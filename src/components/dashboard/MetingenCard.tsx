"use client";

import { computeCheckinRhythm } from "@/lib/checkin-rhythm";
import {
  countVitalityFacetsOnPeil,
  VITALITY_FACET_COUNT,
} from "@/lib/vitality-gauge";
import {
  formatRhythmDays,
  METINGEN_DOMAINS_HINT,
  METINGEN_DOMAINS_LABEL,
  METINGEN_EYEBROW,
  METINGEN_RHYTHM_HINT,
  METINGEN_RHYTHM_LABEL,
} from "@/lib/vitality-score-copy";
import type { CheckLogEntry, CheckScores } from "@/types/dashboard";

type MetingenCardProps = {
  scores: CheckScores;
  history?: CheckLogEntry[];
  tone?: "light" | "dark";
};

export default function MetingenCard({
  scores,
  history = [],
  tone = "light",
}: MetingenCardProps) {
  const dark = tone === "dark";
  const facetsOnPeil = countVitalityFacetsOnPeil(scores);
  const rhythm = computeCheckinRhythm(history);

  return (
    <article
      aria-label="Metingen"
      className={`overflow-hidden rounded-[20px] border ${
        dark
          ? "border-white/10 bg-gradient-to-b from-[#19271d] to-[#0f1b12] shadow-[0_22px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "border-[#e4e0da] bg-white shadow-[0_16px_48px_rgba(15,28,16,0.10),0_2px_8px_rgba(15,28,16,0.04)]"
      }`}
    >
      <div className="px-6 py-5 sm:px-8">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span
            className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${
              dark ? "text-white/55" : "text-[#78716c]"
            }`}
          >
            {METINGEN_EYEBROW}
          </span>
          <span
            className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-extrabold ${
              dark ? "bg-[#7FB28E]/15 text-[#9BC9A8]" : "bg-[#e8f5ee] text-[#5A8F6A]"
            }`}
            title={METINGEN_DOMAINS_HINT}
            aria-label={METINGEN_DOMAINS_HINT}
          >
            i
          </span>
        </div>
        <div className={`grid grid-cols-2 divide-x ${dark ? "divide-white/10" : "divide-[#e4e0da]"}`}>
          <div className="px-4 text-center">
            <div
              className={`text-[34px] leading-none sm:text-[38px] ${dark ? "text-white" : "text-[#1c1917]"}`}
              style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
            >
              {facetsOnPeil}/{VITALITY_FACET_COUNT}
            </div>
            <div
              className={`mt-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${
                dark ? "text-white/55" : "text-[#78716c]"
              }`}
            >
              {METINGEN_DOMAINS_LABEL}
            </div>
          </div>
          <div className="px-4 text-center">
            <div
              className={`text-[34px] leading-none sm:text-[38px] ${dark ? "text-white" : "text-[#1c1917]"}`}
              style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
            >
              {formatRhythmDays(rhythm.currentDays)}
            </div>
            <div
              className={`mt-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${
                dark ? "text-white/55" : "text-[#78716c]"
              }`}
              title={METINGEN_RHYTHM_HINT}
            >
              {METINGEN_RHYTHM_LABEL}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
