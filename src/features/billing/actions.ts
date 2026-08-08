"use server";

import { revalidatePath } from "next/cache";
import type { PlanTier, Prisma } from "@prisma/client";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { pricingPlans, type PricingPlan } from "@/lib/config/site";

/** Applies a plan to an org's subscription and syncs the acting user's
 * credit allowance. Shared by the free instant-switch and code redemption. */
async function applyPlan(
  tx: Prisma.TransactionClient,
  userId: string,
  organizationId: string,
  plan: PricingPlan
) {
  const tier = plan.id.toUpperCase() as PlanTier;

  await tx.subscription.upsert({
    where: { organizationId },
    update: { plan: tier, status: "ACTIVE", cancelAtPeriodEnd: false },
    create: { organizationId, plan: tier, status: "ACTIVE" },
  });

  if (typeof plan.credits === "number") {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (plan.credits !== user.credits) {
      const balanceAfter = plan.credits;
      const delta = balanceAfter - user.credits;
      await tx.user.update({ where: { id: userId }, data: { credits: balanceAfter } });
      await tx.creditTransaction.create({
        data: { userId, type: "MONTHLY_GRANT", amount: delta, balanceAfter },
      });
    }
  }
}

/**
 * Demo billing: Stripe isn't reachable from this deployment's region, so
 * there's no payment gateway. The Free plan can be switched to instantly;
 * paid plans require a redeem code an admin hands out (see redeemCodeAction).
 */
export async function changePlanAction(planId: string) {
  if (planId !== "free") {
    throw new Error("Paid plans require a redeem code — see the code field on that plan.");
  }

  const user = await requireDbUser();
  const membership = user.memberships[0];
  if (!membership) throw new Error("No workspace found for your account.");
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new Error("Only workspace owners or admins can change the plan.");
  }

  const plan = pricingPlans.find((p) => p.id === planId);
  if (!plan) throw new Error("Unknown plan.");

  await db.$transaction((tx) => applyPlan(tx, user.id, membership.organization.id, plan));
  revalidatePath("/billing");
}

export async function redeemCodeAction(planId: string, code: string) {
  const user = await requireDbUser();
  const membership = user.memberships[0];
  if (!membership) throw new Error("No workspace found for your account.");
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new Error("Only workspace owners or admins can redeem a code.");
  }

  const plan = pricingPlans.find((p) => p.id === planId);
  if (!plan) throw new Error("Unknown plan.");
  const tier = plan.id.toUpperCase() as PlanTier;

  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) throw new Error("Enter a code.");

  await db.$transaction(async (tx) => {
    const redeemCode = await tx.redeemCode.findUnique({ where: { code: normalizedCode } });
    if (!redeemCode) throw new Error("That code doesn't exist.");
    if (redeemCode.redeemedById) throw new Error("That code has already been used.");
    if (redeemCode.plan !== tier) {
      throw new Error(`That code is for a different plan, not ${plan.name}.`);
    }

    await tx.redeemCode.update({
      where: { id: redeemCode.id },
      data: { redeemedById: user.id, redeemedAt: new Date() },
    });

    await applyPlan(tx, user.id, membership.organization.id, plan);
  });

  revalidatePath("/billing");
  revalidatePath("/admin");
  return plan.name;
}
