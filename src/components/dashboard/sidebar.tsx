"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNav } from "@/lib/config/nav";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function DashboardSidebarNav({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {dashboardNav.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || isAdmin);
        if (items.length === 0) return null;

        return (
          <div key={group.label} className="flex flex-col gap-1">
            <span className="px-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {group.label}
            </span>
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Logo />
      </div>
      <DashboardSidebarNav isAdmin={isAdmin} />
    </aside>
  );
}
