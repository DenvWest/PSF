"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import {
  getCachedDailyLog,
  setCachedDailyLog,
} from "@/lib/daily-log-client";
import { isPlanStepHidden, resolveActionKey } from "@/lib/day-model";
import { trackEvent } from "@/lib/ga4";
import { getVandaagContextLine } from "@/lib/vandaag-card-links";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type DomainTodayStripProps = {
  model: DashboardModel;
  domain: PillarId;
  onGoAgenda: () => void;
};

export default function DomainTodayStrip({
  model,
  domain,
  onGoAgenda,
}: DomainTodayStripProps) {
  const todaySlot = useMemo(
    () => buildWeekSchedulePreview(model).find((slot) => slot.isToday) ?? null,
    [model],
  );
  const isOwnStep = todaySlot?.domain === domain;
  const hidden = todaySlot ? isPlanStepHidden(model, todaySlot) : true;
  const actionKey = todaySlot ? resolveActionKey(model, todaySlot) : null;
  const cachedDailyLog =
    isOwnStep && actionKey ? getCachedDailyLog(domain) : null;

  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [fetchLoaded, setFetchLoaded] = useState(false);
  const resolvedDone =
    cachedDailyLog && actionKey ? cachedDailyLog.keys.includes(actionKey) : done;
  const resolvedStreak = cachedDailyLog?.streak ?? streak;
  const loaded = !isOwnStep || !actionKey || cachedDailyLog !== null || fetchLoaded;

  useEffect(() => {
    if (!isOwnStep || !actionKey || hidden) {
      return;
    }
    if (getCachedDailyLog(domain)) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(
          `/api/account/daily-log?domain=${encodeURIComponent(domain)}`,
          { credentials: "include" },
        );
        if (!response.ok || cancelled) {
          return;
        }
        const state = (await response.json()) as { keys: string[]; streak: number };
        if (cancelled) {
          return;
        }
        setCachedDailyLog(domain, state);
        setDone(state.keys.includes(actionKey));
        setStreak(state.streak);
      } finally {
        if (!cancelled) {
          setFetchLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [domain, actionKey, isOwnStep, hidden]);

  if (!todaySlot || hidden) {
    return null;
  }

  const toggleDaily = async () => {
    if (!actionKey || toggleBusy) {
      return;
    }

    const nextDone = !resolvedDone;
    setToggleBusy(true);
    try {
      const response = await fetch("/api/account/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain, actionKey, done: nextDone }),
      });

      if (!response.ok) {
        return;
      }

      const state = (await response.json()) as { keys: string[]; streak: number };
      setCachedDailyLog(domain, state);
      setDone(state.keys.includes(actionKey));
      setStreak(state.streak);

      trackEvent("dashboard_vandaag_action_toggled", {
        domain,
        done: nextDone,
        streak: state.streak,
        surface: "kompas_domain",
      });
      clarityTag("dashboard_kompas_domain_strip", nextDone ? "done" : "undone");
    } finally {
      setToggleBusy(false);
    }
  };

  const pillar = PILLAR[domain];

  if (!isOwnStep) {
    const todayPillar = PILLAR[todaySlot.domain];
    return (
      <article className="rounded-[16px] border border-[#ebe7e2] bg-white p-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a8a29e]">
          Stap vandaag
        </span>
        <p className="mt-1.5 text-[14px] leading-normal text-[#57534e] text-pretty">
          Vandaag staat je stap bij {todayPillar.label.toLowerCase()}.
        </p>
        <button
          type="button"
          onClick={() => {
            clarityTag("dashboard_kompas_domain_strip", "go_agenda");
            onGoAgenda();
          }}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold text-[var(--sage)]"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Open Mijn Dag
          <Icons.ArrowRight s={13} />
        </button>
      </article>
    );
  }

  const supportingLine =
    todaySlot.rationale ?? getVandaagContextLine(pillar, model.activeHabit);

  return (
    <article
      className="rounded-[16px] border border-[#ebe7e2] bg-white p-4"
      style={{ borderLeftWidth: 2, borderLeftColor: pillar.color }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a8a29e]">
        Stap vandaag
      </span>
      <h3
        className="mt-1 mb-0 text-[16px] font-medium leading-snug text-[#1c1917] text-pretty"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        {todaySlot.title}
      </h3>
      {supportingLine ? (
        <p className="mt-1.5 text-[13px] leading-normal text-[#78716c] text-pretty">
          {supportingLine}
        </p>
      ) : null}
      <button
        type="button"
        aria-label={
          resolvedDone ? "Actie afgevinkt voor vandaag" : "Markeer als gedaan vandaag"
        }
        aria-pressed={resolvedDone}
        disabled={!loaded || toggleBusy}
        onClick={() => void toggleDaily()}
        className="mt-3 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-none px-4 text-[14px] font-semibold transition-opacity disabled:opacity-60"
        style={{
          background: resolvedDone ? "rgba(90, 143, 106, 0.15)" : "var(--sage)",
          color: "#0f1c10",
          fontFamily: "var(--f-sans)",
        }}
      >
        {resolvedDone ? (
          <>
            <Icons.Check s={15} />
            Gedaan
          </>
        ) : (
          "Markeer als gedaan"
        )}
      </button>
      {resolvedStreak >= 2 ? (
        <p className="mt-2 mb-0 text-center text-[12px] text-[#78716c]">
          {resolvedStreak} dagen op rij
        </p>
      ) : null}
    </article>
  );
}
