import { useMemo, useState } from "react";
import { getSortedTimelineTasks } from "../lib/dashboard-projections";
import type { TaskLogistico } from "../lib/relocation-schema";

type MasterTimelineProps = {
  tasks: TaskLogistico[];
  completedTaskIds: Set<string>;
  onTaskCompletionChange: (task: TaskLogistico, completed: boolean) => void;
};

const priorityStyles = {
  Alta: "border-red-700 bg-red-950/40 text-red-100",
  Media: "border-amber-700 bg-amber-950/30 text-amber-100",
  Bassa: "border-neutral-700 bg-neutral-900 text-neutral-300"
} as const;

export function MasterTimeline({
  tasks,
  completedTaskIds,
  onTaskCompletionChange
}: MasterTimelineProps) {
  const [statusFilter, setStatusFilter] = useState<"Tutti" | "Aperti" | "Completati">(
    "Tutti"
  );

  const visibleTasks = useMemo(() => {
    return getSortedTimelineTasks(tasks).filter((task) => {
      const isCompleted = completedTaskIds.has(task.id);

      if (statusFilter === "Aperti") {
        return !isCompleted;
      }

      if (statusFilter === "Completati") {
        return isCompleted;
      }

      return true;
    });
  }, [completedTaskIds, statusFilter, tasks]);

  function toggleTask(task: TaskLogistico) {
    const isCompleted = completedTaskIds.has(task.id);

    if (!isCompleted && task.critico) {
      const confirmed = window.confirm(
        `Hai davvero completato "${task.titolo}" secondo il criterio richiesto, o hai solo spostato il problema in una scatola?`
      );

      if (!confirmed) {
        return;
      }
    }

    onTaskCompletionChange(task, !isCompleted);
  }

  return (
    <section className="border border-neutral-800 bg-neutral-950">
      <header className="flex flex-col gap-3 border-b border-neutral-800 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Master Timeline
          </p>
          <h2 className="mt-1 text-xl font-semibold text-neutral-100">
            {tasks.length} task logistici
          </h2>
        </div>
        <div className="grid grid-cols-3 border border-neutral-800 text-xs">
          {(["Tutti", "Aperti", "Completati"] as const).map((filter) => (
            <button
              className={`px-3 py-2 uppercase tracking-widest ${
                statusFilter === filter
                  ? "bg-neutral-100 text-neutral-950"
                  : "bg-black text-neutral-400 hover:text-neutral-100"
              }`}
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <div className="divide-y divide-neutral-900">
        {visibleTasks.map((task) => {
          const isCompleted = completedTaskIds.has(task.id);

          return (
            <article
              className={`grid gap-4 p-4 md:grid-cols-[92px_1fr_148px] ${
                isCompleted ? "bg-neutral-900/50 text-neutral-500" : "bg-black"
              }`}
              key={task.id}
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  Giorni
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold">
                  {task.scadenza_giorni_al_trasloco}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`border px-2 py-1 text-xs font-semibold uppercase tracking-widest ${
                      priorityStyles[task.priorita]
                    }`}
                  >
                    {task.priorita}
                  </span>
                  <span className="border border-neutral-800 px-2 py-1 text-xs uppercase tracking-widest text-neutral-400">
                    {task.categoria}
                  </span>
                  {task.critico ? (
                    <span className="border border-red-900 px-2 py-1 text-xs uppercase tracking-widest text-red-300">
                      Critico
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-neutral-100">
                  {task.titolo}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  {task.descrizione}
                </p>
                <p className="mt-3 border-l border-neutral-700 pl-3 text-sm text-neutral-300">
                  {task.criterio_completamento}
                </p>
              </div>

              <button
                className={`h-11 border px-3 text-sm font-semibold uppercase tracking-widest ${
                  isCompleted
                    ? "border-neutral-700 bg-neutral-900 text-neutral-400"
                    : "border-neutral-700 bg-neutral-950 text-neutral-100 hover:border-red-700"
                }`}
                type="button"
                onClick={() => toggleTask(task)}
              >
                {isCompleted ? "Riapri" : "Completa"}
              </button>
            </article>
          );
        })}

        {visibleTasks.length === 0 ? (
          <p className="p-4 text-sm text-neutral-500">Nessun task in questo filtro.</p>
        ) : null}
      </div>
    </section>
  );
}
