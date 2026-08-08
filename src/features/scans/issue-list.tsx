import type { IssueSeverity, ScanCategory } from "@prisma/client";
import { IssueCard, type IssueWithFixes } from "./issue-card";

const CATEGORY_LABELS: Record<ScanCategory, string> = {
  SEO: "SEO",
  PERFORMANCE: "Performance",
  ACCESSIBILITY: "Accessibility",
  SECURITY: "Security",
  CODE_QUALITY: "Code Quality",
  BEST_PRACTICES: "Best Practices",
  BROKEN_LINKS: "Broken Links",
  BUNDLE_SIZE: "Bundle Size",
  CORE_WEB_VITALS: "Core Web Vitals",
};

const SEVERITY_ORDER: IssueSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export function IssueList({
  issues,
  canAutoApply = false,
}: {
  issues: IssueWithFixes[];
  canAutoApply?: boolean;
}) {
  if (issues.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No issues found — this scan came back clean.
      </p>
    );
  }

  const sorted = [...issues].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const grouped = sorted.reduce<Record<string, IssueWithFixes[]>>((acc, issue) => {
    (acc[issue.category] ??= []).push(issue);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([category, categoryIssues]) => (
        <div key={category} className="flex flex-col gap-2.5">
          <h4 className="text-sm font-semibold tracking-tight">
            {CATEGORY_LABELS[category as ScanCategory]}
            <span className="ml-1.5 font-normal text-muted-foreground">
              ({categoryIssues.length})
            </span>
          </h4>
          <div className="flex flex-col gap-2">
            {categoryIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} canAutoApply={canAutoApply} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
