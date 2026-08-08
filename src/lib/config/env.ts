import { z } from "zod";

/**
 * Centralized, validated environment access. Import `env` instead of reading
 * `process.env` directly so a missing/malformed var fails fast at boot with a
 * clear message instead of surfacing as a runtime crash three layers deep.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Redis / Queue
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_BUSINESS: z.string().optional(),

  // AI providers (Gemini first-class today; others plug in via the same interface)
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROK_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),

  // Storage (project file blobs, reports, screenshots)
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),

  // Source control
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITLAB_CLIENT_ID: z.string().optional(),
  GITLAB_CLIENT_SECRET: z.string().optional(),
  BITBUCKET_CLIENT_ID: z.string().optional(),
  BITBUCKET_CLIENT_SECRET: z.string().optional(),

  // Alerting
  SLACK_WEBHOOK_URL: z.string().optional(),
  DISCORD_WEBHOOK_URL: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // Secrets
  ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY must be at least 32 chars"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables:\n${formatted}\n\nCheck your .env against .env.example.`
    );
  }

  return parsed.data;
}

// Skip hard validation during `next build`'s static analysis / lint passes and
// in test runs where secrets aren't provisioned; real boot (dev/start) still validates.
export const env: Env =
  process.env.SKIP_ENV_VALIDATION === "true"
    ? (process.env as unknown as Env)
    : loadEnv();
