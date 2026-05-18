import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

export default redisConnection;
