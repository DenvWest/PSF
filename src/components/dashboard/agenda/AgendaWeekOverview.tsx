"use client";

import { PILLAR } from "@/data/dashboard";
import { getAgendaCategory } from "@/data/agenda/categories";
import type { AgendaBlockRecord } from "@/types/agenda";
import type { PillarId } from "@/types/dashboard";

export type AgendaWeekDayEntry = {
  date: string;
  dayLabel: string;
  dayNumber: string;
  isToday: boolean;
  domain: PillarId | null;
  planStepTitle: string | null;
  blocks: AgendaBlockRecord[];
};

type AgendaWeekOverviewProps = {
  days: AgendaWeekDayEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

const MAX_CHIPS = 4;

/**
 * Weekblik: zeven dagen naast elkaar met chips uit agenda_blocks. Bewust geen
 * zeven uurrasters — een week is om te scannen, niet om in te plannen.
 */
export default function AgendaWeekOverview({
  days,
  selectedDate,
  onSelectDate,
}: AgendaWeekOverviewProps) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-7 md:gap-1.5">
      {days.map((day) => {
        const selected = day.date === selectedDate;
        const pillar = day.domain ? PILLAR[day.domain] : null;
        const visible = day.blocks.slice(0, MAX_CHIPS);
        const overflow = day.blocks.length - visible.length;

        return (
          <li key={day.date} className="min-w-0">
            <button
              type="button"
              onClick={() => onSelectDate(day.date)}
              aria-label={`Open ${day.dayLabel} ${day.dayNumber}${day.isToday ? ", vandaag" : ""}`}
              className={`flex min-h-[88px] w-full cursor-pointer flex-col gap-2 rounded-2xl border p-3 text-left transition-colors md:min-h-[168px] ${
                selected
                  ? "border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.12)]"
                  : day.isToday
                    ? "border-white/20 bg-white/[0.05] hover:bg-white/[0.08]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
              style={{ fontFamily: "var(--f-sans)" }}
            >
              <span className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9FB0A6]">
                  {day.isToday ? "Nu" : day.dayLabel}
                </span>
                <span className="text-[15px] font-medium tabular-nums text-[#F1EFE8]">
                  {day.dayNumber}
                </span>
                {pillar ? (
                  <span
                    className="ml-auto h-2 w-2 shrink-0 rounded-full"
                    style={{ background: pillar.color }}
                    aria-hidden
                  />
                ) : null}
              </span>

              {day.planStepTitle ? (
                <span className="flex min-w-0 items-start gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: pillar?.color ?? "var(--sage)" }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#9FB0A6]">
                      Uit je plan
                    </span>
                    <span className="line-clamp-2 text-[12px] leading-snug text-[#CDD7D0]">
                      {day.planStepTitle}
                    </span>
                  </span>
                </span>
              ) : null}

              {visible.length > 0 ? (
                <span className="flex min-w-0 flex-col gap-1">
                  {visible.map((block) => {
                    const category = getAgendaCategory(block.categoryId);
                    return (
                      <span
                        key={block.id}
                        className="flex min-w-0 items-center gap-1.5 rounded-lg bg-white/[0.05] px-2 py-1"
                        style={{ borderLeft: `2px solid ${category.color}` }}
                      >
                        <span className="shrink-0 text-[10.5px] tabular-nums text-[#9FB0A6]">
                          {block.startTime.slice(0, 5)}
                        </span>
                        <span
                          className={`truncate text-[12px] leading-snug ${
                            block.status === "done"
                              ? "text-[#9FB0A6] line-through"
                              : "text-[#F1EFE8]"
                          }`}
                        >
                          {block.title}
                        </span>
                      </span>
                    );
                  })}
                  {overflow > 0 ? (
                    <span className="px-2 text-[11px] text-[#9FB0A6]">
                      +{overflow} meer
                    </span>
                  ) : null}
                </span>
              ) : day.planStepTitle ? null : (
                <span className="text-[12px] text-[#7E8C82]">Nog niets gepland</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
