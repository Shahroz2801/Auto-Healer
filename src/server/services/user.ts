import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db/client";

/**
 * Looks up the local `User`/`Organization` rows for the signed-in Clerk
 * session. Returns `null` when signed out, or when the Clerk webhook hasn't
 * synced this user into Postgres yet (e.g. a brand-new signup racing the
 * webhook — see src/app/api/webhooks/clerk/route.ts).
 */
export async function getCurrentDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  return db.user.findUnique({
    where: { clerkId },
    include: {
      memberships: {
        include: { organization: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}

/**
 * Same as `getCurrentDbUser`, but redirects to sign-in when signed out and
 * self-heals the (rare) race where Clerk has a session but the webhook
 * hasn't landed yet by provisioning the user record inline.
 */
export async function requireDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const existing = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      memberships: { include: { organization: true }, orderBy: { joinedAt: "asc" } },
    },
  });
  if (existing) return existing;

  const { provisionUserWithPersonalOrg } = await import("@/server/services/provisioning");
  return provisionUserWithPersonalOrg({
    clerkId: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress ?? `${clerkUser.id}@unknown.local`,
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
    imageUrl: clerkUser.imageUrl,
  });
}

/** The user's default ("personal") workspace — the org they joined first. */
export async function getCurrentOrg() {
  const dbUser = await getCurrentDbUser();
  return dbUser?.memberships[0]?.organization ?? null;
}
