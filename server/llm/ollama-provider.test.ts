import { afterEach, describe, expect, it, vi } from "vitest";
import { createOllamaProvider } from "./ollama-provider";

const originalEnv = { ...process.env };

describe("ollama provider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("calls Ollama generate API with non-streaming JSON mode", async () => {
    process.env.OLLAMA_BASE_URL = "http://127.0.0.1:11434/";
    process.env.OLLAMA_MODEL = "llama3.1:8b";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          response: "{\"schema_version\":\"1.0.0\"}"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );

    const provider = createOllamaProvider();
    const response = await provider.chat({
      message: "Prepara il piano"
    });

    expect(response.provider).toBe("ollama");
    expect(response.assistantText).toContain("Provider Ollama locale: llama3.1:8b.");
    expect(response.assistantText).toContain("```json");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:11434/api/generate",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String)
      })
    );

    const requestBody = JSON.parse(
      fetchMock.mock.calls[0]?.[1]?.body as string
    ) as Record<string, unknown>;

    expect(requestBody).toMatchObject({
      model: "llama3.1:8b",
      stream: false
    });
    expect(requestBody.format).toMatchObject({
      type: "object",
      required: expect.arrayContaining(["schema_version", "task_logistici"])
    });
    expect(requestBody.prompt).toEqual(expect.stringContaining("L'Inquisitore Logistico"));
  });

  it("returns a clear error when Ollama is unreachable", async () => {
    process.env.OLLAMA_BASE_URL = "http://127.0.0.1:11434";

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));

    const provider = createOllamaProvider();

    await expect(
      provider.chat({
        message: "Prepara il piano"
      })
    ).rejects.toThrow("Ollama non raggiungibile");
  });
});
