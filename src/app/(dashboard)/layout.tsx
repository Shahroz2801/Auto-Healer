import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization ?? null;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          orgName={org?.name ?? "Personal Workspace"}
          credits={user.credits}
          isAdmin={isAdmin}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
