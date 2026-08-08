export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type GenerateTextParams = {
  system?: string;
  prompt: string;
  temperature?: number;
};

export type ChatParams = {
  system?: string;
  history: ChatTurn[];
  message: string;
};

/** Provider-agnostic AI interface — Gemini is the only implementation today
 * (`src/lib/ai/providers/gemini.ts`), but nothing outside this file and its
 * provider implementations should import `@google/generative-ai` directly.
 * Adding OpenAI/Claude/Grok/DeepSeek/local models later means writing a new
 * class that implements this interface, not touching call sites. */
export interface AIProvider {
  readonly name: string;
  generateText(params: GenerateTextParams): Promise<string>;
  chat(params: ChatParams): Promise<string>;
}
