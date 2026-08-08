import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/server/db/client";
import { aiProvider } from "@/lib/ai";
import {
  ISSUE_EXPLANATION_SYSTEM,
  buildIssueExplanationPrompt,
  FIX_GENERATION_SYSTEM,
  buildFixGenerationPrompt,
  FIX_GENERATION_FULL_FILE_SYSTEM,
  buildFullFileFixPrompt,
} from "@/lib/ai/prompts";
import { downloadObject, uploadObject } from "@/server/storage/r2";
import { extractZip, zipDirectory } from "@/lib/zip/extract";
import { findEntryFile } from "@/lib/zip/static-server";

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

function parseFullFileFixResponse(raw: string) {
  const explanationMatch = raw.match(/EXPLANATION:\s*([\s\S]*?)(?=\nFILE:|$)/i);
  const fileMatch = raw.match(/FILE:\s*([\s\S]*)$/i);

  return {
    explanation: explanationMatch?.[1]?.trim() || "AI-generated fix.",
    content: fileMatch?.[1]?.trim() || "",
  };
}

/** Downloads and extracts a ZIP_UPLOAD project's source, locating the same
 * entry file the scanner used. Caller must invoke the returned `cleanup()`. */
async function extractProjectZip(projectId: string) {
  const projectFile = await db.projectFile.findUnique({
    where: { projectId_path: { projectId, path: "source.zip" } },
  });
  if (!projectFile) throw new Error("No uploaded zip found for this project.");

  const buffer = await downloadObject(projectFile.storageKey);
  const { dir, cleanup } = extractZip(buffer);

  const entry = await findEntryFile(dir);
  if (!entry) {
    cleanup();
    throw new Error("Couldn't find an index.html in the uploaded zip.");
  }

  return { projectFile, dir, entry, entryPath: join(dir, entry), cleanup };
}

export async function generateFix(issueId: string) {
  const issue = await db.issue.findUniqueOrThrow({
    where: { id: issueId },
    include: { scan: { include: { project: true } } },
  });
  const { project } = issue.scan;

  if (project.importMethod === "ZIP_UPLOAD") {
    const { entry, entryPath, cleanup } = await extractProjectZip(project.id);
    try {
      const fileContent = await readFile(entryPath, "utf-8");
      const raw = await aiProvider.generateText({
        system: FIX_GENERATION_FULL_FILE_SYSTEM,
        prompt: buildFullFileFixPrompt(issue, project, entry, fileContent),
        temperature: 0.2,
      });
      const { explanation, content } = parseFullFileFixResponse(raw);
      const fixedContent = content || raw;

      // Guard against LLM repetition/hallucination loops producing a
      // runaway response — a legitimate fixed file shouldn't be wildly
      // larger than the original.
      const maxLength = Math.max(fileContent.length * 4, 20_000);
      if (fixedContent.length > maxLength) {
        throw new Error(
          "The AI's response looked malformed (too large) — try generating the fix again."
        );
      }

      const fix = await db.fix.create({
        data: {
          issueId,
          status: "GENERATED",
          aiProvider: aiProvider.name,
          diff: fixedContent,
          explanation,
          filesChanged: [entry],
        },
      });
      await db.issue.update({ where: { id: issueId }, data: { status: "FIX_GENERATED" } });
      return fix;
    } finally {
      cleanup();
    }
  }

  const raw = await aiProvider.generateText({
    system: FIX_GENERATION_SYSTEM,
    prompt: buildFixGenerationPrompt(issue, project),
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

/** Applies a generated fix back to the project's actual source and
 * re-uploads it — only possible for ZIP_UPLOAD projects, since that's the
 * only import method where we hold real source files (URL scans only ever
 * see the live rendered HTML, nothing to write a fix back into). The fix's
 * `diff` field holds the complete corrected file (see generateFix), so
 * applying it is a direct overwrite rather than a patch operation. */
export async function applyFix(fixId: string) {
  const fix = await db.fix.findUniqueOrThrow({
    where: { id: fixId },
    include: { issue: { include: { scan: { include: { project: true } } } } },
  });

  if (fix.status !== "GENERATED") {
    throw new Error(`Fix is already ${fix.status.toLowerCase()}.`);
  }

  const { project } = fix.issue.scan;
  if (project.importMethod !== "ZIP_UPLOAD") {
    throw new Error("Auto-apply is only available for projects imported via ZIP upload.");
  }
  if (!fix.diff.trim()) {
    throw new Error("This fix has no content to apply.");
  }

  const { projectFile, dir, entryPath, cleanup } = await extractProjectZip(project.id);

  try {
    await writeFile(entryPath, fix.diff, "utf-8");
    const newZip = zipDirectory(dir);

    await uploadObject(projectFile.storageKey, newZip, "application/zip");
    await db.projectFile.update({
      where: { id: projectFile.id },
      data: { sizeBytes: newZip.length, sha256: createHash("sha256").update(newZip).digest("hex") },
    });

    const [updatedFix] = await db.$transaction([
      db.fix.update({ where: { id: fixId }, data: { status: "APPLIED", appliedAt: new Date() } }),
      db.issue.update({ where: { id: fix.issueId }, data: { status: "FIX_APPLIED" } }),
    ]);

    return updatedFix;
  } finally {
    cleanup();
  }
}
