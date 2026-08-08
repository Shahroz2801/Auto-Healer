import { GeminiProvider } from "./providers/gemini";
import type { AIProvider } from "./types";

export type { AIProvider, ChatTurn } from "./types";

const globalForAI = globalThis as unknown as { aiProvider: AIProvider | undefined };

/** The active AI provider. Swapping providers is changing this one line —
 * see the interface doc comment in ./types.ts. */
export const aiProvider: AIProvider =
  globalForAI.aiProvider ?? new GeminiProvider(process.env.GEMINI_API_KEY ?? "");

if (process.env.NODE_ENV !== "production") globalForAI.aiProvider = aiProvider;
