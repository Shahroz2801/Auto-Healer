import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, ChatParams, GenerateTextParams } from "../types";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName = process.env.GEMINI_MODEL || "gemini-flash-latest") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateText({ system, prompt, temperature = 0.4 }: GenerateTextParams): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: system,
      generationConfig: { temperature },
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async chat({ system, history, message }: ChatParams): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: system,
      generationConfig: { temperature: 0.6 },
    });
    const session = model.startChat({
      history: history.map((turn) => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.content }],
      })),
    });
    const result = await session.sendMessage(message);
    return result.response.text();
  }
}
