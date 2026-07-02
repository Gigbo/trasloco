import type { DeclutteringAction } from "./api-types";
import type { DeclutteringItem, TaskLogistico, VoceCosto } from "./relocation-schema";

export function getSortedTimelineTasks(tasks: TaskLogistico[]) {
  return [...tasks].sort(
    (left, right) =>
      left.scadenza_giorni_al_trasloco - right.scadenza_giorni_al_trasloco
  );
}

export function calculateBudgetTotal(
  costs: VoceCosto[],
  overrides: Record<string, number>
) {
  return costs.reduce((sum, cost) => sum + (overrides[cost.id] ?? cost.stima_eur), 0);
}

export function getPendingDeclutteringItems(
  items: DeclutteringItem[],
  decisions: Record<string, DeclutteringAction>
) {
  return items.filter((item) => !decisions[item.id]);
}
