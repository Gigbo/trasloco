import { useMemo } from "react";
import type { RelocationData } from "../lib/relocation-schema";

type BotanicalPlanProps = {
  botanica: RelocationData["logistica_botanica"];
  completedInterventionIds: Set<string>;
  layoutNotes: string;
  onInterventionChange: (interventionId: string, completed: boolean) => void;
  onLayoutNotesChange: (notes: string) => void;
  onLayoutNotesCommit: () => void;
};

export function BotanicalPlan({
  botanica,
  completedInterventionIds,
  layoutNotes,
  onInterventionChange,
  onLayoutNotesChange,
  onLayoutNotesCommit
}: BotanicalPlanProps) {
  const cellMap = useMemo(() => {
    return new Map(
      botanica.layout_nuovo_spazio.giardino_4x2.celle.map((cell) => [
        `${cell.x}:${cell.y}`,
        cell
      ])
    );
  }, [botanica.layout_nuovo_spazio.giardino_4x2.celle]);

  function toggleIntervention(id: string) {
    onInterventionChange(id, !completedInterventionIds.has(id));
  }

  return (
    <section className="border border-neutral-800 bg-black">
      <header className="border-b border-neutral-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Planimetria Botanica
        </p>
        <h2 className="mt-1 text-xl font-semibold text-neutral-100">
          Giardino 4x2m e terrazzo
        </h2>
      </header>

      <div className="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
        <div className="border border-neutral-800 bg-neutral-950 p-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Interventi pre-trasloco
          </p>
          <div className="mt-4 space-y-3">
            {botanica.interventi_pre_trasloco.map((intervention) => {
              const isCompleted = completedInterventionIds.has(intervention.id);

              return (
                <button
                  className={`w-full border p-3 text-left ${
                    isCompleted
                      ? "border-neutral-800 bg-black text-neutral-500"
                      : intervention.critico
                        ? "border-red-900 bg-red-950/20 text-neutral-100"
                        : "border-neutral-800 bg-black text-neutral-200"
                  }`}
                  aria-label={`${isCompleted ? "Riapri" : "Completa"} intervento botanico ${intervention.azione}`}
                  aria-pressed={isCompleted}
                  key={intervention.id}
                  type="button"
                  onClick={() => toggleIntervention(intervention.id)}
                >
                  <span className="block text-xs uppercase tracking-widest text-neutral-500">
                    T-{intervention.giorni_prima} giorni
                  </span>
                  <span className="mt-1 block font-semibold">{intervention.azione}</span>
                  <span className="mt-2 block text-sm leading-6 text-neutral-400">
                    {intervention.motivo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  Griglia giardino
                </p>
                <p className="mt-1 text-sm text-neutral-400">
                  Esposizione:{" "}
                  {botanica.layout_nuovo_spazio.giardino_4x2.esposizione_solare}
                </p>
              </div>
              <p className="font-mono text-sm text-neutral-500">4m x 2m</p>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {[0, 1].flatMap((y) =>
                [0, 1, 2, 3].map((x) => {
                  const cell = cellMap.get(`${x}:${y}`);

                  return (
                    <div
                      className="min-h-28 border border-neutral-800 bg-black p-3"
                      key={`${x}:${y}`}
                    >
                      <p className="font-mono text-xs text-neutral-600">
                        x{x} y{y}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-neutral-200">
                        {cell?.uso_suggerito ?? "Da mappare"}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        {cell?.note ?? "Nessuna nota."}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <label
              className="mt-4 block text-xs uppercase tracking-widest text-neutral-500"
              htmlFor="botanical-layout-notes"
            >
              Note layout e flussi
            </label>
            <textarea
              id="botanical-layout-notes"
              className="mt-2 h-24 w-full resize-none border border-neutral-800 bg-black p-3 text-sm text-neutral-200 outline-none focus:border-red-500"
              value={layoutNotes}
              onBlur={onLayoutNotesCommit}
              onChange={(event) => onLayoutNotesChange(event.target.value)}
              placeholder="Annota sole, passaggi da lasciare liberi, punti acqua, pesi dei vasi."
            />
          </div>

          <aside className="space-y-4">
            <div className="border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-xs uppercase tracking-widest text-neutral-500">Terrazzo</p>
              <p className="mt-2 text-sm text-neutral-300">
                Esposizione: {botanica.layout_nuovo_spazio.terrazzo.esposizione_solare}
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                {botanica.layout_nuovo_spazio.terrazzo.uso_suggerito}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                {botanica.layout_nuovo_spazio.terrazzo.vincoli.map((vincolo) => (
                  <li className="border-l border-neutral-700 pl-3" key={vincolo}>
                    {vincolo}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                Piante critiche
              </p>
              <div className="mt-3 space-y-3">
                {botanica.piante_critiche.map((plant) => (
                  <div className="border border-neutral-800 bg-black p-3" key={plant.id}>
                    <p className="font-semibold text-neutral-100">{plant.nome}</p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-red-300">
                      Rischio {plant.rischio}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      {plant.azione_preventiva}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
