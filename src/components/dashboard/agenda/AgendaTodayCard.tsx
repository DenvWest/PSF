"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { KompasLooseCard } from "@/components/dashboard/agenda/KompasLooseCard";
import { PILLAR } from "@/data/dashboard";
import {
  getCachedDailyLog,
  setCachedDailyLog,
} from "@/lib/daily-log-client";
import { clarityTag } from "@/lib/clarity";
import {
  trackEvent,
  trackOnderbouwingLinkClick,
} from "@/lib/ga4";
import {
  buildVandaagFollowUp,
  getVandaagContextLine,
} from "@/lib/vandaag-card-links";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";
import { useEffect, useRef, useState } from "react";

type AgendaTodayCardProps = {
  model: DashboardModel;
  slot: WeekDaySlot;
  onCompletionChange?: () => void;
};

export default function AgendaTodayCard({
  model,
  slot,
  onCompletionChange,
}: AgendaTodayCardProps) {
  const shownRef = useRef(false);
  const habit = model.activeHabit;
  const domain = slot.domain;
  const actionKey = habit?.stepId ?? slot.stepId;
  const cachedDailyLog = actionKey ? getCachedDailyLog(domain) : null;

  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [busy, setBusy] = useState(false);
  const [fetchLoaded, setFetchLoaded] = useState(false);
  const resolvedDone =
    cachedDailyLog && actionKey ? cachedDailyLog.keys.includes(actionKey) : done;
  const resolvedStreak = cachedDailyLog?.streak ?? streak;
  const loaded = !actionKey || cachedDailyLog !== null || fetchLoaded;

  const contextLine = getVandaagContextLine(PILLAR[domain], habit);
  const onderbouwingHref = slot.evidenceHref;
  const followUp = buildVandaagFollowUp(domain);
  const showHabitDetail = Boolean(
    slot.detail && slot.detail !== contextLine && slot.detail !== slot.rationale,
  );

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_vandaag_card_shown", {
      has_active_habit: Boolean(model.activeHabit),
      priority: model.priority.id,
      surface: "agenda_today",
    });
    clarityTag("dashboard_agenda", "today_shown");
  }, [model.activeHabit, model.priority.id]);

  useEffect(() => {
    if (!actionKey) {
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
  }, [domain, actionKey]);

  const toggleDaily = async () => {
    if (!actionKey || busy) {
      return;
    }

    const nextDone = !resolvedDone;
    setBusy(true);
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
        surface: "agenda_today",
      });
      clarityTag("dashboard_agenda", nextDone ? "done" : "undone");
      onCompletionChange?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <KompasLooseCard>
      <div className="mb-1 flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: PILLAR[domain].color }}
          aria-hidden
        />
        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#78716c]">
          {PILLAR[domain].label}
        </span>
      </div>

      <h2
        className="font-serif text-[19px] leading-snug text-[#1c1917]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Jouw stap vandaag
      </h2>

      <div className="mt-4">
        <p
          className="text-[16px] font-semibold leading-snug text-[#1c1917] text-pretty"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {slot.title}
        </p>

        {slot.rationale ? (
          <p className="mt-2 text-[13.5px] leading-normal text-[#78716c] text-pretty">
            {slot.rationale}
          </p>
        ) : null}

        {contextLine ? (
          <p className="mt-2 text-[13.5px] leading-normal text-[#78716c] text-pretty">
            {contextLine}{" "}
            <Link
              href={onderbouwingHref}
              onClick={() => {
                trackOnderbouwingLinkClick({
                  surface: "agenda_today",
                  domain,
                });
                clarityTag("onderbouwing_link", "agenda_today");
              }}
              className="font-medium text-[#78716c] underline decoration-[#d6d3d1] underline-offset-2"
            >
              Waarom?
            </Link>
          </p>
        ) : null}

        {showHabitDetail ? (
          <p className="mt-2 text-[13.5px] leading-normal text-[#78716c] text-pretty">
            {slot.detail}
          </p>
        ) : null}

        {slot.planLink ? (
          <Link
            href={slot.planLink.href}
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium no-underline"
            style={{ color: "var(--sage)" }}
          >
            {slot.planLink.label}
            <Icons.ArrowRight s={14} />
          </Link>
        ) : null}

        <button
          type="button"
          aria-label={
            resolvedDone ? "Actie afgevinkt voor vandaag" : "Markeer als gedaan vandaag"
          }
          aria-pressed={resolvedDone}
          disabled={!loaded || busy}
          onClick={() => void toggleDaily()}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors"
          style={{
            borderColor: resolvedDone ? "var(--sage)" : "#e4e0da",
            background: resolvedDone ? "rgba(90, 143, 106, 0.08)" : "#faf9f7",
            cursor: !loaded || busy ? "default" : "pointer",
            fontFamily: "var(--f-sans)",
          }}
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{
              border: resolvedDone ? "none" : "1.5px solid #e4e0da",
              background: resolvedDone ? "var(--sage)" : "transparent",
              color: resolvedDone ? "#0f1c10" : "#78716c",
            }}
          >
            {resolvedDone ? <Icons.Check s={14} /> : null}
          </span>
          <span className="text-[14px] font-medium text-[#1c1917]">
            {resolvedDone ? "Gedaan" : "Markeer als gedaan"}
          </span>
        </button>

        {resolvedStreak >= 2 ? (
          <p className="mt-2 text-[12px] text-[#78716c]">{resolvedStreak} dagen op rij</p>
        ) : null}

        {resolvedDone ? (
          <div className="mt-4 border-t border-[#e4e0da] pt-4">
            <p className="text-[13px] text-[#78716c]">
              Morgen staat hier je volgende stap.
            </p>
            <Link
              href={followUp.href}
              className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium no-underline"
              style={{ color: "var(--sage)" }}
            >
              {followUp.label}
              <Icons.ArrowRight s={14} />
            </Link>
          </div>
        ) : null}

        {habit?.planHref ? (
          <Link
            href={habit.planHref}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] no-underline"
            style={{ color: "var(--sage)" }}
          >
            Volledig plan bekijken
            <Icons.ArrowRight s={15} />
          </Link>
        ) : null}
      </div>
    </KompasLooseCard>
  );
}
