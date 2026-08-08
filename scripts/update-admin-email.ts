import "dotenv/config";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "../src/server/db/client";

/**
 * Changes a user's email in Clerk (source of truth for auth identity) and
 * mirrors it onto the local `User` row. The `user.updated` webhook would
 * normally do the DB half, but it needs a publicly reachable URL registered
 * in the Clerk dashboard, which local dev doesn't have — so this script
 * updates both sides directly. Run with:
 *   npx tsx scripts/update-admin-email.ts <oldEmail> <newEmail>
 */
async function main() {
  const oldEmail = process.argv[2];
  const newEmail = process.argv[3];
  if (!oldEmail || !newEmail) {
    throw new Error("Usage: npx tsx scripts/update-admin-email.ts <oldEmail> <newEmail>");
  }

  const clerk = await clerkClient();

  const existing = await clerk.users.getUserList({ emailAddress: [oldEmail] });
  const clerkUser = existing.data[0];
  if (!clerkUser) {
    throw new Error(`No Clerk user found with email ${oldEmail}`);
  }

  const oldEmailRecord = clerkUser.emailAddresses.find((e) => e.emailAddress === oldEmail);

  await clerk.emailAddresses.createEmailAddress({
    userId: clerkUser.id,
    emailAddress: newEmail,
    verified: true,
    primary: true,
  });

  if (oldEmailRecord) {
    await clerk.emailAddresses.deleteEmailAddress(oldEmailRecord.id);
  }

  await db.user.updateMany({
    where: { clerkId: clerkUser.id },
    data: { email: newEmail },
  });

  console.log(`Updated admin email: ${oldEmail} -> ${newEmail} (clerkId=${clerkUser.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
