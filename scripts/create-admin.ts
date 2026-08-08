import "dotenv/config";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "../src/server/db/client";

/**
 * Creates (or promotes) a platform admin: a real Clerk account with a
 * password, a matching `User` row with role SUPER_ADMIN, and a personal
 * workspace if it doesn't have one yet. Run with:
 *   npx tsx scripts/create-admin.ts <email> <password>
 */
async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    throw new Error("Usage: npx tsx scripts/create-admin.ts <email> <password>");
  }

  const clerk = await clerkClient();

  const existingClerkUsers = await clerk.users.getUserList({ emailAddress: [email] });
  const clerkUser =
    existingClerkUsers.data[0] ??
    (await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName: "Admin",
      skipLegalChecks: true,
      skipPasswordChecks: true,
    }));

  const user = await db.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { role: "SUPER_ADMIN" },
    create: {
      clerkId: clerkUser.id,
      email,
      name: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  const membership = await db.organizationMember.findFirst({ where: { userId: user.id } });
  if (!membership) {
    const org = await db.organization.create({
      data: {
        name: "Admin Workspace",
        slug: `admin-workspace-${Math.random().toString(36).slice(2, 7)}`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER" } },
        subscription: { create: { plan: "ENTERPRISE", status: "ACTIVE" } },
      },
    });
    console.log(`Created workspace "${org.name}" for admin.`);
  }

  console.log(`Admin ready: ${email} (role=${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
