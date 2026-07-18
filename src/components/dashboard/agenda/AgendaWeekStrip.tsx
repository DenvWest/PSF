"use client";

import { PILLAR } from "@/data/dashboard";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import { isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import * as Icons from "@/components/app/icons";

type AgendaWeekStripProps = {
  slots: WeekDaySlot[];
  selectedDate: string;
  completedKeys: ReadonlySet<string>;
  onSelect: (slot: WeekDaySlot) => void;
};

export default function AgendaWeekStrip({
  slots,
  selectedDate,
  completedKeys,
  onSelect,
}: AgendaWeekStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Weekoverzicht">
      {slots.map((slot) => {
        const selected = slot.date === selectedDate;
        const completed = isWeekSlotCompleted(slot, completedKeys);
        const pillar = PILLAR[slot.domain];

        return (
          <button
            key={slot.date}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`${slot.dayLabel}, ${pillar.label}${completed ? ", gedaan" : ""}`}
            onClick={() => onSelect(slot)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 transition-colors"
            style={{
              borderColor: selected ? "var(--sage)" : "#e4e0da",
              background: selected ? "rgba(90, 143, 106, 0.08)" : "#faf9f7",
              cursor: "pointer",
              fontFamily: "var(--f-sans)",
            }}
          >
            <span
              className="text-[11px] font-medium text-[#78716c]"
              style={{
                color: selected || slot.isToday ? "#1c1917" : "#78716c",
                fontWeight: slot.isToday ? 700 : 500,
              }}
            >
              {slot.dayLabel}
            </span>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: pillar.color }}
              aria-hidden
            />
            <span className="flex h-4 w-4 items-center justify-center">
              {completed ? (
                <Icons.Check s={12} style={{ color: "var(--sage)" }} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-[#e4e0da]" aria-hidden />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
