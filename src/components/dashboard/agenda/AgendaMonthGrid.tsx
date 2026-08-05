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
const MAX_VISIBLE_CHIPS = 3;

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
  /** Full maandview: navigatie staat in AgendaToolbar. */
  hideHeaderNav?: boolean;
  /** Sidebar idle: snel terug naar vandaag. */
  showTodayButton?: boolean;
  onGoToday?: () => void;
};

function getIsoWeekNumber(isoDate: string): number {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function groupDatesByWeek(dates: readonly string[]): string[][] {
  const weeks: string[][] = [];
  for (let index = 0; index < dates.length; index += 7) {
    weeks.push(dates.slice(index, index + 7));
  }
  return weeks;
}

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

function MonthDayChip({ item }: { item: AgendaMonthDayItem }) {
  return (
    <span
      className="pointer-events-none flex w-full min-w-0 items-center gap-1 rounded px-1 py-1 text-[11px] leading-tight"
      style={{
        background: `${item.color}18`,
        borderLeft: `2px solid ${item.color}`,
      }}
    >
      <span className="shrink-0 tabular-nums text-[#9FB0A6]">{item.startTime}</span>
      <span className="min-w-0 truncate text-[#F1EFE8]">{item.title}</span>
    </span>
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
  hideHeaderNav = false,
  showTodayButton = false,
  onGoToday,
}: AgendaMonthGridProps) {
  const dates = getMonthGridDates(anchorDate);
  const weeks = groupDatesByWeek(dates);
  const showWeekColumn = !compact;

  const navButtonClass = compact
    ? "inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition-colors hover:border-white/25 hover:text-[#F1EFE8]"
    : "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition-colors hover:border-white/25 hover:text-[#F1EFE8]";
  const monthLabelClass = compact
    ? "m-0 text-[13px] font-medium capitalize text-[#F1EFE8]"
    : "m-0 text-[15px] font-medium capitalize text-[#F1EFE8]";
  const dayButtonClass = compact
    ? "flex min-h-8 w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border px-0.5 py-1 transition-colors"
    : "flex min-h-[6.5rem] w-full cursor-pointer flex-col items-stretch justify-start gap-1 rounded-lg border px-1 py-1.5 transition-colors";
  const dayNumberClass = compact
    ? "text-[11px] tabular-nums leading-none"
    : "self-start text-[13px] tabular-nums leading-none";

  const renderDayCell = (date: string) => {
    const inMonth = isSameAgendaMonth(date, anchorDate);
    const selected = date === selectedDate;
    const isToday = date === todayDate;
    const density = densityByDate.get(date) ?? 0;
    const dayItems = itemsByDate.get(date) ?? [];
    const hasPreview = compact && dayItems.length > 0;
    const visibleChips = compact ? [] : dayItems.slice(0, MAX_VISIBLE_CHIPS);
    const chipOverflow = compact ? 0 : dayItems.length - visibleChips.length;

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
          {compact ? (
            <span className="flex h-1.5 items-center justify-center gap-0.5">
              {Array.from({ length: Math.min(density, MAX_DENSITY_DOTS) }).map((_, index) => (
                <span
                  key={index}
                  className="h-1 w-1 rounded-full bg-[var(--sage)]"
                  aria-hidden
                />
              ))}
            </span>
          ) : (
            <span className="flex min-h-0 w-full flex-1 flex-col gap-0.5 overflow-hidden">
              {visibleChips.map((item, index) => (
                <MonthDayChip key={`${item.startTime}-${index}`} item={item} />
              ))}
              {chipOverflow > 0 ? (
                <span className="pointer-events-none px-1 text-[10px] font-medium text-[#9FB0A6]">
                  +{chipOverflow}
                </span>
              ) : null}
            </span>
          )}
        </button>
        {hasPreview ? <MonthDayPreview items={dayItems} compact={compact} /> : null}
      </div>
    );
  };

  const weekdayHeader = (
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
  );

  return (
    <div className="min-w-0">
      {!hideHeaderNav ? (
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
      ) : null}

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

      {showWeekColumn ? (
        <div className="grid grid-cols-[2rem_1fr] gap-x-1 gap-y-1">
          <span aria-hidden />
          <div>{weekdayHeader}</div>
          {weeks.map((week) => (
            <div key={week[0]} className="contents">
              <span
                className="flex items-start justify-center pt-1.5 text-[10px] font-semibold tabular-nums text-[#7E8C82]"
                aria-hidden
              >
                {getIsoWeekNumber(week[0])}
              </span>
              <div className="grid grid-cols-7 gap-1">{week.map(renderDayCell)}</div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {weekdayHeader}
          <div className={`grid grid-cols-7 ${compact ? "gap-0.5" : "gap-1"}`}>
            {dates.map(renderDayCell)}
          </div>
        </>
      )}
    </div>
  );
}
