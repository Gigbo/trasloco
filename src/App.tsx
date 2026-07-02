import { useEffect, useMemo, useState } from "react";
import { BotanicalPlan } from "./components/BotanicalPlan";
import { DeclutteringGraveyard } from "./components/DeclutteringGraveyard";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { InterrogationConsole } from "./components/InterrogationConsole";
import { MasterTimeline } from "./components/MasterTimeline";
import { parseRelocationResponse } from "./lib/parse-ai-json";
import type { DeclutteringItem, TaskLogistico, VoceCosto } from "./lib/relocation-schema";
import type {
  AppStatePayload,
  ConversationPayload,
  DeclutteringAction,
  SnapshotPayload
} from "./lib/api-types";
import { validRelocationResponse } from "./fixtures/demo-response";

export default function App() {
  const [rawResponse, setRawResponse] = useState(validRelocationResponse);
  const [message, setMessage] = useState(
    "Ho un trasloco da organizzare e devo capire priorita, costi e cosa eliminare."
  );
  const [apiStatus, setApiStatus] = useState<string>("Provider mock pronto.");
  const [persistedItems, setPersistedItems] = useState(0);
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

  const parseResult = useMemo(() => {
    return parseRelocationResponse(rawResponse);
  }, [rawResponse]);

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
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : "Errore API sconosciuto.");
    } finally {
      setIsLoading(false);
    }
  }

  function syncConversations(nextConversations: ConversationPayload[]) {
    const uniqueConversations = Array.from(
      new Map(nextConversations.map((conversation) => [conversation.id, conversation])).values()
    );

    setConversations(uniqueConversations);
    setPersistedItems(uniqueConversations.length);
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

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)]">
        <InterrogationConsole
          message={message}
          rawResponse={rawResponse}
          apiStatus={apiStatus}
          isLoading={isLoading}
          persistedItems={persistedItems}
          conversations={conversations}
          snapshots={snapshots}
          selectedConversationId={selectedConversationId}
          selectedSnapshotId={selectedSnapshotId}
          onMessageChange={setMessage}
          onRawResponseChange={(nextRawResponse) => {
            setRawResponse(nextRawResponse);
            setSelectedSnapshotId(null);
          }}
          onSubmit={interrogateBackend}
          onSelectConversation={selectConversation}
          onSelectSnapshot={selectSnapshot}
        />

        <section className="space-y-5 p-5">
          {parseResult.success ? (
            <>
              <DashboardHeader data={parseResult.data} />
              <MasterTimeline
                tasks={parseResult.data.task_logistici}
                completedTaskIds={completedTaskIds}
                onTaskCompletionChange={updateTaskState}
              />
              <FinancialDashboard
                costs={parseResult.data.analisi_costi}
                overrides={costOverrides}
                onOverrideChange={updateCostOverride}
              />
              <DeclutteringGraveyard
                items={parseResult.data.verdetto_decluttering}
                decisions={declutteringDecisions}
                onDecision={updateDeclutteringDecision}
              />
              <BotanicalPlan
                botanica={parseResult.data.logistica_botanica}
                completedInterventionIds={completedInterventionIds}
                layoutNotes={layoutNotes}
                onInterventionChange={updateBotanicalIntervention}
                onLayoutNotesChange={setLayoutNotes}
                onLayoutNotesCommit={commitLayoutNotes}
              />
              <RiskPanel
                questions={parseResult.data.domande_aperte}
                risks={parseResult.data.rischi}
              />
              <details className="border border-neutral-800 bg-black p-4">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  JSON normalizzato
                </summary>
                <pre className="mt-4 overflow-auto border border-neutral-800 bg-neutral-950 p-4 text-xs leading-5 text-neutral-300">
                  {JSON.stringify(parseResult.data, null, 2)}
                </pre>
              </details>
            </>
          ) : (
            <div className="border border-red-900 bg-red-950/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-300">
                JSON respinto
              </p>
              <p className="mt-3 text-sm leading-6 text-red-100">{parseResult.error}</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function DashboardHeader({
  data
}: {
  data: Extract<ReturnType<typeof parseRelocationResponse>, { success: true }>["data"];
}) {
  return (
    <header className="border border-neutral-800 bg-black p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Fase trasloco
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-neutral-100">
            {data.fase_trasloco}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
            {data.sintesi_operativa}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2">
          <Metric label="Task" value={data.task_logistici.length} />
          <Metric label="Costi" value={data.analisi_costi.length} />
          <Metric label="Oggetti" value={data.verdetto_decluttering.length} />
          <Metric label="Rischi" value={data.rischi.length} />
        </div>
      </div>
    </header>
  );
}

function RiskPanel({
  questions,
  risks
}: {
  questions: Extract<ReturnType<typeof parseRelocationResponse>, { success: true }>["data"]["domande_aperte"];
  risks: Extract<ReturnType<typeof parseRelocationResponse>, { success: true }>["data"]["rischi"];
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <div className="border border-neutral-800 bg-black p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Domande aperte
        </p>
        <div className="mt-4 space-y-3">
          {questions.map((question) => (
            <article className="border border-neutral-800 bg-neutral-950 p-3" key={question.id}>
              <p className="text-sm font-semibold text-neutral-100">{question.domanda}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-400">{question.motivo}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="border border-neutral-800 bg-black p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Rischi
        </p>
        <div className="mt-4 space-y-3">
          {risks.map((risk) => (
            <article className="border border-neutral-800 bg-neutral-950 p-3" key={risk.id}>
              <div className="flex flex-wrap gap-2">
                <span className="border border-neutral-700 px-2 py-1 text-xs uppercase tracking-widest text-neutral-400">
                  {risk.tipo}
                </span>
                <span className="border border-red-900 px-2 py-1 text-xs uppercase tracking-widest text-red-300">
                  {risk.gravita}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-100">
                {risk.descrizione}
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-400">{risk.mitigazione}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-neutral-800 bg-neutral-950 p-3">
      <p className="text-xs uppercase tracking-widest text-neutral-500">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-neutral-100">{value}</p>
    </div>
  );
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
