import type { CreditTransactionType, Prisma } from "@prisma/client";
import { db } from "@/server/db/client";

export class InsufficientCreditsError extends Error {
  constructor(required: number, available: number) {
    super(`Not enough credits — this needs ${required}, you have ${available}.`);
    this.name = "InsufficientCreditsError";
  }
}

/** Atomically deducts credits and records the ledger entry. Throws
 * `InsufficientCreditsError` (inside the transaction, so nothing is
 * partially applied) if the user doesn't have enough. */
export async function spendCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType,
  metadata?: Prisma.InputJsonValue
) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.credits < amount) {
      throw new InsufficientCreditsError(amount, user.credits);
    }

    const balanceAfter = user.credits - amount;
    await tx.user.update({ where: { id: userId }, data: { credits: balanceAfter } });
    await tx.creditTransaction.create({
      data: { userId, type, amount: -amount, balanceAfter, metadata },
    });

    return balanceAfter;
  });
}
