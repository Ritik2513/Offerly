import { Queue } from "bullmq";
import redisConnection from "../config/queue";

export const clickQueue = new Queue("clickQueue", {
  connection: redisConnection,
});
