import { Bell } from "lucide-react";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationsList } from "@/features/notifications/notifications-list";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireDbUser();
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Scan results, fix suggestions, and account alerts.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see scan completions, AI fix suggestions, and monitoring alerts here."
        />
      ) : (
        <NotificationsList notifications={notifications} />
      )}
    </div>
  );
}
