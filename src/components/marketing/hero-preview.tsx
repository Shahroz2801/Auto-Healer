"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleDashed, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type IssueCategory = "Performance" | "SEO" | "Security" | "Accessibility";

type Issue = {
  id: string;
  category: IssueCategory;
  label: string;
};

const issues: Issue[] = [
  { id: "perf", category: "Performance", label: "Render-blocking scripts on homepage" },
  { id: "seo", category: "SEO", label: "Missing meta descriptions on 12 pages" },
  { id: "sec", category: "Security", label: "Outdated dependency: lodash@4.17.15" },
  { id: "a11y", category: "Accessibility", label: "Low contrast text in footer" },
];

const categoryScores: Record<IssueCategory, { before: number; after: number }> = {
  Performance: { before: 58, after: 96 },
  SEO: { before: 71, after: 98 },
  Security: { before: 64, after: 100 },
  Accessibility: { before: 80, after: 97 },
};

type Phase = "idle" | "fixing" | "fixed";

const CYCLE_MS = 1600;

export function HeroPreview() {
  const [healedCount, setHealedCount] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("idle");

  React.useEffect(() => {
    if (healedCount >= issues.length) {
      const resetTimer = setTimeout(() => {
        setHealedCount(0);
        setPhase("idle");
      }, CYCLE_MS * 1.4);
      return () => clearTimeout(resetTimer);
    }

    const timers = [
      setTimeout(() => setPhase("fixing"), 0),
      setTimeout(() => setPhase("fixed"), CYCLE_MS * 0.65),
      setTimeout(() => {
        setHealedCount((count) => count + 1);
        setPhase("idle");
      }, CYCLE_MS),
    ];

    return () => timers.forEach(clearTimeout);
  }, [healedCount]);

  return (
    <div className="relative w-full max-w-md">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_0%,var(--brand-glow),transparent_70%)] opacity-25 blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 ring-1 ring-foreground/5">
        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-amber-500/60" />
          <span className="size-2.5 rounded-full bg-emerald-500/60" />
          <span className="ml-3 flex-1 truncate rounded-md bg-background px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border">
            healsite.ai/scan/your-website.com
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Live issue feed
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3" />
              AI healing
            </span>
          </div>

          <ul className="space-y-2">
            {issues.map((issue, index) => {
              const isHealed = index < healedCount;
              const isCurrent = index === healedCount;
              const currentPhase: Phase = isHealed ? "fixed" : isCurrent ? phase : "idle";

              return (
                <li
                  key={issue.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors duration-500",
                    isHealed
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-border bg-background"
                  )}
                >
                  <span className="shrink-0">
                    {currentPhase === "fixed" ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : currentPhase === "fixing" ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <CircleDashed className="size-4 text-muted-foreground/50" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "flex-1 truncate transition-all duration-500",
                      isHealed && "text-muted-foreground line-through decoration-emerald-500/50"
                    )}
                  >
                    {issue.label}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    {issue.category}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {(Object.keys(categoryScores) as IssueCategory[]).map((category) => {
              const issueIndex = issues.findIndex((i) => i.category === category);
              const resolved = issueIndex < healedCount;
              const { before, after } = categoryScores[category];
              const score = resolved ? after : before;

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{category}</span>
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={score}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "font-semibold tabular-nums",
                          resolved ? "text-emerald-500" : "text-foreground"
                        )}
                      >
                        {score}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        resolved ? "bg-emerald-500" : "bg-primary/70"
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
