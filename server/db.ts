import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { RelocationData } from "../src/lib/relocation-schema";

export type ConversationRecord = {
  id: number;
  created_at: string;
  user_message: string;
  assistant_text: string;
  provider: string;
};

export type SnapshotRecord = {
  id: number;
  created_at: string;
  schema_version: string;
  snapshot_id: string;
  conversation_id: number;
  payload: RelocationData;
};

export type SaveConversationInput = {
  userMessage: string;
  assistantText: string;
  provider: string;
};

export type SaveSnapshotInput = {
  conversationId: number;
  payload: RelocationData;
};

export type DeclutteringAction = "Vendere" | "Donare" | "Buttare";

export type TaskStateRecord = {
  task_id: string;
  completed: boolean;
  updated_at: string;
};

export type DeclutteringDecisionRecord = {
  item_id: string;
  action: DeclutteringAction;
  updated_at: string;
};

export type CostOverrideRecord = {
  cost_id: string;
  stima_eur: number;
  updated_at: string;
};

export type BotanicalInterventionStateRecord = {
  intervention_id: string;
  completed: boolean;
  updated_at: string;
};

export type BotanicalNotesRecord = {
  layout_notes: string;
  updated_at: string;
};

export type UserStateRecord = {
  taskStates: TaskStateRecord[];
  declutteringDecisions: DeclutteringDecisionRecord[];
  costOverrides: CostOverrideRecord[];
  botanicalInterventions: BotanicalInterventionStateRecord[];
  botanicalNotes: BotanicalNotesRecord | null;
};

export type Persistence = {
  saveConversation(input: SaveConversationInput): ConversationRecord;
  saveSnapshot(input: SaveSnapshotInput): SnapshotRecord;
  getRecentConversations(limit?: number): ConversationRecord[];
  getLatestSnapshot(): SnapshotRecord | null;
  getRecentSnapshots(limit?: number): SnapshotRecord[];
  getUserState(): UserStateRecord;
  setTaskState(taskId: string, completed: boolean): TaskStateRecord;
  setDeclutteringDecision(
    itemId: string,
    action: DeclutteringAction
  ): DeclutteringDecisionRecord;
  setCostOverride(costId: string, stimaEur: number): CostOverrideRecord;
  setBotanicalInterventionState(
    interventionId: string,
    completed: boolean
  ): BotanicalInterventionStateRecord;
  setBotanicalNotes(layoutNotes: string): BotanicalNotesRecord;
  close(): void;
};

const defaultDbPath = resolve(process.cwd(), "data/relocation.sqlite");

export function createSqlitePersistence(dbPath = process.env.DATABASE_PATH ?? defaultDbPath): Persistence {
  if (dbPath !== ":memory:") {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      user_message TEXT NOT NULL,
      assistant_text TEXT NOT NULL,
      provider TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      schema_version TEXT NOT NULL,
      snapshot_id TEXT NOT NULL,
      conversation_id INTEGER NOT NULL,
      payload_json TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_created_at
      ON conversations(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_snapshots_created_at
      ON snapshots(created_at DESC);

    CREATE TABLE IF NOT EXISTS task_state (
      task_id TEXT PRIMARY KEY,
      completed INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS decluttering_decisions (
      item_id TEXT PRIMARY KEY,
      action TEXT NOT NULL CHECK (action IN ('Vendere', 'Donare', 'Buttare')),
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cost_overrides (
      cost_id TEXT PRIMARY KEY,
      stima_eur REAL NOT NULL CHECK (stima_eur >= 0),
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS botanical_intervention_state (
      intervention_id TEXT PRIMARY KEY,
      completed INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS botanical_notes (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      layout_notes TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const insertConversation = db.prepare(`
    INSERT INTO conversations (created_at, user_message, assistant_text, provider)
    VALUES (@created_at, @user_message, @assistant_text, @provider)
  `);

  const getConversationById = db.prepare(`
    SELECT id, created_at, user_message, assistant_text, provider
    FROM conversations
    WHERE id = ?
  `);

  const insertSnapshot = db.prepare(`
    INSERT INTO snapshots (
      created_at,
      schema_version,
      snapshot_id,
      conversation_id,
      payload_json
    )
    VALUES (
      @created_at,
      @schema_version,
      @snapshot_id,
      @conversation_id,
      @payload_json
    )
  `);

  const getSnapshotById = db.prepare(`
    SELECT id, created_at, schema_version, snapshot_id, conversation_id, payload_json
    FROM snapshots
    WHERE id = ?
  `);

  const getRecentConversations = db.prepare(`
    SELECT id, created_at, user_message, assistant_text, provider
    FROM conversations
    ORDER BY id DESC
    LIMIT ?
  `);

  const getLatestSnapshot = db.prepare(`
    SELECT id, created_at, schema_version, snapshot_id, conversation_id, payload_json
    FROM snapshots
    ORDER BY id DESC
    LIMIT 1
  `);

  const getRecentSnapshots = db.prepare(`
    SELECT id, created_at, schema_version, snapshot_id, conversation_id, payload_json
    FROM snapshots
    ORDER BY id DESC
    LIMIT ?
  `);

  const upsertTaskState = db.prepare(`
    INSERT INTO task_state (task_id, completed, updated_at)
    VALUES (@task_id, @completed, @updated_at)
    ON CONFLICT(task_id) DO UPDATE SET
      completed = excluded.completed,
      updated_at = excluded.updated_at
  `);

  const getTaskStateById = db.prepare(`
    SELECT task_id, completed, updated_at
    FROM task_state
    WHERE task_id = ?
  `);

  const getTaskStates = db.prepare(`
    SELECT task_id, completed, updated_at
    FROM task_state
    ORDER BY updated_at DESC
  `);

  const upsertDeclutteringDecision = db.prepare(`
    INSERT INTO decluttering_decisions (item_id, action, updated_at)
    VALUES (@item_id, @action, @updated_at)
    ON CONFLICT(item_id) DO UPDATE SET
      action = excluded.action,
      updated_at = excluded.updated_at
  `);

  const getDeclutteringDecisionById = db.prepare(`
    SELECT item_id, action, updated_at
    FROM decluttering_decisions
    WHERE item_id = ?
  `);

  const getDeclutteringDecisions = db.prepare(`
    SELECT item_id, action, updated_at
    FROM decluttering_decisions
    ORDER BY updated_at DESC
  `);

  const upsertCostOverride = db.prepare(`
    INSERT INTO cost_overrides (cost_id, stima_eur, updated_at)
    VALUES (@cost_id, @stima_eur, @updated_at)
    ON CONFLICT(cost_id) DO UPDATE SET
      stima_eur = excluded.stima_eur,
      updated_at = excluded.updated_at
  `);

  const getCostOverrideById = db.prepare(`
    SELECT cost_id, stima_eur, updated_at
    FROM cost_overrides
    WHERE cost_id = ?
  `);

  const getCostOverrides = db.prepare(`
    SELECT cost_id, stima_eur, updated_at
    FROM cost_overrides
    ORDER BY updated_at DESC
  `);

  const upsertBotanicalInterventionState = db.prepare(`
    INSERT INTO botanical_intervention_state (intervention_id, completed, updated_at)
    VALUES (@intervention_id, @completed, @updated_at)
    ON CONFLICT(intervention_id) DO UPDATE SET
      completed = excluded.completed,
      updated_at = excluded.updated_at
  `);

  const getBotanicalInterventionById = db.prepare(`
    SELECT intervention_id, completed, updated_at
    FROM botanical_intervention_state
    WHERE intervention_id = ?
  `);

  const getBotanicalInterventions = db.prepare(`
    SELECT intervention_id, completed, updated_at
    FROM botanical_intervention_state
    ORDER BY updated_at DESC
  `);

  const upsertBotanicalNotes = db.prepare(`
    INSERT INTO botanical_notes (id, layout_notes, updated_at)
    VALUES (1, @layout_notes, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      layout_notes = excluded.layout_notes,
      updated_at = excluded.updated_at
  `);

  const getBotanicalNotes = db.prepare(`
    SELECT layout_notes, updated_at
    FROM botanical_notes
    WHERE id = 1
  `);

  return {
    saveConversation(input) {
      const result = insertConversation.run({
        created_at: new Date().toISOString(),
        user_message: input.userMessage,
        assistant_text: input.assistantText,
        provider: input.provider
      });

      return getConversationById.get(result.lastInsertRowid) as ConversationRecord;
    },

    saveSnapshot(input) {
      const result = insertSnapshot.run({
        created_at: new Date().toISOString(),
        schema_version: input.payload.schema_version,
        snapshot_id: input.payload.snapshot_id,
        conversation_id: input.conversationId,
        payload_json: JSON.stringify(input.payload)
      });

      return mapSnapshot(getSnapshotById.get(result.lastInsertRowid));
    },

    getRecentConversations(limit = 20) {
      return getRecentConversations.all(limit) as ConversationRecord[];
    },

    getLatestSnapshot() {
      const row = getLatestSnapshot.get();
      return row ? mapSnapshot(row) : null;
    },

    getRecentSnapshots(limit = 20) {
      return getRecentSnapshots.all(limit).map(mapSnapshot);
    },

    getUserState() {
      return {
        taskStates: getTaskStates.all().map(mapTaskState),
        declutteringDecisions: getDeclutteringDecisions
          .all()
          .map(mapDeclutteringDecision),
        costOverrides: getCostOverrides.all().map(mapCostOverride),
        botanicalInterventions: getBotanicalInterventions
          .all()
          .map(mapBotanicalIntervention),
        botanicalNotes: mapNullableBotanicalNotes(getBotanicalNotes.get())
      };
    },

    setTaskState(taskId, completed) {
      upsertTaskState.run({
        task_id: taskId,
        completed: completed ? 1 : 0,
        updated_at: new Date().toISOString()
      });

      return mapTaskState(getTaskStateById.get(taskId));
    },

    setDeclutteringDecision(itemId, action) {
      upsertDeclutteringDecision.run({
        item_id: itemId,
        action,
        updated_at: new Date().toISOString()
      });

      return mapDeclutteringDecision(getDeclutteringDecisionById.get(itemId));
    },

    setCostOverride(costId, stimaEur) {
      upsertCostOverride.run({
        cost_id: costId,
        stima_eur: stimaEur,
        updated_at: new Date().toISOString()
      });

      return mapCostOverride(getCostOverrideById.get(costId));
    },

    setBotanicalInterventionState(interventionId, completed) {
      upsertBotanicalInterventionState.run({
        intervention_id: interventionId,
        completed: completed ? 1 : 0,
        updated_at: new Date().toISOString()
      });

      return mapBotanicalIntervention(getBotanicalInterventionById.get(interventionId));
    },

    setBotanicalNotes(layoutNotes) {
      upsertBotanicalNotes.run({
        layout_notes: layoutNotes,
        updated_at: new Date().toISOString()
      });

      return mapNullableBotanicalNotes(getBotanicalNotes.get()) as BotanicalNotesRecord;
    },

    close() {
      db.close();
    }
  };
}

function mapSnapshot(row: unknown): SnapshotRecord {
  const snapshot = row as {
    id: number;
    created_at: string;
    schema_version: string;
    snapshot_id: string;
    conversation_id: number;
    payload_json: string;
  };

  return {
    id: snapshot.id,
    created_at: snapshot.created_at,
    schema_version: snapshot.schema_version,
    snapshot_id: snapshot.snapshot_id,
    conversation_id: snapshot.conversation_id,
    payload: JSON.parse(snapshot.payload_json) as RelocationData
  };
}

function mapTaskState(row: unknown): TaskStateRecord {
  const state = row as {
    task_id: string;
    completed: number;
    updated_at: string;
  };

  return {
    task_id: state.task_id,
    completed: Boolean(state.completed),
    updated_at: state.updated_at
  };
}

function mapDeclutteringDecision(row: unknown): DeclutteringDecisionRecord {
  const decision = row as {
    item_id: string;
    action: DeclutteringAction;
    updated_at: string;
  };

  return {
    item_id: decision.item_id,
    action: decision.action,
    updated_at: decision.updated_at
  };
}

function mapCostOverride(row: unknown): CostOverrideRecord {
  const override = row as {
    cost_id: string;
    stima_eur: number;
    updated_at: string;
  };

  return {
    cost_id: override.cost_id,
    stima_eur: override.stima_eur,
    updated_at: override.updated_at
  };
}

function mapBotanicalIntervention(row: unknown): BotanicalInterventionStateRecord {
  const intervention = row as {
    intervention_id: string;
    completed: number;
    updated_at: string;
  };

  return {
    intervention_id: intervention.intervention_id,
    completed: Boolean(intervention.completed),
    updated_at: intervention.updated_at
  };
}

function mapNullableBotanicalNotes(row: unknown): BotanicalNotesRecord | null {
  if (!row) {
    return null;
  }

  const notes = row as {
    layout_notes: string;
    updated_at: string;
  };

  return {
    layout_notes: notes.layout_notes,
    updated_at: notes.updated_at
  };
}
