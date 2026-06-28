"use client";

import type { CSSProperties, ReactNode } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";
import { computeCheckinRhythm } from "@/lib/checkin-rhythm";
import { getVitalityBand } from "@/lib/vitality-gauge";
import {
  formatRhythmDays,
  getVitalityScoreBandHint,
  getVitalityScoreBody,
  getVitalityScoreHeading,
  VITALITY_RHYTHM_BEST,
  VITALITY_RHYTHM_CURRENT,
  VITALITY_RHYTHM_EYEBROW,
  VITALITY_SCORE_CTA,
  VITALITY_INSIGHTS_CTA,
} from "@/lib/vitality-score-copy";
import type { CheckLogEntry } from "@/types/dashboard";

type VitalityScoreCardProps = {
  value?: number;
  locked?: boolean;
  delta?: number | null;
  firstName?: string | null;
  headingLine?: string | null;
  bodyLine?: string | null;
  onCta?: () => void;
  onInsightsClick?: () => void;
  ctaHref?: string;
  ctaLabel?: string;
  history?: CheckLogEntry[];
  showRhythm?: boolean;
  footer?: ReactNode;
  tone?: "light" | "dark";
  layoutVariant?: "default" | "reveal-premium";
  revealBadge?: string;
  revealMeta?: string;
  revealEyebrow?: string;
  revealSignalLabel?: string;
};

export default function VitalityScoreCard({
  value = 0,
  locked = false,
  delta = null,
  firstName = null,
  headingLine = null,
  bodyLine = null,
  onCta,
  onInsightsClick,
  ctaHref,
  ctaLabel = VITALITY_SCORE_CTA,
  history = [],
  showRhythm = true,
  footer,
  tone = "light",
  layoutVariant = "default",
  revealBadge,
  revealMeta,
  revealEyebrow,
  revealSignalLabel,
}: VitalityScoreCardProps) {
  const dark = tone === "dark";
  const rhythm = computeCheckinRhythm(history);
  const heading = headingLine?.trim() || getVitalityScoreHeading(firstName, locked);
  const body = getVitalityScoreBody(locked, value, bodyLine);
  const bandHint = !locked && !bodyLine ? getVitalityScoreBandHint(value) : null;
  const band = getVitalityBand(value);

  if (layoutVariant === "reveal-premium") {
    return (
      <article
        aria-label="Leefstijlscore"
        className="reveal-vitality-premium reveal-premium-panel"
      >
        <div className="reveal-vitality-premium__inner reveal-premium-panel__inner">
          <div className="reveal-premium-panel__top">
            {revealBadge ? (
              <span className="reveal-premium-panel__badge">{revealBadge}</span>
            ) : null}
            {revealMeta ? (
              <span className="reveal-premium-panel__meta">{revealMeta}</span>
            ) : null}
          </div>

          <div className="reveal-vitality-premium__instrument">
            <div className="reveal-vitality-premium__instrument-grid" aria-hidden />
            <div className="reveal-vitality-premium__instrument-ring" aria-hidden />
            <div className="reveal-vitality-premium__gauge">
              <VitalityGauge
                value={value}
                locked={locked}
                delta={delta}
                size={300}
                stroke={18}
                variant="hero"
                theme="dark"
                tone="dark"
                showBandLabel={false}
              />
            </div>
          </div>

          <div className="reveal-vitality-premium__signal">
            {revealEyebrow ? (
              <p className="reveal-premium-panel__eyebrow">{revealEyebrow}</p>
            ) : null}
            <h2 className="reveal-vitality-premium__heading">{heading}</h2>
            <div className="reveal-vitality-premium__band-row">
              <span
                className="reveal-vitality-premium__band"
                style={
                  {
                    "--reveal-vitality-band-color": band.color,
                  } as CSSProperties
                }
              >
                <span className="reveal-vitality-premium__band-dot" aria-hidden />
                {band.label}
              </span>
              <span className="reveal-vitality-premium__score">
                {Math.round(value)}/100
              </span>
            </div>
            {revealSignalLabel ? (
              <p className="reveal-vitality-premium__signal-label">{revealSignalLabel}</p>
            ) : null}
            <p className="reveal-vitality-premium__body">{body}</p>
          </div>

          {footer ? <div className="reveal-vitality-premium__footer">{footer}</div> : null}
        </div>
      </article>
    );
  }

  return (
    <article
      aria-label="Leefstijlscore"
      className={`vitaalscore-card overflow-hidden rounded-[28px] border ${
        dark
          ? "border-white/10 bg-gradient-to-b from-[#19271d] to-[#0f1b12] shadow-[0_22px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
          : "border-[#e4e0da] bg-gradient-to-b from-[#fefdfb] to-white shadow-[0_16px_48px_rgba(15,28,16,0.10),0_2px_8px_rgba(15,28,16,0.04)]"
      }`}
    >
      <div className="px-6 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
        <div className="flex justify-center">
          <VitalityGauge
            value={value}
            locked={locked}
            delta={delta}
            size={300}
            stroke={18}
            variant="hero"
            theme="light"
            tone={tone}
            showBandLabel={false}
          />
        </div>

        <div className="mt-2 text-center sm:mt-3">
          <h2
            className={`m-0 text-[26px] leading-[1.12] sm:text-[30px] ${dark ? "text-white" : "text-[#1c1917]"}`}
            style={{ fontFamily: "var(--f-serif, Georgia, serif)", fontWeight: 400 }}
          >
            {heading}
          </h2>
          <p
            className={`mx-auto mt-3.5 max-w-[340px] text-[15px] font-medium leading-relaxed sm:text-[16px] ${
              dark ? "text-white/70" : "text-[#44403c]"
            }`}
          >
            {body}
          </p>
          {bandHint ? (
            <p
              className={`mx-auto mt-2 max-w-[340px] text-[13px] font-semibold leading-snug ${
                dark ? "text-[#9BC9A8]" : "text-[#5A8F6A]"
              }`}
            >
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

      {!locked && onInsightsClick ? (
        <div
          className={`border-t ${
            dark ? "border-white/10 bg-white/[0.03]" : "border-[#ebe7e2] bg-[#faf9f7]"
          }`}
        >
          <button
            type="button"
            onClick={onInsightsClick}
            className={`flex min-h-[52px] w-full cursor-pointer items-center justify-center border-0 bg-transparent px-6 py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] transition-colors sm:px-8 ${
              dark
                ? "text-[#9BC9A8] hover:text-[#B8DCC2]"
                : "text-[#5A8F6A] hover:text-[#4A7F5A]"
            }`}
          >
            {VITALITY_INSIGHTS_CTA}
          </button>
        </div>
      ) : null}

      {showRhythm ? (
        <div
          className={`border-t px-6 py-5 sm:px-8 ${
            dark ? "border-white/10 bg-white/[0.03]" : "border-[#ebe7e2] bg-[#faf9f7]"
          }`}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <span
              className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${
                dark ? "text-white/55" : "text-[#78716c]"
              }`}
            >
              {VITALITY_RHYTHM_EYEBROW}
            </span>
            <span
              className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-extrabold ${
                dark ? "bg-[#7FB28E]/15 text-[#9BC9A8]" : "bg-[#e8f5ee] text-[#5A8F6A]"
              }`}
              aria-hidden
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
                {formatRhythmDays(rhythm.currentDays)}
              </div>
              <div
                className={`mt-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${
                  dark ? "text-white/55" : "text-[#78716c]"
                }`}
              >
                {VITALITY_RHYTHM_CURRENT}
              </div>
            </div>
            <div className="px-4 text-center">
              <div
                className={`text-[34px] leading-none sm:text-[38px] ${dark ? "text-white" : "text-[#1c1917]"}`}
                style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
              >
                {formatRhythmDays(rhythm.longestDays)}
              </div>
              <div
                className={`mt-2 text-[12px] font-semibold uppercase tracking-[0.08em] ${
                  dark ? "text-white/55" : "text-[#78716c]"
                }`}
              >
                {VITALITY_RHYTHM_BEST}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {footer ? (
        <div
          className={`border-t px-6 py-5 sm:px-8 ${
            dark ? "border-white/10 bg-white/[0.03]" : "border-[#ebe7e2] bg-[#faf9f7]"
          }`}
        >
          {footer}
        </div>
      ) : null}
    </article>
  );
}
