import { db } from "@/server/db/client";
import { aiProvider } from "@/lib/ai";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import type { ChatTurn } from "@/lib/ai";

const MAX_HISTORY_TURNS = 20;

export async function createChat(userId: string, projectId?: string) {
  const project = projectId ? await db.project.findUnique({ where: { id: projectId } }) : null;
  return db.chat.create({
    data: {
      userId,
      projectId: project?.id,
      title: project ? `${project.name}` : "New chat",
    },
  });
}

export async function sendChatMessage(chatId: string, userId: string, message: string) {
  const chat = await db.chat.findFirstOrThrow({
    where: { id: chatId, userId },
    include: {
      project: true,
      messages: { orderBy: { createdAt: "asc" }, take: MAX_HISTORY_TURNS },
    },
  });

  await db.chatMessage.create({
    data: { chatId, role: "USER", content: message },
  });

  let recentIssues: Array<{ title: string; severity: string; category: string }> = [];
  if (chat.project) {
    const latestScan = await db.scan.findFirst({
      where: { projectId: chat.project.id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });
    if (latestScan) {
      const issues = await db.issue.findMany({
        where: { scanId: latestScan.id, severity: { in: ["CRITICAL", "HIGH", "MEDIUM"] } },
        orderBy: { severity: "asc" },
        take: 8,
      });
      recentIssues = issues.map((i) => ({ title: i.title, severity: i.severity, category: i.category }));
    }
  }

  const system = buildChatSystemPrompt({
    projectName: chat.project?.name,
    framework: chat.project?.framework,
    healthScore: chat.project?.healthScore,
    recentIssues,
  });

  const history: ChatTurn[] = chat.messages.map((m) => ({
    role: m.role === "ASSISTANT" ? "assistant" : "user",
    content: m.content,
  }));

  const reply = await aiProvider.chat({ system, history, message });

  const assistantMessage = await db.chatMessage.create({
    data: { chatId, role: "ASSISTANT", content: reply, aiProvider: aiProvider.name },
  });

  if (chat.messages.length === 0) {
    const title = message.slice(0, 60) + (message.length > 60 ? "…" : "");
    await db.chat.update({ where: { id: chatId }, data: { title } });
  }

  return assistantMessage;
}
