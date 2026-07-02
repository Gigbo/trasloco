export type LlmProviderName = "mock" | "ollama" | "cloud";

export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  provider: LlmProviderName;
  assistantText: string;
};

export type LlmProvider = {
  name: LlmProviderName;
  chat(request: ChatRequest): Promise<ChatResponse>;
};
