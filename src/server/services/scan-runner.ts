import { db } from "@/server/db/client";
import { runScan } from "@/lib/scanners";
import type { ScanJobData } from "@/server/queue/scan-queue";

/** Executes a scan job end-to-end: crawl + analyze, persist Issues, roll the
 * scores up onto the Scan and Project rows, notify the owner. Called from
 * the BullMQ worker (src/server/queue/scan-worker.ts) — kept separate from
 * the worker file so it can also be invoked directly (tests, `db:seed`-style
 * scripts) without spinning up a queue.
 */
export async function runScanJob({ scanId, projectId, url }: ScanJobData) {
  await db.scan.update({
    where: { id: scanId },
    data: { status: "CRAWLING", startedAt: new Date() },
  });

  try {
    await db.scan.update({ where: { id: scanId }, data: { status: "ANALYZING" } });

    const result = await runScan(url);

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

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { name: true, createdById: true },
    });
    if (project) {
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
    }

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
