import { Queue } from "bullmq"

export const redisConnection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}


export const emailQueue = new Queue