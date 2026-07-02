export type LlmProviderName = "mock" | "ollama" | "cloud";

export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  provider: LlmProviderName;
  assistantText: string;
};

export type LlmDiagnostics = {
  status: "ready" | "missing_model" | "unreachable" | "not_applicable";
  baseUrl?: string;
  installedModels: string[];
  selectedModelInstalled?: boolean;
  detail?: string;
};

export type LlmProvider = {
  name: LlmProviderName;
  model?: string;
  diagnostics?(): Promise<LlmDiagnostics>;
  setModel?(model: string): Promise<void> | void;
  chat(request: ChatRequest): Promise<ChatResponse>;
};
