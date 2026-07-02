import { createMockProvider } from "./mock-provider";
import type { LlmProvider } from "./types";

export function createLlmProvider(): LlmProvider {
  const provider = process.env.LLM_PROVIDER ?? "mock";

  if (provider !== "mock") {
    throw new Error(
      `Provider LLM "${provider}" non ancora implementato. Usa LLM_PROVIDER=mock.`
    );
  }

  return createMockProvider();
}
