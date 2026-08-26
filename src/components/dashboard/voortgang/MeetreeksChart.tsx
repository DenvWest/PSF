"use client";

import { useState } from "react";
import {
  MEETREEKS_AXIS_GUTTER,
  MEETREEKS_CHART_H,
  MEETREEKS_COL,
  meetreeksDaysAgoLabel,
  meetreeksGridLevels,
  meetreeksLabelAnchors,
  meetreeksLevelToY,
  meetreeksScaleHint,
  meetreeksSourceLabel,
  meetreeksTickLabel,
  shortMeetreeksDate,
} from "@/lib/voortgang-meetreeks-format";
import type { MeetreeksRow } from "@/lib/voortgang-meetreeks";
import type { DomainMeasurement } from "@/types/dashboard";

export function MeetreeksAxisGutter({ row }: { row: MeetreeksRow }) {
  return (
    <svg
      width={MEETREEKS_AXIS_GUTTER}
      height={MEETREEKS_CHART_H}
      viewBox={`0 0 ${MEETREEKS_AXIS_GUTTER} ${MEETREEKS_CHART_H}`}
      aria-hidden
      className="block shrink-0"
    >
      {meetreeksGridLevels(row).map((level) => (
        <text
          key={level}
          x={MEETREEKS_AXIS_GUTTER - 6}
          y={meetreeksLevelToY(row, level) + 3}
          textAnchor="end"
          fontSize={9.5}
          fill="var(--text-subtle)"
        >
          {meetreeksTickLabel(row, level)}
        </text>
      ))}
    </svg>
  );
}

/**
 * Eén meetmoment op de datumas — label bij een ankerpunt, anders een stille
 * tik. Gedeeld door de tabel-voet en de grafiek-as zodat beide surfaces
 * dezelfde uitdunning krijgen.
 */
export function MeetreeksMomentTick({
  moment,
  index,
  activeIndex,
  showLabel,
  onSelect,
}: {
  moment: DomainMeasurement;
  index: number;
  activeIndex: number;
  showLabel: boolean;
  onSelect: (index: number) => void;
}) {
  const active = index === activeIndex;
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-pressed={active}
      aria-label={showLabel ? undefined : moment.dateLabel}
      className="min-h-11 shrink-0 cursor-pointer border-none bg-transparent px-1 py-2 text-center"
      style={{ width: MEETREEKS_COL }}
    >
      <span
        className="block text-[12px] font-medium"
        style={{ color: active ? "var(--text)" : "var(--text-muted)" }}
      >
        {showLabel ? shortMeetreeksDate(moment.dateLabel) : " "}
      </span>
      <span
        aria-hidden
        className="mx-auto mt-1.5 block rounded-full"
        style={{
          width: active ? 8 : showLabel ? 5 : 4,
          height: active ? 8 : showLabel ? 5 : 4,
          background: active ? "var(--sage)" : "var(--panel-border)",
          boxShadow: active ? "0 0 0 4px rgba(154,196,164,0.18)" : undefined,
          opacity: active || showLabel ? 1 : 0.55,
        }}
      />
    </button>
  );
}

export function MeetreeksMomentAxis({
  moments,
  activeIndex,
  onSelect,
}: {
  moments: DomainMeasurement[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const anchors = meetreeksLabelAnchors(moments.length, activeIndex);
  return (
    <div className="flex" style={{ width: moments.length * MEETREEKS_COL }}>
      {moments.map((moment, index) => (
        <MeetreeksMomentTick
          key={moment.id}
          moment={moment}
          index={index}
          activeIndex={activeIndex}
          showLabel={anchors.has(index)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function MeetreeksGrafiek({
  row,
  moments,
  activeIndex,
  color,
}: {
  row: MeetreeksRow;
  moments: DomainMeasurement[];
  activeIndex: number;
  color: string;
}) {
  const width = moments.length * MEETREEKS_COL;
  const x = (index: number) => index * MEETREEKS_COL + MEETREEKS_COL / 2;
  const y = (level: number) => meetreeksLevelToY(row, level);

  const segments: { index: number; level: number }[][] = [];
  let current: { index: number; level: number }[] = [];
  row.cells.forEach((cell, index) => {
    if (cell?.level == null) {
      if (current.length > 0) {
        segments.push(current);
        current = [];
      }
      return;
    }
    current.push({ index, level: cell.level });
  });
  if (current.length > 0) {
    segments.push(current);
  }

  return (
    <svg
      width={width}
      height={MEETREEKS_CHART_H}
      viewBox={`0 0 ${width} ${MEETREEKS_CHART_H}`}
      role="img"
      aria-label={`${row.label} over ${moments.length} meetmomenten, links je laatste meting. ${meetreeksScaleHint(row)}`}
      className="block"
    >
      {meetreeksGridLevels(row).map((level) => (
        <line
          key={level}
          x1={0}
          y1={y(level)}
          x2={width}
          y2={y(level)}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={1}
        />
      ))}

      <line
        x1={x(activeIndex)}
        y1={6}
        x2={x(activeIndex)}
        y2={MEETREEKS_CHART_H - 6}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={1}
        strokeDasharray="2 4"
      />

      {segments
        .filter((segment) => segment.length >= 2)
        .map((segment) => (
          <polyline
            key={`seg-${segment[0].index}`}
            points={segment.map((point) => `${x(point.index)},${y(point.level)}`).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

      {row.cells.map((cell, index) =>
        cell?.level == null ? null : (
          <circle
            key={moments[index].id}
            cx={x(index)}
            cy={y(cell.level)}
            r={index === activeIndex ? 6 : 4}
            fill={index === activeIndex ? color : "var(--panel)"}
            stroke={color}
            strokeWidth={2}
          />
        ),
      )}
    </svg>
  );
}

/**
 * Eén rij uit de meetreeks, onder een ladderfeit. Geen tabel, geen
 * domeinwisselaar — home blijft de matrix.
 */
export function FactMicroReeks({
  row,
  moments,
  color,
}: {
  row: MeetreeksRow;
  moments: DomainMeasurement[];
  color: string;
}) {
  const [momentIndex, setMomentIndex] = useState(0);
  const activeIndex = momentIndex < moments.length ? momentIndex : 0;
  const activeMoment = moments[activeIndex] ?? null;
  const activeCell = row.cells[activeIndex] ?? null;

  return (
    <div className="mt-2">
      <p className="m-0 text-[11.5px] text-[var(--text-subtle)]">
        Links je laatste meting, naar rechts terug in de tijd.
      </p>
      <p className="m-0 mt-1 text-[11.5px] text-[var(--text-subtle)] text-pretty">
        {meetreeksScaleHint(row)}
      </p>
      <div className="mt-2 flex items-start">
        <MeetreeksAxisGutter row={row} />
        <div className="-mr-1 min-w-0 flex-1 overflow-x-auto pr-1">
          <div style={{ width: moments.length * MEETREEKS_COL }}>
            <MeetreeksGrafiek
              row={row}
              moments={moments}
              activeIndex={activeIndex}
              color={color}
            />
            <MeetreeksMomentAxis
              moments={moments}
              activeIndex={activeIndex}
              onSelect={setMomentIndex}
            />
          </div>
        </div>
      </div>
      {activeMoment ? (
        <p className="m-0 mt-2 text-[12.5px] leading-relaxed text-[var(--text-muted)] text-pretty">
          <span className="font-semibold text-[var(--text)]">{activeMoment.dateLabel}</span>
          {" · "}
          {meetreeksSourceLabel(activeMoment.source)}
          {" · "}
          {meetreeksDaysAgoLabel(activeMoment.daysAgo)}
          {" — "}
          {row.label.toLowerCase()}
          {": "}
          <span className="text-[var(--text)]">{activeCell?.answerLabel ?? "niet gemeten"}</span>
          {activeCell?.benchmarkLabel ? ` (${activeCell.benchmarkLabel})` : ""}
        </p>
      ) : null}
    </div>
  );
}
