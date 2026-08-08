"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { explainIssue, generateFix } from "@/server/services/ai-heal";
import { createChat, sendChatMessage } from "@/server/services/ai-chat";
import { spendCredits } from "@/server/services/credits";
import { AI_FIX_CREDIT_COST } from "@/lib/config/credits";

async function assertIssueInOrg(issueId: string, organizationId: string) {
  const issue = await db.issue.findFirst({
    where: { id: issueId, scan: { project: { organizationId } } },
  });
  if (!issue) throw new Error("Issue not found.");
}

export async function explainIssueAction(issueId: string) {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;
  if (!org) throw new Error("No workspace found for your account.");
  await assertIssueInOrg(issueId, org.id);

  await explainIssue(issueId);
  revalidatePath("/", "layout");
}

export async function generateFixAction(issueId: string) {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;
  if (!org) throw new Error("No workspace found for your account.");
  await assertIssueInOrg(issueId, org.id);

  await spendCredits(user.id, AI_FIX_CREDIT_COST, "AI_FIX", { issueId });

  await generateFix(issueId);
  revalidatePath("/", "layout");
}

export async function createChatAction(formData: FormData) {
  const user = await requireDbUser();
  const projectId = formData.get("projectId")?.toString() || undefined;

  if (projectId) {
    const org = user.memberships[0]?.organization;
    const project = org
      ? await db.project.findFirst({ where: { id: projectId, organizationId: org.id } })
      : null;
    if (!project) throw new Error("Project not found.");
  }

  const chat = await createChat(user.id, projectId);
  redirect(`/assistant/${chat.id}`);
}

export async function sendChatMessageAction(chatId: string, message: string) {
  const user = await requireDbUser();
  if (!message.trim()) return;

  await sendChatMessage(chatId, user.id, message.trim());
  revalidatePath(`/assistant/${chatId}`);
}
