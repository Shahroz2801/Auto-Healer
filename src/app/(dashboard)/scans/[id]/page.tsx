import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanStatusPoller } from "@/features/scans/scan-status-poller";
import { ScoreSummary } from "@/features/scans/score-summary";
import { IssueList } from "@/features/scans/issue-list";

export const metadata = { title: "Scan" };

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;
  if (!org) notFound();

  const scan = await db.scan.findFirst({
    where: { id, project: { organizationId: org.id } },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!scan) notFound();

  const issues = await db.issue.findMany({
    where: { scanId: scan.id },
    orderBy: { severity: "asc" },
    include: { fixes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 lg:p-8">
      <ScanStatusPoller status={scan.status} />

      <div>
        <Link
          href={`/projects/${scan.project.id}`}
          className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {scan.project.name}
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Scan · {scan.createdAt.toLocaleString()}
          </h1>
          <Badge variant={scan.status === "FAILED" ? "destructive" : "outline"}>{scan.status}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {scan.status === "COMPLETED" ? (
            <>
              <ScoreSummary scan={scan} />
              <IssueList issues={issues} />
            </>
          ) : scan.status === "FAILED" ? (
            <p className="text-sm text-destructive">
              {scan.errorMessage ?? "The scan failed to complete."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              This scan is still in progress ({scan.status.toLowerCase()})...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
