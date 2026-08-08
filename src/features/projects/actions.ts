"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { createProjectSchema } from "@/lib/validators/project";
import { uploadObject } from "@/server/storage/r2";
import type { ImportMethod } from "@prisma/client";

const MAX_ZIP_SIZE_BYTES = 25 * 1024 * 1024;

export async function createProjectAction(formData: FormData) {
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    importMethod: formData.get("importMethod"),
    sourceUrl: formData.get("sourceUrl") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid project details.";
    redirect(`/projects/new?error=${encodeURIComponent(message)}`);
  }

  const isZipUpload = parsed.data.importMethod === "ZIP_UPLOAD";
  let zipBuffer: Buffer | null = null;

  if (isZipUpload) {
    const file = formData.get("zipFile");
    if (!(file instanceof File) || file.size === 0) {
      redirect(`/projects/new?error=${encodeURIComponent("Choose a .zip file to upload.")}`);
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      redirect(`/projects/new?error=${encodeURIComponent("Only .zip files are supported.")}`);
    }
    if (file.size > MAX_ZIP_SIZE_BYTES) {
      redirect(`/projects/new?error=${encodeURIComponent("Zip file must be 25MB or smaller.")}`);
    }
    zipBuffer = Buffer.from(await file.arrayBuffer());
  }

  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;
  if (!org) {
    redirect(`/projects/new?error=${encodeURIComponent("No workspace found for your account.")}`);
  }

  const project = await db.project.create({
    data: {
      organizationId: org.id,
      createdById: user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      importMethod: parsed.data.importMethod as ImportMethod,
      sourceUrl: parsed.data.sourceUrl || null,
    },
  });

  if (isZipUpload && zipBuffer) {
    try {
      const storageKey = `projects/${project.id}/source.zip`;
      await uploadObject(storageKey, zipBuffer, "application/zip");
      await db.projectFile.create({
        data: {
          projectId: project.id,
          path: "source.zip",
          sizeBytes: zipBuffer.length,
          storageKey,
          sha256: createHash("sha256").update(zipBuffer).digest("hex"),
        },
      });
    } catch (error) {
      await db.project.delete({ where: { id: project.id } });
      const message = error instanceof Error ? error.message : "Failed to upload zip file.";
      redirect(`/projects/new?error=${encodeURIComponent(message)}`);
    }
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireDbUser();
  const org = user.memberships[0]?.organization;
  if (!org) throw new Error("No workspace found for your account.");

  await db.project.deleteMany({
    where: { id: projectId, organizationId: org.id },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
