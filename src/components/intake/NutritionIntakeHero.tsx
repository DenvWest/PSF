"use client";

import { nutritionScoreArcColor } from "@/lib/nutrition-display";
import {
  getNextVitalityBand,
  getVitalityBand,
  VITALITY_BANDS,
  VITALITY_SCORE_MAX,
} from "@/lib/vitality-gauge";

const RING_START = 135;
const RING_SWEEP = 270;
const RING_SIZE = 200;
const RING_STROKE = 12;

type NutritionIntakeHeroProps = {
  score: number;
};

function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

function NutritionScoreRing({ score }: { score: number }) {
  const safeScore = Math.min(100, Math.max(0, Number.isFinite(score) ? score : 0));
  const band = getVitalityBand(safeScore);
  const arcColor = nutritionScoreArcColor(safeScore);
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  const r = (RING_SIZE - RING_STROKE) / 2 - 4;
  const progressEnd = RING_START + (RING_SWEEP * safeScore) / 100;

  return (
    <div className="relative block h-[200px] w-[200px] shrink-0 sm:h-[248px] sm:w-[248px]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[10%] rounded-full opacity-70 blur-lg"
        style={{
          background: "radial-gradient(closest-side, rgba(90,143,106,0.5), transparent 72%)",
        }}
      />
      <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="relative h-full w-full" aria-hidden>
        <path
          d={arcPath(cx, cy, r, RING_START, RING_START + RING_SWEEP)}
          fill="none"
          stroke="rgba(241, 239, 232, 0.14)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
        />
        {safeScore > 0 ? (
          <path
            d={arcPath(cx, cy, r, RING_START, progressEnd)}
            fill="none"
            stroke={arcColor}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
          />
        ) : null}
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        aria-label={`Voedingsscore ${Math.round(safeScore)} van 100, ${band.label}`}
      >
        <span
          className="font-serif text-5xl leading-none text-[#F1EFE8]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(safeScore)}
        </span>
        <span className="mt-1 text-xs font-semibold tracking-wide text-[#7E8C82]">/100</span>
        <span className="mt-2 text-sm font-semibold" style={{ color: arcColor }}>
          {band.label}
        </span>
      </div>
    </div>
  );
}

function NutritionScoreReadout({ score }: { score: number }) {
  const safeScore = Math.round(
    Math.min(100, Math.max(0, Number.isFinite(score) ? score : 0)),
  );
  const band = getVitalityBand(safeScore);
  const nextBand = getNextVitalityBand(safeScore);

  const segments = VITALITY_BANDS.map((entry, index) => {
    const next = VITALITY_BANDS[index + 1];
    return {
      id: entry.id,
      color: entry.color,
      width: ((next ? next.min : VITALITY_SCORE_MAX) - entry.min) / VITALITY_SCORE_MAX,
    };
  });

  return (
    <div className="grid w-full gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
          Voedingsscore
        </span>
        <span
          className="text-[21px] leading-none tabular-nums text-[#F1EFE8]"
          style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
        >
          {safeScore}
          <span className="text-[12.5px] text-[#7E8C82]">/{VITALITY_SCORE_MAX}</span>
        </span>
      </div>

      <div
        role="img"
        aria-label={`Je voedingsscore ${safeScore} van de 100 op de schaal van vijf banden; nu: ${band.label}.`}
        className="relative h-4 w-full"
      >
        <span className="absolute inset-x-0 top-1/2 flex h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
          {segments.map((segment) => (
            <span
              key={segment.id}
              className="block h-full"
              style={{
                width: `${segment.width * 100}%`,
                background: segment.id === band.id ? segment.color : `${segment.color}33`,
              }}
            />
          ))}
        </span>
        <span
          aria-hidden
          className="absolute top-0 block h-4 w-[2px] -translate-x-1/2 rounded-full bg-[#F1EFE8]"
          style={{ left: `${Math.min(100, Math.max(0, safeScore))}%` }}
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold"
          style={{ color: band.color }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: band.color }}
          />
          {band.label}
        </span>
        <span className="text-[11.5px] text-[#7E8C82]">
          {nextBand
            ? `Volgende band: ${nextBand.label} vanaf ${nextBand.min}`
            : "Hoogste band bereikt — hier houd je vast"}
        </span>
      </div>

      <p className="m-0 text-[11.5px] leading-relaxed text-[#7E8C82]">
        Frequentie t.o.v. vuistregel — geen grammen of kcal
      </p>
    </div>
  );
}

export default function NutritionIntakeHero({ score }: NutritionIntakeHeroProps) {
  return (
    <section
      aria-label="Voedingsinname op frequentie"
      className="grid w-full content-start justify-items-center gap-5 text-center md:justify-items-start md:text-left"
    >
      <NutritionScoreRing score={score} />
      <NutritionScoreReadout score={score} />
    </section>
  );
}
