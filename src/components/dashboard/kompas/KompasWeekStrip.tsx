"use client";

import { useEffect, useMemo, useState } from "react";
import { PILLAR } from "@/data/dashboard";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { buildWeekSchedulePreview, isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { DashboardModel } from "@/types/dashboard";

type WeekPayload = {
  today: string;
  dates: string[];
  completedKeys: string[];
};

type KompasWeekStripProps = {
  model: DashboardModel;
  onGoAgenda: () => void;
};

export default function KompasWeekStrip({ model, onGoAgenda }: KompasWeekStripProps) {
  const [weekState, setWeekState] = useState<WeekPayload | null>(null);
  const slots = useMemo(() => buildWeekSchedulePreview(model), [model]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/daily-log?range=7", {
          credentials: "include",
        });
        if (!response.ok || cancelled) {
          return;
        }
        const payload = (await response.json()) as WeekPayload;
        if (!cancelled) {
          setWeekState(payload);
        }
      } catch {
        /* non-blocking read */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [model.priority.id]);

  const completedSet = useMemo(
    () => new Set(weekState?.completedKeys ?? []),
    [weekState?.completedKeys],
  );

  const completedCount = slots.filter((slot) =>
    isWeekSlotCompleted(slot, completedSet),
  ).length;

  const handleClick = () => {
    trackEvent("dashboard_kompas_week_click", {
      completed_days: completedCount,
      surface: "kompas_home",
    });
    clarityTag("dashboard_kompas_home", "week_strip");
    onGoAgenda();
  };

  return (
    <CockpitTile eyebrow="Gedrag">
      <button
        type="button"
        onClick={handleClick}
        className="w-full cursor-pointer border-none bg-transparent p-0 text-left"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        <h2
          className="m-0 font-serif text-[18px] leading-snug text-[#F1EFE8]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          Je week
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
          {weekState
            ? `${completedCount} van 7 dagen een stap gezet`
            : "Je stappen deze week — adherence, geen score"}
        </p>

        <div className="mt-3 grid grid-cols-7 gap-1.5" aria-hidden>
          {slots.map((slot) => {
            const pillar = PILLAR[slot.domain];
            const completed = isWeekSlotCompleted(slot, completedSet);
            return (
              <div
                key={slot.date}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-black/15 px-1 py-2"
                style={{
                  borderColor: slot.isToday ? `${pillar.color}66` : undefined,
                  boxShadow: slot.isToday ? `inset 0 0 0 1px ${pillar.color}33` : undefined,
                }}
              >
                <span
                  className="text-[9px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: slot.isToday ? pillar.color : "#7E8C82" }}
                >
                  {slot.isToday ? "Nu" : slot.dayLabel}
                </span>
                <span
                  className="h-3 w-3 rounded-full transition-opacity"
                  style={{
                    background: pillar.color,
                    opacity: completed ? 1 : 0.22,
                  }}
                />
              </div>
            );
          })}
        </div>

        <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#5A8F6A]">
          Bekijk je week
          <span aria-hidden>→</span>
        </span>
      </button>
    </CockpitTile>
  );
}
