import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildApp } from "./app";
import { createSqlitePersistence } from "./db";
import type { LlmProvider } from "./llm/types";
import {
  calculateBudgetTotal,
  getPendingDeclutteringItems,
  getSortedTimelineTasks
} from "../src/lib/dashboard-projections";

const validFixture = readFileSync(
  resolve(process.cwd(), "fixtures/llm/valid-response.txt"),
  "utf8"
);

const stableMockProvider: LlmProvider = {
  name: "mock",
  model: "fixture",
  async chat() {
    return {
      provider: "mock",
      assistantText: validFixture
    };
  }
};

describe("e2e chat -> parsing -> dashboard data", () => {
  it("turns a valid mock chat response into dashboard-ready state", async () => {
    const app = buildApp({
      llmProvider: stableMockProvider,
      persistence: createSqlitePersistence(":memory:")
    });

    const chatResponse = await app.inject({
      method: "POST",
      url: "/api/chat",
      payload: {
        message: "Genera un piano trasloco completo"
      }
    });

    expect(chatResponse.statusCode).toBe(200);
    expect(chatResponse.json()).toMatchObject({
      provider: "mock",
      snapshotSaved: true
    });

    const stateResponse = await app.inject({
      method: "GET",
      url: "/api/state"
    });

    expect(stateResponse.statusCode).toBe(200);

    const payload = stateResponse.json().latestSnapshot.payload;
    const timelineTasks = getSortedTimelineTasks(payload.task_logistici);
    const budgetTotal = calculateBudgetTotal(payload.analisi_costi, {});
    const pendingDecluttering = getPendingDeclutteringItems(
      payload.verdetto_decluttering,
      {}
    );

    expect(timelineTasks.map((task) => task.id)).toEqual([
      "task_volume_001",
      "task_utenze_001"
    ]);
    expect(timelineTasks[0]).toMatchObject({
      scadenza_giorni_al_trasloco: -30,
      priorita: "Alta"
    });
    expect(budgetTotal).toBe(90);
    expect(pendingDecluttering).toHaveLength(1);
    expect(pendingDecluttering[0]).toMatchObject({
      oggetto: "Divano vecchio",
      azione_consigliata: "Donare"
    });

    await app.close();
  });
});
