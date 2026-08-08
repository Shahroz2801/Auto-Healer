import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export type ScanJobData = {
  scanId: string;
  projectId: string;
  url: string;
};

export const SCAN_QUEUE_NAME = "scans";

export const scanQueue = new Queue<ScanJobData>(SCAN_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: { age: 7 * 24 * 60 * 60, count: 1000 },
    removeOnFail: { age: 30 * 24 * 60 * 60 },
  },
});

export async function enqueueScan(data: ScanJobData) {
  return scanQueue.add("run-scan", data, { jobId: data.scanId });
}
