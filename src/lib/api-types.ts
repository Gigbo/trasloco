import type { RelocationData } from "./relocation-schema";

export type DeclutteringAction = "Vendere" | "Donare" | "Buttare";

export type ConversationPayload = {
  id: number;
  created_at: string;
  user_message: string;
  assistant_text: string;
  provider: string;
};

export type UserStatePayload = {
  taskStates: Array<{
    task_id: string;
    completed: boolean;
  }>;
  declutteringDecisions: Array<{
    item_id: string;
    action: DeclutteringAction;
  }>;
  costOverrides: Array<{
    cost_id: string;
    stima_eur: number;
  }>;
  botanicalInterventions: Array<{
    intervention_id: string;
    completed: boolean;
  }>;
  botanicalNotes: {
    layout_notes: string;
  } | null;
};

export type SnapshotPayload = {
  id: number;
  created_at: string;
  schema_version: string;
  snapshot_id: string;
  conversation_id: number;
  payload: RelocationData;
};

export type AppStatePayload = {
  latestSnapshot?: SnapshotPayload | null;
  recentSnapshots?: SnapshotPayload[];
  recentConversations?: ConversationPayload[];
  userState?: UserStatePayload;
};
