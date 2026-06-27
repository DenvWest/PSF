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
  compact?: boolean;
  theme?: "dark" | "light";
  variant?: "default" | "hero";
  tone?: "light" | "dark";
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
      strokeLinecap="round"
    />
  );
}

function collectTickAngles(startAngle: number, sweep: number): { angle: number; major: boolean }[] {
  const angles = new Map<number, boolean>();

  for (const pct of [0, 0.25, 0.5, 0.75, 1]) {
    const angle = Math.round((startAngle + sweep * pct) * 100) / 100;
    angles.set(angle, pct === 0 || pct === 1 || pct === 0.5);
  }

  for (const segment of VITALITY_BANDS) {
    const angle = Math.round(scoreToAngle(startAngle, sweep, segment.min) * 100) / 100;
    angles.set(angle, true);
  }
  angles.set(Math.round(scoreToAngle(startAngle, sweep, VITALITY_SCORE_MAX) * 100) / 100, true);

  return [...angles.entries()]
    .map(([angle, major]) => ({ angle, major }))
    .sort((a, b) => a.angle - b.angle);
}

export default function VitalityGauge({
  value,
  label = "Vitaliteit",
  size = 200,
  stroke = 14,
  locked = false,
  delta = null,
  showBandLabel = true,
  compact = false,
  theme = "dark",
  variant = "default",
  tone = "light",
}: VitalityGaugeProps) {
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
      setDisp(0);
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
      setDisp(e * value);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    const settle = window.setTimeout(() => setDisp(value), dur + 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [value, locked]);

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
  const innerR = isHero ? r * 0.58 : 0;
  const clamped = Math.min(VITALITY_SCORE_MAX, Math.max(0, disp));
  const band = getVitalityBand(value);
  const progressEnd = scoreToAngle(startAngle, sweep, clamped);
  const isLight = theme === "light" || isHero;
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
    const progressAngle = scoreToAngle(startAngle, sweep, clamped);
    const [dotX, dotY] = polar(cx, cy, r, progressAngle);
    const labelRadius = r + heroStroke / 2 + 16;
    const tickInner = r - heroStroke / 2 - 1;
    const tickOuter = r + heroStroke / 2 + 1;
    const tickAngles = collectTickAngles(startAngle, sweep);
    const innerHighlightId = `${innerGradientId}-hi`;
    const innerShadowId = `${innerGradientId}-sh`;

    return (
      <div
        className="vitaalscore-gauge"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
      >
        <div style={{ position: "relative", width, height }}>
          <svg width={width} height={height} aria-hidden style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id={innerGradientId} cx="48%" cy="40%" r="58%">
                <stop offset="0%" stopColor="#E4F5E9" />
                <stop offset="28%" stopColor="#B8E0C4" />
                <stop offset="58%" stopColor="#6FA77E" />
                <stop offset="100%" stopColor="#3D7248" />
              </radialGradient>
              <radialGradient id={innerHighlightId} cx="42%" cy="32%" r="48%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <radialGradient id={innerShadowId} cx="50%" cy="58%" r="52%">
                <stop offset="60%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(29,58,38,0.22)" />
              </radialGradient>
              <radialGradient id={glowGradientId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(90,143,106,0.28)" />
                <stop offset="100%" stopColor="rgba(90,143,106,0)" />
              </radialGradient>
              <filter id={`${fillGradientId}-glow`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation={dark ? "6" : "4"} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id={`${fillGradientId}-disc`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(45,90,62,0.35)" />
              </filter>
            </defs>

            {/* Buitenste basisring — dik, zacht, premium */}
            <path
              d={arcPath(cx, cy, r, startAngle, startAngle + sweep)}
              fill="none"
              stroke={dark ? "rgba(255,255,255,0.06)" : "#ebe9e4"}
              strokeWidth={trackStroke}
              strokeLinecap="round"
            />
            <path
              d={arcPath(cx, cy, r, startAngle, startAngle + sweep)}
              fill="none"
              stroke={dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.65)"}
              strokeWidth={trackStroke - 4}
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
                      strokeOpacity={0.32}
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
                  return (
                    <path
                      key={`track-${segment.id}`}
                      d={arcPath(cx, cy, r, segStart, segEnd)}
                      fill="none"
                      stroke={segment.color}
                      strokeOpacity={0.95}
                      strokeWidth={heroStroke}
                      strokeLinecap="butt"
                    />
                  );
                })}

                {clamped < VITALITY_SCORE_MAX ? (
                  <path
                    d={arcPath(cx, cy, r, progressAngle, startAngle + sweep)}
                    fill="none"
                    stroke={dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.35)"}
                    strokeWidth={heroStroke - 1}
                    strokeLinecap="butt"
                  />
                ) : null}

                {clamped > 0 ? (
                  <path
                    d={arcPath(cx, cy, r, startAngle, progressAngle)}
                    fill="none"
                    stroke={band.color}
                    strokeWidth={heroStroke + 1}
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
                      r={10}
                      fill="#fff"
                      stroke={band.color}
                      strokeWidth={3}
                      className="vitaalscore-dot"
                    />
                    <circle cx={dotX} cy={dotY} r={4.5} fill={band.color} />
                  </>
                ) : null}
              </>
            )}

            {/* Kwartaal- en bandstrepen over de boog */}
            {tickAngles.map(({ angle, major }) =>
              radialTickLine(
                cx,
                cy,
                angle,
                tickInner,
                tickOuter,
                major ? 2.5 : 1.5,
                major ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.55)",
                `tick-${angle}`,
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
              fill={locked ? "rgba(90,143,106,0.06)" : "rgba(61,114,72,0.12)"}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={2}
            />

            {/* Hoofdschijf met schaduw */}
            <circle
              cx={cx}
              cy={cy}
              r={innerR}
              fill={locked ? "rgba(90,143,106,0.10)" : `url(#${innerGradientId})`}
              stroke={locked ? "rgba(90,143,106,0.20)" : "rgba(255,255,255,0.38)"}
              strokeWidth={3}
              filter={locked ? undefined : `url(#${fillGradientId}-disc)`}
            />

            {/* Glans + diepte overlay */}
            {!locked ? (
              <>
                <circle cx={cx} cy={cy} r={innerR} fill={`url(#${innerHighlightId})`} />
                <circle cx={cx} cy={cy} r={innerR} fill={`url(#${innerShadowId})`} />
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerR - 10}
                  fill="none"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth={1}
                />
              </>
            ) : null}

            {dark && !locked ? (
              <g>
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerR + 20}
                  fill="none"
                  stroke="rgba(127,178,142,0.10)"
                  strokeWidth={1}
                />
                <g style={{ transformOrigin: "center" }}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={innerR + 30}
                    fill="none"
                    stroke="rgba(127,178,142,0.22)"
                    strokeWidth={1}
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
                      dur="90s"
                      repeatCount="indefinite"
                    />
                  ) : null}
                </g>
              </g>
            ) : null}

            {VITALITY_BANDS.map((segment, index) => {
              const slotStart = startAngle + (sweep * index) / VITALITY_BANDS.length;
              const slotEnd = startAngle + (sweep * (index + 1)) / VITALITY_BANDS.length;
              const pathId = `${labelArcId}-${segment.id}`;
              const active = !locked && clamped >= segment.min;
              const isCurrent = !locked && band.id === segment.id;
              return (
                <g key={`label-${segment.id}`}>
                  <path id={pathId} d={arcPath(cx, cy, labelRadius, slotStart, slotEnd)} fill="none" stroke="none" />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={active ? segment.color : dark ? "rgba(255,255,255,0.36)" : "rgba(15,28,16,0.32)"}
                    fontSize={isCurrent ? 12 : active ? 11 : 10.5}
                    fontWeight={isCurrent ? 800 : active ? 700 : 600}
                    letterSpacing="0.12em"
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
            {!locked && clamped > 0 ? (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
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
                fontSize: size * 0.24,
                fontWeight: 400,
                color: locked ? (dark ? "rgba(255,255,255,0.45)" : scoreColor) : "#fff",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                textShadow: locked ? undefined : "0 2px 10px rgba(15,28,16,0.28)",
              }}
            >
              {locked ? "0" : Math.round(disp)}
            </div>
            <div
              style={{
                fontSize: size * 0.068,
                fontWeight: 700,
                color: locked
                  ? dark
                    ? "rgba(255,255,255,0.30)"
                    : "rgba(15,28,16,0.30)"
                  : "rgba(255,255,255,0.82)",
                letterSpacing: "0.12em",
                marginTop: 4,
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
              {VITALITY_BANDS.map((segment, index) => {
                const next = VITALITY_BANDS[index + 1];
                const segStart = startAngle + (sweep * segment.min) / VITALITY_SCORE_MAX;
                const segEnd =
                  startAngle + (sweep * (next ? next.min : VITALITY_SCORE_MAX)) / VITALITY_SCORE_MAX;
                return (
                  <path
                    key={segment.id}
                    d={arcPath(cx, cy, r, segStart, segEnd)}
                    fill="none"
                    stroke={segment.color}
                    strokeOpacity={isLight ? 0.18 : 0.22}
                    strokeWidth={stroke}
                    strokeLinecap="round"
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
                  style={{ filter: `drop-shadow(0 0 6px ${band.color}66)` }}
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
            gap: 2,
          }}
        >
          <div
            style={{
              fontFamily: "var(--f-serif, Georgia, serif)",
              fontSize: size * 0.3,
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
                fontSize: compact ? 11 : 13,
                fontWeight: 600,
                color: band.color,
                marginTop: 2,
              }}
            >
              {band.label}
            </div>
          ) : null}
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
