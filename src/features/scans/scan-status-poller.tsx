"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ScanStatus } from "@prisma/client";

const TERMINAL: ScanStatus[] = ["COMPLETED", "FAILED", "CANCELLED"];
const POLL_MS = 3000;

/** Auto-refreshes the (server-rendered) page while a scan is still running,
 * so the status/results update without a manual reload. */
export function ScanStatusPoller({ status }: { status: ScanStatus | undefined }) {
  const router = useRouter();

  React.useEffect(() => {
    if (!status || TERMINAL.includes(status)) return;
    const interval = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(interval);
  }, [status, router]);

  return null;
}
