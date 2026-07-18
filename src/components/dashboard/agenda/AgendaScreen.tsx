"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AgendaDayPreview from "@/components/dashboard/agenda/AgendaDayPreview";
import AgendaTodayCard from "@/components/dashboard/agenda/AgendaTodayCard";
import AgendaWeekStrip from "@/components/dashboard/agenda/AgendaWeekStrip";
import { KompasLooseCard } from "@/components/dashboard/agenda/KompasLooseCard";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { trackAgendaDaySelected, trackEvent } from "@/lib/ga4";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

type AgendaScreenProps = {
  model: DashboardModel;
};

type WeekFetchState = {
  completedKeys: Set<string>;
  loaded: boolean;
};

export default function AgendaScreen({ model }: AgendaScreenProps) {
  const shownRef = useRef(false);
  const slots = useMemo(() => buildWeekSchedulePreview(model), [model]);
  const todaySlot = slots.find((slot) => slot.isToday) ?? slots[0];
  const [selectedDate, setSelectedDate] = useState(todaySlot.date);
  const [weekState, setWeekState] = useState<WeekFetchState>({
    completedKeys: new Set(),
    loaded: false,
  });

  const selectedSlot = slots.find((slot) => slot.date === selectedDate) ?? todaySlot;

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_agenda_shown", {
      priority: model.priority.id,
      has_active_habit: Boolean(model.activeHabit),
    });
    clarityTag("dashboard_agenda", "shown");
  }, [model.activeHabit, model.priority.id]);

  const refreshWeekState = useCallback(() => {
    void (async () => {
      try {
        const response = await fetch("/api/account/daily-log?range=7", {
          credentials: "include",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { completedKeys?: string[] };
        setWeekState({
          completedKeys: new Set(payload.completedKeys ?? []),
          loaded: true,
        });
      } catch {
        // ignore refresh errors
      }
    })();
  }, []);

  useEffect(() => {
    refreshWeekState();
  }, [model.date, refreshWeekState]);

  const handleSelect = (slot: WeekDaySlot) => {
    setSelectedDate(slot.date);
    trackAgendaDaySelected({
      day_offset: slot.dayOffset,
      is_today: slot.isToday,
      domain: slot.domain,
    });
    clarityTag("dashboard_agenda", slot.isToday ? "day_today" : "day_preview");
  };

  return (
    <section aria-label="Agenda" className="-mt-2 flex flex-col gap-4">
      <KompasLooseCard>
        <h2
          className="m-0 text-[18px] leading-tight text-[#1c1917]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          Je week
        </h2>
        <p className="mt-1 text-[13px] leading-normal text-[#78716c] text-pretty">
          Een mix op basis van je check-in — vandaag kun je afvinken.
        </p>
        <div className="mt-4">
          <AgendaWeekStrip
            slots={slots}
            selectedDate={selectedDate}
            completedKeys={weekState.completedKeys}
            onSelect={handleSelect}
          />
        </div>
      </KompasLooseCard>

      {selectedSlot.isToday ? (
        <AgendaTodayCard
          model={model}
          slot={selectedSlot}
          onCompletionChange={refreshWeekState}
        />
      ) : (
        <AgendaDayPreview slot={selectedSlot} />
      )}
    </section>
  );
}
