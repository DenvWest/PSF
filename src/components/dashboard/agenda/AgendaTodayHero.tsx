"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import AgendaTimeBucketPicker from "@/components/dashboard/agenda/AgendaTimeBucketPicker";
import { PILLAR } from "@/data/dashboard";
import {
  deriveDefaultTimeBucket,
} from "@/lib/account-priority-pref";
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

type AgendaTodayHeroProps = {
  model: DashboardModel;
  slot: WeekDaySlot;
  prefBusy?: boolean;
  onCompletionChange?: () => void;
  onScheduledTimeChange?: (scheduledTime: string) => void;
};

function pickSupportingLine(
  slot: WeekDaySlot,
  contextLine: string | null,
): string | null {
  if (slot.rationale) {
    return slot.rationale;
  }
  if (contextLine) {
    return contextLine;
  }
  if (slot.detail) {
    return slot.detail;
  }
  return null;
}

export default function AgendaTodayHero({
  model,
  slot,
  prefBusy = false,
  onCompletionChange,
  onScheduledTimeChange,
}: AgendaTodayHeroProps) {
  const shownRef = useRef(false);
  const isToday = slot.isToday;
  const habit = model.activeHabit;
  const domain = slot.domain;
  const pillar = PILLAR[domain];
  const actionKey = habit?.stepId ?? slot.stepId;
  const cachedDailyLog = isToday && actionKey ? getCachedDailyLog(domain) : null;

  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [fetchLoaded, setFetchLoaded] = useState(false);
  const [moveExpanded, setMoveExpanded] = useState(false);
  const resolvedDone =
    cachedDailyLog && actionKey ? cachedDailyLog.keys.includes(actionKey) : done;
  const resolvedStreak = cachedDailyLog?.streak ?? streak;
  const loaded = !isToday || !actionKey || cachedDailyLog !== null || fetchLoaded;

  const contextLine = getVandaagContextLine(PILLAR[domain], habit);
  const supportingLine = pickSupportingLine(slot, contextLine);
  const onderbouwingHref = slot.evidenceHref;
  const followUp = buildVandaagFollowUp(domain);
  const activeBucket = model.timeBucket ?? deriveDefaultTimeBucket();

  useEffect(() => {
    if (!isToday || shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_vandaag_card_shown", {
      has_active_habit: Boolean(model.activeHabit),
      priority: model.priority.id,
      surface: "agenda_today",
      user_chosen: model.priorityIsUserChosen,
    });
    clarityTag("dashboard_agenda", "today_shown");
  }, [isToday, model.activeHabit, model.priority.id, model.priorityIsUserChosen]);

  useEffect(() => {
    if (!isToday || !actionKey) {
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
  }, [domain, actionKey, isToday]);

  const toggleDaily = async () => {
    if (!isToday || !actionKey || toggleBusy) {
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
        surface: "agenda_today",
      });
      clarityTag("dashboard_agenda", nextDone ? "done" : "undone");
      onCompletionChange?.();
    } finally {
      setToggleBusy(false);
    }
  };

  return (
    <article
      className="rounded-[16px] border border-[#ebe7e2] bg-white p-4 shadow-[0_2px_12px_rgba(15,28,16,0.04)]"
      style={{ borderLeftWidth: 2, borderLeftColor: pillar.color }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#78716c]">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: pillar.color }}
            aria-hidden
          />
          {pillar.label}
        </span>
        {isToday && onScheduledTimeChange ? (
          <button
            type="button"
            disabled={prefBusy}
            onClick={() => setMoveExpanded((open) => !open)}
            aria-expanded={moveExpanded}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center border-none bg-transparent px-0 text-[12px] font-semibold text-[var(--sage)] disabled:opacity-60"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            {moveExpanded ? "Sluit" : "Verplaats"}
          </button>
        ) : null}
      </div>

      {isToday && moveExpanded && onScheduledTimeChange ? (
        <div className="mb-3">
          <AgendaTimeBucketPicker
            value={model.scheduledTime}
            defaultBucket={activeBucket}
            busy={prefBusy}
            variant="compact"
            onChange={(scheduledTime) => {
              onScheduledTimeChange(scheduledTime);
              setMoveExpanded(false);
            }}
          />
        </div>
      ) : null}

      <h3
        className="m-0 text-[18px] font-medium leading-snug text-[#1c1917] text-pretty"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        {slot.title}
      </h3>

      {supportingLine ? (
        <p className="mt-2 text-[14px] leading-normal text-[#78716c] text-pretty">
          {supportingLine}
        </p>
      ) : null}

      {isToday ? (
        <>
          <button
            type="button"
            aria-label={
              resolvedDone ? "Actie afgevinkt voor vandaag" : "Markeer als gedaan vandaag"
            }
            aria-pressed={resolvedDone}
            disabled={!loaded || toggleBusy}
            onClick={() => void toggleDaily()}
            className="mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-none px-4 text-[15px] font-semibold transition-opacity disabled:opacity-60"
            style={{
              background: resolvedDone ? "rgba(90, 143, 106, 0.15)" : "var(--sage)",
              color: "#0f1c10",
              fontFamily: "var(--f-sans)",
            }}
          >
            {resolvedDone ? (
              <>
                <Icons.Check s={16} />
                Gedaan
              </>
            ) : (
              "Markeer als gedaan"
            )}
          </button>

          {resolvedStreak >= 2 ? (
            <p className="mt-2 text-center text-[12px] text-[#78716c]">
              {resolvedStreak} dagen op rij
            </p>
          ) : null}

          {resolvedDone ? (
            <p className="mt-3 text-center text-[13px] text-[#78716c]">
              Morgen staat hier je volgende stap.
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-[13px] leading-normal text-[#78716c] text-pretty">
          Je kunt deze stap afvinken zodra het zover is.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href={onderbouwingHref}
          onClick={() => {
            trackOnderbouwingLinkClick({
              surface: isToday ? "agenda_today" : "agenda_preview",
              domain,
            });
            clarityTag("onderbouwing_link", isToday ? "agenda_today" : "agenda_preview");
          }}
          className="inline-flex items-center gap-1 text-[13px] font-medium no-underline"
          style={{ color: "#78716c" }}
        >
          Waarom?
          <Icons.ArrowRight s={13} />
        </Link>
        {slot.planLink ? (
          <Link
            href={slot.planLink.href}
            className="inline-flex items-center gap-1 text-[13px] font-medium no-underline"
            style={{ color: "var(--sage)" }}
          >
            {slot.planLink.label}
            <Icons.ArrowRight s={13} />
          </Link>
        ) : null}
        {isToday && resolvedDone ? (
          <Link
            href={followUp.href}
            className="inline-flex items-center gap-1 text-[13px] font-medium no-underline"
            style={{ color: "var(--sage)" }}
          >
            {followUp.label}
            <Icons.ArrowRight s={13} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
