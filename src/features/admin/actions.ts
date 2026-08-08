"use server";

import { revalidatePath } from "next/cache";
import type { GlobalRole, PlanTier } from "@prisma/client";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { generateRedeemCode } from "@/lib/redeem-code";

async function requireAdmin() {
  const user = await requireDbUser();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Admin access required");
  }
  return user;
}

export async function adjustUserCreditsAction(userId: string, delta: number) {
  const admin = await requireAdmin();
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error("Enter a non-zero amount");
  }

  await db.$transaction(async (tx) => {
    const target = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const balanceAfter = Math.max(0, target.credits + delta);
    const appliedDelta = balanceAfter - target.credits;
    if (appliedDelta === 0) return;

    await tx.user.update({ where: { id: userId }, data: { credits: balanceAfter } });
    await tx.creditTransaction.create({
      data: {
        userId,
        type: "ADMIN_ADJUSTMENT",
        amount: appliedDelta,
        balanceAfter,
        metadata: { adjustedBy: admin.id },
      },
    });
  });

  revalidatePath("/admin");
}

export async function setUserRoleAction(userId: string, role: GlobalRole) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    throw new Error("You can't change your own role");
  }
  if (role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
    throw new Error("Only a super admin can grant super admin access");
  }

  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin");
}

export async function generateRedeemCodeAction(plan: PlanTier) {
  const admin = await requireAdmin();
  if (plan === "FREE") {
    throw new Error("The Free plan doesn't need a code.");
  }

  let code = generateRedeemCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.redeemCode.findUnique({ where: { code } });
    if (!existing) break;
    code = generateRedeemCode();
  }

  await db.redeemCode.create({ data: { code, plan, createdById: admin.id } });
  revalidatePath("/admin");
  return code;
}
