"use client";

import * as React from "react";
import Link from "next/link";
import type { Notification } from "@prisma/client";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions";

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const [pending, startTransition] = React.useTransition();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="flex flex-col gap-4">
      {unreadCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-end"
          disabled={pending}
          onClick={() => startTransition(() => markAllNotificationsReadAction())}
        >
          <CheckCheck className="size-4" />
          Mark all as read
        </Button>
      )}

      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={cn(
              "flex-row items-start gap-3 p-4",
              !n.readAt && "border-primary/30 bg-primary/[0.03]"
            )}
          >
            <span
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                n.readAt ? "bg-transparent" : "bg-primary"
              )}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                {n.href ? (
                  <Link href={n.href} className="text-sm font-medium hover:underline">
                    {n.title}
                  </Link>
                ) : (
                  <span className="text-sm font-medium">{n.title}</span>
                )}
                <span className="shrink-0 text-xs text-muted-foreground">
                  {n.createdAt.toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              {!n.readAt && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => markNotificationReadAction(n.id))}
                  className="text-xs text-primary hover:underline"
                >
                  Mark as read
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
