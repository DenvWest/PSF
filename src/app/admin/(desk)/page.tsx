import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { ExpiryCalendarStrip } from "@/components/partnerdesk/ExpiryCalendarStrip";
import { SignalRow } from "@/components/partnerdesk/SignalRow";
import { TaskRow } from "@/components/partnerdesk/TaskRow";
import Link from "next/link";
import { todayIso } from "@/lib/partnerdesk/dates";
import {
  listOpenSignals,
  listOpenTasks,
  listRecentPartners,
  listUpcomingExpiries,
} from "@/lib/partnerdesk/queries";
import { syncAllSignals } from "@/lib/partnerdesk/signals";
import { groupTasks } from "@/lib/partnerdesk/task-grouping";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] p-5">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function VandaagPage() {
  await syncAllSignals();

  const today = todayIso();
  const [signals, taskItems, expiries, recent] = await Promise.all([
    listOpenSignals(),
    listOpenTasks(),
    listUpcomingExpiries(),
    listRecentPartners(),
  ]);

  const red = signals.filter((s) => s.signal.severity === "red");
  const amber = signals.filter((s) => s.signal.severity === "amber");

  const taskGroups = groupTasks(
    taskItems.map((i) => ({ ...i, due_on: i.task.due_on })),
    today,
  );
  const activeTasks = [...taskGroups.overdue, ...taskGroups.today, ...taskGroups.week];
  const allQuiet = signals.length === 0 && activeTasks.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Vandaag</h1>

      {allQuiet ? (
        <EmptyState title="Alles rustig">0 signalen, 0 taken vandaag.</EmptyState>
      ) : (
        <div className="space-y-5">
          {signals.length > 0 && (
            <Card title={`Signalen (${signals.length})`}>
              {red.length > 0 && (
                <div className="mb-2">
                  {red.map((s) => (
                    <SignalRow key={s.signal.id} item={s} />
                  ))}
                </div>
              )}
              {amber.map((s) => (
                <SignalRow key={s.signal.id} item={s} />
              ))}
            </Card>
          )}

          {activeTasks.length > 0 && (
            <Card title="Taken">
              {taskGroups.overdue.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                    Te laat · {taskGroups.overdue.length}
                  </p>
                  {taskGroups.overdue.map((row) => (
                    <TaskRow key={row.task.id} task={row.task} partnerName={row.partnerName} partnerSlug={row.partnerSlug} />
                  ))}
                </div>
              )}
              {taskGroups.today.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ps-muted)]">
                    Vandaag · {taskGroups.today.length}
                  </p>
                  {taskGroups.today.map((row) => (
                    <TaskRow key={row.task.id} task={row.task} partnerName={row.partnerName} partnerSlug={row.partnerSlug} />
                  ))}
                </div>
              )}
              {taskGroups.week.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ps-muted)]">
                    Deze week · {taskGroups.week.length}
                  </p>
                  {taskGroups.week.map((row) => (
                    <TaskRow key={row.task.id} task={row.task} partnerName={row.partnerName} partnerSlug={row.partnerSlug} />
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      <div className="mt-5 space-y-5">
        <Card title="Verloopkalender">
          <ExpiryCalendarStrip events={expiries} />
        </Card>

        {recent.length > 0 && (
          <Card title="Recent">
            <ul className="space-y-1 text-sm">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/partners/${p.slug}`} className="hover:underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
