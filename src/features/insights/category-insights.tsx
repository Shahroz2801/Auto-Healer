import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ScanCategory } from "@prisma/client";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueCard, type IssueWithFixes } from "@/features/scans/issue-card";

type ScoreKey =
  | "performanceScore"
  | "seoScore"
  | "accessibilityScore"
  | "securityScore";

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

export async function CategoryInsightsPage({
  category,
  scoreKey,
  title,
  description,
  icon: Icon,
}: {
  category: ScanCategory;
  scoreKey: ScoreKey;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;

  const projects = org
    ? await db.project.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" },
        include: {
          scans: {
            where: { status: "COMPLETED" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })
    : [];

  const scored = projects
    .map((project) => ({ project, score: project.scans[0]?.[scoreKey] ?? null }))
    .filter((entry): entry is { project: (typeof projects)[number]; score: number } => entry.score != null);

  const average = scored.length
    ? Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
    : null;

  const issues = org
    ? await db.issue.findMany({
        where: { category, scan: { project: { organizationId: org.id } } },
        orderBy: { severity: "asc" },
        take: 100,
        include: {
          fixes: { orderBy: { createdAt: "desc" }, take: 1 },
          scan: { include: { project: { select: { id: true, name: true } } } },
        },
      })
    : [];

  const groupedByProject = issues.reduce<
    Record<string, { name: string; issues: typeof issues }>
  >((acc, issue) => {
    const key = issue.scan.project.id;
    (acc[key] ??= { name: issue.scan.project.name, issues: [] }).issues.push(issue);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {scored.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={`No ${title.toLowerCase()} data yet`}
          description="Run a scan on a project to see its score and issues here."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Average {title.toLowerCase()} score</CardTitle>
            </CardHeader>
            <CardContent>
              <span
                className={cn(
                  "text-4xl font-semibold tabular-nums",
                  average != null && scoreColor(average)
                )}
              >
                {average ?? "—"}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                / 100 across {scored.length} project{scored.length === 1 ? "" : "s"}
              </span>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">{title} score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scored.map(({ project, score }) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className={cn("text-right tabular-nums font-medium", scoreColor(score))}>
                      {score}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {issues.length > 0 && (
            <div className="flex flex-col gap-6">
              {Object.values(groupedByProject).map((group) => (
                <div key={group.name} className="flex flex-col gap-2.5">
                  <h4 className="text-sm font-semibold tracking-tight">
                    {group.name}
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      ({group.issues.length})
                    </span>
                  </h4>
                  <div className="flex flex-col gap-2">
                    {group.issues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue as IssueWithFixes} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
