import "dotenv/config";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "../src/server/db/client";

async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("Usage: npx tsx scripts/lookup-user.ts <email>");

  const clerk = await clerkClient();
  const res = await clerk.users.getUserList({ emailAddress: [email] });
  const u = res.data[0];
  if (!u) {
    console.log("No Clerk user found with that email");
    return;
  }
  console.log("Clerk user id:", u.id);
  const dbUser = await db.user.findUnique({
    where: { clerkId: u.id },
    include: { memberships: { include: { organization: true } } },
  });
  console.log("DB user:", JSON.stringify(dbUser, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
