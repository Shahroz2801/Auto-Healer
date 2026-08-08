import { notFound } from "next/navigation";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { ChatPanel } from "@/features/ai/chat-panel";

export const metadata = { title: "AI Assistant" };

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const user = await requireDbUser();

  const chat = await db.chat.findFirst({
    where: { id: chatId, userId: user.id },
    include: {
      project: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!chat) notFound();

  return <ChatPanel chatId={chat.id} messages={chat.messages} projectName={chat.project?.name} />;
}
