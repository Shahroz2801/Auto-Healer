import type { IssueSeverity, ScanCategory } from "@prisma/client";
import type { FetchedPage } from "./fetch-page";

export type Finding = {
  category: ScanCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  impact?: string;
  estPerformanceGain?: number;
  estSeoGain?: number;
  filePath?: string;
};

export type Analyzer = (page: FetchedPage) => Promise<Finding[]> | Finding[];

const SEVERITY_WEIGHT: Record<IssueSeverity, number> = {
  CRITICAL: 20,
  HIGH: 12,
  MEDIUM: 6,
  LOW: 3,
  INFO: 0,
};

/** 100 minus weighted deductions per finding in that category, floored at 0. */
export function scoreCategory(findings: Finding[], category: ScanCategory): number {
  const deductions = findings
    .filter((f) => f.category === category)
    .reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  return Math.max(0, 100 - deductions);
}
