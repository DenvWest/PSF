"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { PILLAR } from "@/data/dashboard";
import { buildWeekSchedulePreview, isWeekSlotCompleted } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { buildKompasMilestone } from "@/lib/kompas-home";
import type { DashboardModel } from "@/types/dashboard";

type WeekPayload = {
  today: string;
  dates: string[];
  completedKeys: string[];
};

type KompasVoortgangCardProps = {
  model: DashboardModel;
  remeasureDue?: boolean;
  onGoVoortgang: () => void;
  onRemeasure?: () => void;
};

function formatTrendLine(delta: number | null, note: string | null): string {
  if (note?.trim()) {
    return note.trim();
  }
  if (delta == null || delta === 0) {
    return "Trend stabiel sinds je laatste meting";
  }
  const signed = delta > 0 ? `+${delta}` : `${delta}`;
  return `Trend ${signed} sinds je laatste meting`;
}

export default function KompasVoortgangCard({
  model,
  remeasureDue = false,
  onGoVoortgang,
  onRemeasure,
}: KompasVoortgangCardProps) {
  const reminderShownRef = useRef(false);
  const [weekState, setWeekState] = useState<WeekPayload | null>(null);
  const [streak, setStreak] = useState(0);
  const slots = useMemo(() => buildWeekSchedulePreview(model), [model]);
  const domain = model.priority.id;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [weekResponse, streakResponse] = await Promise.all([
          fetch("/api/account/daily-log?range=7", { credentials: "include" }),
          fetch(`/api/account/daily-log?domain=${encodeURIComponent(domain)}`, {
            credentials: "include",
          }),
        ]);
        if (cancelled) {
          return;
        }
        if (weekResponse.ok) {
          const payload = (await weekResponse.json()) as WeekPayload;
          setWeekState(payload);
        }
        if (streakResponse.ok) {
          const state = (await streakResponse.json()) as { streak: number };
          setStreak(state.streak);
        }
      } catch {
        /* non-blocking read */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [domain, model.priority.id]);

  useEffect(() => {
    if (!remeasureDue || reminderShownRef.current) {
      return;
    }
    reminderShownRef.current = true;
    trackEvent("dashboard_hermeting_reminder_shown", { surface: "kompas_home" });
  }, [remeasureDue]);

  const completedSet = useMemo(
    () => new Set(weekState?.completedKeys ?? []),
    [weekState?.completedKeys],
  );

  const completedCount = slots.filter((slot) =>
    isWeekSlotCompleted(slot, completedSet),
  ).length;

  const milestone = buildKompasMilestone(model, completedCount, remeasureDue);

  const handleVoortgangClick = () => {
    trackEvent("dashboard_kompas_voortgang_link_click", { surface: "kompas_home" });
    clarityTag("dashboard_kompas_home", "voortgang_link");
    onGoVoortgang();
  };

  const handleRemeasureClick = () => {
    trackEvent("dashboard_hermeting_reminder_click", { surface: "kompas_home" });
    clarityTag("dashboard_hermeting", "kompas_voortgang");
    onRemeasure?.();
  };

  return (
    <CockpitTile eyebrow="Voortgang" className="p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
            Streak
          </p>
          <p
            className="mt-1 m-0 font-serif text-[24px] leading-none tabular-nums text-[#F1EFE8]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {streak > 0 ? streak : "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-[#9FB0A6]">
            {streak === 1 ? "dag op rij" : "dagen op rij"}
          </p>
        </div>

        <div className="min-w-0">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
            Trend
          </p>
          <p className="mt-1 text-[12px] leading-snug text-[#CDD7D0] text-pretty">
            {formatTrendLine(model.vitalityDelta, model.vitalityDeltaNote)}
          </p>
        </div>

        <div className="col-span-2">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
            Afgelopen week
          </p>
          <p className="mt-1 text-[12px] text-[#9FB0A6]">
            {weekState
              ? `${completedCount} van 7 dagen een stap gezet`
              : "Je stappen deze week"}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5" aria-hidden>
            {slots.map((slot) => {
              const pillar = PILLAR[slot.domain];
              const completed = isWeekSlotCompleted(slot, completedSet);
              return (
                <span
                  key={slot.date}
                  className="h-2.5 w-2.5 rounded-full transition-opacity"
                  style={{
                    background: pillar.color,
                    opacity: completed ? 1 : 0.2,
                    boxShadow: slot.isToday ? `0 0 0 1px ${pillar.color}88` : undefined,
                  }}
                  title={slot.isToday ? "Vandaag" : slot.dayLabel}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
        <p className="m-0 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
          {milestone.line}
        </p>
        {milestone.kind === "hermeting" && milestone.ctaLabel && onRemeasure ? (
          <button
            type="button"
            onClick={handleRemeasureClick}
            className="mt-2.5 inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-[#5A8F6A] px-3.5 py-2 text-[13px] font-semibold text-[#0f1c10]"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {milestone.ctaLabel}
            <Icons.ArrowRight s={14} />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleVoortgangClick}
        className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold text-[#5A8F6A]"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        Bekijk je voortgang
        <Icons.ArrowRight s={14} />
      </button>
    </CockpitTile>
  );
}
