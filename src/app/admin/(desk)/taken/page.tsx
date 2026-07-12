import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { TaskRow } from "@/components/partnerdesk/TaskRow";
import { todayIso } from "@/lib/partnerdesk/dates";
import { listOpenTasks } from "@/lib/partnerdesk/queries";
import {
  groupTasks,
  TASK_BUCKET_LABEL,
  TASK_BUCKET_ORDER,
} from "@/lib/partnerdesk/task-grouping";

export const dynamic = "force-dynamic";

export default async function TakenPage() {
  const items = await listOpenTasks();
  const today = todayIso();
  const groups = groupTasks(
    items.map((i) => ({ ...i, due_on: i.task.due_on })),
    today,
  );

  const total = items.length;

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Taken</h1>
        <p className="mt-0.5 text-sm text-[var(--ps-body)]">
          {total} open {total === 1 ? "taak" : "taken"}
        </p>
      </header>

      {total === 0 ? (
        <EmptyState title="Geen open taken">
          Alles afgehandeld. Taken maak je aan vanuit een partnerdossier.
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {TASK_BUCKET_ORDER.map((bucket) => {
            const rows = groups[bucket];
            if (rows.length === 0) return null;
            return (
              <section key={bucket}>
                <h2
                  className={`mb-1 text-xs font-semibold uppercase tracking-wide ${
                    bucket === "overdue" ? "text-red-600" : "text-[var(--ps-muted)]"
                  }`}
                >
                  {TASK_BUCKET_LABEL[bucket]} · {rows.length}
                </h2>
                <div className="divide-y divide-[var(--ps-border)] rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] px-4">
                  {rows.map((row) => (
                    <TaskRow
                      key={row.task.id}
                      task={row.task}
                      partnerName={row.partnerName}
                      partnerSlug={row.partnerSlug}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
