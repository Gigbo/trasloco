import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadLocalEnv } from "./env";

const originalEnv = { ...process.env };
const tempDirs: string[] = [];

describe("local env loader", () => {
  afterEach(() => {
    process.env = { ...originalEnv };

    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loads simple key-value pairs without overriding existing variables", () => {
    const dir = mkdtempSync(join(tmpdir(), "relocation-env-"));
    tempDirs.push(dir);
    const envPath = join(dir, ".env");
    process.env.LLM_PROVIDER = "mock";

    writeFileSync(
      envPath,
      [
        "# commento",
        "LLM_PROVIDER=ollama",
        "OLLAMA_MODEL=\"llama3.2:latest\"",
        "OLLAMA_BASE_URL=http://127.0.0.1:11434"
      ].join("\n")
    );

    loadLocalEnv(envPath);

    expect(process.env.LLM_PROVIDER).toBe("mock");
    expect(process.env.OLLAMA_MODEL).toBe("llama3.2:latest");
    expect(process.env.OLLAMA_BASE_URL).toBe("http://127.0.0.1:11434");
  });

  it("does nothing when the env file does not exist", () => {
    expect(() => loadLocalEnv("/missing/.env")).not.toThrow();
  });
});
