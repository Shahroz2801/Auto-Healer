import "dotenv/config";
import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { SCAN_QUEUE_NAME, type ScanJobData } from "./scan-queue";
import { runScanJob } from "@/server/services/scan-runner";

/** Long-running worker process — NOT part of the Next.js server. Run it
 * separately (`npm run worker:dev` locally; a standalone process/container
 * in production). Keeping it out-of-process means a slow/hanging scan can
 * never block a web request. */
const worker = new Worker<ScanJobData>(
  SCAN_QUEUE_NAME,
  async (job) => {
    console.log(`[scan-worker] starting scan ${job.data.scanId} (project ${job.data.projectId})`);
    const result = await runScanJob(job.data);
    console.log(
      `[scan-worker] finished scan ${job.data.scanId}: health=${result.healthScore} issues=${result.findings.length}`
    );
    return result;
  },
  { connection: redisConnection, concurrency: 3 }
);

worker.on("failed", (job, err) => {
  console.error(`[scan-worker] scan ${job?.data.scanId} failed:`, err.message);
});

console.log("[scan-worker] listening for scan jobs...");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
