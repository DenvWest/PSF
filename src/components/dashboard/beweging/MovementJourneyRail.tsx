"use client";

import { useState, type ComponentType } from "react";
import * as Icons from "@/components/app/icons";
import MovementRouteLadder from "@/components/dashboard/beweging/MovementRouteLadder";
import { buildDomainTrendRow } from "@/lib/leefstijllijn";
import {
  buildJourneyWaypoints,
  type JourneyWaypoint,
  type JourneyWaypointId,
} from "@/lib/movement-journey";
import {
  buildAnchorWhySuffix,
  MOVEMENT_ANCHOR_OPTIONS,
  type MovementPrefs,
} from "@/lib/movement-prefs";
import type { DashboardModel } from "@/types/dashboard";

type MovementJourneyRailProps = {
  model: DashboardModel;
  movementPrefs: MovementPrefs;
  onChangeStartPattern?: () => void;
  onOpenPlan?: () => void;
};

const WAYPOINT_ICONS: Record<
  JourneyWaypointId,
  ComponentType<{ s?: number }>
> = {
  begin: Icons.Footprints,
  waarom: Icons.Heart,
  doel: Icons.Target,
  vandaag: Icons.Activity,
  groei: Icons.TrendUp,
  future: Icons.Spark,
};

function waypointCircleClass(state: JourneyWaypoint["state"]): string {
  if (state === "current") {
    return "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--ac)] text-[#0f1c10] shadow-[0_0_12px_rgba(90,143,106,0.35)] lg:h-7 lg:w-7";
  }
  if (state === "done") {
    return "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--ac)]/50 text-[color:var(--ac)] lg:h-7 lg:w-7";
  }
  return "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#7E8C82] lg:h-7 lg:w-7";
}

function waypointLabelClass(state: JourneyWaypoint["state"]): string {
  if (state === "current") {
    return "font-serif text-[15px] leading-snug text-[#F1EFE8] text-pretty";
  }
  if (state === "done") {
    return "font-serif text-[14px] leading-snug text-[color:var(--ac)]/80 text-pretty";
  }
  return "font-serif text-[14px] leading-snug text-[#7E8C82] text-pretty";
}

function needsAnchorAction(
  id: JourneyWaypointId,
  state: JourneyWaypoint["state"],
): boolean {
  return (
    (id === "waarom" || id === "doel" || id === "future") &&
    (state === "todo" || state === "locked")
  );
}

function WaypointButton({
  waypoint,
  onToggle,
  layout,
  isOpen,
  showConnectorLeft,
  showConnectorRight,
  connectorLeftActive,
  connectorRightActive,
}: {
  waypoint: JourneyWaypoint;
  onToggle: (id: JourneyWaypointId) => void;
  layout: "vertical" | "horizontal";
  isOpen: boolean;
  showConnectorLeft?: boolean;
  showConnectorRight?: boolean;
  connectorLeftActive?: boolean;
  connectorRightActive?: boolean;
}) {
  const Icon = WAYPOINT_ICONS[waypoint.id];
  const isCurrent = waypoint.state === "current";

  if (layout === "vertical") {
    return (
      <li
        className={
          isCurrent
            ? "rounded-xl border border-[color:var(--ac)]/50 bg-[color:var(--ac)]/10 px-3.5 py-3"
            : "rounded-xl border border-white/[0.06] px-3.5 py-3"
        }
      >
        <button
          type="button"
          onClick={() => onToggle(waypoint.id)}
          className="flex w-full cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left"
          aria-expanded={isOpen}
        >
          <span className={waypointCircleClass(waypoint.state)} aria-hidden>
            <Icon s={14} />
          </span>
          <div className="min-w-0 flex-1">
            <p className={waypointLabelClass(waypoint.state)}>{waypoint.label}</p>
            {isCurrent ? (
              <span className="mt-1 inline-block rounded-full bg-[color:var(--ac)]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--ac)]">
                Nu
              </span>
            ) : null}
          </div>
        </button>
      </li>
    );
  }

  return (
    <li className="flex-1">
      <button
        type="button"
        onClick={() => onToggle(waypoint.id)}
        className="w-full cursor-pointer border-none bg-transparent p-0 text-center"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <span
            aria-hidden
            className={
              !showConnectorLeft
                ? "h-px flex-1 bg-transparent"
                : connectorLeftActive
                  ? "h-px flex-1 bg-[color:var(--ac)]/50"
                  : "h-px flex-1 bg-white/15"
            }
          />
          <span className={waypointCircleClass(waypoint.state)} aria-hidden>
            <Icon s={14} />
          </span>
          <span
            aria-hidden
            className={
              !showConnectorRight
                ? "h-px flex-1 bg-transparent"
                : connectorRightActive
                  ? "h-px flex-1 bg-[color:var(--ac)]/50"
                  : "h-px flex-1 bg-white/15"
            }
          />
        </div>
        <div className="mt-2 px-1">
          <p className={waypointLabelClass(waypoint.state)}>{waypoint.label}</p>
          {isCurrent ? (
            <span className="mt-1.5 inline-block rounded-full bg-[color:var(--ac)]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--ac)]">
              Nu
            </span>
          ) : null}
        </div>
      </button>
    </li>
  );
}

export default function MovementJourneyRail({
  model,
  movementPrefs,
  onChangeStartPattern,
  onOpenPlan,
}: MovementJourneyRailProps) {
  const [openId, setOpenId] = useState<JourneyWaypointId | null>(null);

  const trendRow = buildDomainTrendRow(model, "beweging");
  const hasTrend = trendRow.trend.length >= 2;
  const anchorOption = movementPrefs.anchor
    ? MOVEMENT_ANCHOR_OPTIONS.find((option) => option.id === movementPrefs.anchor)
    : null;
  const anchorWhy = buildAnchorWhySuffix(movementPrefs.anchor);

  const waypoints = buildJourneyWaypoints({
    baselineScore: trendRow.baselineScore,
    currentScore: trendRow.currentScore,
    hasTrend,
    anchorLabel: anchorOption?.label ?? null,
    anchorWhy,
    activeHabitTitle: model.activeHabit?.title ?? null,
    activeHabitDetail: model.activeHabit?.detail ?? null,
  });

  const currentIndex = waypoints.findIndex((wp) => wp.state === "current");
  const lastIndex = waypoints.length - 1;
  const openWaypoint = openId
    ? waypoints.find((wp) => wp.id === openId) ?? null
    : null;

  function toggleWaypoint(id: JourneyWaypointId) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <section
      aria-label="Jouw route"
      className="rounded-2xl border border-white/10 bg-black/20 p-4"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
        Jouw route
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty lg:hidden">
        Je positie volgt uit je acties, planfase &amp; hermeting
      </p>

      <ol className="mt-4 flex flex-col gap-2 lg:hidden">
        {waypoints.map((waypoint) => (
          <WaypointButton
            key={waypoint.id}
            waypoint={waypoint}
            onToggle={toggleWaypoint}
            layout="vertical"
            isOpen={openId === waypoint.id}
          />
        ))}
      </ol>

      <ol className="mt-3 hidden lg:flex lg:items-start">
        {waypoints.map((waypoint, index) => {
          const leftReached = currentIndex > -1 && index <= currentIndex;
          const rightReached = currentIndex > -1 && index < currentIndex;
          return (
            <WaypointButton
              key={waypoint.id}
              waypoint={waypoint}
              onToggle={toggleWaypoint}
              layout="horizontal"
              isOpen={openId === waypoint.id}
              showConnectorLeft={index > 0}
              showConnectorRight={index < lastIndex}
              connectorLeftActive={leftReached}
              connectorRightActive={rightReached}
            />
          );
        })}
      </ol>

      {openWaypoint ? (
        <div className="mt-4 rounded-xl border border-white/[0.06] px-3.5 py-3.5">
          <p className="font-serif text-[16px] leading-snug text-[#F1EFE8] text-pretty">
            {openWaypoint.title}
          </p>
          {openWaypoint.body ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
              {openWaypoint.body}
            </p>
          ) : null}
          {onChangeStartPattern &&
          needsAnchorAction(openWaypoint.id, openWaypoint.state) ? (
            <button
              type="button"
              onClick={onChangeStartPattern}
              className="mt-3 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[13px] font-semibold text-[color:var(--ac)]"
            >
              Kies je waarom <Icons.ArrowRight s={14} />
            </button>
          ) : null}
          {openWaypoint.id === "vandaag" ? (
            <div className="mt-4">
              <MovementRouteLadder
                model={model}
                startPattern={movementPrefs.startPattern}
                onChangeStartPattern={onChangeStartPattern}
                onOpenPlan={onOpenPlan}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
