import { useMemo } from "react";
import { calculateBudgetTotal } from "../lib/dashboard-projections";
import type { VoceCosto } from "../lib/relocation-schema";

type FinancialDashboardProps = {
  costs: VoceCosto[];
  overrides: Record<string, number>;
  onOverrideChange: (cost: VoceCosto, stimaEur: number) => void;
};

const riskStyles = {
  Alto: "text-red-300",
  Medio: "text-amber-300",
  Basso: "text-neutral-300"
} as const;

export function FinancialDashboard({
  costs,
  overrides,
  onOverrideChange
}: FinancialDashboardProps) {
  const total = useMemo(() => {
    return calculateBudgetTotal(costs, overrides);
  }, [costs, overrides]);

  function updateCost(cost: VoceCosto, value: string) {
    const parsed = Number(value);

    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }

    onOverrideChange(cost, parsed);
  }

  return (
    <section className="border border-neutral-800 bg-black">
      <header className="grid gap-4 border-b border-neutral-800 p-4 md:grid-cols-[1fr_220px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Cruscotto Finanziario
          </p>
          <h2 className="mt-1 text-xl font-semibold text-neutral-100">
            {costs.length} voci di spesa
          </h2>
        </div>
        <div className="border border-neutral-800 bg-neutral-950 p-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Totale</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-neutral-100">
            {formatCurrency(total)}
          </p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="border-b border-neutral-800 text-xs uppercase tracking-widest text-neutral-500">
            <tr>
              <th className="p-3">Voce</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Stima</th>
              <th className="p-3">Range</th>
              <th className="p-3">Rischio</th>
              <th className="p-3">Strategia risparmio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {costs.map((cost) => (
              <tr className="align-top" key={cost.id}>
                <td className="p-3 font-semibold text-neutral-100">{cost.voce_spesa}</td>
                <td className="p-3 text-neutral-400">{cost.categoria}</td>
                <td className="p-3">
                  <input
                    className="w-28 border border-neutral-800 bg-neutral-950 px-2 py-2 font-mono text-neutral-100 outline-none focus:border-red-500"
                    min={0}
                    type="number"
                    value={overrides[cost.id] ?? cost.stima_eur}
                    onChange={(event) => updateCost(cost, event.target.value)}
                  />
                </td>
                <td className="p-3 font-mono text-neutral-400">
                  {formatCurrency(cost.range_min_eur)} - {formatCurrency(cost.range_max_eur)}
                </td>
                <td className={`p-3 font-semibold ${riskStyles[cost.rischio_sforamento]}`}>
                  {cost.rischio_sforamento}
                </td>
                <td className="max-w-md p-3 leading-6 text-neutral-300">
                  {cost.strategia_risparmio}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}
