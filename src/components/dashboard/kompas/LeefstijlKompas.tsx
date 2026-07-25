"use client";

import { useMemo, type CSSProperties } from "react";
import * as Icons from "@/components/app/icons";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import { clarityTag } from "@/lib/clarity";
import { supportsKompasDeepView } from "@/lib/dashboard-url";
import {
  buildKompasDomainRows,
  type KompasDomainRow,
} from "@/lib/kompas-home";
import type { DashboardModel, PillarId } from "@/types/dashboard";

const RING_SIZE = 240;
const RING_CENTER = RING_SIZE / 2;
const RING_STROKE = 9;
const RING_RADII = [92, 76, 60, 44, 28];

type LeefstijlKompasProps = {
  model: DashboardModel;
  onOpenDomain: (domain: PillarId) => void;
  onOpenPriority?: (domain: PillarId) => void;
};

function ringMetrics(score: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const progress = (clamped / 100) * circumference;
  return { circumference, progress };
}

function formatVitalityDelta(delta: number | null): string | null {
  if (delta == null || delta === 0) {
    return null;
  }
  return `${delta > 0 ? "▲" : "▼"} ${delta > 0 ? "+" : ""}${delta} sinds je start`;
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

function KompasRings({
  rows,
  vitality,
  vitalityDelta,
}: {
  rows: KompasDomainRow[];
  vitality: number;
  vitalityDelta: number | null;
}) {
  const deltaLine = formatVitalityDelta(vitalityDelta);

  return (
    <svg
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      className="mx-auto h-[180px] w-[180px] shrink-0 min-[1440px]:h-[220px] min-[1440px]:w-[220px]"
      role="img"
      aria-label={`Leefstijl: ${Math.round(vitality)} van de 100, samengesteld uit slaap, beweging, voeding, stress en verbinding`}
    >
      {rows.map((row, index) => {
        const radius = RING_RADII[index] ?? RING_RADII[RING_RADII.length - 1]!;
        const { circumference, progress } = ringMetrics(row.score, radius);
        const strokeWidth = row.isPriority ? RING_STROKE + 2 : RING_STROKE;

        return (
          <g key={row.id} aria-hidden>
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={radius}
              fill="none"
              stroke={row.color}
              strokeWidth={strokeWidth}
              opacity={0.12}
            />
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={radius}
              fill="none"
              stroke={row.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
            />
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER - radius}
              r={2.5}
              fill="#F1EFE8"
              opacity={0.55}
            />
          </g>
        );
      })}

      <text
        x={RING_CENTER}
        y={RING_CENTER - 8}
        textAnchor="middle"
        fill="#F1EFE8"
        fontSize="40"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        {Math.round(vitality)}
      </text>
      <text
        x={RING_CENTER}
        y={RING_CENTER + 14}
        textAnchor="middle"
        fill="#7E8C82"
        fontSize="8.5"
        letterSpacing="2.2"
      >
        LEEFSTIJL
      </text>
      {deltaLine ? (
        <text
          x={RING_CENTER}
          y={RING_CENTER + 30}
          textAnchor="middle"
          fill="#9FB0A6"
          fontSize="8"
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
}: {
  row: KompasDomainRow;
  onOpenDomain: (domain: PillarId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenDomain(row.id)}
      aria-label={`Open ${row.label}`}
      className={`flex min-h-[48px] w-full cursor-pointer items-center gap-2.5 rounded-xl border bg-transparent px-3 py-2 text-left transition hover:bg-white/[0.03] ${
        row.isPriority ? "border-[color:var(--ac)]/35" : "border-white/8"
      }`}
      style={
        row.isPriority
          ? ({ "--ac": row.color, fontFamily: "var(--f-sans)" } as CSSProperties)
          : { fontFamily: "var(--f-sans)" }
      }
    >
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: row.color }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-serif text-[14px] text-[#F1EFE8]">
          {row.label}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-[#7E8C82]">
          {row.descriptor}
        </span>
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
  );
}

function FocusStrip({
  model,
  onOpenPriority,
}: {
  model: DashboardModel;
  onOpenPriority: (domain: PillarId) => void;
}) {
  const priority = model.priority;
  const hasStappenplan = supportsKompasDeepView(priority.id);
  const linkLabel = hasStappenplan
    ? "Stappenplan"
    : `Open ${priority.label.toLowerCase()}`;

  const handleClick = () => {
    clarityTag("dashboard_kompas_home", `focus_${priority.id}`);
    onOpenPriority(priority.id);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3.5 py-3">
      <div className="min-w-0">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
          Focus deze week
        </p>
        <p
          className="mt-1 m-0 font-serif text-[17px] text-[#F1EFE8]"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {priority.label}
        </p>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[color:var(--ac)]/35 bg-[color:var(--ac)]/10 px-3.5 py-2 text-[13px] font-semibold text-[#CDD7D0]"
        style={
          {
            "--ac": priority.color,
            fontFamily: "var(--f-sans)",
          } as CSSProperties
        }
      >
        {linkLabel}
        <Icons.ArrowRight s={14} />
      </button>
    </div>
  );
}

export default function LeefstijlKompas({
  model,
  onOpenDomain,
  onOpenPriority,
}: LeefstijlKompasProps) {
  const rows = useMemo(() => buildKompasDomainRows(model), [model]);

  const handleOpenDomain = (domain: PillarId) => {
    clarityTag("dashboard_kompas_home", `ring_row_${domain}`);
    onOpenDomain(domain);
  };

  const handleOpenPriority = onOpenPriority ?? onOpenDomain;

  return (
    <CockpitTile eyebrow="Overzicht" className="flex h-full flex-col p-4 sm:p-5">
      <FocusStrip model={model} onOpenPriority={handleOpenPriority} />

      <h2
        className="m-0 font-serif text-[18px] leading-snug text-[#F1EFE8] text-pretty sm:text-[20px]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Je leefstijl in vijf lijnen
      </h2>
      <p className="mt-1 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
        Vijf domeinen, één beeld — score en richting in één oogopslag.
      </p>

      <div className="mt-4 flex flex-1 flex-col items-center gap-4 xl:flex-row xl:items-start">
        <KompasRings
          rows={rows}
          vitality={model.vitality}
          vitalityDelta={model.vitalityDelta}
        />
        <div className="flex w-full min-w-0 flex-col gap-1.5">
          {rows.map((row) => (
            <DomainLineRow key={row.id} row={row} onOpenDomain={handleOpenDomain} />
          ))}
        </div>
      </div>

      {model.vitalityDeltaNote ? (
        <p className="mt-2.5 text-[11px] text-[#7E8C82]">{model.vitalityDeltaNote}</p>
      ) : null}
    </CockpitTile>
  );
}
