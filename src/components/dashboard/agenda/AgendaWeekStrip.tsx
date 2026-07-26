"use client";

import { PILLAR } from "@/data/dashboard";
import type { TimeBucket } from "@/lib/account-priority-pref";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import { isWeekSlotCompleted, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import * as Icons from "@/components/app/icons";

type AgendaWeekStripProps = {
  slots: WeekDaySlot[];
  selectedDate: string;
  completedKeys: ReadonlySet<string>;
  todayTimeBucket?: TimeBucket | null;
  variant?: "light" | "dark";
  compact?: boolean;
  onSelect: (slot: WeekDaySlot) => void;
};

function dayPhase(slot: WeekDaySlot, today: string): "past" | "today" | "future" {
  if (slot.isToday) {
    return "today";
  }
  return slot.date < today ? "past" : "future";
}

export default function AgendaWeekStrip({
  slots,
  selectedDate,
  completedKeys,
  todayTimeBucket = null,
  variant = "light",
  compact = false,
  onSelect,
}: AgendaWeekStripProps) {
  const today = todayInAgendaTimezone();
  const isDark = variant === "dark";

  return (
    <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Weekoverzicht">
      {slots.map((slot) => {
        const selected = slot.date === selectedDate;
        const completed = isWeekSlotCompleted(slot, completedKeys);
        const pillar = PILLAR[slot.domain];
        const phase = dayPhase(slot, today);
        const isToday = phase === "today";
        const isPast = phase === "past";
        const bucketHint =
          isToday && todayTimeBucket ? todayTimeBucket.charAt(0).toUpperCase() : null;

        const borderColor = selected
          ? isDark
            ? "#5A8F6A"
            : "var(--sage)"
          : isToday
            ? pillar.color
            : isPast
              ? isDark
                ? "rgba(255,255,255,0.08)"
                : "#ebe7e2"
              : isDark
                ? "rgba(255,255,255,0.08)"
                : "#f0ece7";

        const background = selected
          ? isDark
            ? "rgba(90, 143, 106, 0.14)"
            : "rgba(90, 143, 106, 0.1)"
          : isToday
            ? `${pillar.color}10`
            : isPast
              ? isDark
                ? "rgba(0,0,0,0.15)"
                : "#faf9f7"
              : isDark
                ? "rgba(0,0,0,0.15)"
                : "white";

        return (
          <button
            key={slot.date}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`${slot.dayLabel}, ${pillar.label}${completed ? ", gedaan" : ""}${isToday ? ", vandaag" : ""}${bucketHint ? `, ${todayTimeBucket}` : ""}`}
            onClick={() => onSelect(slot)}
            className={`group flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-2.5 transition-all duration-200 ease-out ${
              compact ? "min-h-[58px] rounded-xl py-2" : "min-h-[76px]"
            }`}
            style={{
              borderColor,
              background,
              boxShadow: isToday
                ? `inset 0 0 0 1px ${pillar.color}33`
                : selected && !isDark
                  ? "0 4px 14px rgba(90, 143, 106, 0.12)"
                  : "none",
              cursor: "pointer",
              fontFamily: "var(--f-sans)",
              opacity: isPast && !selected ? 0.72 : 1,
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{
                color: isToday
                  ? pillar.color
                  : selected
                    ? isDark
                      ? "#F1EFE8"
                      : "#1c1917"
                    : isDark
                      ? "#9FB0A6"
                      : "#78716c",
              }}
            >
              {isToday ? "Nu" : slot.dayLabel}
            </span>

            <span
              className="relative flex h-3 w-3 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
              style={{
                background: pillar.color,
                boxShadow: isToday ? `0 0 0 3px ${pillar.color}22` : "none",
              }}
              aria-hidden
            />

            <span className="flex h-4 w-4 items-center justify-center">
              {completed ? (
                <Icons.Check s={12} style={{ color: isDark ? "#5FA872" : "var(--sage)" }} />
              ) : bucketHint ? (
                <span
                  className={`text-[9px] font-bold leading-none ${isDark ? "text-[#9FB0A6]" : "text-[#78716c]"}`}
                  aria-hidden
                >
                  {bucketHint}
                </span>
              ) : (
                <span
                  className="h-1 w-1 rounded-full"
                  style={{
                    background: isPast
                      ? isDark
                        ? "rgba(255,255,255,0.2)"
                        : "#d6d3d1"
                      : isDark
                        ? "rgba(255,255,255,0.14)"
                        : "#e4e0da",
                  }}
                  aria-hidden
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
