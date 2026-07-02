import { z } from "zod";
import { RelocationSchema, type RelocationData } from "./relocation-schema";

type ParseSuccess = {
  success: true;
  data: RelocationData;
  jsonText: string;
};

type ParseFailure = {
  success: false;
  error: string;
  jsonText?: string;
};

export type RelocationParseResult = ParseSuccess | ParseFailure;

const priorityRank = {
  Alta: 0,
  Media: 1,
  Bassa: 2
} as const;

export function parseRelocationResponse(rawResponse: string): RelocationParseResult {
  let jsonText: string;

  try {
    jsonText = extractJsonText(rawResponse);
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return {
      success: false,
      jsonText,
      error: `JSON trovato, ma malformato: ${getErrorMessage(error)}`
    };
  }

  const validation = RelocationSchema.safeParse(parsed);

  if (!validation.success) {
    return {
      success: false,
      jsonText,
      error: formatZodError(validation.error)
    };
  }

  return {
    success: true,
    jsonText,
    data: normalizeRelocationData(validation.data)
  };
}

export function extractJsonText(rawResponse: string): string {
  const fencedJson = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedJson?.[1]) {
    return fencedJson[1].trim();
  }

  const objectCandidate = extractBalancedJsonObject(rawResponse);

  if (objectCandidate) {
    return objectCandidate;
  }

  throw new Error("Nessun blocco JSON trovato nella risposta dell'IA.");
}

function extractBalancedJsonObject(text: string): string | null {
  const firstBrace = text.indexOf("{");

  if (firstBrace === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = firstBrace; index < text.length; index += 1) {
    const char = text[index];

    if (escaping) {
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(firstBrace, index + 1).trim();
      }
    }
  }

  return null;
}

function normalizeRelocationData(data: RelocationData): RelocationData {
  return {
    ...data,
    task_logistici: [...data.task_logistici].sort((left, right) => {
      const deadlineDiff =
        left.scadenza_giorni_al_trasloco - right.scadenza_giorni_al_trasloco;

      if (deadlineDiff !== 0) {
        return deadlineDiff;
      }

      return priorityRank[left.priorita] - priorityRank[right.priorita];
    })
  };
}

function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];

  if (!firstIssue) {
    return "JSON valido, ma non conforme allo schema.";
  }

  const path = firstIssue.path.length > 0 ? firstIssue.path.join(".") : "radice";

  return `JSON valido, ma schema errato in "${path}": ${firstIssue.message}`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "errore sconosciuto";
}
