import { Queue, Worker } from "bullmq"
import { redisConnection } from "../config/queue.js"

export const emailQueueName = "email-queue"

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: {
    delay: 5000,
    removeOnComplete: {
      count: 100,
      age: 60 * 60 * 24,
    },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnFail: {
      count: 1000,
    },
  },
})

// workers
export const handler = new Worker(emailQueueName, async (job) => {})
