"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db/client";

async function requireUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not signed in");
  const user = await db.user.findUniqueOrThrow({ where: { clerkId } });
  return user.id;
}

export async function markNotificationReadAction(notificationId: string) {
  const userId = await requireUserId();
  await db.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const userId = await requireUserId();
  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}
