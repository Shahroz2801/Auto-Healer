import { db } from "@/server/db/client";
import { runScan } from "@/lib/scanners";
import { downloadObject } from "@/server/storage/r2";
import { extractZip } from "@/lib/zip/extract";
import { findEntryFile, serveStaticDir } from "@/lib/zip/static-server";
import type { ScanJobData } from "@/server/queue/scan-queue";

/** ZIP_UPLOAD projects have no live URL to fetch — instead, unzip the
 * uploaded archive and serve it from a local static server so the existing
 * fetch-based scanner pipeline (built for real URLs) can run against it
 * unchanged, rather than maintaining a second static-analysis engine. */
async function runZipScan(projectId: string) {
  const projectFile = await db.projectFile.findUnique({
    where: { projectId_path: { projectId, path: "source.zip" } },
  });
  if (!projectFile) {
    throw new Error("No uploaded zip found for this project.");
  }

  const buffer = await downloadObject(projectFile.storageKey);
  const { dir, cleanup } = extractZip(buffer);

  try {
    const entry = await findEntryFile(dir);
    if (!entry) {
      throw new Error("Couldn't find an index.html in the uploaded zip.");
    }

    const { url, close } = await serveStaticDir(dir);
    try {
      return await runScan(`${url}/${entry}`);
    } finally {
      await close();
    }
  } finally {
    cleanup();
  }
}

/** Executes a scan job end-to-end: crawl + analyze, persist Issues, roll the
 * scores up onto the Scan and Project rows, notify the owner. Called from
 * the BullMQ worker (src/server/queue/scan-worker.ts) — kept separate from
 * the worker file so it can also be invoked directly (tests, `db:seed`-style
 * scripts) without spinning up a queue.
 */
export async function runScanJob({ scanId, projectId }: ScanJobData) {
  await db.scan.update({
    where: { id: scanId },
    data: { status: "CRAWLING", startedAt: new Date() },
  });

  try {
    await db.scan.update({ where: { id: scanId }, data: { status: "ANALYZING" } });

    const project = await db.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { importMethod: true, sourceUrl: true, name: true, createdById: true },
    });

    const result =
      project.importMethod === "ZIP_UPLOAD"
        ? await runZipScan(projectId)
        : await runScan(project.sourceUrl!);

    await db.$transaction([
      db.issue.createMany({
        data: result.findings.map((finding) => ({
          scanId,
          category: finding.category,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          impact: finding.impact,
          estPerformanceGain: finding.estPerformanceGain,
          estSeoGain: finding.estSeoGain,
        })),
      }),
      db.scan.update({
        where: { id: scanId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          healthScore: result.healthScore,
          performanceScore: result.scores.PERFORMANCE,
          seoScore: result.scores.SEO,
          accessibilityScore: result.scores.ACCESSIBILITY,
          securityScore: result.scores.SECURITY,
          bestPracticesScore: result.scores.BEST_PRACTICES,
        },
      }),
      db.project.update({
        where: { id: projectId },
        data: { healthScore: result.healthScore },
      }),
    ]);

    const critical = result.findings.filter(
      (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
    ).length;
    await db.notification.create({
      data: {
        userId: project.createdById,
        type: "SCAN_COMPLETE",
        title: `Scan complete: ${project.name}`,
        body: `Health score ${result.healthScore}/100 — ${result.findings.length} issue(s) found${critical > 0 ? ` (${critical} high priority)` : ""}.`,
        href: `/projects/${projectId}`,
      },
    });

    return result;
  } catch (error) {
    await db.scan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
