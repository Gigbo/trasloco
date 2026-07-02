import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractJsonText, parseRelocationResponse } from "./parse-ai-json";

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "../..");

function fixture(name: string) {
  return readFileSync(resolve(projectRoot, "fixtures/llm", name), "utf8");
}

describe("extractJsonText", () => {
  it("extracts a fenced JSON block", () => {
    const jsonText = extractJsonText(fixture("valid-response.txt"));

    expect(JSON.parse(jsonText)).toMatchObject({
      schema_version: "1.0.0",
      snapshot_id: "snap_fixture_valid_001"
    });
  });

  it("extracts a bare JSON object when no fence exists", () => {
    const jsonText = extractJsonText('prefix {"schema_version":"1.0.0"} suffix');

    expect(jsonText).toBe('{"schema_version":"1.0.0"}');
  });

  it("fails when no JSON is present", () => {
    expect(() => extractJsonText("solo testo, nessun modulo")).toThrow(
      /Nessun blocco JSON/
    );
  });
});

describe("parseRelocationResponse", () => {
  it("parses and normalizes a valid LLM response", () => {
    const result = parseRelocationResponse(fixture("valid-response.txt"));

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.data.schema_version).toBe("1.0.0");
    expect(result.data.task_logistici.map((task) => task.id)).toEqual([
      "task_volume_001",
      "task_utenze_001"
    ]);
  });

  it("reports malformed JSON without throwing", () => {
    const result = parseRelocationResponse(fixture("malformed-json.txt"));

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected malformed JSON to fail.");
    }

    expect(result.error).toMatch(/malformato/i);
  });

  it("reports schema errors for invalid enum values", () => {
    const result = parseRelocationResponse(fixture("invalid-enum.txt"));

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected invalid enum to fail.");
    }

    expect(result.error).toMatch(/task_logistici\.0\.priorita/);
  });

  it("reports schema errors for missing required fields", () => {
    const result = parseRelocationResponse(fixture("missing-required-fields.txt"));

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected missing required fields to fail.");
    }

    expect(result.error).toMatch(/schema errato/i);
  });
});
