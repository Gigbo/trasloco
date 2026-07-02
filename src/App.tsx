import { useMemo } from "react";
import { BotanicalPlan } from "./components/BotanicalPlan";
import { DeclutteringGraveyard } from "./components/DeclutteringGraveyard";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { InterrogationConsole } from "./components/InterrogationConsole";
import { MasterTimeline } from "./components/MasterTimeline";
import { usePersistedRelocationState } from "./hooks/usePersistedRelocationState";
import { useProviderStatus } from "./hooks/useProviderStatus";
import { parseRelocationResponse } from "./lib/parse-ai-json";

export default function App() {
  const {
    providerStatus,
    isChangingModel,
    refreshProviderStatus,
    changeProviderModel
  } = useProviderStatus();
  const relocationState = usePersistedRelocationState({
    onProviderStatusRefresh: refreshProviderStatus
  });

  const parseResult = useMemo(() => {
    return parseRelocationResponse(relocationState.rawResponse);
  }, [relocationState.rawResponse]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)]">
        <InterrogationConsole
          message={relocationState.message}
          rawResponse={relocationState.rawResponse}
          apiStatus={relocationState.apiStatus}
          providerStatus={providerStatus}
          isChangingModel={isChangingModel}
          isLoading={relocationState.isLoading}
          persistedItems={relocationState.persistedItems}
          conversations={relocationState.conversations}
          snapshots={relocationState.snapshots}
          selectedConversationId={relocationState.selectedConversationId}
          selectedSnapshotId={relocationState.selectedSnapshotId}
          onMessageChange={relocationState.setMessage}
          onRawResponseChange={relocationState.updateRawResponse}
          onSubmit={relocationState.interrogateBackend}
          onModelChange={changeProviderModel}
          onSelectConversation={relocationState.selectConversation}
          onSelectSnapshot={relocationState.selectSnapshot}
        />

        <section className="space-y-5 p-5">
          {parseResult.success ? (
            <>
              <DashboardHeader data={parseResult.data} />
              <MasterTimeline
                tasks={parseResult.data.task_logistici}
                completedTaskIds={relocationState.completedTaskIds}
                onTaskCompletionChange={relocationState.updateTaskState}
              />
              <FinancialDashboard
                costs={parseResult.data.analisi_costi}
                overrides={relocationState.costOverrides}
                onOverrideChange={relocationState.updateCostOverride}
              />
              <DeclutteringGraveyard
                items={parseResult.data.verdetto_decluttering}
                decisions={relocationState.declutteringDecisions}
                onDecision={relocationState.updateDeclutteringDecision}
              />
              <BotanicalPlan
                botanica={parseResult.data.logistica_botanica}
                completedInterventionIds={relocationState.completedInterventionIds}
                layoutNotes={relocationState.layoutNotes}
                onInterventionChange={relocationState.updateBotanicalIntervention}
                onLayoutNotesChange={relocationState.setLayoutNotes}
                onLayoutNotesCommit={relocationState.commitLayoutNotes}
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
