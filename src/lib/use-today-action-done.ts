"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import {
  getCachedDailyLog,
  setCachedDailyLog,
  subscribeDailyLogCache,
} from "@/lib/daily-log-client";
import { isPlanStepHidden, isTodayActionDone } from "@/lib/day-model";
import type { DashboardModel } from "@/types/dashboard";

type DailyLogApiState = { keys: string[]; streak: number };

function dailyLogSnapshot(domain: string | null): string {
  if (!domain) {
    return "";
  }
  const cached = getCachedDailyLog(domain);
  return cached ? cached.keys.join("\0") : "";
}

/**
 * Leest of de dagstap van vandaag in daily_action_log staat — gedeelde SSOT
 * voor cockpit-rail en inspector. Alleen lezen; toggles lopen via useDailyActionLog.
 */
export function useTodayActionDone(model: DashboardModel | null): boolean {
  const todaySlot = useMemo(
    () =>
      model
        ? (buildWeekSchedulePreview(model).find((slot) => slot.isToday) ?? null)
        : null,
    [model],
  );
  const domain = todaySlot?.domain ?? null;

  useSyncExternalStore(
    subscribeDailyLogCache,
    () => dailyLogSnapshot(domain),
    () => "",
  );

  const [fetchKeys, setFetchKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!model || !todaySlot || !domain || isPlanStepHidden(model, todaySlot)) {
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
        setFetchKeys(state.keys);
      } catch {
        // Rail blijft "nog niet afgevinkt" tot cache gevuld is.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [model, todaySlot, domain]);

  if (!model || !todaySlot || isPlanStepHidden(model, todaySlot)) {
    return false;
  }

  const keys = (domain ? getCachedDailyLog(domain)?.keys : null) ?? fetchKeys;
  return isTodayActionDone(model, todaySlot, keys);
}
