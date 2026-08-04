"use client";

import * as Icons from "@/components/app/icons";
import {
  addAgendaMonths,
  formatAgendaDayNumber,
  formatAgendaMonthLabel,
  getMonthGridDates,
  isSameAgendaMonth,
} from "@/lib/agenda-month";

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;
const MAX_DENSITY_DOTS = 3;

type AgendaMonthGridProps = {
  anchorDate: string;
  selectedDate: string;
  todayDate: string;
  densityByDate: ReadonlyMap<string, number>;
  onAnchorChange: (date: string) => void;
  onSelectDate: (date: string) => void;
  /** Sidebar: kleinere cellen en nav. */
  compact?: boolean;
  /** Sidebar idle: snel terug naar vandaag. */
  showTodayButton?: boolean;
  onGoToday?: () => void;
};

export default function AgendaMonthGrid({
  anchorDate,
  selectedDate,
  todayDate,
  densityByDate,
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
    ? "flex min-h-8 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border px-0.5 py-1 transition-colors"
    : "flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-0.5 py-1.5 transition-colors";
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

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-current={selected ? "date" : undefined}
              aria-label={`${formatAgendaDayNumber(date)} ${formatAgendaMonthLabel(date)}${
                density > 0 ? `, ${density} momenten` : ""
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
          );
        })}
      </div>
    </div>
  );
}
