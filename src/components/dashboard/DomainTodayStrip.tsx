"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { deriveDefaultTimeBucket } from "@/lib/account-priority-pref";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import {
  getCachedDailyLog,
  setCachedDailyLog,
} from "@/lib/daily-log-client";
import { isPlanStepHidden, resolveActionKey, resolveScheduledTime } from "@/lib/day-model";
import { trackEvent } from "@/lib/ga4";
import { getVandaagContextLine } from "@/lib/vandaag-card-links";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type DomainTodayStripProps = {
  model: DashboardModel;
  domain: PillarId;
  onGoAgenda: () => void;
  readOnly?: boolean;
  profileLabel?: string | null;
  tone?: "light" | "dark";
  surface?: string;
};

function OpenAgendaLink({
  onClick,
  tone,
  label = "Open Mijn Dag",
}: {
  onClick: () => void;
  tone: "light" | "dark";
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-2 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold ${
        tone === "dark" ? "text-[#5A8F6A]" : "text-[var(--sage)]"
      }`}
      style={{ fontFamily: "var(--f-sans)" }}
    >
      {label}
      <Icons.ArrowRight s={13} />
    </button>
  );
}

function ReadOnlyAgendaCard({
  onClick,
  tone,
  className,
  style,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  tone: "light" | "dark";
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  ariaLabel: string;
}) {
  const hoverClass =
    tone === "dark"
      ? "cursor-pointer transition hover:border-white/14 hover:bg-white/[0.03]"
      : "cursor-pointer transition hover:border-[#d6d3d1] hover:bg-[#faf9f7]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${className} w-full text-left ${hoverClass}`}
      style={{ fontFamily: "var(--f-sans)", ...style }}
    >
      {children}
    </button>
  );
}

function ReadOnlyStatusLine({
  done,
  streak,
  loaded,
  tone,
}: {
  done: boolean;
  streak: number;
  loaded: boolean;
  tone: "light" | "dark";
}) {
  if (!loaded) {
    return null;
  }

  const muted = tone === "dark" ? "text-[#9FB0A6]" : "text-[#78716c]";
  const doneLabel = done ? "Afgevinkt" : "Nog niet afgevinkt";
  const streakSuffix =
    streak >= 2 ? ` · ${streak} dagen op rij` : streak === 1 && done ? " · 1 dag op rij" : "";

  return (
    <p className={`mt-3 mb-0 text-[12px] leading-snug ${muted}`}>
      {done ? "✓" : "○"} {doneLabel}
      {streakSuffix}
    </p>
  );
}

export default function DomainTodayStrip({
  model,
  domain,
  onGoAgenda,
  readOnly = false,
  profileLabel = null,
  tone = "light",
  surface = "kompas_domain",
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

  const handleOpenAgenda = () => {
    if (readOnly) {
      trackEvent("dashboard_kompas_agenda_open", {
        surface,
        priority: model.priority.id,
        user_chosen: model.priorityIsUserChosen,
        ...(todaySlot?.date ? { dag: todaySlot.date } : {}),
      });
    }
    clarityTag(
      readOnly ? "dashboard_kompas_home" : "dashboard_kompas_domain_strip",
      "agenda_open",
    );
    onGoAgenda();
  };

  if (!todaySlot || hidden) {
    return null;
  }

  const toggleDaily = async () => {
    if (readOnly || !actionKey || toggleBusy) {
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
        surface,
      });
      clarityTag("dashboard_kompas_domain_strip", nextDone ? "done" : "undone");
    } finally {
      setToggleBusy(false);
    }
  };

  const pillar = PILLAR[domain];
  const isDark = tone === "dark";
  const cardClass = isDark
    ? "rounded-xl border border-white/8 bg-black/15 px-3 py-3"
    : "rounded-[16px] border border-[#ebe7e2] bg-white p-4";
  const eyebrowClass = isDark
    ? "text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]"
    : "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a8a29e]";
  const bodyClass = isDark ? "text-[#CDD7D0]" : "text-[#57534e]";
  const titleClass = isDark
    ? "mt-1 mb-0 text-[15px] font-medium leading-snug text-[#F1EFE8] text-pretty"
    : "mt-1 mb-0 text-[16px] font-medium leading-snug text-[#1c1917] text-pretty";
  const supportingClass = isDark
    ? "mt-1.5 text-[12.5px] leading-normal text-[#9FB0A6] text-pretty"
    : "mt-1.5 text-[13px] leading-normal text-[#78716c] text-pretty";

  if (!isOwnStep) {
    const todayPillar = PILLAR[todaySlot.domain];
    const content = (
      <>
        <span className={eyebrowClass}>{readOnly ? "Mijn dag" : "Stap vandaag"}</span>
        <p className={`mt-1.5 text-[14px] leading-normal text-pretty ${bodyClass}`}>
          Vandaag staat je stap bij {todayPillar.label.toLowerCase()}.
        </p>
        {!readOnly ? <OpenAgendaLink onClick={handleOpenAgenda} tone={tone} /> : null}
      </>
    );

    if (readOnly) {
      return (
        <ReadOnlyAgendaCard
          onClick={handleOpenAgenda}
          tone={tone}
          className={cardClass}
          ariaLabel={`Mijn dag openen — vandaag staat je stap bij ${todayPillar.label.toLowerCase()}`}
        >
          {content}
        </ReadOnlyAgendaCard>
      );
    }

    return <article className={cardClass}>{content}</article>;
  }

  const supportingLine =
    todaySlot.rationale ?? getVandaagContextLine(pillar, model.activeHabit);
  const scheduledTime = resolveScheduledTime(model, todaySlot);
  const timeBucket = model.timeBucket ?? deriveDefaultTimeBucket();

  const cardStyle: CSSProperties = {
    borderLeftWidth: 2,
    borderLeftColor: pillar.color,
  };

  const ownStepContent = (
    <>
      <span className={eyebrowClass}>{readOnly ? "Mijn dag" : "Stap vandaag"}</span>

      {readOnly && profileLabel ? (
        <p className={`mt-2 text-[11px] leading-snug ${isDark ? "text-[#9FB0A6]" : "text-[#78716c]"}`}>
          Op basis van je check ·{" "}
          <span className={isDark ? "text-[#CDD7D0]" : "text-[#57534e]"}>{profileLabel}</span>
        </p>
      ) : null}

      {readOnly ? (
        <p className={`mt-1.5 text-[12px] font-medium leading-snug ${bodyClass}`}>
          {pillar.label.toLowerCase()} · {scheduledTime}
          {!model.scheduledTime && timeBucket ? (
            <span className={`font-normal ${isDark ? "text-[#9FB0A6]" : "text-[#78716c]"}`}>
              {" "}
              ({timeBucket})
            </span>
          ) : null}
        </p>
      ) : null}

      {readOnly ? (
        <p className={titleClass}>{todaySlot.title}</p>
      ) : (
        <h3 className={titleClass} style={isDark ? undefined : { fontFamily: "var(--f-serif)" }}>
          {todaySlot.title}
        </h3>
      )}
      {supportingLine ? <p className={supportingClass}>{supportingLine}</p> : null}

      {readOnly ? (
        <ReadOnlyStatusLine
          done={resolvedDone}
          streak={resolvedStreak}
          loaded={loaded}
          tone={tone}
        />
      ) : (
        <>
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
        </>
      )}
    </>
  );

  if (readOnly) {
    return (
      <ReadOnlyAgendaCard
        onClick={handleOpenAgenda}
        tone={tone}
        className={cardClass}
        style={cardStyle}
        ariaLabel={`Mijn dag openen — ${todaySlot.title}`}
      >
        {ownStepContent}
      </ReadOnlyAgendaCard>
    );
  }

  return (
    <article className={cardClass} style={cardStyle}>
      {ownStepContent}
    </article>
  );
}
