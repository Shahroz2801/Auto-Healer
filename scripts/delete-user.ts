import "dotenv/config";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "../src/server/db/client";

/** Deletes a user from both Clerk and the local DB (org included if they own one). */
async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("Usage: npx tsx scripts/delete-user.ts <email>");

  const clerk = await clerkClient();
  const res = await clerk.users.getUserList({ emailAddress: [email] });
  const clerkUser = res.data[0];
  if (!clerkUser) {
    console.log(`No Clerk user found with email ${email}`);
    return;
  }

  const dbUser = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (dbUser) {
    await db.organization.deleteMany({ where: { ownerId: dbUser.id } });
    await db.user.delete({ where: { id: dbUser.id } });
  }

  await clerk.users.deleteUser(clerkUser.id);
  console.log(`Deleted ${email} (clerkId=${clerkUser.id}) from Clerk and DB.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
