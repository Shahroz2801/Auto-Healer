import "dotenv/config";
import type { GlobalRole } from "@prisma/client";
import { db } from "../src/server/db/client";

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] as GlobalRole | undefined;
  if (!email || !role) {
    throw new Error("Usage: npx tsx scripts/set-user-role.ts <email> <USER|ADMIN|SUPER_ADMIN>");
  }

  const user = await db.user.update({ where: { email }, data: { role } });
  console.log(`Set ${user.email} role -> ${user.role}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
