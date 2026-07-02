import { createMockProvider } from "./mock-provider";
import { createOllamaProvider } from "./ollama-provider";
import type { LlmProvider } from "./types";

export function createLlmProvider(): LlmProvider {
  const provider = process.env.LLM_PROVIDER ?? "mock";

  if (provider === "mock") {
    return createMockProvider();
  }

  if (provider === "ollama") {
    return createOllamaProvider();
  }

  throw new Error(
    `Provider LLM "${provider}" non supportato. Usa LLM_PROVIDER=mock oppure LLM_PROVIDER=ollama.`
  );
}
