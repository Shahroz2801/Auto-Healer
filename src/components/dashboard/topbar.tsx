"use client";

import * as React from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { Notification } from "@prisma/client";
import { Menu, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DashboardSidebarNav } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { NotificationsMenu } from "@/components/dashboard/notifications-menu";
import { Logo } from "@/components/shared/logo";

export function DashboardTopbar({
  orgName,
  credits,
  isAdmin,
  notifications,
}: {
  orgName: string;
  credits: number;
  isAdmin: boolean;
  notifications: Notification[];
}) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 lg:px-6">
        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon-sm" className="lg:hidden" />}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="h-16 justify-center border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <DashboardSidebarNav isAdmin={isAdmin} />
          </SheetContent>
        </Sheet>

        <span className="hidden text-sm font-medium text-muted-foreground sm:block">
          {orgName}
        </span>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-xs"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <Link href="/billing">
            <Badge variant="outline" className="hidden gap-1.5 sm:inline-flex">
              <Zap className="size-3 text-primary" />
              {credits.toLocaleString()} credits
            </Badge>
          </Link>
          <ThemeToggle />
          <NotificationsMenu notifications={notifications} />
          <UserButton
            appearance={{
              elements: { avatarBox: "size-8" },
            }}
          />
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} isAdmin={isAdmin} />
    </>
  );
}
