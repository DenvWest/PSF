"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "@/components/app/icons";
import AgendaTimelineHourAxis from "@/components/dashboard/agenda/AgendaTimelineHourAxis";
import AgendaAddBlockSheet from "@/components/dashboard/agenda/AgendaAddBlockSheet";
import AgendaBlockCard from "@/components/dashboard/agenda/AgendaBlockCard";
import AgendaBlockDetailSheet from "@/components/dashboard/agenda/AgendaBlockDetailSheet";
import MeerHulpBridgeSheet from "@/components/dashboard/agenda/MeerHulpBridgeSheet";
import { clarityTag } from "@/lib/clarity";
import { buildBewegingHelpBridge } from "@/lib/beweging-help-bridge";
import { buildDashboardSchapHref } from "@/lib/dashboard-url";
import { getCachedDailyLog, subscribeDailyLogCache } from "@/lib/daily-log-client";
import AgendaPlanStepStrip from "@/components/dashboard/agenda/AgendaPlanStepStrip";
import {
  buildDayTimeline,
  buildPlanStepBlock,
  getBlockTimelineSpanPx,
  getBlockTimelineStyle,
  getBlockTimelineTopPx,
  getHourMarkerTopPx,
  getNowLinePercent,
  getTimelineHalfHourMarks,
  getTimelineHourLabels,
  getTimelineTrackHeightPx,
  isCompactTimelineBlock,
  positionToTimelineTime,
  resolvePlanStepPlacement,
  timeToMinutes,
  TIMELINE_MIN_BLOCK_HEIGHT_PX,
} from "@/lib/agenda-timeline";
import {
  hasPlanStepDragChanged,
  hasRoutineDragChanged,
  resolveRetimeFromDrag,
} from "@/lib/agenda-timeline-drag";
import { trackAgendaBlockUpdated, trackEvent } from "@/lib/ga4";
import { useAgendaTimelineDrag } from "@/lib/use-agenda-timeline-drag";
import { useStickyHeaderOffset } from "@/lib/use-sticky-header-offset";
import { useTodayActionDone } from "@/lib/use-today-action-done";
import type { AgendaDayContext } from "@/lib/agenda-day-context";
import type { AgendaBlockRecord, AgendaCategoryId } from "@/types/agenda";
import type { DashboardModel, PillarId } from "@/types/dashboard";

const HOUR_HEIGHT_PX = 58;
const TIMELINE_HEIGHT_PX = getTimelineTrackHeightPx(HOUR_HEIGHT_PX);

type DraftSlot = {
  startTime: string;
  endTime: string;
};

/** "Meer hulp hierbij" opent de dunne brug (Pad A, slice 3) — geen catalogus. */
type HelpPreset = {
  domain: PillarId;
};

type HiddenPlanStep = {
  title: string;
  domainLabel: string;
  color: string;
  reason: "day" | "all";
};

export type RetimeBlockInput = {
  date?: string;
  startTime: string;
  endTime: string;
};

type AgendaDayTimelineProps = {
  model: DashboardModel;
  context: AgendaDayContext;
  routineBlocks: AgendaBlockRecord[];
  prefBusy: boolean;
  blockBusy?: boolean;
  /** Poort 2 van de bestaande advies-deur (§G.1 BESLUIT) — voedt de brug-statusstrip. */
  nutritionLogCompleted: boolean;
  onCompletionChange?: () => void;
  onScheduledTimeChange: (
    scheduledTime: string,
    surface?: "agenda_day_schedule" | "agenda_timeline_drag",
  ) => void;
  onCreateBlock: (input: {
    date: string;
    categoryId: AgendaCategoryId;
    title: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  onToggleBlockDone: (blockId: string, done: boolean) => Promise<void>;
  onPurgeBlock: (blockId: string) => Promise<void>;
  onRetimeBlock?: (blockId: string, input: RetimeBlockInput) => Promise<void>;
  hiddenPlanStep?: HiddenPlanStep | null;
  onDismissPlanStep?: (date: string) => Promise<void>;
  onRestorePlanStep?: () => Promise<void>;
  onHideAllPlanSteps?: () => Promise<void>;
  onShowAllPlanSteps?: () => Promise<void>;
  onCloseFocus: () => void;
  weekStrip?: ReactNode;
  onRegisterFooterActions?: (actions: {
    openAddSheet: () => void;
    blockBusy: boolean;
  }) => void;
};

export default function AgendaDayTimeline({
  model,
  context,
  routineBlocks,
  prefBusy,
  blockBusy = false,
  nutritionLogCompleted,
  onCompletionChange,
  onScheduledTimeChange,
  onCreateBlock,
  onToggleBlockDone,
  onPurgeBlock,
  onRetimeBlock,
  hiddenPlanStep = null,
  onDismissPlanStep,
  onRestorePlanStep,
  onHideAllPlanSteps,
  onShowAllPlanSteps,
  onCloseFocus,
  weekStrip,
  onRegisterFooterActions,
}: AgendaDayTimelineProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [draftSlot, setDraftSlot] = useState<DraftSlot | null>(null);
  const [helpPreset, setHelpPreset] = useState<HelpPreset | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [railElement, setRailElement] = useState<HTMLDivElement | null>(null);

  // Mobiel: de uur-as+rail scrollen intern binnen wat er na de sticky chrome
  // overblijft, i.p.v. de hele pagina — gemeten, niet hardcoded, zoals de
  // header-hoogte elders al gebeurt (die groeit ook mee).
  const headerHeightPx = useStickyHeaderOffset("[data-cockpit-header]");
  const toolbarHeightPx = useStickyHeaderOffset("[data-agenda-toolbar]");
  const bottomNavHeightPx = useStickyHeaderOffset("[data-cockpit-bottom-nav]");
  const railMaxHeight = `calc(100dvh - ${headerHeightPx + toolbarHeightPx}px - ${bottomNavHeightPx}px)`;

  const slot = context.kind === "engine" ? context.slot : null;
  const date = context.date;
  const isToday = slot?.isToday ?? false;

  const planStepPlacement = slot ? resolvePlanStepPlacement(model, slot) : "hidden";
  // Gedaan-staat komt uit daily_action_log (dezelfde bron als elke Gedaan-knop),
  // nooit uit het blok zelf — anders is de chip in het raster een vierde readout.
  const planStepDomain =
    slot?.isToday && slot.domain ? slot.domain : null;
  useSyncExternalStore(
    subscribeDailyLogCache,
    () =>
      planStepDomain
        ? (getCachedDailyLog(planStepDomain)?.keys.join("\0") ?? "")
        : "",
    () => "",
  );
  const todayActionDone = useTodayActionDone(model);
  const planStep = useMemo(() => {
    const logKeys = planStepDomain
      ? (getCachedDailyLog(planStepDomain)?.keys ?? [])
      : [];
    return slot
      ? buildPlanStepBlock(
          model,
          slot,
          slot.isToday ? todayActionDone : false,
          logKeys,
        )
      : null;
  }, [model, planStepDomain, slot, todayActionDone]);
  const dayBlocks = useMemo(
    () => buildDayTimeline(model, { date }, routineBlocks),
    [model, date, routineBlocks],
  );
  // Eén object, één plek: staat de plan-stap in het raster, dan verdwijnt de
  // tray-strip — en andersom (verdict §A2c).
  const gridBlocks = useMemo(() => {
    if (planStepPlacement !== "grid" || !planStep) {
      return dayBlocks;
    }
    return [...dayBlocks, planStep].sort((left, right) =>
      left.startTime.localeCompare(right.startTime),
    );
  }, [dayBlocks, planStep, planStepPlacement]);

  const selectedBlock = useMemo(() => {
    if (planStep?.id === selectedBlockId) {
      return planStep;
    }
    return gridBlocks.find((block) => block.id === selectedBlockId) ?? null;
  }, [gridBlocks, planStep, selectedBlockId]);

  const trayVisible = Boolean(planStep && planStepPlacement === "tray");

  const nowLinePercent = isToday ? getNowLinePercent() : null;
  const hourLabels = getTimelineHourLabels();
  const halfHourMarks = getTimelineHalfHourMarks();
  const ghostStyle = draftSlot
    ? getBlockTimelineStyle(draftSlot.startTime, draftSlot.endTime)
    : null;

  const timelineDrag = useAgendaTimelineDrag({
    disabled: blockBusy || prefBusy,
  });

  const closeSheet = () => {
    setAddOpen(false);
    setDraftSlot(null);
    setHelpPreset(null);
  };

  const closeFocus = onCloseFocus;

  const closeDetail = () => {
    setSelectedBlockId(null);
  };

  const openDetail = (blockId: string) => {
    closeSheet();
    closeFocus();
    setSelectedBlockId(blockId);
  };

  const getRailRect = useCallback(
    () => railElement?.getBoundingClientRect() ?? null,
    [railElement],
  );

  const commitPlanStepDrag = useCallback(
    (startTime: string) => {
      onScheduledTimeChange(startTime, "agenda_timeline_drag");
      clarityTag("agenda_block", "timeline_drag");
    },
    [onScheduledTimeChange],
  );

  const bindBlockDrag = useCallback(
    (block: (typeof gridBlocks)[number], onTap?: () => void) => {
      if (!block.isEditable) {
        return undefined;
      }
      const durationMinutes = Math.max(
        15,
        timeToMinutes(block.endTime) - timeToMinutes(block.startTime),
      );
      return timelineDrag.bindDragHandle({
        durationMinutes,
        getTrackRect: getRailRect,
        onTap,
        onCommit: (slot) => {
          if (block.kind === "analysis") {
            if (!hasPlanStepDragChanged(block.startTime, slot.startTime)) {
              return;
            }
            commitPlanStepDrag(slot.startTime);
            return;
          }
          if (!onRetimeBlock) {
            return;
          }
          const retime = resolveRetimeFromDrag(
            block.startTime,
            block.endTime,
            slot.startTime,
          );
          if (!hasRoutineDragChanged(block.startTime, block.endTime, retime)) {
            return;
          }
          onRetimeBlock(block.id, retime)
            .then(() => {
              trackAgendaBlockUpdated({
                category_id: block.categoryId,
                surface: "agenda_timeline_drag",
                moved_date: false,
              });
              clarityTag("agenda_block", "timeline_drag");
            })
            .catch(() => {
              // Fout is al zichtbaar via de gedeelde agenda-foutbanner
              // (AgendaScreen.reportAgendaError); hier alleen tracking overslaan.
            });
        },
      });
    },
    [commitPlanStepDrag, getRailRect, onRetimeBlock, timelineDrag],
  );

  const planStepDragHandle =
    trayVisible && isToday && planStep
      ? timelineDrag.bindDragHandle({
          durationMinutes: Math.max(
            15,
            timeToMinutes(planStep.endTime) - timeToMinutes(planStep.startTime),
          ),
          getTrackRect: getRailRect,
          onTap: () => openDetail(planStep.id),
          onCommit: (slot) => {
            commitPlanStepDrag(slot.startTime);
            clarityTag("agenda_plan_step", "tray_drag_to_grid");
          },
        })
      : undefined;

  const dragGhostStyle =
    timelineDrag.ghost && timelineDrag.isDragging
      ? getBlockTimelineStyle(timelineDrag.ghost.startTime, timelineDrag.ghost.endTime)
      : null;

  const openHeaderSheet = useCallback(() => {
    closeFocus();
    setSelectedBlockId(null);
    setDraftSlot(null);
    setHelpPreset(null);
    setAddOpen(true);
  }, [closeFocus]);

  const openHelpSheet = (preset: HelpPreset) => {
    closeFocus();
    setSelectedBlockId(null);
    setDraftSlot(null);
    setHelpPreset(preset);
    setAddOpen(true);
  };

  const handleQuietCtaClick = () => {
    trackEvent("dashboard_agenda_quiet_cta_click", {
      surface: "agenda",
      view: "dag",
    });
    clarityTag("dashboard_agenda", "quiet_cta");
    openHeaderSheet();
  };

  useEffect(() => {
    onRegisterFooterActions?.({ openAddSheet: openHeaderSheet, blockBusy });
  }, [blockBusy, onRegisterFooterActions, openHeaderSheet]);

  const handleRailClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (blockBusy || timelineDrag.isDragging) {
      return;
    }

    closeFocus();
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const nextDraft = positionToTimelineTime(offsetY, rect.height);
    setSelectedBlockId(null);
    setHelpPreset(null);
    setDraftSlot(nextDraft);
    setAddOpen(true);
    clarityTag("agenda_block", "tap_create");
  };

  // De tray blijft staan zolang er geen tijd gezet is (fullbleed-regel 7); de
  // sectiekop maakt van "hangt erboven" een eigen belofte in plaats van een
  // restpost.
  const freeHeading = isToday ? "Vandaag nog vrij" : "Nog vrij op deze dag";
  const quietHeading = trayVisible
    ? isToday
      ? "Nog geen moment in je dag gezet"
      : "Nog geen moment op deze dag gezet"
    : isToday
      ? "Je dag is nog leeg"
      : "Nog niets op deze dag";
  const quietBody = trayVisible
    ? "Je stap hierboven wacht nog op een tijd. Zet er een moment bij, of plan iets anders."
    : "Zet één moment vast, dan weet je waar de rest omheen past.";

  return (
    <section aria-label="Dagtijdlijn" className="min-w-0">
      {planStep && trayVisible ? (
        <section className="mb-3" aria-label={freeHeading}>
          <h3 className="m-0 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            {freeHeading}
          </h3>
          <AgendaPlanStepStrip
            block={planStep}
            dragHandleProps={planStepDragHandle}
            onOpenDetail={() => openDetail(planStep.id)}
          />
          <p className="mt-2 text-[12px] leading-normal text-[#7E8C82]">
            Sleep naar je dag of tik om een moment te kiezen — hij verdwijnt niet vanzelf.
          </p>
        </section>
      ) : null}

      {weekStrip ? <div className="mb-4">{weekStrip}</div> : null}

      <div
        className="flex max-h-[var(--agenda-rail-max-h)] gap-2 overflow-y-auto sm:max-h-none sm:gap-3 sm:overflow-visible"
        style={{ "--agenda-rail-max-h": railMaxHeight } as CSSProperties}
      >
        <AgendaTimelineHourAxis
          hourLabels={hourLabels}
          hourHeightPx={HOUR_HEIGHT_PX}
          trackHeightPx={TIMELINE_HEIGHT_PX}
        />

        <div
          ref={setRailElement}
          className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
          style={{
            height: TIMELINE_HEIGHT_PX,
            minHeight: TIMELINE_HEIGHT_PX,
          }}
        >
          <button
            type="button"
            disabled={blockBusy || timelineDrag.isDragging}
            aria-label="Voeg leefstijlmoment toe op dit tijdstip"
            onClick={handleRailClick}
            className="absolute inset-0 z-0 cursor-pointer border-none bg-transparent transition-colors hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
          />

          {hourLabels.map((hour) => (
            <div
              key={`grid-${hour}`}
              className="pointer-events-none absolute inset-x-0 border-t border-white/10"
              style={{ top: getHourMarkerTopPx(hour, HOUR_HEIGHT_PX) }}
              aria-hidden
            />
          ))}

          {halfHourMarks.map((mark) => (
            <div
              key={`half-${mark}`}
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/[0.055]"
              style={{ top: getHourMarkerTopPx(mark, HOUR_HEIGHT_PX) }}
              aria-hidden
            />
          ))}

          {ghostStyle && addOpen && draftSlot ? (
            <div
              className="pointer-events-none absolute inset-x-2 z-[5] rounded-xl border border-dashed border-[var(--sage)] bg-[rgba(90,143,106,0.14)]"
              style={{
                top: `${ghostStyle.topPercent}%`,
                height: `${ghostStyle.heightPercent}%`,
              }}
              aria-hidden
            />
          ) : null}

          {dragGhostStyle ? (
            <div
              className="pointer-events-none absolute inset-x-2 z-[6] rounded-xl border border-dashed border-[var(--sage)] bg-[rgba(90,143,106,0.22)]"
              style={{
                top: `${dragGhostStyle.topPercent}%`,
                height: `${dragGhostStyle.heightPercent}%`,
              }}
              aria-hidden
            />
          ) : null}

          {nowLinePercent !== null ? (
            <div
              className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
              style={{ top: `${nowLinePercent}%` }}
              aria-hidden
            >
              <span className="h-2 w-2 rounded-full bg-[var(--sage)]" />
              <span className="h-px flex-1 bg-[var(--sage)]/70" />
            </div>
          ) : null}

          {gridBlocks.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-3 top-[12%] z-[15] flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-black/30 p-3.5">
              <p
                className="m-0 text-[14px] font-medium leading-snug text-[#F1EFE8] text-pretty"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {quietHeading}
              </p>
              <p className="m-0 text-[12.5px] leading-normal text-[#9FB0A6] text-pretty">
                {quietBody}
              </p>
              <button
                type="button"
                disabled={blockBusy}
                onClick={handleQuietCtaClick}
                aria-haspopup="dialog"
                className={`pointer-events-auto inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors disabled:opacity-60 ${
                  trayVisible
                    ? "border border-white/15 bg-white/[0.04] text-[var(--sage)] hover:border-white/30"
                    : "border border-[var(--sage)] bg-[var(--sage)] text-[#0f1c10]"
                }`}
                style={{ fontFamily: "var(--f-sans)" }}
              >
                <Icons.Plus s={14} />
                Plan een moment
              </button>
            </div>
          ) : null}

          {gridBlocks.map((block, index) => {
            const topPx = getBlockTimelineTopPx(block.startTime, HOUR_HEIGHT_PX);
            const heightPx = getBlockTimelineSpanPx(
              block.startTime,
              block.endTime,
              HOUR_HEIGHT_PX,
              TIMELINE_MIN_BLOCK_HEIGHT_PX,
            );
            const compact = isCompactTimelineBlock(
              block.startTime,
              block.endTime,
              HOUR_HEIGHT_PX,
              TIMELINE_MIN_BLOCK_HEIGHT_PX,
            );
            return (
              <div
                key={block.id}
                className="absolute inset-x-1.5 z-10 overflow-hidden sm:inset-x-2"
                style={{
                  top: topPx,
                  height: heightPx,
                  zIndex: 10 + index,
                }}
              >
                <AgendaBlockCard
                  block={block}
                  compact={compact}
                  dragHandleProps={bindBlockDrag(block, () => openDetail(block.id))}
                  onOpenDetail={() => openDetail(block.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {addOpen && helpPreset ? (
        <MeerHulpBridgeSheet
          key={`help-${date}-${helpPreset.domain}`}
          open={addOpen}
          bridge={buildBewegingHelpBridge(model, slot, nutritionLogCompleted)}
          onClose={closeSheet}
          onOpenSchap={() => {
            closeSheet();
            router.push(buildDashboardSchapHref(helpPreset.domain, "producten"));
          }}
        />
      ) : null}

      {addOpen && !helpPreset ? (
        <AgendaAddBlockSheet
          key={
            draftSlot
              ? `tap-${date}-${draftSlot.startTime}-${draftSlot.endTime}`
              : `header-${date}`
          }
          open={addOpen}
          date={date}
          busy={blockBusy}
          initialStartTime={draftSlot?.startTime}
          initialEndTime={draftSlot?.endTime}
          createSurface={draftSlot ? "agenda_timeline_tap" : "agenda_add_sheet"}
          hiddenPlanStep={hiddenPlanStep}
          onRestorePlanStep={onRestorePlanStep}
          onShowAllPlanSteps={onShowAllPlanSteps}
          onClose={closeSheet}
          onSubmit={onCreateBlock}
        />
      ) : null}

      <AgendaBlockDetailSheet
        key={`${date}-${selectedBlockId ?? "none"}`}
        block={selectedBlock}
        model={model}
        date={date}
        prefBusy={prefBusy}
        busy={blockBusy}
        onClose={closeDetail}
        onCompletionChange={onCompletionChange}
        onScheduledTimeChange={onScheduledTimeChange}
        onToggleDone={onToggleBlockDone}
        onPurge={(blockId) => onPurgeBlock(blockId)}
        onRetime={onRetimeBlock}
        onDismissPlanStep={onDismissPlanStep}
        onHideAllPlanSteps={onHideAllPlanSteps}
        onOpenHelpSheet={openHelpSheet}
      />
    </section>
  );
}
