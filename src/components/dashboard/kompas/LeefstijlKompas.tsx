"use client";

import { useMemo } from "react";
import * as Icons from "@/components/app/icons";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  buildKompasDomainRows,
  prioritySegmentIndex,
  type KompasDomainRow,
} from "@/lib/kompas-home";
import type { DashboardModel, PillarId } from "@/types/dashboard";

const ROSE_SIZE = 220;
const ROSE_CENTER = ROSE_SIZE / 2;
const ROSE_RADIUS = 84;
const SEGMENT_SPAN = 67;
const SEGMENT_GAP = 2.5;
const LABEL_RADIUS = 104;
const PRIORITY_DOT_RADIUS = 100;

type LeefstijlKompasProps = {
  model: DashboardModel;
  onOpenDomain: (domain: PillarId) => void;
};

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polarToCartesian(cx, cy, radius, startDeg);
  const end = polarToCartesian(cx, cy, radius, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function segmentAngles(index: number): { start: number; end: number; mid: number } {
  const start = index * 72 + SEGMENT_GAP;
  const end = start + SEGMENT_SPAN;
  return { start, end, mid: start + SEGMENT_SPAN / 2 };
}

function formatVitalityDelta(delta: number | null): string | null {
  if (delta == null || delta === 0) {
    return null;
  }
  return `${delta > 0 ? "+" : ""}${delta} sinds je laatste meting`;
}

function DomainSparkline({ trend, color }: { trend: number[]; color: string }) {
  if (trend.length < 2) {
    return (
      <span className="flex h-[18px] w-14 shrink-0 items-center justify-center">
        <span className="h-px w-full border-t border-dashed border-white/20" aria-hidden />
        <span className="sr-only">Nog geen lijn</span>
      </span>
    );
  }

  return (
    <span className="block h-[18px] w-14 shrink-0 opacity-80">
      <Sparkline data={trend} w={56} h={18} color={color} />
    </span>
  );
}

function KompasRose({
  rows,
  vitality,
  vitalityDelta,
}: {
  rows: KompasDomainRow[];
  vitality: number;
  vitalityDelta: number | null;
}) {
  const priorityIndex = prioritySegmentIndex(rows);
  const priorityMid = segmentAngles(priorityIndex).mid;
  const priorityDot = polarToCartesian(
    ROSE_CENTER,
    ROSE_CENTER,
    PRIORITY_DOT_RADIUS,
    priorityMid,
  );
  const deltaLine = formatVitalityDelta(vitalityDelta);

  return (
    <svg
      viewBox={`0 0 ${ROSE_SIZE} ${ROSE_SIZE}`}
      className="mx-auto h-[200px] w-[200px] shrink-0 lg:h-[240px] lg:w-[240px]"
      role="img"
      aria-label={`Leefstijl: ${Math.round(vitality)} van de 100, samengesteld uit slaap, beweging, voeding, stress en verbinding`}
    >
      {rows.map((row, index) => {
        const { start, end } = segmentAngles(index);
        const fillEnd = start + SEGMENT_SPAN * (Math.min(100, Math.max(0, row.score)) / 100);
        return (
          <g key={row.id} aria-hidden>
            <path
              d={describeArc(ROSE_CENTER, ROSE_CENTER, ROSE_RADIUS, start, end)}
              fill="none"
              stroke={row.color}
              strokeWidth={16}
              strokeLinecap="round"
              opacity={0.14}
            />
            <path
              d={describeArc(ROSE_CENTER, ROSE_CENTER, ROSE_RADIUS, start, fillEnd)}
              fill="none"
              stroke={row.color}
              strokeWidth={16}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      <circle
        cx={priorityDot.x}
        cy={priorityDot.y}
        r={3.5}
        fill="#F1EFE8"
        opacity={0.6}
        aria-hidden
      />

      {rows.map((row, index) => {
        const labelPoint = polarToCartesian(
          ROSE_CENTER,
          ROSE_CENTER,
          LABEL_RADIUS,
          segmentAngles(index).mid,
        );
        return (
          <text
            key={`label-${row.id}`}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={row.color}
            fontSize="9"
            fontWeight="600"
            className="hidden sm:inline"
            aria-hidden
          >
            {row.label.slice(0, 3)}
          </text>
        );
      })}

      <text
        x={ROSE_CENTER}
        y={ROSE_CENTER - 6}
        textAnchor="middle"
        fill="#F1EFE8"
        fontSize="42"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        {Math.round(vitality)}
      </text>
      <text
        x={ROSE_CENTER}
        y={ROSE_CENTER + 18}
        textAnchor="middle"
        fill="#7E8C82"
        fontSize="9"
        letterSpacing="2"
      >
        LEEFSTIJL
      </text>
      {deltaLine ? (
        <text
          x={ROSE_CENTER}
          y={ROSE_CENTER + 34}
          textAnchor="middle"
          fill="#9FB0A6"
          fontSize="8.5"
        >
          {deltaLine}
        </text>
      ) : null}
    </svg>
  );
}

function DomainLineRow({
  row,
  onOpenDomain,
  onNextStepClick,
}: {
  row: KompasDomainRow;
  onOpenDomain: (domain: PillarId) => void;
  onNextStepClick: (row: KompasDomainRow) => void;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/15">
      <button
        type="button"
        onClick={() => onOpenDomain(row.id)}
        aria-label={`Open ${row.label}`}
        className="flex min-h-14 w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2.5 text-left transition hover:bg-white/[0.03]"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: row.color }}
        />
        <span className="min-w-0 flex-1 truncate font-serif text-[14px] text-[#F1EFE8]">
          {row.label}
        </span>
        <DomainSparkline trend={row.trend} color={row.color} />
        <span className="shrink-0 text-[13px] tabular-nums text-[#CDD7D0]">
          {row.score}
        </span>
        <span className="w-[36px] shrink-0 text-right">
          <DeltaBadge delta={row.delta} empty={row.delta == null} />
        </span>
        <Icons.ChevronRight s={15} style={{ color: "#7E8C82" }} />
      </button>
      <button
        type="button"
        onClick={() => onNextStepClick(row)}
        className="flex w-full cursor-pointer items-center gap-1.5 border-none border-t border-white/6 bg-transparent px-3 py-2 text-left transition hover:bg-white/[0.03]"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
          Volgende stap
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#9FB0A6]">
          {row.nextStep}
        </span>
        <Icons.ArrowRight s={13} style={{ color: "#7E8C82" }} />
      </button>
    </div>
  );
}

export default function LeefstijlKompas({ model, onOpenDomain }: LeefstijlKompasProps) {
  const rows = useMemo(() => buildKompasDomainRows(model), [model]);

  const handleOpenDomain = (domain: PillarId) => {
    clarityTag("dashboard_kompas_home", `roos_row_${domain}`);
    onOpenDomain(domain);
  };

  const handleNextStepClick = (row: KompasDomainRow) => {
    trackEvent("dashboard_kompas_nextstep_click", {
      domain: row.id,
      step_id: row.stepId,
    });
    clarityTag("dashboard_kompas_home", `nextstep_${row.id}`);
    onOpenDomain(row.id);
  };

  return (
    <CockpitTile eyebrow="Overzicht">
      <h2
        className="m-0 font-serif text-[20px] leading-snug text-[#F1EFE8] text-pretty"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Je leefstijl in vijf lijnen
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        Vijf domeinen, één beeld — score, richting en je volgende stap per lijn.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <KompasRose
          rows={rows}
          vitality={model.vitality}
          vitalityDelta={model.vitalityDelta}
        />
        <div className="flex w-full min-w-0 flex-col gap-2">
          {rows.map((row) => (
            <DomainLineRow
              key={row.id}
              row={row}
              onOpenDomain={handleOpenDomain}
              onNextStepClick={handleNextStepClick}
            />
          ))}
        </div>
      </div>

      {model.vitalityDeltaNote ? (
        <p className="mt-3 text-[11px] text-[#7E8C82]">{model.vitalityDeltaNote}</p>
      ) : null}
    </CockpitTile>
  );
}
