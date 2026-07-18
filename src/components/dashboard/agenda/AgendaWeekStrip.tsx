"use client";

import { PILLAR } from "@/data/dashboard";
import type { TimeBucket } from "@/lib/account-priority-pref";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import { isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import * as Icons from "@/components/app/icons";

type AgendaWeekStripProps = {
  slots: WeekDaySlot[];
  selectedDate: string;
  completedKeys: ReadonlySet<string>;
  todayTimeBucket?: TimeBucket | null;
  onSelect: (slot: WeekDaySlot) => void;
};

export default function AgendaWeekStrip({
  slots,
  selectedDate,
  completedKeys,
  todayTimeBucket = null,
  onSelect,
}: AgendaWeekStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1" role="tablist" aria-label="Weekoverzicht">
      {slots.map((slot) => {
        const selected = slot.date === selectedDate;
        const completed = isWeekSlotCompleted(slot, completedKeys);
        const pillar = PILLAR[slot.domain];
        const isToday = slot.isToday;
        const bucketHint =
          isToday && todayTimeBucket ? todayTimeBucket.charAt(0).toUpperCase() : null;

        return (
          <button
            key={slot.date}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`${slot.dayLabel}, ${pillar.label}${completed ? ", gedaan" : ""}${isToday ? ", vandaag" : ""}${bucketHint ? `, ${todayTimeBucket}` : ""}`}
            onClick={() => onSelect(slot)}
            className="flex flex-col items-center gap-1 rounded-xl border px-0.5 py-2 transition-colors"
            style={{
              borderColor: selected ? "var(--sage)" : "transparent",
              background: selected ? "rgba(90, 143, 106, 0.08)" : "transparent",
              cursor: "pointer",
              fontFamily: "var(--f-sans)",
            }}
          >
            <span
              className="text-[10px] font-medium"
              style={{
                color: isToday ? pillar.color : selected ? "#1c1917" : "#78716c",
                fontWeight: isToday ? 700 : 500,
              }}
            >
              {isToday ? "Nu" : slot.dayLabel}
            </span>
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: pillar.color }}
              aria-hidden
            />
            <span className="flex h-3.5 w-3.5 items-center justify-center">
              {completed ? (
                <Icons.Check s={11} style={{ color: "var(--sage)" }} />
              ) : bucketHint ? (
                <span
                  className="text-[9px] font-semibold leading-none text-[#78716c]"
                  aria-hidden
                >
                  {bucketHint}
                </span>
              ) : (
                <span className="h-1 w-1 rounded-full bg-[#e4e0da]" aria-hidden />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
