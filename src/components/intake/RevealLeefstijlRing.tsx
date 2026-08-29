"use client";

import { REVEAL_RING_COPY } from "@/lib/results-reveal-copy";
import type { RevealRingRow } from "@/lib/reveal-roadmap";
import { getVitalityBand } from "@/lib/vitality-gauge";

const RING_SIZE = 240;
const RING_CENTER = RING_SIZE / 2;
const RING_STROKE = 9;
const RING_RADII = [104, 87, 70, 53, 36];

type RevealLeefstijlRingProps = {
  rows: RevealRingRow[];
  vitality: number;
};

function ringMetrics(score: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  return { circumference, progress: (clamped / 100) * circumference };
}

export default function RevealLeefstijlRing({ rows, vitality }: RevealLeefstijlRingProps) {
  const band = getVitalityBand(vitality);
  const domainSummary = rows.map((row) => row.label.toLowerCase()).join(", ");

  return (
    <span className="relative block h-[212px] w-[212px] shrink-0 sm:h-[248px] sm:w-[248px] lg:h-[284px] lg:w-[284px]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[10%] rounded-full opacity-70 blur-lg"
        style={{
          background: "radial-gradient(closest-side, rgba(90,143,106,0.5), transparent 72%)",
        }}
      />
      <svg
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="relative h-full w-full"
        role="img"
        aria-label={`Leefstijl: ${Math.round(vitality)} van de 100 (${band.label}), samengesteld uit ${domainSummary}`}
      >
        {rows.map((row, index) => {
          const radius = RING_RADII[index] ?? RING_RADII[RING_RADII.length - 1]!;
          const { circumference, progress } = ringMetrics(row.score, radius);
          const strokeWidth = row.isFocus ? RING_STROKE + 2 : RING_STROKE;

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
          y={RING_CENTER - 5}
          textAnchor="middle"
          fill="#F1EFE8"
          fontSize="34"
          style={{ fontFamily: "var(--f-serif)" }}
        >
          {Math.round(vitality)}
        </text>
        <text
          x={RING_CENTER}
          y={RING_CENTER + 13}
          textAnchor="middle"
          fill="#7E8C82"
          fontSize="9"
          letterSpacing="2.4"
        >
          {REVEAL_RING_COPY.ringCenterLabel}
        </text>
      </svg>
    </span>
  );
}
