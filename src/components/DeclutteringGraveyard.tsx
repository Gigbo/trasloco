import { useMemo } from "react";
import type { DeclutteringAction } from "../lib/api-types";
import { getPendingDeclutteringItems } from "../lib/dashboard-projections";
import type { DeclutteringItem } from "../lib/relocation-schema";

type DeclutteringGraveyardProps = {
  items: DeclutteringItem[];
  decisions: Record<string, DeclutteringAction>;
  onDecision: (item: DeclutteringItem, action: DeclutteringAction) => void;
};

const actionStyles = {
  Vendere: "border-emerald-700 text-emerald-200 hover:bg-emerald-950",
  Donare: "border-sky-700 text-sky-200 hover:bg-sky-950",
  Buttare: "border-red-700 text-red-200 hover:bg-red-950"
} as const;

export function DeclutteringGraveyard({
  items,
  decisions,
  onDecision
}: DeclutteringGraveyardProps) {
  const currentItem = getPendingDeclutteringItems(items, decisions)[0];
  const decidedCount = Object.keys(decisions).length;

  const summary = useMemo(() => {
    return (["Vendere", "Donare", "Buttare"] as const).map((action) => ({
      action,
      count: Object.values(decisions).filter((decision) => decision === action).length
    }));
  }, [decisions]);

  return (
    <section className="border border-neutral-800 bg-black">
      <header className="border-b border-neutral-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Cimitero del Superfluo
        </p>
        <h2 className="mt-1 text-xl font-semibold text-neutral-100">
          {decidedCount}/{items.length} decisioni definitive
        </h2>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
        <div className="min-h-[280px] border border-neutral-800 bg-neutral-950 p-5">
          {currentItem ? (
            <>
              <div className="flex flex-wrap gap-2">
                <span className="border border-neutral-700 px-2 py-1 text-xs uppercase tracking-widest text-neutral-400">
                  {currentItem.categoria}
                </span>
                <span className="border border-neutral-700 px-2 py-1 text-xs uppercase tracking-widest text-neutral-400">
                  Ingombro {currentItem.ingombro}
                </span>
                <span className="border border-red-900 px-2 py-1 text-xs uppercase tracking-widest text-red-300">
                  Urgenza {currentItem.urgenza_decisione}
                </span>
              </div>
              <h3 className="mt-5 text-3xl font-semibold text-neutral-100">
                {currentItem.oggetto}
              </h3>
              <p className="mt-4 border-l border-red-800 pl-4 text-lg leading-8 text-neutral-200">
                {currentItem.domanda_socratica}
              </p>
              <p className="mt-4 text-sm leading-6 text-neutral-400">
                Consiglio IA: {currentItem.azione_consigliata}. {currentItem.motivazione}
              </p>
              <p className="mt-2 font-mono text-sm text-neutral-500">
                Valore stimato: {currentItem.valore_stimato_eur} EUR
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {(["Vendere", "Donare", "Buttare"] as const).map((action) => (
                  <button
                    className={`border px-4 py-3 text-sm font-semibold uppercase tracking-widest ${actionStyles[action]}`}
                    key={action}
                    type="button"
                    onClick={() => onDecision(currentItem, action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-[240px] items-center justify-center border border-neutral-900 bg-black p-6 text-center">
              <p className="text-sm uppercase tracking-widest text-neutral-500">
                Coda svuotata. Nessun oggetto puo piu nascondersi dietro l'indecisione.
              </p>
            </div>
          )}
        </div>

        <aside className="border border-neutral-800 bg-neutral-950 p-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Riepilogo</p>
          <div className="mt-4 space-y-3">
            {summary.map((item) => (
              <div className="flex items-center justify-between border-b border-neutral-900 pb-2" key={item.action}>
                <span className="text-sm text-neutral-300">{item.action}</span>
                <span className="font-mono text-lg text-neutral-100">{item.count}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
