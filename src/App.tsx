import { useEffect, useMemo, useState } from "react";
import { BotanicalPlan } from "./components/BotanicalPlan";
import {
  DeclutteringGraveyard,
  type DeclutteringAction
} from "./components/DeclutteringGraveyard";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { MasterTimeline } from "./components/MasterTimeline";
import { parseRelocationResponse } from "./lib/parse-ai-json";
import type { DeclutteringItem, TaskLogistico, VoceCosto } from "./lib/relocation-schema";
import { validRelocationResponse } from "./fixtures/demo-response";

type UserStatePayload = {
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

export default function App() {
  const [rawResponse, setRawResponse] = useState(validRelocationResponse);
  const [message, setMessage] = useState(
    "Ho un trasloco da organizzare e devo capire priorita, costi e cosa eliminare."
  );
  const [apiStatus, setApiStatus] = useState<string>("Provider mock pronto.");
  const [persistedItems, setPersistedItems] = useState(0);
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

        const payload = (await response.json()) as {
          latestSnapshot?: {
            payload?: unknown;
          } | null;
          recentConversations?: unknown[];
          userState?: UserStatePayload;
        };

        setPersistedItems(payload.recentConversations?.length ?? 0);
        hydrateUserState(payload.userState);

        if (payload.latestSnapshot?.payload) {
          setRawResponse(
            `Snapshot persistito dal database locale.\n\n\`\`\`json\n${JSON.stringify(
              payload.latestSnapshot.payload,
              null,
              2
            )}\n\`\`\``
          );
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
        snapshotSaved?: boolean;
      };

      if (!response.ok || !payload.assistantText) {
        throw new Error(payload.detail ?? payload.error ?? "Risposta API non valida.");
      }

      setRawResponse(payload.assistantText);
      setPersistedItems((current) => current + 1);
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

  function hydrateUserState(userState?: UserStatePayload) {
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
        <aside className="border-b border-neutral-800 bg-black p-5 lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500">
            L'Inquisitore Logistico
          </p>
          <h1 className="mt-3 text-2xl font-semibold">
            Relocation Manager
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Console tecnica. Interroga il backend mock, valida il JSON e trasforma
            il modulo IA in dashboard operativa.
          </p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Console interrogatoria
          </label>
          <textarea
            className="mt-2 h-28 w-full resize-none border border-neutral-800 bg-neutral-950 p-3 text-sm leading-5 text-neutral-200 outline-none focus:border-red-500"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button
            className="mt-3 w-full border border-red-800 bg-red-950 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-red-100 hover:bg-red-900 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-900 disabled:text-neutral-500"
            type="button"
            onClick={interrogateBackend}
            disabled={isLoading}
          >
            {isLoading ? "Interrogazione..." : "Interroga"}
          </button>
          <p className="mt-3 min-h-5 text-xs text-neutral-500">{apiStatus}</p>
          <p className="mt-1 text-xs text-neutral-600">
            Conversazioni persistite: {persistedItems}
          </p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Output IA grezzo
          </label>
          <textarea
            className="mt-2 h-[460px] w-full resize-none border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs leading-5 text-neutral-200 outline-none focus:border-red-500"
            value={rawResponse}
            onChange={(event) => setRawResponse(event.target.value)}
            spellCheck={false}
          />
        </aside>

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
