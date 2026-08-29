"use client";

import { REVEAL_RING_COPY } from "@/lib/results-reveal-copy";
import {
  getNextVitalityBand,
  getVitalityBand,
  VITALITY_BANDS,
  VITALITY_SCORE_MAX,
} from "@/lib/vitality-gauge";

type RevealScoreReadoutProps = {
  vitality: number;
};

/**
 * De uitlezing onder de ring: het getal, waar het op de gepubliceerde
 * bandenschaal valt, en welke band erboven ligt.
 *
 * Tot 29 augustus stond hier een losse pil ("Uit balans") met het getal
 * ernaast. Die zei wél het oordeel, maar niet waarop het rust: 29 en "Uit
 * balans" waren twee losse feiten zonder schaal ertussen. De strip laat de
 * vijf banden op ware breedte zien met een merkteken op je score — dezelfde
 * schaal als de dashboard-gauge, dus geen tweede waarheid.
 *
 * De volgende band is een drempel, geen belofte: we noemen waar hij begint,
 * niet wanneer je er bent.
 */
export default function RevealScoreReadout({ vitality }: RevealScoreReadoutProps) {
  const score = Math.round(vitality);
  const band = getVitalityBand(vitality);
  const nextBand = getNextVitalityBand(vitality);

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
          {REVEAL_RING_COPY.scoreLabel}
        </span>
        <span
          className="text-[21px] leading-none tabular-nums text-[#F1EFE8]"
          style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
        >
          {score}
          <span className="text-[12.5px] text-[#7E8C82]">/{VITALITY_SCORE_MAX}</span>
        </span>
      </div>

      <div
        role="img"
        aria-label={REVEAL_RING_COPY.scaleLabel(score, band.label)}
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
          style={{ left: `${Math.min(100, Math.max(0, score))}%` }}
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
            ? REVEAL_RING_COPY.nextBandLine(nextBand.label, nextBand.min)
            : REVEAL_RING_COPY.topBandLine}
        </span>
      </div>
    </div>
  );
}
