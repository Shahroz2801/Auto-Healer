import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, ExternalLink } from "lucide-react";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { RunScanButton } from "@/features/scans/run-scan-button";
import { ScanStatusPoller } from "@/features/scans/scan-status-poller";
import { ScoreSummary } from "@/features/scans/score-summary";
import { IssueList } from "@/features/scans/issue-list";
import { createChatAction } from "@/features/ai/actions";

export const metadata = { title: "Project" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;
  if (!org) notFound();

  const project = await db.project.findFirst({
    where: { id, organizationId: org.id },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { issues: true } } },
      },
    },
  });
  if (!project) notFound();

  const latestScan = project.scans[0];
  const latestIsTerminal =
    !latestScan || ["COMPLETED", "FAILED", "CANCELLED"].includes(latestScan.status);

  const latestIssues = latestScan
    ? await db.issue.findMany({
        where: { scanId: latestScan.id },
        orderBy: { severity: "asc" },
        include: { fixes: { orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 lg:p-8">
      <ScanStatusPoller status={latestScan?.status} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <Badge variant="outline">{project.framework}</Badge>
          </div>
          {project.description && (
            <p className="max-w-lg text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <form action={createChatAction}>
            <input type="hidden" name="projectId" value={project.id} />
            <Button type="submit" variant="outline" className="gap-2">
              <Bot className="size-4" />
              Ask AI
            </Button>
          </form>
          <RunScanButton
            projectId={project.id}
            disabled={
              (project.importMethod !== "ZIP_UPLOAD" && !project.sourceUrl) || !latestIsTerminal
            }
          />
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Import method</CardTitle>
          </CardHeader>
          <CardContent className="text-sm capitalize">
            {project.importMethod.replace("_", " ").toLowerCase()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Source</CardTitle>
          </CardHeader>
          <CardContent>
            {project.sourceUrl ? (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <span className="truncate">{project.sourceUrl}</span>
                <ExternalLink className="size-3.5 shrink-0" />
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Not set</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Health score</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {project.healthScore != null ? project.healthScore : "Not scanned yet"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {project.createdAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardContent>
        </Card>
      </div>

      {latestScan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest scan</CardTitle>
              <Badge variant={latestScan.status === "FAILED" ? "destructive" : "outline"}>
                {latestScan.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {latestScan.status === "COMPLETED" ? (
              <>
                <ScoreSummary scan={latestScan} />
                <IssueList issues={latestIssues} />
              </>
            ) : latestScan.status === "FAILED" ? (
              <p className="text-sm text-destructive">
                {latestScan.errorMessage ?? "The scan failed to complete."}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {latestScan.status === "QUEUED" && "Waiting for a scan worker to pick this up..."}
                {latestScan.status === "CRAWLING" && "Fetching the page..."}
                {latestScan.status === "ANALYZING" && "Running SEO, performance, security, and accessibility checks..."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scan history</CardTitle>
        </CardHeader>
        <CardContent>
          {project.scans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scans yet. Run your first scan to get a health score and a full issue report.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {project.scans.map((scan) => (
                <li key={scan.id}>
                  <Link
                    href={`/scans/${scan.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary/40"
                  >
                    <span>{scan.createdAt.toLocaleString()}</span>
                    <span className="flex items-center gap-3">
                      {scan.healthScore != null && (
                        <span className="text-muted-foreground">
                          Health: {scan.healthScore} · {scan._count.issues} issue(s)
                        </span>
                      )}
                      <Badge variant={scan.status === "FAILED" ? "destructive" : "outline"}>
                        {scan.status}
                      </Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
