import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewProjectForm } from "@/features/projects/new-project-form";

export const metadata = { title: "New Project" };

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
        <p className="text-sm text-muted-foreground">
          Point HealSite AI at a website or codebase to start scanning.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            You can connect the full source (repo, FTP, Docker, etc.) after creating the
            project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewProjectForm errorMessage={error} />
        </CardContent>
      </Card>
    </div>
  );
}
