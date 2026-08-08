import type { ScanCategory } from "@prisma/client";
import { fetchPage } from "./fetch-page";
import { analyzeSeo } from "./seo";
import { analyzeSecurity } from "./security";
import { analyzePerformance } from "./performance";
import { analyzeAccessibility } from "./accessibility";
import { analyzeBestPractices, analyzeBrokenLinks } from "./best-practices";
import { scoreCategory, type Finding } from "./types";

export type { Finding } from "./types";

const ANALYZERS = [
  analyzeSeo,
  analyzeSecurity,
  analyzePerformance,
  analyzeAccessibility,
  analyzeBestPractices,
  analyzeBrokenLinks,
];

export type ScanResult = {
  findings: Finding[];
  scores: Record<ScanCategory, number>;
  healthScore: number;
  meta: {
    finalUrl: string;
    status: number;
    responseTimeMs: number;
    sizeBytes: number;
  };
};

const SCORED_CATEGORIES: ScanCategory[] = [
  "SEO",
  "PERFORMANCE",
  "ACCESSIBILITY",
  "SECURITY",
  "CODE_QUALITY",
  "BEST_PRACTICES",
];

/** Runs the full analyzer suite against a single URL. Multi-page crawling is
 * out of scope for v1 — see analyzeBrokenLinks' doc comment. */
export async function runScan(url: string): Promise<ScanResult> {
  const page = await fetchPage(url);

  const results = await Promise.all(ANALYZERS.map((analyze) => analyze(page)));
  const findings = results.flat();

  const scores = Object.fromEntries(
    SCORED_CATEGORIES.map((category) => [category, scoreCategory(findings, category)])
  ) as Record<ScanCategory, number>;

  const assessedScores = SCORED_CATEGORIES.map((c) => scores[c]);
  const healthScore = Math.round(
    assessedScores.reduce((sum, s) => sum + s, 0) / assessedScores.length
  );

  return {
    findings,
    scores,
    healthScore,
    meta: {
      finalUrl: page.finalUrl,
      status: page.status,
      responseTimeMs: page.responseTimeMs,
      sizeBytes: page.sizeBytes,
    },
  };
}
