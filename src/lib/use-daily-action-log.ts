"use client";

import { useEffect, useState } from "react";
import { clarityTag } from "@/lib/clarity";
import {
  getCachedDailyLog,
  setCachedDailyLog,
} from "@/lib/daily-log-client";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type DailyLogApiState = { keys: string[]; streak: number };

type UseDailyActionLogInput = {
  domain: PillarId;
  actionKey: string | null;
  /** Alleen laden/afvinken wanneer dit slot echt de dagstap van dit domein is. */
  enabled: boolean;
  /** Surface-waarde op het bestaande `dashboard_vandaag_action_toggled`-event. */
  surface: string;
  /** Optionele Clarity-scope; krijgt "done"/"undone". */
  clarityScope?: string;
  /** Verberg log-done tot expliciet afvinken (verse keuze in sessie). */
  forceUnchecked?: boolean;
  onToggled?: () => void;
};

/**
 * Deelt de daily_action_log-toggle (fetch + cache + POST + streak) tussen de
 * vandaag-surfaces. Completie blijft daily_action_log (day-model §2.4): dit is
 * geen tweede dag-waarheid, alleen de gedeelde lees/schrijf-lus.
 */
export function useDailyActionLog({
  domain,
  actionKey,
  enabled,
  surface,
  clarityScope,
  forceUnchecked = false,
  onToggled,
}: UseDailyActionLogInput) {
  const cached = enabled && actionKey && !forceUnchecked ? getCachedDailyLog(domain) : null;
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [busy, setBusy] = useState(false);
  const [fetchLoaded, setFetchLoaded] = useState(false);

  const resolvedDone = forceUnchecked
    ? false
    : cached && actionKey
      ? cached.keys.includes(actionKey)
      : done;
  const resolvedStreak = cached?.streak ?? streak;
  const loaded = !enabled || !actionKey || cached !== null || fetchLoaded;

  useEffect(() => {
    if (!enabled || !actionKey) {
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
        const state = (await response.json()) as DailyLogApiState;
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
  }, [domain, actionKey, enabled]);

  const toggle = async () => {
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

      const state = (await response.json()) as DailyLogApiState;
      setCachedDailyLog(domain, state);
      setDone(state.keys.includes(actionKey));
      setStreak(state.streak);

      trackEvent("dashboard_vandaag_action_toggled", {
        domain,
        done: nextDone,
        streak: state.streak,
        surface,
      });
      if (clarityScope) {
        clarityTag(clarityScope, nextDone ? "done" : "undone");
      }
      onToggled?.();
    } finally {
      setBusy(false);
    }
  };

  return { done: resolvedDone, streak: resolvedStreak, loaded, busy, toggle };
}
