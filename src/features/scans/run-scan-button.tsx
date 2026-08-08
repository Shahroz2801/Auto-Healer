"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runScanAction } from "@/features/scans/actions";

export function RunScanButton({ projectId, disabled }: { projectId: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      className="gap-2"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await runScanAction(projectId);
            toast.success("Scan queued");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to start scan");
          }
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <ScanSearch className="size-4" />}
      Run scan
    </Button>
  );
}
