"use client";

import { useEffect, useMemo, useState } from "react";
import MovementDoorway from "@/components/dashboard/beweging/MovementDoorway";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { isPlanStepHidden, resolveActionKey } from "@/lib/day-model";
import { buildDomainTrendRow } from "@/lib/leefstijllijn";
import {
  buildMovementCapabilityStatement,
  buildMovementGoalProgress,
} from "@/lib/movement-capability";
import {
  buildJourneyWaypoints,
  type JourneyWaypoint,
} from "@/lib/movement-journey";
import {
  buildAnchorWhySuffix,
  MOVEMENT_ANCHOR_OPTIONS,
  resolvePatternTrainingStepId,
  type MovementPrefs,
} from "@/lib/movement-prefs";
import { inferCompletedChoice, resolveTodayChoiceOptions } from "@/lib/movement-today-choices";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

type MovementJourneyRailProps = {
  model: DashboardModel;
  slot: WeekDaySlot | null;
  movementPrefs: MovementPrefs;
  remeasureDays?: number | null;
  onOpenPlan?: () => void;
};

function waypointShellClass(state: JourneyWaypoint["state"]): string {
  if (state === "current") {
    return "rounded-xl border border-[#79B98C]/40 bg-[#5A8F6A]/10 px-3.5 py-3";
  }
  if (state === "pain") {
    return "rounded-xl border border-[#D89A6C]/30 bg-[#D89A6C]/8 px-3.5 py-3";
  }
  return "rounded-xl border border-white/10 bg-black/20 px-3.5 py-3";
}

function pinClass(state: JourneyWaypoint["state"]): string {
  const base = "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full";
  if (state === "current") {
    return `${base} bg-[color:var(--ac)] shadow-[0_0_0_3px_rgba(90,143,106,0.22)]`;
  }
  if (state === "done") {
    return `${base} bg-[#9FB0A6] opacity-60`;
  }
  if (state === "pain") {
    return `${base} border border-[#D89A6C] bg-transparent`;
  }
  return `${base} border border-white/20 bg-transparent`;
}

function WaypointRow({ waypoint }: { waypoint: JourneyWaypoint }) {
  return (
    <li className={waypointShellClass(waypoint.state)}>
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <span className={pinClass(waypoint.state)} aria-hidden />
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-[#F1EFE8]">
            {waypoint.label}{" "}
            <span className="font-mono text-[8.5px] font-normal uppercase tracking-[0.05em] text-[#7E8C82]">
              {waypoint.sourceLabel}
            </span>
          </p>
          <p className="mt-1 max-w-[68ch] text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            {waypoint.body}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function MovementJourneyRail({
  model,
  slot,
  movementPrefs,
  remeasureDays = null,
  onOpenPlan,
}: MovementJourneyRailProps) {
  const [todayOverride, setTodayOverride] = useState<string | null>(null);
  const defaultTodayBody = "Nog niets gekozen voor vandaag.";
  const todayBody = todayOverride ?? defaultTodayBody;

  const trendRow = buildDomainTrendRow(model, "beweging");
  const anchorOption = movementPrefs.anchor
    ? MOVEMENT_ANCHOR_OPTIONS.find((option) => option.id === movementPrefs.anchor)
    : null;

  const activeOwnStep = Boolean(
    slot && slot.isToday && slot.domain === "beweging" && !isPlanStepHidden(model, slot),
  );

  const planPhaseHorizon = useMemo(() => {
    const phaseId = model.movementPlanProgress?.currentPhaseId;
    const phase = movementPlanTemplate.phases.find((entry) => entry.id === phaseId);
    if (!phase) {
      return "week 2–4";
    }
    if (phase.horizon === "deze-week") {
      return "deze week";
    }
    if (phase.horizon === "week-2-4") {
      return "week 2–4";
    }
    return "week 4–12";
  }, [model.movementPlanProgress?.currentPhaseId]);

  useEffect(() => {
    if (!activeOwnStep || !slot) {
      return;
    }

    const dayStepId = resolveActionKey(model, slot);
    const trainingStepId = resolvePatternTrainingStepId(
      model.domainScores,
      model.answers ?? {},
      movementPrefs.startPattern,
      dayStepId,
      Object.fromEntries(
        Object.entries(model.movementPlanProgress?.steps ?? {}).map(([id, entry]) => [
          id,
          { state: entry.state },
        ]),
      ),
    );
    const options = resolveTodayChoiceOptions(trainingStepId, movementPrefs.startPattern);
    if (options.length === 0) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/daily-log?domain=beweging", {
          credentials: "include",
        });
        if (!response.ok || cancelled) {
          return;
        }
        const state = (await response.json()) as { keys: string[] };
        const completed = inferCompletedChoice(state.keys, options);
        if (cancelled) {
          return;
        }
        if (!completed) {
          setTodayOverride(null);
          return;
        }
        const option = options.find((entry) => entry.kind === completed);
        const done = option ? state.keys.includes(option.stepId) : false;
        setTodayOverride(
          `${done ? "Gedaan: " : "Gekozen: "}${option?.label.toLowerCase() ?? completed}${
            option ? ` — ${option.title}` : ""
          }`,
        );
      } catch {
        if (!cancelled) {
          setTodayOverride(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeOwnStep, model, movementPrefs.startPattern, slot]);

  const waypoints = buildJourneyWaypoints({
    baselineScore: trendRow.baselineScore,
    currentScore: trendRow.currentScore,
    hasTrend: trendRow.trend.length >= 2,
    anchorLabel: anchorOption?.label ?? null,
    anchorWhy: buildAnchorWhySuffix(movementPrefs.anchor),
    capabilityStatement: buildMovementCapabilityStatement({
      anchorLabel: anchorOption?.label ?? null,
      movStr: model.answers?.MOV_STR,
    }),
    activeHabitTitle: "Vandaag",
    activeHabitDetail: todayBody,
    goalProgress: buildMovementGoalProgress({
      baselineScore: trendRow.baselineScore,
      currentScore: trendRow.currentScore,
      remeasureDays,
      anchorLabel: anchorOption?.label ?? null,
    }),
  });

  return (
    <section
      aria-label="Jouw route"
      className="rounded-2xl border border-white/10 bg-black/20 p-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Jouw route
        </p>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.09em] text-[#7E8C82]">
          {waypoints.length} waypoints
        </span>
      </div>

      <ol className="mt-4 flex flex-col gap-2">
        {waypoints.map((waypoint) => (
          <WaypointRow key={waypoint.id} waypoint={waypoint} />
        ))}
      </ol>

      {onOpenPlan ? (
        <MovementDoorway onClick={onOpenPlan} className="mt-3">
          <>
            Bekijk je volledige stappenplan —{" "}
            <strong className="font-semibold text-[#79B98C]">{planPhaseHorizon}</strong>
          </>
        </MovementDoorway>
      ) : null}
    </section>
  );
}
