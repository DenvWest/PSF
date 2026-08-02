"use client";

import { PILLAR } from "@/data/dashboard";
import type { TimeBucket } from "@/lib/account-priority-pref";
import * as Icons from "@/components/app/icons";
import type { PillarId } from "@/types/dashboard";

/**
 * De strip toont de calendar-week van de geselecteerde dag. Buiten de
 * engine-week bestaat er geen dagstap, dus is `domain` null: dan toont de dag
 * alleen zijn eigen momenten, zonder domeinkleur die een advies suggereert.
 */
export type AgendaStripDay = {
  date: string;
  dayLabel: string;
  dayNumber: string;
  isToday: boolean;
  isPast: boolean;
  domain: PillarId | null;
  completed: boolean;
  blockCount: number;
};

type AgendaWeekStripProps = {
  days: AgendaStripDay[];
  selectedDate: string;
  todayTimeBucket?: TimeBucket | null;
  onSelect: (date: string) => void;
};

export default function AgendaWeekStrip({
  days,
  selectedDate,
  todayTimeBucket = null,
  onSelect,
}: AgendaWeekStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1" role="tablist" aria-label="Weekoverzicht">
      {days.map((day) => {
        const selected = day.date === selectedDate;
        const pillar = day.domain ? PILLAR[day.domain] : null;
        const accent = pillar?.color ?? "rgba(255,255,255,0.28)";
        const bucketHint =
          day.isToday && todayTimeBucket ? todayTimeBucket.charAt(0).toUpperCase() : null;

        const borderColor = selected
          ? "#5A8F6A"
          : day.isToday
            ? accent
            : "rgba(255,255,255,0.10)";
        const background = selected
          ? "rgba(90, 143, 106, 0.18)"
          : day.isToday
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.16)";

        return (
          <button
            key={day.date}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`${day.dayLabel} ${day.dayNumber}${pillar ? `, ${pillar.label}` : ""}${
              day.completed ? ", gedaan" : ""
            }${day.isToday ? ", vandaag" : ""}`}
            onClick={() => onSelect(day.date)}
            className="group flex min-h-[64px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 transition-all duration-200 ease-out"
            style={{
              borderColor,
              background,
              opacity: day.isPast && !selected ? 0.68 : 1,
              fontFamily: "var(--f-sans)",
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: day.isToday ? "#F1EFE8" : selected ? "#F1EFE8" : "#9FB0A6" }}
            >
              {day.isToday ? "Nu" : day.dayLabel}
            </span>

            <span
              className="text-[14px] font-medium tabular-nums leading-none"
              style={{ color: selected || day.isToday ? "#F1EFE8" : "#CDD7D0" }}
            >
              {day.dayNumber}
            </span>

            <span className="flex h-4 items-center justify-center gap-0.5">
              {day.completed ? (
                <Icons.Check s={12} style={{ color: "#7FB28E" }} />
              ) : bucketHint ? (
                <span className="text-[9px] font-bold leading-none text-[#9FB0A6]" aria-hidden>
                  {bucketHint}
                </span>
              ) : day.blockCount > 0 ? (
                Array.from({ length: Math.min(day.blockCount, 3) }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1 w-1 rounded-full"
                    style={{ background: accent }}
                    aria-hidden
                  />
                ))
              ) : (
                <span
                  className="h-1 w-1 rounded-full bg-white/15"
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
