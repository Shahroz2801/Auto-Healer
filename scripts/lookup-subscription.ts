import "dotenv/config";
import { db } from "../src/server/db/client";

async function main() {
  const email = process.argv[2];
  if (!email) throw new Error("Usage: npx tsx scripts/lookup-subscription.ts <email>");

  const user = await db.user.findUniqueOrThrow({
    where: { email },
    include: { memberships: { include: { organization: { include: { subscription: true } } } } },
  });

  for (const m of user.memberships) {
    console.log(m.organization.name, "->", m.organization.subscription);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
