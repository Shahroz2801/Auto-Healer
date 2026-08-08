import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
});
