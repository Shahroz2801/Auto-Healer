import { db } from "@/server/db/client";
import { aiProvider } from "@/lib/ai";
import {
  ISSUE_EXPLANATION_SYSTEM,
  buildIssueExplanationPrompt,
  FIX_GENERATION_SYSTEM,
  buildFixGenerationPrompt,
} from "@/lib/ai/prompts";

export async function explainIssue(issueId: string) {
  const issue = await db.issue.findUniqueOrThrow({ where: { id: issueId } });

  const explanation = await aiProvider.generateText({
    system: ISSUE_EXPLANATION_SYSTEM,
    prompt: buildIssueExplanationPrompt(issue),
  });

  return db.issue.update({
    where: { id: issueId },
    data: { aiExplanation: explanation.trim() },
  });
}

function parseFixResponse(raw: string) {
  const explanationMatch = raw.match(/EXPLANATION:\s*([\s\S]*?)(?=\nDIFF:|$)/i);
  const diffMatch = raw.match(/DIFF:\s*([\s\S]*?)(?=\nFILES:|$)/i);
  const filesMatch = raw.match(/FILES:\s*([\s\S]*)$/i);

  return {
    explanation: explanationMatch?.[1]?.trim() || raw.trim(),
    diff: diffMatch?.[1]?.trim() || "",
    files: filesMatch?.[1]
      ?.trim()
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean) ?? [],
  };
}

export async function generateFix(issueId: string) {
  const issue = await db.issue.findUniqueOrThrow({
    where: { id: issueId },
    include: { scan: { include: { project: true } } },
  });

  const raw = await aiProvider.generateText({
    system: FIX_GENERATION_SYSTEM,
    prompt: buildFixGenerationPrompt(issue, issue.scan.project),
    temperature: 0.3,
  });

  const { explanation, diff, files } = parseFixResponse(raw);

  const fix = await db.fix.create({
    data: {
      issueId,
      status: "GENERATED",
      aiProvider: aiProvider.name,
      diff: diff || raw,
      explanation,
      filesChanged: files,
    },
  });

  await db.issue.update({ where: { id: issueId }, data: { status: "FIX_GENERATED" } });

  return fix;
}
