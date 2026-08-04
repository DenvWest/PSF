"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { resolveActionKey } from "@/lib/day-model";
import {
  inferCompletedChoice,
  resolveMovementTodayChoiceOptions,
} from "@/lib/movement-today-choices";
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
  variant?: "default" | "detail";
  tone?: "light" | "dark";
  actionSurface?: "agenda_today" | "agenda_block_detail" | "kompas_home";
  eyebrowOverride?: string;
  doneLabel?: string;
  hideSecondaryLinks?: boolean;
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
  variant = "default",
  tone = "light",
  actionSurface = "agenda_today",
  eyebrowOverride,
  doneLabel = "Markeer als gedaan",
  hideSecondaryLinks = false,
  onCompletionChange,
  onScheduledTimeChange,
}: AgendaTodayHeroProps) {
  const shownRef = useRef(false);
  const isToday = slot.isToday;
  const habit = model.activeHabit;
  const domain = slot.domain;
  const pillar = PILLAR[domain];
  const actionKey = resolveActionKey(model, slot);
  // Beweging kent 3 tiers (herstel/matig/trainen) die alle drie een geldige
  // dagstap zijn; zonder dit zou Mijn Dag altijd de default tonen, ook als
  // vandaag een andere tier al is afgevinkt op de Beweging-surface zelf.
  const movementChoiceOptions = useMemo(
    () => (domain === "beweging" ? resolveMovementTodayChoiceOptions(model, slot) : []),
    [domain, model, slot],
  );
  const cachedDailyLog = isToday && actionKey ? getCachedDailyLog(domain) : null;

  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [fetchLoaded, setFetchLoaded] = useState(false);
  const [moveExpanded, setMoveExpanded] = useState(false);

  // De vastgelegde dagkeuze wint; de daily log is de terugval voor wie al
  // afvinkte zonder expliciet te kiezen (het voorstel accepteren telt ook).
  const cachedChoiceKind =
    movementChoiceOptions.length > 0
      ? (model.movementDayChoice ??
        (cachedDailyLog
          ? inferCompletedChoice(cachedDailyLog.keys, movementChoiceOptions)
          : null))
      : null;
  const cachedChoice = cachedChoiceKind
    ? (movementChoiceOptions.find((option) => option.kind === cachedChoiceKind) ?? null)
    : null;
  const effectiveActionKey = cachedChoice?.stepId ?? actionKey;
  const effectiveTitle = cachedChoice?.title ?? slot.title;

  const resolvedDone =
    cachedDailyLog && effectiveActionKey
      ? cachedDailyLog.keys.includes(effectiveActionKey)
      : done;
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
      surface: actionSurface,
      user_chosen: model.priorityIsUserChosen,
    });
    clarityTag("dashboard_agenda", "today_shown");
  }, [isToday, model.activeHabit, model.priority.id, model.priorityIsUserChosen, actionSurface]);

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
        const completedKind =
          movementChoiceOptions.length > 0
            ? (model.movementDayChoice ??
              inferCompletedChoice(state.keys, movementChoiceOptions))
            : null;
        const matchedOption = completedKind
          ? movementChoiceOptions.find((option) => option.kind === completedKind)
          : null;
        setDone(state.keys.includes(matchedOption?.stepId ?? actionKey));
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
  }, [domain, actionKey, isToday, movementChoiceOptions, model.movementDayChoice]);

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
        body: JSON.stringify({ domain, actionKey: effectiveActionKey, done: nextDone }),
      });

      if (!response.ok) {
        return;
      }

      const state = (await response.json()) as { keys: string[]; streak: number };
      setCachedDailyLog(domain, state);
      setDone(state.keys.includes(effectiveActionKey));
      setStreak(state.streak);

      trackEvent("dashboard_vandaag_action_toggled", {
        domain,
        done: nextDone,
        streak: state.streak,
        surface: actionSurface,
      });
      clarityTag("dashboard_agenda", nextDone ? "done" : "undone");
      onCompletionChange?.();
    } finally {
      setToggleBusy(false);
    }
  };

  const domainLabel =
    variant === "detail"
      ? `${pillar.label} · stap uit je plan`
      : pillar.label;

  const scheduleControl =
    isToday && onScheduledTimeChange ? (
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
    ) : null;

  const isDark = tone === "dark";
  const shellClass = isDark
    ? "relative overflow-hidden rounded-2xl border border-[color:var(--ac)]/45 bg-black/25 p-4 sm:p-5"
    : variant === "detail"
      ? "rounded-[16px] border border-[#ebe7e2] bg-white p-4"
      : "rounded-[16px] border border-[#ebe7e2] bg-white p-4 shadow-[0_2px_12px_rgba(15,28,16,0.04)]";
  const shellStyle = isDark
    ? ({ "--ac": pillar.color } as CSSProperties)
    : { borderLeftWidth: 2, borderLeftColor: pillar.color };

  const metaClass = isDark
    ? "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]"
    : "inline-flex items-center gap-1.5 text-[12px] font-medium text-[#78716c]";
  const titleClass = isDark
    ? "m-0 font-serif text-[20px] font-medium leading-snug text-[#F1EFE8] text-pretty"
    : "m-0 text-[18px] font-medium leading-snug text-[#1c1917] text-pretty";
  const bodyClass = isDark
    ? "mt-2 text-[14px] leading-relaxed text-[#9FB0A6] text-pretty"
    : "mt-2 text-[14px] leading-normal text-[#78716c] text-pretty";
  const doneButtonClass = isDark
    ? "mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none px-4 text-[15px] font-semibold transition-opacity disabled:opacity-60"
    : "mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border-none px-4 text-[15px] font-semibold transition-opacity disabled:opacity-60";
  const doneButtonStyle = isDark
    ? {
        background: resolvedDone ? "rgba(90, 143, 106, 0.15)" : pillar.color,
        color: resolvedDone ? "#E7EDE8" : "#0f1c10",
        fontFamily: "var(--f-sans)",
        border: resolvedDone ? "1px solid rgba(255,255,255,0.15)" : "none",
      }
    : {
        background: resolvedDone ? "rgba(90, 143, 106, 0.15)" : "var(--sage)",
        color: "#0f1c10",
        fontFamily: "var(--f-sans)",
      };
  const streakClass = isDark
    ? "mt-2 text-center text-[12px] text-[#9FB0A6]"
    : "mt-2 text-center text-[12px] text-[#78716c]";
  const doneNoteClass = isDark
    ? "mt-3 text-center text-[13px] text-[#9FB0A6]"
    : "mt-3 text-center text-[13px] text-[#78716c]";
  const linkMutedColor = isDark ? "#9FB0A6" : "#78716c";
  const linkAccentColor = isDark ? "#7FB28E" : "var(--sage)";

  const eyebrowLabel = eyebrowOverride
    ? eyebrowOverride
    : isDark && isToday
      ? `Vandaag · ${pillar.label.toLowerCase()}`
      : domainLabel;

  return (
    <article className={shellClass} style={shellStyle}>
      {isDark ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-[80px]"
          style={{ background: "var(--ac)" }}
        />
      ) : null}

      <div className={isDark ? "relative" : undefined}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={metaClass}>
            {!isDark ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: pillar.color }}
                aria-hidden
              />
            ) : null}
            {eyebrowLabel}
          </span>
          {scheduleControl}
        </div>

        {isToday && moveExpanded && onScheduledTimeChange ? (
          <div className="mb-3">
            <AgendaTimeBucketPicker
              value={model.scheduledTime}
              defaultBucket={activeBucket}
              busy={prefBusy}
              variant={isDark ? "compact-dark" : "compact"}
              onChange={(scheduledTime) => {
                onScheduledTimeChange(scheduledTime);
                setMoveExpanded(false);
              }}
            />
            <p className={`mt-2 text-[12px] leading-normal ${isDark ? "text-[#9FB0A6]" : "text-[#78716c]"}`}>
              Je zet alleen een tijd voor vandaag. Duur en lengte in je dag volgen in een volgende update.
            </p>
          </div>
        ) : null}

        <h3 className={titleClass} style={{ fontFamily: "var(--f-serif)" }}>
          {effectiveTitle}
        </h3>

        {supportingLine ? <p className={bodyClass}>{supportingLine}</p> : null}

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
              className={doneButtonClass}
              style={doneButtonStyle}
            >
              {resolvedDone ? (
                <>
                  <Icons.Check s={16} />
                  Gedaan
                </>
              ) : (
                doneLabel
              )}
            </button>

            {resolvedStreak >= 2 ? (
              <p className={streakClass}>{resolvedStreak} dagen op rij</p>
            ) : null}

            {resolvedDone ? (
              <p className={doneNoteClass}>Morgen staat hier je volgende stap.</p>
            ) : null}
          </>
        ) : (
          <p className={bodyClass}>Je kunt deze stap afvinken zodra het zover is.</p>
        )}

        {!hideSecondaryLinks ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={onderbouwingHref}
              onClick={() => {
                const onderbouwingSurface =
                  actionSurface === "agenda_block_detail" || actionSurface === "kompas_home"
                    ? actionSurface
                    : isToday
                      ? "agenda_today"
                      : "agenda_preview";
                trackOnderbouwingLinkClick({ surface: onderbouwingSurface, domain });
                clarityTag("onderbouwing_link", onderbouwingSurface);
              }}
              className="inline-flex items-center gap-1 text-[13px] font-medium no-underline"
              style={{ color: linkMutedColor }}
            >
              Waarom?
              <Icons.ArrowRight s={13} />
            </Link>
            {slot.planLink ? (
              <Link
                href={slot.planLink.href}
                className="inline-flex items-center gap-1 text-[13px] font-medium no-underline"
                style={{ color: linkAccentColor }}
              >
                {slot.planLink.label}
                <Icons.ArrowRight s={13} />
              </Link>
            ) : null}
            {isToday && resolvedDone ? (
              <Link
                href={followUp.href}
                className="inline-flex items-center gap-1 text-[13px] font-medium no-underline"
                style={{ color: linkAccentColor }}
              >
                {followUp.label}
                <Icons.ArrowRight s={13} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
