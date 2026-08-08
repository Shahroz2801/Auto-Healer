import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { env } from "@/lib/config/env";
import { db } from "@/server/db/client";
import { provisionUserWithPersonalOrg } from "@/server/services/provisioning";

/**
 * Keeps the local `User` table in sync with Clerk, which owns the actual
 * auth identity. Configure this URL (`/api/webhooks/clerk`) in the Clerk
 * dashboard under Webhooks, subscribed to user.created/updated/deleted.
 */
export async function POST(req: Request) {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let event: WebhookEvent;
  try {
    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === event.data.primary_email_address_id
      )?.email_address;

      await provisionUserWithPersonalOrg({
        clerkId: id,
        email: primaryEmail ?? email_addresses[0]?.email_address ?? `${id}@unknown.local`,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        imageUrl: image_url,
      });
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === event.data.primary_email_address_id
      )?.email_address;

      await db.user.updateMany({
        where: { clerkId: id },
        data: {
          email: primaryEmail ?? undefined,
          name: [first_name, last_name].filter(Boolean).join(" ") || undefined,
          imageUrl: image_url,
        },
      });
      break;
    }

    case "user.deleted": {
      if (!event.data.id) break;
      const user = await db.user.findUnique({
        where: { clerkId: event.data.id },
      });
      if (user) {
        // Organizations this user owns cascade-delete their projects/scans/etc.
        // See docs/ARCHITECTURE.md — deletion is intentionally destructive here;
        // a production rollout would soft-delete/export first.
        await db.organization.deleteMany({ where: { ownerId: user.id } });
        await db.user.delete({ where: { id: user.id } });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
