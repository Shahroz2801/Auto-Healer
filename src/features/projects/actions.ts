"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { createProjectSchema } from "@/lib/validators/project";
import type { ImportMethod } from "@prisma/client";

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
