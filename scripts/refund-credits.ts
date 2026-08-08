import "dotenv/config";
import { db } from "../src/server/db/client";

async function main() {
  const email = process.argv[2];
  const amount = Number(process.argv[3]);
  if (!email || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Usage: npx tsx scripts/refund-credits.ts <email> <amount>");
  }

  await db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { email } });
    const balanceAfter = user.credits + amount;
    await tx.user.update({ where: { id: user.id }, data: { credits: balanceAfter } });
    await tx.creditTransaction.create({
      data: { userId: user.id, type: "REFUND", amount, balanceAfter },
    });
    console.log(`Refunded ${amount} credits to ${email} -> ${balanceAfter}`);
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
