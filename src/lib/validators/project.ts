import { z } from "zod";

export const importMethods = [
  { value: "URL", label: "Website URL" },
  { value: "GITHUB", label: "GitHub repository" },
  { value: "GITLAB", label: "GitLab repository" },
  { value: "BITBUCKET", label: "Bitbucket repository" },
  { value: "ZIP_UPLOAD", label: "ZIP upload" },
  { value: "WORDPRESS", label: "WordPress site" },
  { value: "SHOPIFY", label: "Shopify store" },
] as const;

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  importMethod: z.enum(importMethods.map((m) => m.value) as [string, ...string[]]),
  sourceUrl: z
    .string()
    .trim()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Enter a valid URL",
    })
    .optional(),
  description: z.string().trim().max(280).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
