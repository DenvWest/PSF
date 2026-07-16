"use client";

import type { DomainScoreKey } from "@/lib/intake-engine";

export type DeltaRadarProps = {
  baseline: Record<DomainScoreKey, number>;
  current: Record<DomainScoreKey, number>;
  daysSinceBaseline?: number;
  methodologyChanged?: boolean;
};

const DOMAIN_LABELS: Record<DomainScoreKey, string> = {
  sleep_score: "Slaap",
  energy_score: "Energie",
  stress_score: "Stress",
  nutrition_score: "Voeding",
  movement_score: "Beweging",
  recovery_score: "Herstel",
  connection_score: "Verbinding",
};

const DOMAIN_KEYS: DomainScoreKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
  "connection_score",
];

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function buildPath(
  scores: Record<DomainScoreKey, number>,
  cx: number,
  cy: number,
  maxR: number,
  maxScore: number,
): string {
  const n = DOMAIN_KEYS.length;
  return DOMAIN_KEYS.map((key, i) => {
    const r = (scores[key] / maxScore) * maxR;
    const [x, y] = polarToCartesian(cx, cy, r, (360 / n) * i);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  })
    .concat(["Z"])
    .join(" ");
}

export function DeltaRadar({
  baseline,
  current,
  daysSinceBaseline,
  methodologyChanged = false,
}: DeltaRadarProps) {
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const MAX_R = 80;
  const MAX_SCORE = 100;
  const n = DOMAIN_KEYS.length;

  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[240px]"
        aria-label="Spinnenwebgrafiek: baseline versus huidige scores per domein"
        role="img"
      >
        {/* Gridrings */}
        {gridLevels.map((level) => {
          const r = (level / MAX_SCORE) * MAX_R;
          const points = DOMAIN_KEYS.map((_, i) => {
            const [x, y] = polarToCartesian(CX, CY, r, (360 / n) * i);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Assen */}
        {DOMAIN_KEYS.map((_, i) => {
          const [x, y] = polarToCartesian(CX, CY, MAX_R, (360 / n) * i);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x.toFixed(1)}
              y2={y.toFixed(1)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Baseline vlak */}
        <path
          d={buildPath(baseline, CX, CY, MAX_R, MAX_SCORE)}
          fill="#cbd5e1"
          fillOpacity="0.4"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        {/* Huidig vlak */}
        <path
          d={buildPath(current, CX, CY, MAX_R, MAX_SCORE)}
          fill="#10b981"
          fillOpacity="0.25"
          stroke="#059669"
          strokeWidth="1.5"
        />

        {/* Labels */}
        {DOMAIN_KEYS.map((key, i) => {
          const [x, y] = polarToCartesian(CX, CY, MAX_R + 18, (360 / n) * i);
          return (
            <text
              key={key}
              x={x.toFixed(1)}
              y={y.toFixed(1)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-600 text-[9px]"
              style={{ fontSize: 9 }}
            >
              {DOMAIN_LABELS[key]}
            </text>
          );
        })}
      </svg>

      {methodologyChanged ? (
        <p className="max-w-xs text-center text-xs text-slate-500">
          Methodiek gewijzigd sinds je baseline — je domein- en vitaliteitsscores zijn niet
          1-op-1 vergelijkbaar.
        </p>
      ) : null}

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-slate-300 opacity-70" />
          Dag 0
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500 opacity-50" />
          {daysSinceBaseline != null ? `Dag ${daysSinceBaseline}` : "Nu"}
        </span>
      </div>
    </div>
  );
}
