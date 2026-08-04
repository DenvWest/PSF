"use client";

import * as Icons from "@/components/app/icons";
import AgendaMonthGrid from "@/components/dashboard/agenda/AgendaMonthGrid";
import type { AgendaWeekDayEntry } from "@/components/dashboard/agenda/AgendaWeekOverview";
import { getAgendaCategory } from "@/data/agenda/categories";
import { PILLAR } from "@/data/dashboard";
import { getBlockRoleLabel } from "@/lib/agenda-timeline";
import type { TimelineBlock } from "@/types/agenda";

type AgendaContextSidebarProps = {
  weekEntries: AgendaWeekDayEntry[];
  monthAnchor: string;
  selectedDate: string;
  todayDate: string;
  densityByDate: ReadonlyMap<string, number>;
  selectedBlock: TimelineBlock | null;
  selectedBlockDate: string | null;
  onMonthAnchorChange: (date: string) => void;
  onSelectDate: (date: string) => void;
  onGoToday: () => void;
  onClearSelection: () => void;
  onOpenInDay: () => void;
  onGoVoortgang: () => void;
};

function formatDetailDate(isoDate: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(`${isoDate}T12:00:00.000Z`));
}

function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)}`;
}

function buildWeekSummary(days: AgendaWeekDayEntry[]) {
  const momentCount = days.reduce((sum, day) => sum + day.blocks.length, 0);
  const planDays = days.filter((day) => day.planStepTitle).length;
  const domains = new Set(
    days.map((day) => day.domain).filter((domain): domain is NonNullable<typeof domain> => Boolean(domain)),
  );
  return { momentCount, planDays, domains };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/[0.06] py-2.5 last:border-b-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7E8C82]">
        {label}
      </span>
      <span
        className="text-[13.5px] leading-snug text-[#F1EFE8] capitalize"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function AgendaContextSidebar({
  weekEntries,
  monthAnchor,
  selectedDate,
  todayDate,
  densityByDate,
  selectedBlock,
  selectedBlockDate,
  onMonthAnchorChange,
  onSelectDate,
  onGoToday,
  onClearSelection,
  onOpenInDay,
  onGoVoortgang,
}: AgendaContextSidebarProps) {
  const summary = buildWeekSummary(weekEntries);
  const category = selectedBlock ? getAgendaCategory(selectedBlock.categoryId) : null;

  return (
    <aside
      aria-label="Agenda-context"
      className="flex w-[min(100%,300px)] shrink-0 flex-col rounded-2xl border border-white/10 bg-black/25 lg:w-[300px]"
    >
      <div className="flex-1 overflow-y-auto p-3.5">
        {selectedBlock && selectedBlockDate ? (
          <section aria-label="Moment">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3
                className="m-0 text-[15px] font-medium text-[#F1EFE8]"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                Moment
              </h3>
              <button
                type="button"
                onClick={onClearSelection}
                aria-label="Sluit detail"
                className="inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[14px] leading-none text-[#9FB0A6] transition-colors hover:border-white/25 hover:text-[#F1EFE8]"
              >
                ✕
              </button>
            </div>

            <div
              className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1"
              style={{ borderLeftColor: category?.color, borderLeftWidth: 3 }}
            >
              <p
                className="m-0 mb-2 text-[16px] font-medium leading-snug text-[#F1EFE8]"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {selectedBlock.title}
              </p>
              <DetailRow label="Datum" value={formatDetailDate(selectedBlockDate)} />
              <DetailRow
                label="Tijd"
                value={formatTimeRange(selectedBlock.startTime, selectedBlock.endTime)}
              />
              <DetailRow label="Categorie" value={getBlockRoleLabel(selectedBlock)} />
              <DetailRow
                label="Status"
                value={selectedBlock.done ? "Gedaan" : "Gepland"}
              />
            </div>

            <button
              type="button"
              onClick={onOpenInDay}
              className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.04] text-[12.5px] font-semibold text-[var(--sage)] transition-colors hover:border-white/25 hover:bg-white/[0.06]"
              style={{ fontFamily: "var(--f-sans)" }}
            >
              Open in dag
              <Icons.ArrowRight s={13} />
            </button>
          </section>
        ) : (
          <section aria-label="Weekoverzicht">
            <AgendaMonthGrid
              compact
              showTodayButton
              anchorDate={monthAnchor}
              selectedDate={selectedDate}
              todayDate={todayDate}
              densityByDate={densityByDate}
              onAnchorChange={onMonthAnchorChange}
              onSelectDate={onSelectDate}
              onGoToday={onGoToday}
            />

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <h3 className="m-0 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#9FB0A6]">
                Deze week
              </h3>
              <ul className="m-0 list-none space-y-1.5 p-0 text-[13px] text-[#CDD7D0]">
                <li>
                  {summary.momentCount === 0
                    ? "Nog geen eigen momenten ingepland"
                    : `${summary.momentCount} moment${summary.momentCount === 1 ? "" : "en"} ingepland`}
                </li>
                <li>
                  {summary.planDays === 0
                    ? "Geen dagstappen in deze week"
                    : `${summary.planDays} dag${summary.planDays === 1 ? "" : "en"} met een stap uit je plan`}
                </li>
              </ul>
              {summary.domains.size > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[...summary.domains].map((domainId) => (
                    <span
                      key={domainId}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-[#CDD7D0]"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: PILLAR[domainId].color }}
                        aria-hidden
                      />
                      {PILLAR[domainId].label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-white/10 p-3.5">
        <button
          type="button"
          onClick={onGoVoortgang}
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--sage)] bg-[var(--sage)] px-4 text-[14px] font-semibold text-[#0f1c10] transition-opacity hover:opacity-95"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Bekijk voortgang
          <Icons.ArrowRight s={15} />
        </button>
      </div>
    </aside>
  );
}
