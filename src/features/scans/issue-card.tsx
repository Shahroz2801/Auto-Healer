"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import type { Fix, Issue, IssueSeverity } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { explainIssueAction, generateFixAction } from "@/features/ai/actions";

export type IssueWithFixes = Issue & { fixes: Fix[] };

const SEVERITY_STYLES: Record<IssueSeverity, string> = {
  CRITICAL: "border-destructive/30 bg-destructive/5 text-destructive",
  HIGH: "border-destructive/20 bg-destructive/5 text-destructive",
  MEDIUM: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
  LOW: "border-border bg-muted/40 text-muted-foreground",
  INFO: "border-border bg-muted/20 text-muted-foreground",
};

export function IssueCard({ issue }: { issue: IssueWithFixes }) {
  const router = useRouter();
  const [explaining, startExplain] = React.useTransition();
  const [fixing, startFix] = React.useTransition();

  const latestFix = issue.fixes[0];

  function runExplain() {
    startExplain(async () => {
      try {
        await explainIssueAction(issue.id);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to generate explanation");
      }
    });
  }

  function runFix() {
    startFix(async () => {
      try {
        await generateFixAction(issue.id);
        toast.success("Fix generated");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to generate fix");
      }
    });
  }

  return (
    <div className={cn("rounded-lg border px-3.5 py-3 text-sm", SEVERITY_STYLES[issue.severity])}>
      <div className="flex items-start justify-between gap-3">
        <span className="font-medium text-foreground">{issue.title}</span>
        <Badge variant="outline" className="shrink-0 uppercase">
          {issue.severity}
        </Badge>
      </div>
      <p className="mt-1 text-muted-foreground">{issue.description}</p>
      {issue.impact && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="font-medium">Impact:</span> {issue.impact}
        </p>
      )}

      {issue.aiExplanation && (
        <div className="mt-2.5 flex gap-2 rounded-md bg-background/60 p-2.5 text-xs">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="text-foreground/90">{issue.aiExplanation}</p>
        </div>
      )}

      {latestFix && (
        <div className="mt-2.5 space-y-1.5 rounded-md bg-background/60 p-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Wand2 className="size-3.5 text-primary" />
            Suggested fix
          </div>
          <p className="text-muted-foreground">{latestFix.explanation}</p>
          <pre className="overflow-x-auto rounded bg-muted p-2 text-[11px] whitespace-pre-wrap text-foreground">
            {latestFix.diff}
          </pre>
        </div>
      )}

      <div className="mt-2.5 flex gap-2">
        {!issue.aiExplanation && (
          <Button
            size="xs"
            variant="outline"
            className="gap-1.5"
            disabled={explaining}
            onClick={runExplain}
          >
            {explaining ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
            Explain
          </Button>
        )}
        {!latestFix && (
          <Button size="xs" variant="outline" className="gap-1.5" disabled={fixing} onClick={runFix}>
            {fixing ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />}
            Generate fix
          </Button>
        )}
      </div>
    </div>
  );
}
