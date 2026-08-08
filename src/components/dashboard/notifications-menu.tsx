"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import type { Notification } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function timeAgo(date: Date) {
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function NotificationsMenu({
  notifications,
}: {
  notifications: Notification[];
}) {
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-2 rounded-full bg-primary" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          notifications.slice(0, 6).map((n) => (
            <DropdownMenuItem
              key={n.id}
              render={<Link href={n.href ?? "/notifications"} />}
              className="flex flex-col items-start gap-0.5 whitespace-normal"
            >
              <span className="flex w-full items-center gap-2">
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    n.readAt ? "bg-transparent" : "bg-primary"
                  )}
                />
                <span className="flex-1 truncate text-sm font-medium">{n.title}</span>
              </span>
              <span className="pl-3.5 text-xs text-muted-foreground">
                {timeAgo(n.createdAt)}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/notifications" />} className="justify-center text-sm">
          View all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
