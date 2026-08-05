"use client";

import * as Icons from "@/components/app/icons";
import {
  addAgendaMonths,
  formatAgendaDayNumber,
  formatAgendaMonthLabel,
  getMonthGridDates,
  isSameAgendaMonth,
} from "@/lib/agenda-month";
import type { AgendaMonthDayItem } from "@/types/agenda";

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;
const MAX_DENSITY_DOTS = 3;
const MAX_PREVIEW_ITEMS = 5;

type AgendaMonthGridProps = {
  anchorDate: string;
  selectedDate: string;
  todayDate: string;
  densityByDate: ReadonlyMap<string, number>;
  itemsByDate: ReadonlyMap<string, readonly AgendaMonthDayItem[]>;
  onAnchorChange: (date: string) => void;
  onSelectDate: (date: string) => void;
  /** Sidebar: kleinere cellen en nav. */
  compact?: boolean;
  /** Sidebar idle: snel terug naar vandaag. */
  showTodayButton?: boolean;
  onGoToday?: () => void;
};

function MonthDayPreview({
  items,
  compact,
}: {
  items: readonly AgendaMonthDayItem[];
  compact: boolean;
}) {
  const visible = items.slice(0, MAX_PREVIEW_ITEMS);
  const overflow = items.length - visible.length;

  return (
    <div
      className={`pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-max max-w-[min(220px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-white/15 bg-[#1a2e1a] px-2.5 py-2 opacity-0 shadow-lg transition-opacity duration-150 [@media(hover:hover)]:group-hover/day:opacity-100 ${
        compact ? "text-[10.5px]" : "text-[11.5px]"
      }`}
      role="tooltip"
    >
      <ul className="m-0 list-none space-y-1 p-0">
        {visible.map((item, index) => (
          <li
            key={`${item.startTime}-${index}`}
            className="flex items-baseline gap-2 text-[#CDD7D0]"
          >
            <span className="shrink-0 tabular-nums text-[#9FB0A6]">{item.startTime}</span>
            <span className="min-w-0 truncate text-[#F1EFE8]">{item.title}</span>
          </li>
        ))}
      </ul>
      {overflow > 0 ? (
        <p className="m-0 mt-1.5 text-[10px] text-[#9FB0A6]">+{overflow} meer</p>
      ) : null}
    </div>
  );
}

export default function AgendaMonthGrid({
  anchorDate,
  selectedDate,
  todayDate,
  densityByDate,
  itemsByDate,
  onAnchorChange,
  onSelectDate,
  compact = false,
  showTodayButton = false,
  onGoToday,
}: AgendaMonthGridProps) {
  const dates = getMonthGridDates(anchorDate);
  const navButtonClass = compact
    ? "inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition-colors hover:border-white/25 hover:text-[#F1EFE8]"
    : "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition-colors hover:border-white/25 hover:text-[#F1EFE8]";
  const monthLabelClass = compact
    ? "m-0 text-[13px] font-medium capitalize text-[#F1EFE8]"
    : "m-0 text-[15px] font-medium capitalize text-[#F1EFE8]";
  const dayButtonClass = compact
    ? "flex min-h-8 w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border px-0.5 py-1 transition-colors"
    : "flex min-h-11 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-0.5 py-1.5 transition-colors";
  const dayNumberClass = compact ? "text-[11px] tabular-nums leading-none" : "text-[13px] tabular-nums leading-none";

  return (
    <div className="min-w-0">
      <div className={`flex items-center justify-between gap-2 ${compact ? "mb-2" : "mb-3"}`}>
        <button
          type="button"
          onClick={() => onAnchorChange(addAgendaMonths(anchorDate, -1))}
          aria-label="Vorige maand"
          className={navButtonClass}
        >
          <Icons.ChevronLeft s={compact ? 14 : 16} />
        </button>
        <p
          className={monthLabelClass}
          style={{ fontFamily: "var(--f-serif)" }}
          aria-live="polite"
        >
          {formatAgendaMonthLabel(anchorDate)}
        </p>
        <button
          type="button"
          onClick={() => onAnchorChange(addAgendaMonths(anchorDate, 1))}
          aria-label="Volgende maand"
          className={navButtonClass}
        >
          <Icons.ChevronRight s={compact ? 14 : 16} />
        </button>
      </div>

      {showTodayButton && onGoToday ? (
        <button
          type="button"
          onClick={onGoToday}
          className="mb-2 inline-flex min-h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[12px] font-semibold text-[var(--sage)] transition-colors hover:border-white/25 hover:bg-white/[0.06]"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Vandaag
        </button>
      ) : null}

      <div className={`grid grid-cols-7 ${compact ? "gap-0.5" : "gap-1"}`} aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className={`text-center font-semibold uppercase tracking-[0.08em] text-[#7E8C82] ${
              compact ? "pb-0.5 text-[9px]" : "pb-1 text-[10px]"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${compact ? "gap-0.5" : "gap-1"}`}>
        {dates.map((date) => {
          const inMonth = isSameAgendaMonth(date, anchorDate);
          const selected = date === selectedDate;
          const isToday = date === todayDate;
          const density = densityByDate.get(date) ?? 0;
          const dayItems = itemsByDate.get(date) ?? [];
          const hasPreview = dayItems.length > 0;

          return (
            <div
              key={date}
              className={`group/day relative min-w-0 ${hasPreview ? "[@media(hover:hover)]:z-20" : ""}`}
            >
              <button
                type="button"
                onClick={() => onSelectDate(date)}
                aria-current={selected ? "date" : undefined}
                aria-label={`${formatAgendaDayNumber(date)} ${formatAgendaMonthLabel(date)}${
                  dayItems.length > 0
                    ? `, ${dayItems.length} moment${dayItems.length === 1 ? "" : "en"}`
                    : density > 0
                      ? `, ${density} momenten`
                      : ""
                }`}
                className={`${dayButtonClass} ${
                  selected
                    ? "border-[rgba(90,143,106,0.6)] bg-[rgba(90,143,106,0.2)]"
                    : isToday
                      ? "border-white/25 bg-white/[0.05] hover:bg-white/[0.08]"
                      : "border-transparent bg-white/[0.02] hover:bg-white/[0.06]"
                }`}
                style={{ fontFamily: "var(--f-sans)" }}
              >
                <span
                  className={`${dayNumberClass} ${
                    selected || isToday ? "font-semibold" : "font-medium"
                  }`}
                  style={{ color: inMonth ? "#F1EFE8" : "#6F7F75" }}
                >
                  {formatAgendaDayNumber(date)}
                </span>
                <span className="flex h-1.5 items-center justify-center gap-0.5">
                  {Array.from({ length: Math.min(density, MAX_DENSITY_DOTS) }).map((_, index) => (
                    <span
                      key={index}
                      className="h-1 w-1 rounded-full bg-[var(--sage)]"
                      aria-hidden
                    />
                  ))}
                </span>
              </button>
              {hasPreview ? <MonthDayPreview items={dayItems} compact={compact} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
