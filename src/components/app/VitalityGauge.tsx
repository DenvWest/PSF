"use client";

import { useEffect, useId, useState } from "react";
import {
  getVitalityBand,
  VITALITY_BANDS,
  VITALITY_BAND_ARC_LABELS,
  VITALITY_SCORE_MAX,
} from "@/lib/vitality-gauge";

type VitalityGaugeProps = {
  value: number;
  label?: string;
  size?: number;
  stroke?: number;
  locked?: boolean;
  delta?: number | null;
  showBandLabel?: boolean;
  showDomainLabel?: boolean;
  compact?: boolean;
  theme?: "dark" | "light";
  variant?: "default" | "hero";
  tone?: "light" | "dark";
  layoutPadding?: number;
  heroDisc?: "bright" | "kompas";
  /** Hero: afstand van boog tot canvasrand (default 8). Lager = grotere ring. */
  heroRingInset?: number;
  /** Hero: horizontale verschuiving van boog + center (px, negatief = links). */
  heroCenterNudgeX?: number;
  /** Hero: straal binnenschijf t.o.v. boog (default 0.58). Hoger = grotere schijf. */
  heroInnerDiscRatio?: number;
};

const DEFAULT_START = 135;
const DEFAULT_SWEEP = 270;
/** Bijna volledige cirkel — gap onderaan, zoals Lifesum Life Score. */
const HERO_START = 135;
const HERO_SWEEP = 270;

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

function scoreToAngle(startAngle: number, sweep: number, score: number): number {
  return startAngle + (sweep * Math.min(VITALITY_SCORE_MAX, Math.max(0, score))) / VITALITY_SCORE_MAX;
}

function radialTickLine(
  cx: number,
  cy: number,
  angleDeg: number,
  innerRadius: number,
  outerRadius: number,
  strokeWidth: number,
  color: string,
  key: string,
) {
  const [x1, y1] = polar(cx, cy, innerRadius, angleDeg);
  const [x2, y2] = polar(cx, cy, outerRadius, angleDeg);
  return (
    <line
      key={key}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
    />
  );
}

export default function VitalityGauge({
  value,
  label = "Vitaliteit",
  size = 200,
  stroke = 14,
  locked = false,
  delta = null,
  showBandLabel = true,
  showDomainLabel = true,
  compact = false,
  theme = "dark",
  variant = "default",
  tone = "light",
  layoutPadding = 0,
  heroDisc = "bright",
  heroRingInset = 8,
  heroCenterNudgeX = 0,
  heroInnerDiscRatio = 0.58,
}: VitalityGaugeProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const [disp, setDisp] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const fillGradientId = useId().replace(/:/g, "");
  const glowGradientId = useId().replace(/:/g, "");
  const innerGradientId = useId().replace(/:/g, "");
  const labelArcId = useId().replace(/:/g, "");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (locked) {
      return;
    }
    let raf = 0;
    let start: number | undefined;
    const dur = 1400;
    const tick = (t: number) => {
      if (!start) {
        start = t;
      }
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      setDisp(e * safeValue);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    const settle = window.setTimeout(() => setDisp(safeValue), dur + 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [safeValue, locked]);

  const isHero = variant === "hero";
  const startAngle = isHero ? HERO_START : DEFAULT_START;
  const sweep = isHero ? HERO_SWEEP : DEFAULT_SWEEP;
  const width = size;
  const height = size;
  const cx = width / 2;
  const cy = height / 2;
  const heroStroke = Math.max(stroke, 24);
  const trackStroke = heroStroke + 6;
  const r = (Math.min(width, height) - trackStroke) / 2 - (isHero ? 8 : 1);
  const displayDisp = locked ? 0 : disp;
  const clamped = Math.min(VITALITY_SCORE_MAX, Math.max(0, displayDisp));
  const band = getVitalityBand(safeValue);
  const progressEnd = scoreToAngle(startAngle, sweep, clamped);
  const isLight = (theme === "light" || isHero) && tone !== "dark";
  const trackMuted = isLight ? "rgba(15,28,16,0.10)" : "rgba(255,255,255,0.14)";
  const scoreColor = locked
    ? isLight
      ? "rgba(15,28,16,0.38)"
      : "rgba(255,255,255,0.4)"
    : isLight
      ? "rgba(15,28,16,0.94)"
      : "rgba(255,255,255,0.95)";
  const labelColor = isLight ? "rgba(15,28,16,0.42)" : "rgba(255,255,255,0.4)";

  if (isHero) {
    const dark = tone === "dark";
    const pad = layoutPadding;
    const canvasSize = size + pad * 2;
    const heroWidth = canvasSize;
    const heroHeight = canvasSize;
    const cx = heroWidth / 2 + heroCenterNudgeX;
    const cy = heroHeight / 2;
    const heroStroke = Math.max(stroke, 24);
    const trackStroke = heroStroke + 6;
    const r = (size - trackStroke) / 2 - heroRingInset;
    const innerR = r * heroInnerDiscRatio;
    const progressAngle = scoreToAngle(startAngle, sweep, clamped);
    const [dotX, dotY] = polar(cx, cy, r, progressAngle);
    const labelRadius = r + heroStroke / 2 + (size <= 240 ? 12 : 16);
    const tickInner = r - heroStroke / 2 - 1;
    const tickOuter = r + heroStroke / 2 + 1;
    const zoneBoundaryScores = VITALITY_BANDS.slice(1).map((segment) => segment.min);
    const tickZoneColor = dark ? "rgba(255,255,255,0.48)" : "rgba(24,38,28,0.32)";
    const innerHighlightId = `${innerGradientId}-hi`;
    const innerShadowId = `${innerGradientId}-sh`;
    const innerRimId = `${innerGradientId}-rim`;
    const heroScoreSize = showBandLabel ? size * 0.24 : size * 0.26;
    const heroMaxSize = showBandLabel ? size * 0.068 : size * 0.072;
    const arcCompact = size <= 240;
    const kompasDisc = heroDisc === "kompas";

    function segmentOpacity(segmentMin: number, nextMin: number | undefined): number {
      if (locked) {
        return 0.32;
      }
      const segEnd = nextMin ?? VITALITY_SCORE_MAX;
      if (clamped >= segEnd) {
        return 0.97;
      }
      if (clamped >= segmentMin) {
        return 0.9;
      }
      return dark ? 0.4 : 0.48;
    }

    const ambientFieldId = `${fillGradientId}-ambient`;
    const dotFilterId = `${fillGradientId}-dot`;
    const ambientColor = locked ? "#5A8F6A" : band.color;

    return (
      <div
        className="vitaalscore-gauge"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
      >
        <div style={{ position: "relative", width: heroWidth, height: heroHeight }}>
          <svg width={heroWidth} height={heroHeight} aria-hidden style={{ overflow: "visible" }}>
            <defs>
              {kompasDisc ? (
                <>
                  <radialGradient id={innerGradientId} cx="50%" cy="32%" r="68%">
                    <stop offset="0%" stopColor="#2a4628" />
                    <stop offset="38%" stopColor="#21381f" />
                    <stop offset="100%" stopColor="#1a2e1a" />
                  </radialGradient>
                  <radialGradient id={innerHighlightId} cx="50%" cy="22%" r="55%">
                    <stop offset="0%" stopColor="rgba(127, 178, 142, 0.35)" />
                    <stop offset="45%" stopColor="rgba(127, 178, 142, 0.08)" />
                    <stop offset="100%" stopColor="rgba(127, 178, 142, 0)" />
                  </radialGradient>
                  <radialGradient id={innerShadowId} cx="52%" cy="68%" r="54%">
                    <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="100%" stopColor="rgba(8, 18, 10, 0.42)" />
                  </radialGradient>
                  <radialGradient id={innerRimId} cx="50%" cy="50%" r="50%">
                    <stop offset="82%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="92%" stopColor="rgba(127, 178, 142, 0.22)" />
                    <stop offset="100%" stopColor="rgba(127, 178, 142, 0.08)" />
                  </radialGradient>
                </>
              ) : (
                <>
                  <radialGradient id={innerGradientId} cx="48%" cy="40%" r="58%">
                    <stop offset="0%" stopColor="#E4F5E9" />
                    <stop offset="28%" stopColor="#B8E0C4" />
                    <stop offset="58%" stopColor="#6FA77E" />
                    <stop offset="100%" stopColor="#3D7248" />
                  </radialGradient>
                  <radialGradient id={innerHighlightId} cx="38%" cy="28%" r="52%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.68)" />
                    <stop offset="45%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                  <radialGradient id={innerShadowId} cx="52%" cy="62%" r="54%">
                    <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="100%" stopColor={dark ? "rgba(12,28,18,0.30)" : "rgba(29,58,38,0.26)"} />
                  </radialGradient>
                  <radialGradient id={innerRimId} cx="50%" cy="50%" r="50%">
                    <stop offset="82%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="92%" stopColor="rgba(255,255,255,0.35)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
                  </radialGradient>
                </>
              )}
              <radialGradient id={glowGradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={dark ? "rgba(90,143,106,0.28)" : "rgba(90,143,106,0.18)"} />
                <stop offset="100%" stopColor="rgba(90,143,106,0)" />
              </radialGradient>
              <radialGradient id={ambientFieldId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={ambientColor} stopOpacity={dark ? 0.14 : 0.09} />
                <stop offset="65%" stopColor={ambientColor} stopOpacity={dark ? 0.05 : 0.03} />
                <stop offset="100%" stopColor={ambientColor} stopOpacity={0} />
              </radialGradient>
              <filter id={dotFilterId} x="-120%" y="-120%" width="340%" height="340%">
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="3.5"
                  floodColor={locked ? "#5A8F6A" : band.color}
                  floodOpacity="0.55"
                />
              </filter>
              <filter id={`${fillGradientId}-glow`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation={dark ? "5" : "3.5"} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={`${fillGradientId}-disc`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy={dark ? "6" : "5"} stdDeviation={dark ? "8" : "6"} floodColor={dark ? "rgba(45,90,62,0.38)" : "rgba(45,90,62,0.28)"} />
              </filter>
            </defs>

            <circle
              cx={cx}
              cy={cy}
              r={r + heroStroke / 2 + 18}
              fill={`url(#${ambientFieldId})`}
            />

            {!locked ? (
              <circle
                cx={cx}
                cy={cy}
                r={r + heroStroke / 2 + 9}
                fill="none"
                stroke={dark ? "rgba(127,178,142,0.07)" : "rgba(90,143,106,0.05)"}
                strokeWidth={1}
              />
            ) : null}

            <path
              d={arcPath(cx, cy, r, startAngle, startAngle + sweep)}
              fill="none"
              stroke={dark ? "rgba(0,0,0,0.28)" : "rgba(15,28,16,0.09)"}
              strokeWidth={trackStroke + 2}
              strokeLinecap="round"
            />
            <path
              d={arcPath(cx, cy, r, startAngle, startAngle + sweep)}
              fill="none"
              stroke={dark ? "rgba(255,255,255,0.05)" : "#ede9e3"}
              strokeWidth={trackStroke}
              strokeLinecap="round"
            />
            <path
              d={arcPath(cx, cy, r - heroStroke * 0.18, startAngle, startAngle + sweep)}
              fill="none"
              stroke={dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.52)"}
              strokeWidth={heroStroke * 0.28}
              strokeLinecap="round"
            />

            {locked ? (
              <>
                {VITALITY_BANDS.map((segment, index) => {
                  const next = VITALITY_BANDS[index + 1];
                  const segStart = startAngle + (sweep * segment.min) / VITALITY_SCORE_MAX;
                  const segEnd =
                    startAngle + (sweep * (next ? next.min : VITALITY_SCORE_MAX)) / VITALITY_SCORE_MAX;
                  return (
                    <path
                      key={`track-${segment.id}`}
                      d={arcPath(cx, cy, r, segStart, segEnd)}
                      fill="none"
                      stroke={segment.color}
                      strokeOpacity={segmentOpacity(segment.min, next?.min)}
                      strokeWidth={heroStroke}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </>
            ) : (
              <>
                {VITALITY_BANDS.map((segment, index) => {
                  const next = VITALITY_BANDS[index + 1];
                  const segStart = startAngle + (sweep * segment.min) / VITALITY_SCORE_MAX;
                  const segEnd =
                    startAngle + (sweep * (next ? next.min : VITALITY_SCORE_MAX)) / VITALITY_SCORE_MAX;
                  const reached = clamped >= segment.min;
                  return (
                    <g key={`track-${segment.id}`}>
                      <path
                        d={arcPath(cx, cy, r, segStart, segEnd)}
                        fill="none"
                        stroke={segment.color}
                        strokeOpacity={segmentOpacity(segment.min, next?.min)}
                        strokeWidth={heroStroke}
                        strokeLinecap="butt"
                      />
                      <path
                        d={arcPath(cx, cy, r - heroStroke * 0.22, segStart, segEnd)}
                        fill="none"
                        stroke="rgba(255,255,255,1)"
                        strokeOpacity={reached ? 0.13 : 0.05}
                        strokeWidth={heroStroke * 0.28}
                        strokeLinecap="butt"
                      />
                    </g>
                  );
                })}

                {clamped > 0 ? (
                  <path
                    d={arcPath(cx, cy, r, startAngle, progressAngle)}
                    fill="none"
                    stroke={band.color}
                    strokeWidth={heroStroke + 2}
                    strokeLinecap="round"
                    filter={`url(#${fillGradientId}-glow)`}
                    opacity={0.98}
                  />
                ) : null}

                {clamped > 0 ? (
                  <>
                    <circle
                      cx={dotX}
                      cy={dotY}
                      r={9}
                      fill="#fff"
                      stroke={band.color}
                      strokeWidth={2.5}
                      filter={`url(#${dotFilterId})`}
                    />
                    <circle cx={dotX} cy={dotY} r={4} fill={band.color} />
                  </>
                ) : null}
              </>
            )}

            {/* Zone-grenzen — vier identieke, crisp scheidingen tussen de 5 banden */}
            {zoneBoundaryScores.map((score) =>
              radialTickLine(
                cx,
                cy,
                scoreToAngle(startAngle, sweep, score),
                tickInner,
                tickOuter,
                2,
                tickZoneColor,
                `zone-${score}`,
              ),
            )}

            {/* Premium midden — gelaagd */}
            <circle
              cx={cx}
              cy={cy}
              r={innerR + 14}
              fill={`url(#${glowGradientId})`}
              className={locked ? undefined : "vitaalscore-pulse"}
            />

            {/* Buitenring schijf */}
            <circle
              cx={cx}
              cy={cy}
              r={innerR + 3}
              fill={
                locked
                  ? "rgba(90,143,106,0.05)"
                  : kompasDisc
                    ? "rgba(127,178,142,0.16)"
                    : "rgba(61,114,72,0.10)"
              }
              stroke={kompasDisc ? "rgba(127,178,142,0.26)" : "rgba(255,255,255,0.48)"}
              strokeWidth={1.5}
            />

            {/* Hoofdschijf met schaduw */}
            <circle
              cx={cx}
              cy={cy}
              r={innerR}
              fill={locked ? "rgba(90,143,106,0.08)" : `url(#${innerGradientId})`}
              stroke={locked ? "rgba(90,143,106,0.18)" : "rgba(255,255,255,0.35)"}
              strokeWidth={2.5}
              filter={locked ? undefined : `url(#${fillGradientId}-disc)`}
            />

            {/* Glans + diepte overlay */}
            {!locked ? (
              <>
                <circle cx={cx} cy={cy} r={innerR} fill={`url(#${innerHighlightId})`} />
                <circle cx={cx} cy={cy} r={innerR} fill={`url(#${innerShadowId})`} />
                <circle cx={cx} cy={cy} r={innerR} fill={`url(#${innerRimId})`} />
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerR - 10}
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={0.75}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerR - 18}
                  fill="none"
                  stroke={dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.11)"}
                  strokeWidth={0.5}
                />
              </>
            ) : null}

            {!locked && kompasDisc ? (
              <g>
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerR + 20}
                  fill="none"
                  stroke="rgba(127,178,142,0.06)"
                  strokeWidth={0.75}
                />
                <g style={{ transformOrigin: "center" }}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={innerR + 30}
                    fill="none"
                    stroke="rgba(127,178,142,0.05)"
                    strokeWidth={0.75}
                    strokeDasharray="1 8"
                    strokeLinecap="round"
                  />
                  {!reduceMotion ? (
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      from={`0 ${cx} ${cy}`}
                      to={`360 ${cx} ${cy}`}
                      dur="180s"
                      repeatCount="indefinite"
                    />
                  ) : null}
                </g>
              </g>
            ) : null}

            {VITALITY_BANDS.map((segment, index) => {
              const next = VITALITY_BANDS[index + 1];
              const slotStart = startAngle + (sweep * segment.min) / VITALITY_SCORE_MAX;
              const slotEnd =
                startAngle + (sweep * (next ? next.min : VITALITY_SCORE_MAX)) / VITALITY_SCORE_MAX;
              const pathId = `${labelArcId}-${segment.id}`;
              const active = !locked && clamped >= segment.min;
              const isCurrent = !locked && band.id === segment.id;
              const labelColor = isCurrent
                ? segment.color
                : active
                  ? `${segment.color}DD`
                  : dark
                    ? "rgba(255,255,255,0.28)"
                    : "rgba(15,28,16,0.28)";
              return (
                <g key={`label-${segment.id}`}>
                  <path id={pathId} d={arcPath(cx, cy, labelRadius, slotStart, slotEnd)} fill="none" stroke="none" />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={labelColor}
                    fontSize={
                      isCurrent
                        ? arcCompact
                          ? 11
                          : 14
                        : active
                          ? arcCompact
                            ? 9.5
                            : 13
                          : arcCompact
                            ? 9
                            : 12
                    }
                    fontWeight={isCurrent ? 800 : active ? 700 : 500}
                    letterSpacing={arcCompact ? "0.07em" : "0.09em"}
                    style={{
                      fontFamily: "var(--f-sans, system-ui, sans-serif)",
                      textTransform: "uppercase",
                    }}
                  >
                    <textPath href={`#${pathId}`} startOffset="50%">
                      {VITALITY_BAND_ARC_LABELS[segment.id]}
                    </textPath>
                  </text>
                </g>
              );
            })}
          </svg>

          <div
            className="vitaalscore-center"
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: innerR * 1.5,
              height: innerR * 1.5,
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          >
            {!locked && clamped > 0 && showBandLabel ? (
              <div
                style={{
                  fontSize: arcCompact ? 9 : 10,
                  fontWeight: 800,
                  letterSpacing: arcCompact ? "0.10em" : "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.92)",
                  marginBottom: 6,
                  textShadow: "0 1px 4px rgba(15,28,16,0.28)",
                }}
              >
                {band.label}
              </div>
            ) : null}
            <div
              className={locked ? undefined : "vitaalscore-number"}
              style={{
                fontFamily: "var(--f-serif, Georgia, serif)",
                fontSize: heroScoreSize,
                fontWeight: 400,
                color: locked ? (dark ? "rgba(255,255,255,0.45)" : scoreColor) : "#fff",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                textShadow: locked ? undefined : "0 2px 10px rgba(15,28,16,0.28)",
              }}
            >
              {locked ? "0" : Math.round(Number.isFinite(disp) ? disp : 0)}
            </div>
            <div
              style={{
                fontSize: heroMaxSize,
                fontWeight: 700,
                color: locked
                  ? dark
                    ? "rgba(255,255,255,0.30)"
                    : "rgba(15,28,16,0.30)"
                  : "rgba(255,255,255,0.82)",
                letterSpacing: "0.12em",
                marginTop: showBandLabel ? 4 : 6,
              }}
            >
              /{VITALITY_SCORE_MAX}
            </div>
          </div>
        </div>

        {!locked && delta != null ? (
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: delta >= 0 ? "#4A7F5A" : "#C2674B",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.02em",
            }}
          >
            {delta >= 0 ? "+" : ""}
            {delta} sinds je vorige check
          </div>
        ) : null}
      </div>
    );
  }

  const kompasCompact = compact && !showDomainLabel;
  const scoreFontSize = size * (kompasCompact ? 0.26 : 0.3);
  const bandFontSize = kompasCompact ? 9 : compact ? 11 : 13;
  const centerGap = kompasCompact ? 1 : 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? 4 : 12 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} aria-hidden>
          {locked ? (
            <path
              d={arcPath(cx, cy, r, startAngle, startAngle + sweep)}
              fill="none"
              stroke={trackMuted}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray="2 12"
            />
          ) : (
            <>
              <path
                d={arcPath(cx, cy, r, startAngle, startAngle + sweep)}
                fill="none"
                stroke={isLight ? "rgba(15,28,16,0.06)" : "rgba(255,255,255,0.08)"}
                strokeWidth={stroke + 4}
                strokeLinecap="round"
              />
              {VITALITY_BANDS.map((segment, index) => {
                const next = VITALITY_BANDS[index + 1];
                const segStart = startAngle + (sweep * segment.min) / VITALITY_SCORE_MAX;
                const segEnd =
                  startAngle + (sweep * (next ? next.min : VITALITY_SCORE_MAX)) / VITALITY_SCORE_MAX;
                const segEndScore = next?.min ?? VITALITY_SCORE_MAX;
                const reached = clamped >= segEndScore;
                const current = clamped >= segment.min && clamped < segEndScore;
                const trackOpacity = reached ? (isLight ? 0.28 : 0.32) : current ? (isLight ? 0.22 : 0.26) : isLight ? 0.14 : 0.16;
                return (
                  <path
                    key={segment.id}
                    d={arcPath(cx, cy, r, segStart, segEnd)}
                    fill="none"
                    stroke={segment.color}
                    strokeOpacity={trackOpacity}
                    strokeWidth={stroke}
                    strokeLinecap="butt"
                  />
                );
              })}
              {clamped > 0 ? (
                <path
                  d={arcPath(cx, cy, r, startAngle, progressEnd)}
                  fill="none"
                  stroke={band.color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 ${isLight ? 5 : 6}px ${band.color}55)` }}
                />
              ) : null}
            </>
          )}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: centerGap,
          }}
        >
          <div
            style={{
              fontFamily: "var(--f-serif, Georgia, serif)",
              fontSize: scoreFontSize,
              color: scoreColor,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {locked ? "—" : Math.round(disp)}
          </div>
          {!locked && showBandLabel ? (
            <div
              style={{
                fontSize: bandFontSize,
                fontWeight: 600,
                color: band.color,
                marginTop: kompasCompact ? 0 : 2,
              }}
            >
              {band.label}
            </div>
          ) : null}
          {showDomainLabel ? (
            <div
              style={{
                fontSize: compact ? 10 : 11.5,
                color: labelColor,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: compact ? 1 : 4,
              }}
            >
              {label}
            </div>
          ) : null}
        </div>
      </div>
      {!locked && delta != null ? (
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: delta >= 0 ? "var(--sage, #5A8F6A)" : "var(--terra, #C8956C)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {delta >= 0 ? "+" : ""}
          {delta} sinds je vorige check
        </div>
      ) : null}
    </div>
  );
}
