"use server";

import { revalidatePath } from "next/cache";
import { requireDbUser } from "@/server/services/user";
import { db } from "@/server/db/client";
import { updateOrganizationSchema } from "@/lib/validators/organization";

export type UpdateOrgState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function updateOrganizationAction(
  _prevState: UpdateOrgState,
  formData: FormData
): Promise<UpdateOrgState> {
  const parsed = updateOrganizationSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await requireDbUser();
  const membership = user.memberships[0];
  if (!membership) {
    return { error: "No workspace found for your account." };
  }
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return { error: "Only workspace owners or admins can change these settings." };
  }

  const existingSlug = await db.organization.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });
  if (existingSlug && existingSlug.id !== membership.organization.id) {
    return { fieldErrors: { slug: ["That slug is already taken."] } };
  }

  await db.organization.update({
    where: { id: membership.organization.id },
    data: { name: parsed.data.name, slug: parsed.data.slug },
  });

  revalidatePath("/settings");
  return { success: true };
}
