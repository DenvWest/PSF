"use client";

import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { NUTRITION_BAND_SHORT } from "@/lib/nutrition-band-labels";
import {
  bandToBarColor,
  bandToFillPercent,
  nutritionScoreArcColor,
  nutritionScoreHeadline,
} from "@/lib/nutrition-display";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import { getVitalityBand } from "@/lib/vitality-gauge";

const RING_START = 135;
const RING_SWEEP = 270;
const RING_SIZE = 200;
const RING_STROKE = 12;

type NutritionIntakeHeroProps = {
  score: number;
  estimate: IntakeEstimate[];
  statements: string[];
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
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} aria-hidden>
          <path
            d={arcPath(cx, cy, r, RING_START, RING_START + RING_SWEEP)}
            fill="none"
            stroke="#ebe7e2"
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
            className="font-serif text-5xl leading-none text-[#1c1917]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {Math.round(safeScore)}
          </span>
          <span className="mt-1 text-xs font-semibold tracking-wide text-[#78716c]">
            /100
          </span>
          <span
            className="mt-2 text-sm font-semibold"
            style={{ color: arcColor }}
          >
            {band.label}
          </span>
        </div>
      </div>
      <p className="mt-3 max-w-xs text-center text-sm font-medium text-[#1c1917]">
        {nutritionScoreHeadline(safeScore)}
      </p>
      <p className="mt-1 text-center text-xs text-[#78716c]">
        Op basis van hoe vaak je eet
      </p>
    </div>
  );
}

type NutrientIntakeCardProps = {
  item: IntakeEstimate;
  hint: string;
  emphasized: boolean;
};

function NutrientIntakeCard({ item, hint, emphasized }: NutrientIntakeCardProps) {
  const ref = nutrientReferences[item.nutrient];
  const fill = bandToFillPercent(item.band);
  const barColor = bandToBarColor(item.band);

  return (
    <article
      className={`flex min-h-[88px] flex-col rounded-[14px] border bg-white px-3 py-3 ${
        emphasized
          ? "col-span-2 border-[#C8956C]/45 sm:col-span-1"
          : "border-[#ebe7e2]"
      }`}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-[#1c1917]">{ref.label}</span>
        <span
          className="shrink-0 text-xs font-semibold"
          style={{ color: barColor }}
        >
          {NUTRITION_BAND_SHORT[item.band]}
        </span>
      </div>
      <p className="mb-2 line-clamp-2 text-[11px] leading-snug text-[#78716c]">
        {hint || item.referenceLabel}
      </p>
      <div
        className="mt-auto h-1.5 overflow-hidden rounded-full bg-[#f5f3ef]"
        role="presentation"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${fill}%`, backgroundColor: barColor }}
        />
      </div>
    </article>
  );
}

export default function NutritionIntakeHero({
  score,
  estimate,
}: NutritionIntakeHeroProps) {
  return (
    <section aria-label="Voedingsinname op frequentie" className="mb-8">
      <NutritionScoreRing score={score} />

      <p className="mb-4 mt-6 text-center text-xs text-[#78716c]">
        Frequentie t.o.v. vuistregel — geen grammen of kcal
      </p>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        aria-label="Inname per nutriënt"
      >
        {estimate.map((item) => (
          <NutrientIntakeCard
            key={item.nutrient}
            item={item}
            hint={item.referenceLabel}
            emphasized={item.nutrient === "protein" && item.band === "below"}
          />
        ))}
      </div>
    </section>
  );
}
