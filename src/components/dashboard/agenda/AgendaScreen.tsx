"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import AgendaDayTimeline from "@/components/dashboard/agenda/AgendaDayTimeline";
import AgendaMetaRow from "@/components/dashboard/agenda/AgendaMetaRow";
import AgendaProvenanceStrip from "@/components/dashboard/agenda/AgendaProvenanceStrip";
import AgendaShell, { AgendaShellSection } from "@/components/dashboard/agenda/AgendaShell";
import AgendaWeekStrip from "@/components/dashboard/agenda/AgendaWeekStrip";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import {
  deriveDefaultTimeBucket,
  type TimeBucket,
} from "@/lib/account-priority-pref";
import { clarityTag } from "@/lib/clarity";
import { trackAgendaDaySelected, trackEvent } from "@/lib/ga4";
import {
  postPrioritySelection,
  postTimeBucket,
  resetPriorityPref,
} from "@/lib/priority-pref-client";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { AccountPriorityPrefData, DashboardModel, PillarId } from "@/types/dashboard";

type AgendaScreenProps = {
  model: DashboardModel;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  onGoVoortgang: () => void;
};

type WeekFetchState = {
  completedKeys: Set<string>;
  loaded: boolean;
};

export default function AgendaScreen({
  model,
  onPrefUpdated,
  onGoVoortgang,
}: AgendaScreenProps) {
  const shownRef = useRef(false);
  const slots = useMemo(() => buildWeekSchedulePreview(model), [model]);
  const todaySlot = slots.find((slot) => slot.isToday) ?? slots[0];
  const [selectedDate, setSelectedDate] = useState(todaySlot.date);
  const [weekState, setWeekState] = useState<WeekFetchState>({
    completedKeys: new Set(),
    loaded: false,
  });
  const [focusExpanded, setFocusExpanded] = useState(false);
  const [prefBusy, setPrefBusy] = useState(false);

  const selectedSlot = slots.find((slot) => slot.date === selectedDate) ?? todaySlot;
  const todayTimeBucket = model.timeBucket ?? deriveDefaultTimeBucket();

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_agenda_shown", {
      priority: model.priority.id,
      has_active_habit: Boolean(model.activeHabit),
      user_chosen: model.priorityIsUserChosen,
    });
    clarityTag("dashboard_agenda", "shown");
  }, [model.activeHabit, model.priority.id, model.priorityIsUserChosen]);

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

  const savePriority = async (
    pillarId: PillarId,
    source: "user_selected" | "accept_engine",
  ) => {
    setPrefBusy(true);
    try {
      const pref = await postPrioritySelection({
        pillarId,
        source,
        surface: "agenda",
        timeBucket: model.timeBucket,
      });
      onPrefUpdated(pref);
      setFocusExpanded(false);
      trackEvent("dashboard_priority_selected", {
        pillar_id: pillarId,
        source,
        surface: "agenda",
      });
      clarityTag("dashboard_priority", pillarId);
    } finally {
      setPrefBusy(false);
    }
  };

  const handleTimeBucket = async (bucket: TimeBucket) => {
    setPrefBusy(true);
    try {
      const pref = await postTimeBucket({
        timeBucket: bucket,
        surface: "agenda_day_schedule",
      });
      onPrefUpdated(pref);
      trackEvent("dashboard_time_bucket_set", {
        time_bucket: bucket,
        surface: "agenda_day_schedule",
      });
      clarityTag("dashboard_time_bucket", bucket);
    } finally {
      setPrefBusy(false);
    }
  };

  const handleReset = async () => {
    setPrefBusy(true);
    try {
      await resetPriorityPref();
      onPrefUpdated(null);
      setFocusExpanded(false);
      trackEvent("dashboard_priority_selected", {
        pillar_id: model.enginePriority.id,
        source: "accept_engine",
        surface: "agenda_reset",
      });
    } finally {
      setPrefBusy(false);
    }
  };

  const handleVoortgangLink = () => {
    trackEvent("dashboard_agenda_voortgang_link_click", {
      surface: "agenda",
    });
    clarityTag("dashboard_agenda", "voortgang_link");
    onGoVoortgang();
  };

  return (
    <AgendaShell accentColor={model.priority.color}>
      <AgendaProvenanceStrip model={model} slot={selectedSlot} />

      <AgendaShellSection>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
          Deze week
        </p>
        <AgendaWeekStrip
          slots={slots}
          selectedDate={selectedDate}
          completedKeys={weekState.completedKeys}
          todayTimeBucket={todayTimeBucket}
          onSelect={handleSelect}
        />
      </AgendaShellSection>

      <AgendaShellSection className="py-5">
        <AgendaDayTimeline
          model={model}
          slot={selectedSlot}
          prefBusy={prefBusy}
          onCompletionChange={refreshWeekState}
          onTimeBucketChange={(bucket) => void handleTimeBucket(bucket)}
        />
      </AgendaShellSection>

      <AgendaShellSection>
        <AgendaMetaRow
          model={model}
          busy={prefBusy}
          focusExpanded={focusExpanded}
          onToggleFocus={() => setFocusExpanded((open) => !open)}
          onSelectPillar={(pillarId) => void savePriority(pillarId, "user_selected")}
          onAcceptEngine={() => void savePriority(model.enginePriority.id, "accept_engine")}
          onReset={() => void handleReset()}
        />
        <button
          type="button"
          onClick={handleVoortgangLink}
          className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-medium text-[var(--sage)]"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          Hoe verschuift je analyse?
          <Icons.ArrowRight s={14} />
        </button>
      </AgendaShellSection>
    </AgendaShell>
  );
}
