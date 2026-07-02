import { useEffect, useState } from "react";
import { validRelocationResponse } from "../fixtures/demo-response";
import { parseRelocationResponse } from "../lib/parse-ai-json";
import type { DeclutteringItem, TaskLogistico, VoceCosto } from "../lib/relocation-schema";
import type {
  AppStatePayload,
  ConversationPayload,
  DeclutteringAction,
  SnapshotPayload
} from "../lib/api-types";

type UsePersistedRelocationStateOptions = {
  onProviderStatusRefresh: () => void;
};

export function usePersistedRelocationState({
  onProviderStatusRefresh
}: UsePersistedRelocationStateOptions) {
  const [rawResponse, setRawResponse] = useState(validRelocationResponse);
  const [message, setMessage] = useState(
    "Ho un trasloco da organizzare e devo capire priorita, costi e cosa eliminare."
  );
  const [apiStatus, setApiStatus] = useState<string>("Backend in verifica...");
  const [conversations, setConversations] = useState<ConversationPayload[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotPayload[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    null
  );
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [declutteringDecisions, setDeclutteringDecisions] = useState<
    Record<string, DeclutteringAction>
  >({});
  const [costOverrides, setCostOverrides] = useState<Record<string, number>>({});
  const [completedInterventionIds, setCompletedInterventionIds] = useState<Set<string>>(
    new Set()
  );
  const [layoutNotes, setLayoutNotes] = useState("");

  useEffect(() => {
    async function loadPersistedState() {
      try {
        const response = await fetch("/api/state");

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as AppStatePayload;

        syncConversations(payload.recentConversations ?? []);
        syncSnapshots(payload.recentSnapshots ?? []);
        hydrateUserState(payload.userState);

        if (payload.latestSnapshot?.payload) {
          setRawResponse(formatSnapshotAsRawResponse(payload.latestSnapshot));
          setSelectedSnapshotId(payload.latestSnapshot.id);
          setApiStatus("Ultimo snapshot valido caricato da SQLite.");
        }
      } catch {
        setApiStatus("Backend non raggiungibile: uso il dato demo locale.");
      }
    }

    void loadPersistedState();
  }, []);

  async function interrogateBackend() {
    setIsLoading(true);
    setApiStatus("Interrogazione in corso...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const payload = (await response.json()) as {
        assistantText?: string;
        error?: string;
        detail?: string;
        provider?: string;
        conversationId?: number;
        snapshotId?: number | null;
        snapshotSaved?: boolean;
      };

      if (!response.ok || !payload.assistantText) {
        throw new Error(payload.detail ?? payload.error ?? "Risposta API non valida.");
      }

      setRawResponse(payload.assistantText);
      const submittedMessage = message;
      const nextConversation: ConversationPayload = {
        id: payload.conversationId ?? Date.now(),
        created_at: new Date().toISOString(),
        user_message: submittedMessage,
        assistant_text: payload.assistantText,
        provider: payload.provider ?? "sconosciuto"
      };
      syncConversations([nextConversation, ...conversations]);
      setSelectedConversationId(nextConversation.id);

      const chatParseResult = parseRelocationResponse(payload.assistantText);

      if (payload.snapshotSaved && payload.snapshotId && chatParseResult.success) {
        const nextSnapshot: SnapshotPayload = {
          id: payload.snapshotId,
          created_at: new Date().toISOString(),
          schema_version: chatParseResult.data.schema_version,
          snapshot_id: chatParseResult.data.snapshot_id,
          conversation_id: nextConversation.id,
          payload: chatParseResult.data
        };
        syncSnapshots([nextSnapshot, ...snapshots]);
        setSelectedSnapshotId(nextSnapshot.id);
      } else {
        setSelectedSnapshotId(null);
      }

      setApiStatus(
        `Risposta ricevuta dal provider ${payload.provider ?? "sconosciuto"}. Snapshot ${
          payload.snapshotSaved ? "salvato" : "non salvato"
        }.`
      );
      onProviderStatusRefresh();
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : "Errore API sconosciuto.");
      onProviderStatusRefresh();
    } finally {
      setIsLoading(false);
    }
  }

  function syncConversations(nextConversations: ConversationPayload[]) {
    const uniqueConversations = Array.from(
      new Map(nextConversations.map((conversation) => [conversation.id, conversation])).values()
    );

    setConversations(uniqueConversations);
  }

  function syncSnapshots(nextSnapshots: SnapshotPayload[]) {
    const uniqueSnapshots = Array.from(
      new Map(nextSnapshots.map((snapshot) => [snapshot.id, snapshot])).values()
    );

    setSnapshots(uniqueSnapshots);
  }

  function selectConversation(conversation: ConversationPayload) {
    setSelectedConversationId(conversation.id);
    setMessage(conversation.user_message);
    setRawResponse(conversation.assistant_text);
    const linkedSnapshot = snapshots.find(
      (snapshot) => snapshot.conversation_id === conversation.id
    );
    setSelectedSnapshotId(linkedSnapshot?.id ?? null);
    setApiStatus(`Conversazione #${conversation.id} caricata dallo storico locale.`);
  }

  function selectSnapshot(snapshot: SnapshotPayload) {
    setSelectedSnapshotId(snapshot.id);
    setRawResponse(formatSnapshotAsRawResponse(snapshot));
    const linkedConversation = conversations.find(
      (conversation) => conversation.id === snapshot.conversation_id
    );

    if (linkedConversation) {
      setSelectedConversationId(linkedConversation.id);
      setMessage(linkedConversation.user_message);
    } else {
      setSelectedConversationId(null);
    }

    setApiStatus(`Snapshot #${snapshot.id} caricato dallo storico validato.`);
  }

  function hydrateUserState(userState?: AppStatePayload["userState"]) {
    if (!userState) {
      return;
    }

    setCompletedTaskIds(
      new Set(
        userState.taskStates
          .filter((taskState) => taskState.completed)
          .map((taskState) => taskState.task_id)
      )
    );
    setDeclutteringDecisions(
      Object.fromEntries(
        userState.declutteringDecisions.map((decision) => [
          decision.item_id,
          decision.action
        ])
      )
    );
    setCostOverrides(
      Object.fromEntries(
        userState.costOverrides.map((override) => [
          override.cost_id,
          override.stima_eur
        ])
      )
    );
    setCompletedInterventionIds(
      new Set(
        userState.botanicalInterventions
          .filter((intervention) => intervention.completed)
          .map((intervention) => intervention.intervention_id)
      )
    );
    setLayoutNotes(userState.botanicalNotes?.layout_notes ?? "");
  }

  async function updateTaskState(task: TaskLogistico, completed: boolean) {
    setCompletedTaskIds((current) => updateSet(current, task.id, completed));

    try {
      await persistJson(`/api/tasks/${encodeURIComponent(task.id)}`, { completed });
      setApiStatus(`Task "${task.titolo}" salvato in SQLite.`);
    } catch (error) {
      setCompletedTaskIds((current) => updateSet(current, task.id, !completed));
      setApiStatus(error instanceof Error ? error.message : "Errore salvataggio task.");
    }
  }

  async function updateDeclutteringDecision(
    item: DeclutteringItem,
    action: DeclutteringAction
  ) {
    setDeclutteringDecisions((current) => ({
      ...current,
      [item.id]: action
    }));

    try {
      await persistJson(`/api/decluttering/${encodeURIComponent(item.id)}`, { action });
      setApiStatus(`Decisione "${action}" salvata per ${item.oggetto}.`);
    } catch (error) {
      setDeclutteringDecisions((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });
      setApiStatus(
        error instanceof Error ? error.message : "Errore salvataggio decluttering."
      );
    }
  }

  async function updateCostOverride(cost: VoceCosto, stimaEur: number) {
    const previous = costOverrides[cost.id];

    setCostOverrides((current) => ({
      ...current,
      [cost.id]: stimaEur
    }));

    try {
      await persistJson(`/api/costs/${encodeURIComponent(cost.id)}`, { stima_eur: stimaEur });
      setApiStatus(`Costo "${cost.voce_spesa}" aggiornato.`);
    } catch (error) {
      setCostOverrides((current) => {
        const next = { ...current };

        if (previous === undefined) {
          delete next[cost.id];
        } else {
          next[cost.id] = previous;
        }

        return next;
      });
      setApiStatus(error instanceof Error ? error.message : "Errore salvataggio costo.");
    }
  }

  async function updateBotanicalIntervention(interventionId: string, completed: boolean) {
    setCompletedInterventionIds((current) => updateSet(current, interventionId, completed));

    try {
      await persistJson(`/api/botanical/interventions/${encodeURIComponent(interventionId)}`, {
        completed
      });
      setApiStatus("Intervento botanico salvato.");
    } catch (error) {
      setCompletedInterventionIds((current) =>
        updateSet(current, interventionId, !completed)
      );
      setApiStatus(
        error instanceof Error ? error.message : "Errore salvataggio botanica."
      );
    }
  }

  async function commitLayoutNotes() {
    try {
      await persistJson("/api/botanical/notes", { layout_notes: layoutNotes });
      setApiStatus("Note layout botanico salvate.");
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : "Errore salvataggio note.");
    }
  }

  function updateRawResponse(nextRawResponse: string) {
    setRawResponse(nextRawResponse);
    setSelectedSnapshotId(null);
  }

  return {
    rawResponse,
    message,
    apiStatus,
    isLoading,
    persistedItems: conversations.length,
    conversations,
    snapshots,
    selectedConversationId,
    selectedSnapshotId,
    completedTaskIds,
    declutteringDecisions,
    costOverrides,
    completedInterventionIds,
    layoutNotes,
    setMessage,
    updateRawResponse,
    interrogateBackend,
    selectConversation,
    selectSnapshot,
    updateTaskState,
    updateDeclutteringDecision,
    updateCostOverride,
    updateBotanicalIntervention,
    setLayoutNotes,
    commitLayoutNotes
  };
}

async function persistJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string;
      error?: string;
    } | null;
    throw new Error(payload?.detail ?? payload?.error ?? "Salvataggio non riuscito.");
  }
}

function updateSet(current: Set<string>, id: string, enabled: boolean) {
  const next = new Set(current);

  if (enabled) {
    next.add(id);
  } else {
    next.delete(id);
  }

  return next;
}

function formatSnapshotAsRawResponse(snapshot: SnapshotPayload) {
  return `Snapshot #${snapshot.id} persistito dal database locale.\n\n\`\`\`json\n${JSON.stringify(
    snapshot.payload,
    null,
    2
  )}\n\`\`\``;
}
