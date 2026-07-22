"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import AgendaDayTimeline from "@/components/dashboard/agenda/AgendaDayTimeline";
import AgendaShell, { AgendaShellSection } from "@/components/dashboard/agenda/AgendaShell";
import AgendaTodayHero from "@/components/dashboard/agenda/AgendaTodayHero";
import AgendaWeekStrip from "@/components/dashboard/agenda/AgendaWeekStrip";
import AgendaPriorityTestPanel from "@/components/dashboard/agenda/AgendaPriorityTestPanel";
import CockpitShell from "@/components/dashboard/cockpit/CockpitShell";
import {
  createAgendaBlock,
  deleteAgendaBlock,
  fetchAgendaBlocks,
  fetchArchivedAgendaBlocks,
  restoreAgendaBlock,
  updateAgendaBlock,
} from "@/lib/agenda-blocks-client";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import {
  deriveDefaultTimeBucket,
} from "@/lib/account-priority-pref";
import { clarityTag } from "@/lib/clarity";
import { isPlanStepHidden } from "@/lib/day-model";
import { isCockpitShellEnabled } from "@/lib/feature-flags";
import { trackAgendaDaySelected, trackEvent } from "@/lib/ga4";
import {
  postDismissPlanStep,
  postPrioritySelection,
  postRestorePlanStep,
  postScheduledTime,
  postSetPlanStepsHidden,
  resetPriorityPref,
} from "@/lib/priority-pref-client";
import type { AgendaBlockRecord, AgendaCategoryId } from "@/types/agenda";
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
  const [routineBlocks, setRoutineBlocks] = useState<AgendaBlockRecord[]>([]);
  const [archivedBlocks, setArchivedBlocks] = useState<AgendaBlockRecord[]>([]);
  const [blocksLoaded, setBlocksLoaded] = useState(false);
  const [prefBusy, setPrefBusy] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const footerActionsRef = useRef<{
    openAddSheet: () => void;
    blockBusy: boolean;
  } | null>(null);

  const selectedSlot = slots.find((slot) => slot.date === selectedDate) ?? todaySlot;
  const todayTimeBucket = model.timeBucket ?? deriveDefaultTimeBucket();
  const weekStart = slots[0]?.date ?? todaySlot.date;
  const weekEnd = slots[slots.length - 1]?.date ?? todaySlot.date;
  const planStepHidden = isPlanStepHidden(model, selectedSlot);
  const hiddenPlanStep = useMemo(() => {
    if (!planStepHidden) {
      return null;
    }
    return {
      title: model.activeHabit?.title ?? selectedSlot.title,
      domainLabel: model.priority.label,
      color: model.priority.color,
      reason: model.planStepsHidden ? ("all" as const) : ("day" as const),
    };
  }, [
    planStepHidden,
    model.activeHabit?.title,
    model.planStepsHidden,
    model.priority.color,
    model.priority.label,
    selectedSlot.title,
  ]);

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

  const refreshRoutineBlocks = useCallback(async () => {
    try {
      const [blocks, archived] = await Promise.all([
        fetchAgendaBlocks(weekStart, weekEnd),
        fetchArchivedAgendaBlocks(weekStart, weekEnd),
      ]);
      setRoutineBlocks(blocks);
      setArchivedBlocks(archived);
      setBlocksLoaded(true);
    } catch {
      setBlocksLoaded(true);
    }
  }, [weekEnd, weekStart]);

  useEffect(() => {
    refreshWeekState();
  }, [model.date, refreshWeekState]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [blocks, archived] = await Promise.all([
          fetchAgendaBlocks(weekStart, weekEnd),
          fetchArchivedAgendaBlocks(weekStart, weekEnd),
        ]);
        if (!cancelled) {
          setRoutineBlocks(blocks);
          setArchivedBlocks(archived);
          setBlocksLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setBlocksLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weekEnd, weekStart]);

  const handleSelect = (slot: WeekDaySlot) => {
    setSelectedDate(slot.date);
    trackAgendaDaySelected({
      day_offset: slot.dayOffset,
      is_today: slot.isToday,
      domain: slot.domain,
    });
    clarityTag("dashboard_agenda", slot.isToday ? "day_today" : "day_preview");
  };

  const handleScheduledTime = async (scheduledTime: string) => {
    setPrefBusy(true);
    try {
      const pref = await postScheduledTime({
        scheduledTime,
        surface: "agenda_day_schedule",
      });
      onPrefUpdated(pref);
      trackEvent("dashboard_time_bucket_set", {
        scheduled_time: scheduledTime,
        ...(pref.timeBucket ? { time_bucket: pref.timeBucket } : {}),
        surface: "agenda_day_schedule",
      });
      if (pref.timeBucket) {
        clarityTag("dashboard_time_bucket", pref.timeBucket);
      }
    } finally {
      setPrefBusy(false);
    }
  };

  const handleCreateBlock = async (input: {
    date: string;
    categoryId: AgendaCategoryId;
    title: string;
    startTime: string;
    endTime: string;
  }) => {
    setBlockBusy(true);
    try {
      await createAgendaBlock(input);
      await refreshRoutineBlocks();
    } finally {
      setBlockBusy(false);
    }
  };

  const handleToggleBlockDone = async (blockId: string, done: boolean) => {
    setBlockBusy(true);
    try {
      await updateAgendaBlock(blockId, { status: done ? "done" : "open" });
      await refreshRoutineBlocks();
    } finally {
      setBlockBusy(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    setBlockBusy(true);
    try {
      await deleteAgendaBlock(blockId);
      await refreshRoutineBlocks();
    } finally {
      setBlockBusy(false);
    }
  };

  const handleRestoreBlock = async (blockId: string) => {
    setBlockBusy(true);
    try {
      await restoreAgendaBlock(blockId);
      await refreshRoutineBlocks();
    } finally {
      setBlockBusy(false);
    }
  };

  const handleDismissPlanStep = async (date: string) => {
    setPrefBusy(true);
    try {
      const pref = await postDismissPlanStep({
        date,
        surface: "agenda_block_detail",
      });
      onPrefUpdated(pref);
    } finally {
      setPrefBusy(false);
    }
  };

  const handleRestorePlanStep = async () => {
    setPrefBusy(true);
    try {
      const pref = await postRestorePlanStep({
        surface: "agenda_add_sheet",
      });
      onPrefUpdated(pref);
    } finally {
      setPrefBusy(false);
    }
  };

  const handleHideAllPlanSteps = async () => {
    setPrefBusy(true);
    try {
      const pref = await postSetPlanStepsHidden({
        hidden: true,
        surface: "agenda_block_detail",
      });
      onPrefUpdated(pref);
    } finally {
      setPrefBusy(false);
    }
  };

  const handleShowAllPlanSteps = async () => {
    setPrefBusy(true);
    try {
      const pref = await postSetPlanStepsHidden({
        hidden: false,
        surface: "agenda_add_sheet",
      });
      onPrefUpdated(pref);
    } finally {
      setPrefBusy(false);
    }
  };

  const saveAgendaPriority = async (
    pillarId: PillarId,
    source: "user_selected" | "accept_engine",
  ) => {
    setPrefBusy(true);
    try {
      const pref = await postPrioritySelection({
        pillarId,
        source,
        surface: "agenda",
        timeBucket: model.timeBucket ?? null,
        scheduledTime: model.scheduledTime ?? null,
      });
      onPrefUpdated(pref);
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

  const handleResetFocus = async () => {
    setPrefBusy(true);
    try {
      await resetPriorityPref();
      onPrefUpdated(null);
    } finally {
      setPrefBusy(false);
    }
  };

  const handleRegisterFooterActions = useCallback(
    (actions: { openAddSheet: () => void; blockBusy: boolean }) => {
      footerActionsRef.current = actions;
    },
    [],
  );

  const handleOpenAddSheet = () => {
    footerActionsRef.current?.openAddSheet();
  };

  const handleVoortgangLink = () => {
    trackEvent("dashboard_agenda_voortgang_link_click", {
      surface: "agenda",
    });
    clarityTag("dashboard_agenda", "voortgang_link");
    onGoVoortgang();
  };

  const cockpitMode = isCockpitShellEnabled();
  const showCockpitHero =
    cockpitMode &&
    todaySlot.isToday &&
    !isPlanStepHidden(model, todaySlot);

  return (
    <>
      {showCockpitHero ? (
        <div className="mb-4">
          <CockpitShell
            accent={model.priority.color}
            ariaLabel="Mijn dag — uitvoeren"
          >
            <AgendaTodayHero
              model={model}
              slot={todaySlot}
              prefBusy={prefBusy}
              variant="cockpit"
              actionSurface="agenda_today"
              onCompletionChange={refreshWeekState}
              onScheduledTimeChange={(scheduledTime) =>
                void handleScheduledTime(scheduledTime)
              }
            />
          </CockpitShell>
        </div>
      ) : null}

      <AgendaShell accentColor={model.priority.color}>
      <AgendaShellSection className="!pt-3 pb-5">
        <AgendaDayTimeline
          model={model}
          slot={selectedSlot}
          routineBlocks={blocksLoaded ? routineBlocks : []}
          prefBusy={prefBusy}
          blockBusy={blockBusy}
          hidePlanStepStrip={showCockpitHero && selectedSlot.isToday}
          onCompletionChange={refreshWeekState}
          onScheduledTimeChange={(scheduledTime) => void handleScheduledTime(scheduledTime)}
          onCreateBlock={handleCreateBlock}
          onToggleBlockDone={handleToggleBlockDone}
          onDeleteBlock={handleDeleteBlock}
          archivedBlocks={blocksLoaded ? archivedBlocks : []}
          onRestoreBlock={handleRestoreBlock}
          hiddenPlanStep={hiddenPlanStep}
          onDismissPlanStep={handleDismissPlanStep}
          onRestorePlanStep={handleRestorePlanStep}
          onHideAllPlanSteps={handleHideAllPlanSteps}
          onShowAllPlanSteps={handleShowAllPlanSteps}
          onSelectPillar={(pillarId) =>
            void saveAgendaPriority(pillarId, "user_selected")
          }
          onAcceptEngine={() =>
            void saveAgendaPriority(model.enginePriority.id, "accept_engine")
          }
          onResetFocus={() => void handleResetFocus()}
          onRegisterFooterActions={handleRegisterFooterActions}
          weekStrip={
            <AgendaWeekStrip
              slots={slots}
              selectedDate={selectedDate}
              completedKeys={weekState.completedKeys}
              todayTimeBucket={todayTimeBucket}
              onSelect={handleSelect}
            />
          }
        />
      </AgendaShellSection>

      <AgendaPriorityTestPanel model={model} onPrefUpdated={onPrefUpdated} />

      <AgendaShellSection className="pt-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={blockBusy}
            onClick={handleOpenAddSheet}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[var(--sage)] bg-[var(--sage)] px-3 text-[13px] font-semibold text-[#0f1c10] transition-opacity disabled:opacity-60"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            <Icons.Plus s={14} />
            Moment
          </button>
          <button
            type="button"
            onClick={handleVoortgangLink}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-full border border-[#e4e0da] bg-white px-3 text-[13px] font-semibold text-[var(--sage)] transition-colors hover:border-[#d6d3d1]"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            <span className="text-pretty leading-snug">Hoe verschuift je analyse?</span>
            <span className="shrink-0" aria-hidden>
              <Icons.ArrowRight s={14} />
            </span>
          </button>
        </div>
      </AgendaShellSection>
    </AgendaShell>
    </>
  );
}
