import Link from "next/link";
import { FolderKanban, ScanSearch, Zap, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;

  const [projects, scanCount] = await Promise.all([
    org
      ? db.project.findMany({
          where: { organizationId: org.id },
          orderBy: { createdAt: "desc" },
          take: 6,
        })
      : Promise.resolve([]),
    org
      ? db.scan.count({ where: { project: { organizationId: org.id } } })
      : Promise.resolve(0),
  ]);

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban },
    { label: "Scans run", value: scanCount, icon: ScanSearch },
    { label: "Credits left", value: user.credits, icon: Zap },
    { label: "Plan", value: "Free", icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across {org?.name ?? "your workspace"}.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </div>
              <div>
                <div className="text-xl font-semibold tabular-nums leading-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent projects</h2>
          {projects.length > 0 && (
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Import a website or codebase to run your first AI scan."
            action={
              <Link href="/projects/new">
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Import your first project
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="truncate">{project.name}</CardTitle>
                      <Badge variant="outline">{project.framework}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {project.importMethod.replace("_", " ").toLowerCase()}
                    </span>
                    <span className="text-xs font-medium">
                      {project.healthScore != null
                        ? `Health: ${project.healthScore}`
                        : "Not scanned yet"}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
