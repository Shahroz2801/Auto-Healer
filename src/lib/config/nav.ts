import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  ScanSearch,
  Bot,
  Gauge,
  Search,
  ShieldCheck,
  Accessibility,
  BarChart3,
  FileText,
  Radar,
  Rocket,
  Plug,
  Settings,
  CreditCard,
  Bell,
  ShieldAlert,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const dashboardNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Scans", href: "/scans", icon: ScanSearch },
      { title: "AI Assistant", href: "/assistant", icon: Bot },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Performance", href: "/performance", icon: Gauge },
      { title: "SEO", href: "/seo", icon: Search },
      { title: "Security", href: "/security", icon: ShieldCheck },
      { title: "Accessibility", href: "/accessibility", icon: Accessibility },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
      { title: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Monitoring", href: "/monitoring", icon: Radar },
      { title: "Deployments", href: "/deployments", icon: Rocket },
      { title: "Integrations", href: "/integrations", icon: Plug },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Billing", href: "/billing", icon: CreditCard },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    label: "Admin",
    items: [{ title: "Admin", href: "/admin", icon: ShieldAlert, adminOnly: true }],
  },
];
