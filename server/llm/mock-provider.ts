import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ChatRequest, ChatResponse, LlmProvider } from "./types";

const fixturePath = resolve(process.cwd(), "fixtures/llm/valid-response.txt");

export function createMockProvider(): LlmProvider {
  return {
    name: "mock",
    model: "fixture",
    async diagnostics() {
      return {
        status: "not_applicable",
        installedModels: [],
        detail: "Provider mock: nessun modello locale richiesto."
      };
    },
    async chat(request: ChatRequest): Promise<ChatResponse> {
      const fixture = await readFile(fixturePath, "utf8");
      const assistantText = [
        `Messaggio ricevuto: "${request.message}".`,
        "Uso il provider mock: nessun modello esterno e stato chiamato.",
        fixture
      ].join("\n\n");

      return {
        provider: "mock",
        assistantText
      };
    }
  };
}
