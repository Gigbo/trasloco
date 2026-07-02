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

export type AppStatePayload = {
  latestSnapshot?: {
    payload?: unknown;
  } | null;
  recentConversations?: ConversationPayload[];
  userState?: UserStatePayload;
};
