import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { ChatSidebar } from "@/features/ai/chat-sidebar";

export default async function AssistantLayout({ children }: { children: React.ReactNode }) {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;

  const [chats, projects] = await Promise.all([
    db.chat.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { id: true, title: true, updatedAt: true },
    }),
    org
      ? db.project.findMany({
          where: { organizationId: org.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex h-full">
      <ChatSidebar chats={chats} projects={projects} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
