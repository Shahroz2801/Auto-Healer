import { cn } from "@/lib/utils";

const METRICS: Array<{ key: "performanceScore" | "seoScore" | "accessibilityScore" | "securityScore" | "bestPracticesScore"; label: string }> = [
  { key: "performanceScore", label: "Performance" },
  { key: "seoScore", label: "SEO" },
  { key: "accessibilityScore", label: "Accessibility" },
  { key: "securityScore", label: "Security" },
  { key: "bestPracticesScore", label: "Best Practices" },
];

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

function barColor(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-destructive";
}

export function ScoreSummary({
  scan,
}: {
  scan: {
    performanceScore: number | null;
    seoScore: number | null;
    accessibilityScore: number | null;
    securityScore: number | null;
    bestPracticesScore: number | null;
  };
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {METRICS.map(({ key, label }) => {
        const score = scan[key];
        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className={cn("text-sm font-semibold tabular-nums", score != null && scoreColor(score))}>
                {score ?? "—"}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", score != null && barColor(score))}
                style={{ width: `${score ?? 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
