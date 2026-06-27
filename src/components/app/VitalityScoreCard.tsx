"use client";

import type { ReactNode } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";
import { computeCheckinRhythm } from "@/lib/checkin-rhythm";
import {
  formatRhythmDays,
  getVitalityScoreBandHint,
  getVitalityScoreBody,
  getVitalityScoreHeading,
  VITALITY_RHYTHM_BEST,
  VITALITY_RHYTHM_CURRENT,
  VITALITY_RHYTHM_EYEBROW,
  VITALITY_SCORE_CTA,
  VITALITY_SCORE_EYEBROW,
} from "@/lib/vitality-score-copy";
import type { CheckLogEntry } from "@/types/dashboard";

type VitalityScoreCardProps = {
  value?: number;
  locked?: boolean;
  delta?: number | null;
  firstName?: string | null;
  bodyLine?: string | null;
  onCta?: () => void;
  ctaHref?: string;
  ctaLabel?: string;
  history?: CheckLogEntry[];
  showRhythm?: boolean;
  footer?: ReactNode;
};

export default function VitalityScoreCard({
  value = 0,
  locked = false,
  delta = null,
  firstName = null,
  bodyLine = null,
  onCta,
  ctaHref,
  ctaLabel = VITALITY_SCORE_CTA,
  history = [],
  showRhythm = true,
  footer,
}: VitalityScoreCardProps) {
  const rhythm = computeCheckinRhythm(history);
  const heading = getVitalityScoreHeading(firstName, locked);
  const body = getVitalityScoreBody(locked, value, bodyLine);
  const bandHint = !locked && !bodyLine ? getVitalityScoreBandHint(value) : null;

  return (
    <article
      aria-label="Jouw vitaalscore"
      className="vitaalscore-card overflow-hidden rounded-[28px] border border-[#e4e0da] bg-gradient-to-b from-[#fefdfb] to-white shadow-[0_16px_48px_rgba(15,28,16,0.10),0_2px_8px_rgba(15,28,16,0.04)]"
    >
      <div className="px-6 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
        <p className="m-0 text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#5A8F6A]">
          {VITALITY_SCORE_EYEBROW}
        </p>

        <div className="mt-1 flex justify-center sm:mt-2">
          <VitalityGauge
            value={value}
            locked={locked}
            delta={delta}
            size={300}
            stroke={18}
            variant="hero"
            theme="light"
            showBandLabel={false}
          />
        </div>

        <div className="mt-2 text-center sm:mt-3">
          <h2
            className="m-0 text-[26px] leading-[1.12] text-[#1c1917] sm:text-[30px]"
            style={{ fontFamily: "var(--f-serif, Georgia, serif)", fontWeight: 400 }}
          >
            {heading}
          </h2>
          <p className="mx-auto mt-3.5 max-w-[340px] text-[15px] font-medium leading-relaxed text-[#44403c] sm:text-[16px]">
            {body}
          </p>
          {bandHint ? (
            <p className="mx-auto mt-2 max-w-[340px] text-[13px] font-semibold leading-snug text-[#5A8F6A]">
              {bandHint}
            </p>
          ) : null}

          {locked && (onCta || ctaHref) ? (
            <div className="mt-6">
              {ctaHref ? (
                <a
                  href={ctaHref}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#5A8F6A] px-8 text-[13px] font-extrabold uppercase tracking-[0.16em] text-white no-underline shadow-[0_6px_20px_rgba(90,143,106,0.38)] transition-all hover:bg-[#4A7F5A] hover:shadow-[0_8px_24px_rgba(90,143,106,0.45)] active:scale-[0.98]"
                >
                  {ctaLabel}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onCta}
                  className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full border-0 bg-[#5A8F6A] px-8 text-[13px] font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_6px_20px_rgba(90,143,106,0.38)] transition-all hover:bg-[#4A7F5A] hover:shadow-[0_8px_24px_rgba(90,143,106,0.45)] active:scale-[0.98]"
                >
                  {ctaLabel}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {showRhythm ? (
        <div className="border-t border-[#ebe7e2] bg-[#faf9f7] px-6 py-5 sm:px-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#78716c]">
              {VITALITY_RHYTHM_EYEBROW}
            </span>
            <span
              className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#e8f5ee] text-[10px] font-extrabold text-[#5A8F6A]"
              aria-hidden
            >
              i
            </span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-[#e4e0da]">
            <div className="px-4 text-center">
              <div
                className="text-[34px] leading-none text-[#1c1917] sm:text-[38px]"
                style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
              >
                {formatRhythmDays(rhythm.currentDays)}
              </div>
              <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                {VITALITY_RHYTHM_CURRENT}
              </div>
            </div>
            <div className="px-4 text-center">
              <div
                className="text-[34px] leading-none text-[#1c1917] sm:text-[38px]"
                style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
              >
                {formatRhythmDays(rhythm.longestDays)}
              </div>
              <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                {VITALITY_RHYTHM_BEST}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {footer ? (
        <div className="border-t border-[#ebe7e2] bg-[#faf9f7] px-6 py-5 sm:px-8">{footer}</div>
      ) : null}
    </article>
  );
}
