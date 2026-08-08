import type { Issue, Project } from "@prisma/client";

export const ISSUE_EXPLANATION_SYSTEM = `You are a senior web engineer explaining an automated scan finding to a
site owner who may not be technical. Be concrete and specific to the finding
given — never generic. Keep it to 2-4 short sentences: what's wrong, why it
actually matters (user impact, not just "best practice"), and how urgent it
is. No headers, no bullet points, plain prose.`;

export function buildIssueExplanationPrompt(issue: Issue) {
  return `Finding: ${issue.title}
Category: ${issue.category}
Severity: ${issue.severity}
Scanner description: ${issue.description}
${issue.filePath ? `Location: ${issue.filePath}` : ""}

Explain this finding to the site owner.`;
}

export const FIX_GENERATION_SYSTEM = `You are an AI code-fix generator for a website health platform. You are
given a single automated scan finding for a live URL — you do NOT have
access to the site's actual source repository, only its rendered HTML and
HTTP response. Produce a concrete, copy-pasteable fix snippet (HTML/HTTP
header config/etc., whichever is relevant) and a short explanation.

Respond in exactly this format, with no extra commentary before or after:

EXPLANATION:
<2-3 sentences on what the fix does and why>

DIFF:
<the actual code/config snippet to add or change, in a fenced code block>

FILES:
<comma-separated list of the kind of file(s) this typically belongs in, e.g. "HTML <head>, nginx.conf" — you don't know their real file names>`;

export function buildFixGenerationPrompt(issue: Issue, project: Project) {
  return `Project: ${project.name} (${project.framework})
Finding: ${issue.title}
Category: ${issue.category}
Severity: ${issue.severity}
Description: ${issue.description}
${issue.impact ? `Impact: ${issue.impact}` : ""}

Generate a fix for this finding.`;
}

export function buildChatSystemPrompt(context: {
  projectName?: string;
  framework?: string;
  healthScore?: number | null;
  recentIssues?: Array<{ title: string; severity: string; category: string }>;
}) {
  const lines = [
    `You are the HealSite AI assistant — an expert in web performance, SEO, accessibility, and security.`,
    `Answer clearly and concretely. Prefer short paragraphs and code blocks over long bullet lists. If you don't have enough information about the user's specific project to answer precisely, say so and ask, rather than guessing.`,
  ];

  if (context.projectName) {
    lines.push(`\nCurrent project: "${context.projectName}"${context.framework ? ` (${context.framework})` : ""}.`);
    if (context.healthScore != null) lines.push(`Latest health score: ${context.healthScore}/100.`);
    if (context.recentIssues && context.recentIssues.length > 0) {
      lines.push(
        `Known open issues:\n` +
          context.recentIssues.map((i) => `- [${i.severity}] (${i.category}) ${i.title}`).join("\n")
      );
    }
  } else {
    lines.push(`\nNo project is selected for this conversation — answer generally.`);
  }

  return lines.join("\n");
}
