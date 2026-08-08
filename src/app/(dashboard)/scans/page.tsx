import Link from "next/link";
import { ScanSearch } from "lucide-react";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Scans" };

export default async function ScansPage() {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;

  const scans = org
    ? await db.scan.findMany({
        where: { project: { organizationId: org.id } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { project: { select: { id: true, name: true } }, _count: { select: { issues: true } } },
      })
    : [];

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scans</h1>
        <p className="text-sm text-muted-foreground">
          Every scan run across all of your projects.
        </p>
      </div>

      {scans.length === 0 ? (
        <EmptyState
          icon={ScanSearch}
          title="No scans yet"
          description="Open a project and click “Run scan” to get a health score and a full issue report."
        />
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Health</TableHead>
                <TableHead className="text-right">Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell>
                    <Link href={`/projects/${scan.project.id}`} className="hover:underline">
                      {scan.project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {scan.createdAt.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={scan.status === "FAILED" ? "destructive" : "outline"}>
                      {scan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {scan.healthScore ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Link href={`/scans/${scan.id}`} className="hover:underline">
                      {scan._count.issues}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
