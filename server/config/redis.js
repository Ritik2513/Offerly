import { createClient } from "redis";
import logger from "./logger.js";

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("error", (err) => logger.info("Redis Error", err));

export const connectRedis = async () => {
  await redisClient.connect();
  logger.info("Redis connected");
};
