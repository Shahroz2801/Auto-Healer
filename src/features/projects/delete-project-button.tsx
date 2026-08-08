"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProjectAction } from "@/features/projects/actions";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" />
        }
      >
        <Trash2 className="size-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{projectName}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the project and all of its scans, issues, and reports.
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="outline" />}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            render={
              <Button
                variant="destructive"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteProjectAction(projectId);
                    router.push("/projects");
                  })
                }
              />
            }
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
