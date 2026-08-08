import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;

  const projects = org
    ? await db.project.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Everything you&apos;ve imported into {org?.name ?? "your workspace"}.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Import a website URL, a repository, or an upload to run your first AI scan."
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
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="truncate">{project.name}</CardTitle>
                    <Badge variant="outline">{project.framework}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {project.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">
                      {project.importMethod.replace("_", " ").toLowerCase()}
                    </span>
                    <span>
                      {project.healthScore != null
                        ? `Health: ${project.healthScore}`
                        : "Not scanned yet"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
