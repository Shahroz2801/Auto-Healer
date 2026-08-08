import { Prisma } from "@prisma/client";
import { db } from "@/server/db/client";

type ProvisionInput = {
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl?: string | null;
};

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "workspace"}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Creates the `User` row plus a personal `Organization` (every user needs a
 * workspace to own projects under — see docs/ARCHITECTURE.md). Called from
 * the Clerk `user.created` webhook, and defensively from `requireDbUser()`
 * in case the webhook hasn't landed yet.
 *
 * Next.js can fire several server requests for a brand-new session at once
 * (parallel route rendering/prefetching), so two calls can race to create
 * the same `User` row. The loser catches the unique-constraint violation
 * and polls for the winner's committed row instead of crashing.
 */
export async function provisionUserWithPersonalOrg(input: ProvisionInput) {
  try {
    return await createUserWithPersonalOrg(input);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return await waitForConcurrentlyProvisionedUser(input.clerkId);
    }
    throw error;
  }
}

async function createUserWithPersonalOrg(input: ProvisionInput) {
  const workspaceName = input.name ? `${input.name}'s Workspace` : "My Workspace";

  return db.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { clerkId: input.clerkId },
      update: {
        email: input.email,
        name: input.name,
        imageUrl: input.imageUrl ?? undefined,
      },
      create: {
        clerkId: input.clerkId,
        email: input.email,
        name: input.name,
        imageUrl: input.imageUrl ?? undefined,
      },
    });

    const existingMembership = await tx.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });
    if (existingMembership) {
      return { ...user, memberships: [existingMembership] };
    }

    const organization = await tx.organization.create({
      data: {
        name: workspaceName,
        slug: slugify(workspaceName),
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER" } },
        subscription: { create: { plan: "FREE", status: "TRIALING" } },
      },
    });

    const membership = await tx.organizationMember.findFirstOrThrow({
      where: { organizationId: organization.id, userId: user.id },
      include: { organization: true },
    });

    return { ...user, memberships: [membership] };
  });
}

async function waitForConcurrentlyProvisionedUser(clerkId: string, attempts = 5) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        memberships: { include: { organization: true }, orderBy: { joinedAt: "asc" } },
      },
    });
    if (user && user.memberships.length > 0) return user;
    await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
  }
  throw new Error(`Timed out waiting for concurrently-provisioned user ${clerkId}`);
}
