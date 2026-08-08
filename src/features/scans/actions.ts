"use server";

import { revalidatePath } from "next/cache";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { enqueueScan } from "@/server/queue/scan-queue";
import { spendCredits, InsufficientCreditsError } from "@/server/services/credits";
import { SCAN_CREDIT_COST } from "@/lib/config/credits";

export async function runScanAction(projectId: string) {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;
  if (!org) throw new Error("No workspace found for your account.");

  if (user.credits < SCAN_CREDIT_COST) {
    throw new InsufficientCreditsError(SCAN_CREDIT_COST, user.credits);
  }

  const project = await db.project.findFirst({
    where: { id: projectId, organizationId: org.id },
  });
  if (!project) throw new Error("Project not found.");
  if (project.importMethod !== "ZIP_UPLOAD" && !project.sourceUrl) {
    throw new Error("This project has no source URL to scan yet.");
  }

  const scan = await db.scan.create({
    data: {
      projectId,
      status: "QUEUED",
      categories: ["SEO", "PERFORMANCE", "ACCESSIBILITY", "SECURITY", "BEST_PRACTICES"],
      triggeredBy: "MANUAL",
    },
  });

  await spendCredits(user.id, SCAN_CREDIT_COST, "SCAN", { scanId: scan.id, projectId });

  await enqueueScan({ scanId: scan.id, projectId });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/scans");
  return { scanId: scan.id };
}
