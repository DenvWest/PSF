"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import AgendaBlockDetailSheet from "@/components/dashboard/agenda/AgendaBlockDetailSheet";
import AgendaAddBlockSheet from "@/components/dashboard/agenda/AgendaAddBlockSheet";
import AgendaContextSidebar from "@/components/dashboard/agenda/AgendaContextSidebar";
import AgendaDayTimeline from "@/components/dashboard/agenda/AgendaDayTimeline";
import AgendaMonthGrid from "@/components/dashboard/agenda/AgendaMonthGrid";
import AgendaShell, { AgendaShellSection } from "@/components/dashboard/agenda/AgendaShell";
import AgendaSheetFrame from "@/components/dashboard/agenda/AgendaSheetFrame";
import AgendaViewSwitcher from "@/components/dashboard/agenda/AgendaViewSwitcher";
import AgendaWeekOverview from "@/components/dashboard/agenda/AgendaWeekOverview";
import AgendaWeekTimeGrid, {
  type WeekGridEmptySlot,
} from "@/components/dashboard/agenda/AgendaWeekTimeGrid";
import AgendaWeekStrip from "@/components/dashboard/agenda/AgendaWeekStrip";
import AgendaPriorityTestPanel from "@/components/dashboard/agenda/AgendaPriorityTestPanel";
import type { AgendaStripDay } from "@/components/dashboard/agenda/AgendaWeekStrip";
import type { AgendaWeekDayEntry } from "@/components/dashboard/agenda/AgendaWeekOverview";
import type { RetimeBlockInput } from "@/components/dashboard/agenda/AgendaDayTimeline";
import {
  createAgendaBlock,
  fetchAgendaBlocks,
  purgeAgendaBlock,
  updateAgendaBlock,
} from "@/lib/agenda-blocks-client";
import { resolveAgendaDayContext } from "@/lib/agenda-day-context";
import { resolvePlanStepDuration } from "@/lib/agenda-plan-duration";
import { buildWeekColumnBlocks, resolvePlanStepPlacement } from "@/lib/agenda-timeline";
import { getCachedDailyLog } from "@/lib/daily-log-client";
import { getMonthRange, isSameAgendaMonth } from "@/lib/agenda-month";
import {
  buildWeekSchedulePreview,
  getCalendarWeekDates,
  isWeekSlotCompleted,
  todayInAgendaTimezone,
} from "@/lib/agenda-week-preview";
import { syncDashboardAgendaViewParam, syncDashboardDagParam } from "@/lib/dashboard-url";
import type { AgendaViewId } from "@/lib/dashboard-url";
import { deriveDefaultTimeBucket } from "@/lib/account-priority-pref";
import { clarityTag } from "@/lib/clarity";
import { isPlanStepHidden, resolveScheduledTime } from "@/lib/day-model";
import { trackAgendaDaySelected, trackAgendaViewSet, trackEvent } from "@/lib/ga4";
import { useStickyHeaderOffset } from "@/lib/use-sticky-header-offset";
import {
  resetDashboardPriorityFocus,
  saveDashboardPrioritySelection,
} from "@/lib/dashboard-priority-selection";
import {
  postDismissPlanStep,
  postRestorePlanStep,
  postScheduledTime,
  postSetPlanStepsHidden,
} from "@/lib/priority-pref-client";
import type { AgendaBlockRecord, AgendaCategoryId, TimelineBlock } from "@/types/agenda";
import type { AccountPriorityPrefData, DashboardModel, PillarId } from "@/types/dashboard";

type ScheduledTimeSurface = "agenda_day_schedule" | "agenda_timeline_drag";

type AgendaScreenProps = {
  model: DashboardModel;
  selectedDate: string;
  view: AgendaViewId;
  onSelectedDateChange: (date: string) => void;
  onViewChange: (view: AgendaViewId) => void;
  onPrefUpdated: (pref: AccountPriorityPrefData | null) => void;
  onGoVoortgang: () => void;
};

type WeekFetchState = {
  completedKeys: Set<string>;
  loaded: boolean;
};

const WEEKDAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"] as const;

function formatDayHeading(isoDate: string, isToday: boolean): string {
  const formatted = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(`${isoDate}T12:00:00.000Z`));

  return isToday ? `Vandaag · ${formatted}` : formatted;
}

function formatRangeHeading(startDate: string, endDate: string): string {
  const format = (iso: string, withMonth: boolean) =>
    new Intl.DateTimeFormat("nl-NL", {
      day: "numeric",
      ...(withMonth ? { month: "long" } : {}),
      timeZone: "Europe/Amsterdam",
    }).format(new Date(`${iso}T12:00:00.000Z`));

  const sameMonth = startDate.slice(0, 7) === endDate.slice(0, 7);
  return `${format(startDate, !sameMonth)} – ${format(endDate, true)}`;
}

function formatMonthHeading(isoDate: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(`${isoDate}T12:00:00.000Z`));
}

export default function AgendaScreen({
  model,
  selectedDate,
  view,
  onSelectedDateChange,
  onViewChange,
  onPrefUpdated,
  onGoVoortgang,
}: AgendaScreenProps) {
  const shownRef = useRef(false);
  const today = todayInAgendaTimezone();
  const slots = useMemo(() => buildWeekSchedulePreview(model), [model]);
  const dayContext = useMemo(
    () => resolveAgendaDayContext(model, selectedDate, slots),
    [model, selectedDate, slots],
  );
  const selectedSlot = dayContext.kind === "engine" ? dayContext.slot : null;

  const [weekState, setWeekState] = useState<WeekFetchState>({
    completedKeys: new Set(),
    loaded: false,
  });
  const [routineBlocks, setRoutineBlocks] = useState<AgendaBlockRecord[]>([]);
  const [blocksLoaded, setBlocksLoaded] = useState(false);
  const [prefBusy, setPrefBusy] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  // De maand volgt de geselecteerde dag, tenzij je zelf door de maanden bladert.
  const [monthOverride, setMonthOverride] = useState<string | null>(null);
  const monthAnchor = monthOverride ?? selectedDate;
  const [monthSheetOpen, setMonthSheetOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [weekAddOpen, setWeekAddOpen] = useState(false);
  const [weekDraftSlot, setWeekDraftSlot] = useState<WeekGridEmptySlot | null>(null);
  const footerActionsRef = useRef<{
    openAddSheet: () => void;
    blockBusy: boolean;
  } | null>(null);
  const stickyOffset = useStickyHeaderOffset();

  const stripWeekDates = useMemo(
    () => getCalendarWeekDates(selectedDate),
    [selectedDate],
  );
  const todayTimeBucket = model.timeBucket ?? deriveDefaultTimeBucket();

  // Fetch-range volgt de blik: dag/week = de calendar-week van de selectie,
  // maand = de hele maand inclusief de rand-dagen die het raster toont.
  const fetchRange = useMemo(() => {
    const week = { startDate: stripWeekDates[0], endDate: stripWeekDates[6] };
    if (view === "maand" || monthSheetOpen || view === "week") {
      const month = getMonthRange(monthAnchor);
      return {
        startDate: month.startDate < week.startDate ? month.startDate : week.startDate,
        endDate: month.endDate > week.endDate ? month.endDate : week.endDate,
      };
    }
    return week;
  }, [monthAnchor, monthSheetOpen, stripWeekDates, view]);

  const planStepHidden = selectedSlot ? isPlanStepHidden(model, selectedSlot) : false;
  const hiddenPlanStep = useMemo(() => {
    if (!planStepHidden || !selectedSlot) {
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
    selectedSlot,
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
      const blocks = await fetchAgendaBlocks(fetchRange.startDate, fetchRange.endDate);
      setRoutineBlocks(blocks);
      setBlocksLoaded(true);
    } catch {
      setBlocksLoaded(true);
    }
  }, [fetchRange.endDate, fetchRange.startDate]);

  useEffect(() => {
    refreshWeekState();
  }, [model.date, refreshWeekState]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const blocks = await fetchAgendaBlocks(fetchRange.startDate, fetchRange.endDate);
        if (!cancelled) {
          setRoutineBlocks(blocks);
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
  }, [fetchRange.endDate, fetchRange.startDate]);

  const visibleBlocks = useMemo(
    () => (blocksLoaded ? routineBlocks : []),
    [blocksLoaded, routineBlocks],
  );

  const blocksByDate = useMemo(() => {
    const map = new Map<string, AgendaBlockRecord[]>();
    for (const block of visibleBlocks) {
      const list = map.get(block.date);
      if (list) {
        list.push(block);
      } else {
        map.set(block.date, [block]);
      }
    }
    for (const list of map.values()) {
      list.sort((left, right) => left.startTime.localeCompare(right.startTime));
    }
    return map;
  }, [visibleBlocks]);

  const densityByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const [date, list] of blocksByDate) {
      map.set(date, list.length);
    }
    return map;
  }, [blocksByDate]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, { startTime: string; title: string }[]>();

    const addItem = (date: string, item: { startTime: string; title: string }) => {
      const list = map.get(date);
      if (list) {
        list.push(item);
      } else {
        map.set(date, [item]);
      }
    };

    for (const [date, blocks] of blocksByDate) {
      for (const block of blocks) {
        addItem(date, {
          startTime: block.startTime.slice(0, 5),
          title: block.title,
        });
      }
    }

    for (const slot of slots) {
      if (isPlanStepHidden(model, slot)) {
        continue;
      }
      if (resolvePlanStepPlacement(model, slot) !== "grid") {
        continue;
      }
      addItem(slot.date, {
        startTime: resolveScheduledTime(model, slot).slice(0, 5),
        title: slot.title,
      });
    }

    for (const list of map.values()) {
      list.sort((left, right) => left.startTime.localeCompare(right.startTime));
    }

    return map;
  }, [blocksByDate, model, slots]);

  const stripDays = useMemo<AgendaStripDay[]>(
    () =>
      stripWeekDates.map((date, index) => {
        const slot = slots.find((entry) => entry.date === date) ?? null;
        return {
          date,
          dayLabel: WEEKDAY_LABELS[index],
          dayNumber: String(Number(date.slice(8, 10))),
          isToday: date === today,
          isPast: date < today,
          domain: slot?.domain ?? null,
          completed: slot ? isWeekSlotCompleted(slot, weekState.completedKeys) : false,
          blockCount: blocksByDate.get(date)?.length ?? 0,
        };
      }),
    [blocksByDate, slots, stripWeekDates, today, weekState.completedKeys],
  );

  const weekEntries = useMemo<AgendaWeekDayEntry[]>(
    () =>
      stripWeekDates.map((date, index) => {
        const slot = slots.find((entry) => entry.date === date) ?? null;
        const hidden = slot ? isPlanStepHidden(model, slot) : true;
        const logKeys =
          slot?.isToday && slot.domain
            ? (getCachedDailyLog(slot.domain)?.keys ?? [])
            : [];
        const planStepDuration = slot && !hidden
          ? resolvePlanStepDuration(model, slot, logKeys)
          : null;
        return {
          date,
          dayLabel: WEEKDAY_LABELS[index],
          dayNumber: String(Number(date.slice(8, 10))),
          isToday: date === today,
          domain: slot?.domain ?? null,
          planStepTitle: slot && !hidden ? slot.title : null,
          planStepDurationLabel: planStepDuration?.durationLabel ?? null,
          planStepScheduledTime:
            slot?.isToday && model.scheduledTime ? model.scheduledTime : null,
          blocks: blocksByDate.get(date) ?? [],
        };
      }),
    [blocksByDate, model, slots, stripWeekDates, today],
  );

  const selectDate = useCallback(
    (date: string, surface: "week_strip" | "week_view" | "month" | "go_today") => {
      const nextWeekStart = getCalendarWeekDates(date)[0];
      if (nextWeekStart !== stripWeekDates[0]) {
        setSelectedBlockId(null);
      }
      setMonthOverride(null);
      onSelectedDateChange(date);
      syncDashboardDagParam(date);
      const slot = slots.find((entry) => entry.date === date) ?? null;
      trackAgendaDaySelected({
        day_offset: slot?.dayOffset ?? 0,
        is_today: date === today,
        domain: slot?.domain ?? "geen",
        surface: `agenda_${surface}`,
      });
      clarityTag("dashboard_agenda", date === today ? "day_today" : "day_preview");
    },
    [onSelectedDateChange, slots, stripWeekDates, today],
  );

  const handleGoToday = useCallback(
    (surface: "agenda_header" | "agenda_month_sheet" | "agenda_week_sidebar") => {
      setMonthOverride(null);
      setSelectedBlockId(null);
      selectDate(today, "go_today");
      trackEvent("dashboard_agenda_go_today", { view, surface });
      clarityTag("dashboard_agenda", "go_today");
    },
    [selectDate, today, view],
  );

  const handleViewChange = useCallback(
    (nextView: AgendaViewId) => {
      setSelectedBlockId(null);
      onViewChange(nextView);
      syncDashboardAgendaViewParam(nextView);
      trackAgendaViewSet({ view: nextView, surface: "agenda" });
      clarityTag("dashboard_agenda", `view_${nextView}`);
    },
    [onViewChange],
  );

  const handleScheduledTime = async (
    scheduledTime: string,
    surface: ScheduledTimeSurface = "agenda_day_schedule",
  ) => {
    setPrefBusy(true);
    try {
      const pref = await postScheduledTime({
        scheduledTime,
        surface,
      });
      onPrefUpdated(pref);
      trackEvent("dashboard_time_bucket_set", {
        scheduled_time: scheduledTime,
        ...(pref.timeBucket ? { time_bucket: pref.timeBucket } : {}),
        surface,
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

  const handleRetimeBlock = async (blockId: string, input: RetimeBlockInput) => {
    setBlockBusy(true);
    try {
      const block = await updateAgendaBlock(blockId, input);
      if (block.date !== selectedDate) {
        onSelectedDateChange(block.date);
        syncDashboardDagParam(block.date);
      }
      await refreshRoutineBlocks();
    } finally {
      setBlockBusy(false);
    }
  };

  const handlePurgeBlock = async (blockId: string) => {
    setBlockBusy(true);
    try {
      await purgeAgendaBlock(blockId);
      await refreshRoutineBlocks();
      setSelectedBlockId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kon moment niet verwijderen.";
      throw new Error(message);
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
      await saveDashboardPrioritySelection({
        pillarId,
        source,
        surface: "agenda",
        timeBucket: model.timeBucket ?? null,
        scheduledTime: model.scheduledTime ?? null,
        onPrefUpdated,
      });
    } finally {
      setPrefBusy(false);
    }
  };

  const handleResetFocus = async () => {
    setPrefBusy(true);
    try {
      await resetDashboardPriorityFocus(onPrefUpdated);
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

  const handleVoortgangLink = (surface: "agenda" | "agenda_week_sidebar" = "agenda") => {
    trackEvent("dashboard_agenda_voortgang_link_click", {
      surface,
    });
    clarityTag("dashboard_agenda", "voortgang_link");
    onGoVoortgang();
  };

  const handleWeekEmptySlot = (slot: WeekGridEmptySlot) => {
    setWeekDraftSlot(slot);
    setWeekAddOpen(true);
    selectDate(slot.date, "week_view");
  };

  const closeWeekAddSheet = () => {
    setWeekAddOpen(false);
    setWeekDraftSlot(null);
  };

  const handleWeekCreateBlock = async (input: {
    date: string;
    categoryId: AgendaCategoryId;
    title: string;
    startTime: string;
    endTime: string;
  }) => {
    await handleCreateBlock(input);
    closeWeekAddSheet();
  };

  const selectWeekDate = (date: string) => {
    selectDate(date, "week_view");
  };

  const heading =
    view === "dag"
      ? formatDayHeading(selectedDate, selectedDate === today)
      : view === "week"
        ? formatRangeHeading(stripWeekDates[0], stripWeekDates[6])
        : formatMonthHeading(monthAnchor);

  const showGoToday =
    selectedDate !== today ||
    (view === "week" && !stripWeekDates.includes(today)) ||
    (view === "maand" && !isSameAgendaMonth(monthAnchor, today));

  let selectedWeekBlock: { block: TimelineBlock; date: string } | null = null;
  if (selectedBlockId) {
    for (const day of weekEntries) {
      const slot = slots.find((entry) => entry.date === day.date) ?? null;
      const blocks = buildWeekColumnBlocks(
        model,
        day.date,
        slot,
        day.blocks,
        slot ? isWeekSlotCompleted(slot, weekState.completedKeys) : false,
      );
      const found = blocks.find((block) => block.id === selectedBlockId);
      if (found) {
        selectedWeekBlock = { block: found, date: day.date };
        break;
      }
    }
  }

  return (
    <AgendaShell accentColor={model.priority.color}>
      <header
        className="sticky z-10 -mx-3 mb-4 border-b border-white/10 bg-[rgba(26,46,26,0.94)] px-3 pb-3 pt-2 backdrop-blur-md sm:-mx-4 sm:px-4 min-[1440px]:-mx-6 min-[1440px]:px-6"
        style={{ top: stickyOffset }}
      >
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <h2
            className="m-0 min-w-0 flex-1 text-[20px] font-medium capitalize leading-tight text-[#F1EFE8] sm:text-[22px]"
            style={{ fontFamily: "var(--f-serif)" }}
          >
            {heading}
          </h2>
          {showGoToday || view === "dag" ? (
            <div className="flex shrink-0 items-center gap-2">
              {showGoToday ? (
                <button
                  type="button"
                  onClick={() => handleGoToday("agenda_header")}
                  className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border border-white/10 bg-white/[0.04] px-3 text-[12.5px] font-medium text-[var(--sage)] transition-colors hover:border-white/25 hover:text-[#F1EFE8]"
                  style={{ fontFamily: "var(--f-sans)" }}
                >
                  Vandaag
                </button>
              ) : null}
              {view === "dag" ? (
                <button
                  type="button"
                  onClick={() => setMonthSheetOpen(true)}
                  aria-haspopup="dialog"
                  className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[12.5px] font-medium text-[#CDD7D0] transition-colors hover:border-white/25 hover:text-[#F1EFE8]"
                  style={{ fontFamily: "var(--f-sans)" }}
                >
                  <Icons.Calendar s={13} />
                  Maand
                  <Icons.ChevronRight s={13} />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <AgendaViewSwitcher value={view} onChange={handleViewChange} />
      </header>

      {view === "dag" ? (
        <AgendaDayTimeline
          model={model}
          context={dayContext}
          routineBlocks={visibleBlocks}
          prefBusy={prefBusy}
          blockBusy={blockBusy}
          onCompletionChange={refreshWeekState}
          onScheduledTimeChange={(scheduledTime, surface) =>
            void handleScheduledTime(scheduledTime, surface)
          }
          onCreateBlock={handleCreateBlock}
          onToggleBlockDone={handleToggleBlockDone}
          onPurgeBlock={handlePurgeBlock}
          onRetimeBlock={handleRetimeBlock}
          hiddenPlanStep={hiddenPlanStep}
          onDismissPlanStep={handleDismissPlanStep}
          onRestorePlanStep={handleRestorePlanStep}
          onHideAllPlanSteps={handleHideAllPlanSteps}
          onShowAllPlanSteps={handleShowAllPlanSteps}
          onSelectPillar={(pillarId) => void saveAgendaPriority(pillarId, "user_selected")}
          onAcceptEngine={() =>
            void saveAgendaPriority(model.enginePriority.id, "accept_engine")
          }
          onResetFocus={() => void handleResetFocus()}
          onRegisterFooterActions={handleRegisterFooterActions}
          weekStrip={
            <AgendaWeekStrip
              days={stripDays}
              selectedDate={selectedDate}
              todayTimeBucket={todayTimeBucket}
              onSelect={(date) => selectDate(date, "week_strip")}
            />
          }
        />
      ) : null}

      {view === "week" ? (
        <>
          <div className="lg:hidden">
            <AgendaWeekOverview
              days={weekEntries}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                selectDate(date, "week_view");
                handleViewChange("dag");
              }}
            />
          </div>
          <div className="hidden min-w-0 lg:flex lg:items-start lg:gap-4">
            <AgendaWeekTimeGrid
              model={model}
              days={weekEntries}
              slots={slots}
              completedKeys={weekState.completedKeys}
              selectedDate={selectedDate}
              todayDate={today}
              selectedBlockId={selectedBlockId}
              blockBusy={blockBusy}
              prefBusy={prefBusy}
              onSelectDate={selectWeekDate}
              onSelectBlock={setSelectedBlockId}
              onEmptySlot={handleWeekEmptySlot}
              onRetimeBlock={handleRetimeBlock}
              onScheduledTimeChange={(scheduledTime) =>
                void handleScheduledTime(scheduledTime, "agenda_timeline_drag")
              }
            />
            <AgendaContextSidebar
              weekEntries={weekEntries}
              monthAnchor={monthAnchor}
              selectedDate={selectedDate}
              todayDate={today}
              densityByDate={densityByDate}
              itemsByDate={itemsByDate}
              selectedBlock={selectedWeekBlock?.block ?? null}
              selectedBlockDate={selectedWeekBlock?.date ?? null}
              onMonthAnchorChange={setMonthOverride}
              onSelectDate={selectWeekDate}
              onGoToday={() => handleGoToday("agenda_week_sidebar")}
              onClearSelection={() => setSelectedBlockId(null)}
              onOpenInDay={() => {
                if (selectedWeekBlock) {
                  selectDate(selectedWeekBlock.date, "week_view");
                }
                handleViewChange("dag");
              }}
              onGoVoortgang={() => handleVoortgangLink("agenda_week_sidebar")}
            />
          </div>
          {weekAddOpen && weekDraftSlot ? (
            <AgendaAddBlockSheet
              key={`week-${weekDraftSlot.date}-${weekDraftSlot.startTime}`}
              open={weekAddOpen}
              date={weekDraftSlot.date}
              busy={blockBusy}
              initialStartTime={weekDraftSlot.startTime}
              initialEndTime={weekDraftSlot.endTime}
              createSurface="agenda_week_grid_tap"
              onClose={closeWeekAddSheet}
              onSubmit={handleWeekCreateBlock}
            />
          ) : null}
          <AgendaBlockDetailSheet
            key={`week-${selectedWeekBlock?.date ?? "none"}-${selectedWeekBlock?.block.id ?? "none"}`}
            block={selectedWeekBlock?.block ?? null}
            model={model}
            date={selectedWeekBlock?.date ?? selectedDate}
            prefBusy={prefBusy}
            busy={blockBusy}
            onClose={() => setSelectedBlockId(null)}
            onCompletionChange={refreshWeekState}
            onScheduledTimeChange={(scheduledTime) =>
              void handleScheduledTime(scheduledTime, "agenda_day_schedule")
            }
            onToggleDone={(blockId, done) => void handleToggleBlockDone(blockId, done)}
            onPurge={(blockId) => handlePurgeBlock(blockId)}
            onRetime={
              selectedWeekBlock
                ? (blockId, input) => {
                    void handleRetimeBlock(blockId, input);
                  }
                : undefined
            }
            onDismissPlanStep={
              selectedWeekBlock?.block.kind === "analysis"
                ? (dismissDate) => {
                    void handleDismissPlanStep(dismissDate);
                  }
                : undefined
            }
            onHideAllPlanSteps={
              selectedWeekBlock?.block.kind === "analysis"
                ? () => {
                    void handleHideAllPlanSteps();
                  }
                : undefined
            }
          />
        </>
      ) : null}

      {view === "maand" ? (
        <AgendaMonthGrid
          anchorDate={monthAnchor}
          selectedDate={selectedDate}
          todayDate={today}
          densityByDate={densityByDate}
          itemsByDate={itemsByDate}
          onAnchorChange={setMonthOverride}
          onSelectDate={(date) => {
            selectDate(date, "month");
            handleViewChange("dag");
          }}
        />
      ) : null}

      <AgendaPriorityTestPanel model={model} onPrefUpdated={onPrefUpdated} />

      {view === "dag" ? (
        <AgendaShellSection className="pt-4">
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
              onClick={() => handleVoortgangLink("agenda")}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[13px] font-semibold text-[var(--sage)] transition-colors hover:border-white/25"
              style={{ fontFamily: "var(--f-sans)" }}
            >
              <span className="text-pretty leading-snug">Hoe verschuift je analyse?</span>
              <span className="shrink-0" aria-hidden>
                <Icons.ArrowRight s={14} />
              </span>
            </button>
          </div>
        </AgendaShellSection>
      ) : null}

      {monthSheetOpen ? (
        <AgendaSheetFrame
          titleId="agenda-month-sheet"
          title="Kies een dag"
          onClose={() => setMonthSheetOpen(false)}
        >
          <AgendaMonthGrid
            anchorDate={monthAnchor}
            selectedDate={selectedDate}
            todayDate={today}
            densityByDate={densityByDate}
            itemsByDate={itemsByDate}
            onAnchorChange={setMonthOverride}
            onSelectDate={(date) => {
              selectDate(date, "month");
              setMonthSheetOpen(false);
            }}
            showTodayButton
            onGoToday={() => {
              handleGoToday("agenda_month_sheet");
              setMonthSheetOpen(false);
            }}
          />
        </AgendaSheetFrame>
      ) : null}
    </AgendaShell>
  );
}
