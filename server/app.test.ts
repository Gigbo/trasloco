import { describe, expect, it } from "vitest";
import { buildApp } from "./app";
import { createSqlitePersistence } from "./db";
import type { LlmProvider } from "./llm/types";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const testProvider: LlmProvider = {
  name: "mock",
  async chat(request) {
    return {
      provider: "mock",
      assistantText: `Mock response for: ${request.message}`
    };
  }
};

const validFixture = readFileSync(
  resolve(process.cwd(), "fixtures/llm/valid-response.txt"),
  "utf8"
);

const validJsonProvider: LlmProvider = {
  name: "mock",
  async chat() {
    return {
      provider: "mock",
      assistantText: validFixture
    };
  }
};

function buildTestApp(provider: LlmProvider = testProvider) {
  return buildApp({
    llmProvider: provider,
    persistence: createSqlitePersistence(":memory:")
  });
}

describe("backend API", () => {
  it("responds to /api/health", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      service: "relocation-manager-api",
      provider: "mock",
      model: null
    });

    await app.close();
  });

  it("includes provider diagnostics in /api/health when available", async () => {
    const diagnosticProvider: LlmProvider = {
      name: "ollama",
      model: "gemma4:latest",
      async diagnostics() {
        return {
          status: "ready",
          baseUrl: "http://127.0.0.1:11434",
          installedModels: ["gemma4:latest"],
          selectedModelInstalled: true,
          detail: "Modello disponibile."
        };
      },
      async chat() {
        return {
          provider: "ollama",
          assistantText: "ok"
        };
      }
    };
    const app = buildTestApp(diagnosticProvider);

    const response = await app.inject({
      method: "GET",
      url: "/api/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      provider: "ollama",
      model: "gemma4:latest",
      llm: {
        status: "ready",
        installedModels: ["gemma4:latest"],
        selectedModelInstalled: true
      }
    });

    await app.close();
  });

  it("returns a clear 502 when the LLM provider fails", async () => {
    const failingProvider: LlmProvider = {
      name: "ollama",
      model: "gemma4:latest",
      async chat() {
        throw new Error("Ollama non raggiungibile su http://127.0.0.1:11434.");
      }
    };
    const app = buildTestApp(failingProvider);

    const response = await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "Genera piano operativo"
      }
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({
      error: "Provider LLM non disponibile.",
      detail: "Ollama non raggiungibile su http://127.0.0.1:11434."
    });

    await app.close();
  });

  it("responds to /api/chat with the configured provider", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "Prepara il piano trasloco"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      provider: "mock",
      assistantText: "Mock response for: Prepara il piano trasloco",
      snapshotSaved: false
    });

    expect(response.json().conversationId).toEqual(expect.any(Number));
    expect(response.json().snapshotId).toBeNull();

    await app.close();
  });

  it("rejects empty chat messages", async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: ""
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "Richiesta chat non valida."
    });

    await app.close();
  });

  it("persists valid conversations and snapshots", async () => {
    const app = buildTestApp(validJsonProvider);

    const chatResponse = await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "Genera piano operativo"
      }
    });

    expect(chatResponse.statusCode).toBe(200);
    expect(chatResponse.json()).toMatchObject({
      provider: "mock",
      snapshotSaved: true
    });
    expect(chatResponse.json().conversationId).toEqual(expect.any(Number));
    expect(chatResponse.json().snapshotId).toEqual(expect.any(Number));

    const stateResponse = await app.inject({
      method: "GET",
      url: "/api/state"
    });

    expect(stateResponse.statusCode).toBe(200);
    expect(stateResponse.json().recentConversations).toHaveLength(1);
    expect(stateResponse.json().recentSnapshots).toHaveLength(1);
    expect(stateResponse.json().latestSnapshot.payload).toMatchObject({
      schema_version: "1.0.0",
      fase_trasloco: "Pianificazione iniziale"
    });
    expect(stateResponse.json().userState).toMatchObject({
      taskStates: [],
      declutteringDecisions: [],
      costOverrides: [],
      botanicalInterventions: [],
      botanicalNotes: null
    });

    await app.close();
  });

  it("returns recent snapshots for validated plan history", async () => {
    const app = buildTestApp(validJsonProvider);

    await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "Primo piano valido"
      }
    });
    await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "Secondo piano valido"
      }
    });

    const stateResponse = await app.inject({
      method: "GET",
      url: "/api/state"
    });
    const snapshotsResponse = await app.inject({
      method: "GET",
      url: "/api/snapshots"
    });

    expect(stateResponse.statusCode).toBe(200);
    expect(stateResponse.json().recentSnapshots).toHaveLength(2);
    expect(stateResponse.json().recentSnapshots[0]).toMatchObject({
      id: 2,
      schema_version: "1.0.0",
      snapshot_id: "snap_fixture_valid_001",
      payload: {
        fase_trasloco: "Pianificazione iniziale"
      }
    });
    expect(snapshotsResponse.statusCode).toBe(200);
    expect(snapshotsResponse.json().snapshots).toHaveLength(2);
    expect(snapshotsResponse.json().snapshots[1]).toMatchObject({
      id: 1,
      schema_version: "1.0.0"
    });

    await app.close();
  });

  it("returns recent conversations for the console history", async () => {
    const app = buildTestApp();

    await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "Prima richiesta"
      }
    });
    await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "Seconda richiesta"
      }
    });

    const stateResponse = await app.inject({
      method: "GET",
      url: "/api/state"
    });

    expect(stateResponse.statusCode).toBe(200);
    expect(stateResponse.json().recentConversations).toHaveLength(2);
    expect(stateResponse.json().recentConversations[0]).toMatchObject({
      user_message: "Seconda richiesta",
      assistant_text: "Mock response for: Seconda richiesta",
      provider: "mock"
    });
    expect(stateResponse.json().recentConversations[1]).toMatchObject({
      user_message: "Prima richiesta"
    });

    await app.close();
  });

  it("persists user task state", async () => {
    const app = buildTestApp();

    const updateResponse = await app.inject({
      method: "PUT",
      url: "/api/tasks/task-fragili",
      payload: {
        completed: true
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      task_id: "task-fragili",
      completed: true
    });

    const stateResponse = await app.inject({
      method: "GET",
      url: "/api/user-state"
    });

    expect(stateResponse.statusCode).toBe(200);
    expect(stateResponse.json().taskStates).toContainEqual(
      expect.objectContaining({
        task_id: "task-fragili",
        completed: true
      })
    );

    await app.close();
  });

  it("persists decluttering decisions", async () => {
    const app = buildTestApp();

    const updateResponse = await app.inject({
      method: "PUT",
      url: "/api/decluttering/libreria",
      payload: {
        action: "Donare"
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      item_id: "libreria",
      action: "Donare"
    });

    const stateResponse = await app.inject({
      method: "GET",
      url: "/api/user-state"
    });

    expect(stateResponse.json().declutteringDecisions).toContainEqual(
      expect.objectContaining({
        item_id: "libreria",
        action: "Donare"
      })
    );

    await app.close();
  });

  it("persists cost overrides and botanical state", async () => {
    const app = buildTestApp();

    const costResponse = await app.inject({
      method: "PUT",
      url: "/api/costs/trasporto",
      payload: {
        stima_eur: 420
      }
    });

    const interventionResponse = await app.inject({
      method: "PUT",
      url: "/api/botanical/interventions/stop-irrigazione",
      payload: {
        completed: true
      }
    });

    const notesResponse = await app.inject({
      method: "PUT",
      url: "/api/botanical/notes",
      payload: {
        layout_notes: "Passaggio libero lato est, vasi pesanti contro muro."
      }
    });

    expect(costResponse.statusCode).toBe(200);
    expect(interventionResponse.statusCode).toBe(200);
    expect(notesResponse.statusCode).toBe(200);

    const stateResponse = await app.inject({
      method: "GET",
      url: "/api/user-state"
    });

    expect(stateResponse.json()).toMatchObject({
      costOverrides: [
        expect.objectContaining({
          cost_id: "trasporto",
          stima_eur: 420
        })
      ],
      botanicalInterventions: [
        expect.objectContaining({
          intervention_id: "stop-irrigazione",
          completed: true
        })
      ],
      botanicalNotes: {
        layout_notes: "Passaggio libero lato est, vasi pesanti contro muro."
      }
    });

    await app.close();
  });
});
