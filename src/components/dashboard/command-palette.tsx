"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { dashboardNav } from "@/lib/config/nav";

export function CommandPalette({
  open,
  onOpenChange,
  isAdmin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}) {
  const router = useRouter();

  const runNavigate = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to"
      description="Search dashboard sections"
    >
      <CommandInput placeholder="Search projects, scans, settings..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {dashboardNav.map((group) => {
          const items = group.items.filter((item) => !item.adminOnly || isAdmin);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={group.label} heading={group.label}>
              {items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  onSelect={() => runNavigate(item.href)}
                >
                  <item.icon />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
