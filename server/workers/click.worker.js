import dotenv from "dotenv";
dotenv.config();
import { Worker } from "bullmq";
import redisConnection from "../config/redisQueue.js";
import mongoose from "mongoose";
import geoip from "geoip-lite";
import { nanoid } from "nanoid";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const UAParser = require("ua-parser-js");

import Click from "../modules/tracking/click.model.js";
import { incrementClickStats } from "../utils/analytics.helper.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("Worker MongoDB Connected");

//Worker listens to clickQueue
const worker = new Worker(
  "clickQueue",
  async (job) => {
    const { trackingLinkId, affiliate, offer, ip, userAgent, referer } =
      job.data;

    console.log("Processing click job:", trackingLinkId);

    // geo location
    const geo = geoip.lookup(ip);

    const country = geo?.country || "Unknown";
    const city = geo?.city || "Unknown";

    //device / browser parsing
    const parser = new UAParser(userAgent);
    const device = parser.getDevice().type || "desktop";
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";

    const clickDoc = await Click.create({
      trackingLink: trackingLinkId,
      clickId: nanoid(12), //Generate public click id
      ip,
      country,
      city,
      device,
      browser,
      os,
      referer,
      affiliate,
      offer,
    });

    console.log("Click saved to MongoDB", clickDoc);

    await incrementClickStats(clickDoc);
  },
  { connection: redisConnection },
);

worker.on("completed", (job) => {
  console.log("Job Completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("Job Failed:", err);
});
