"use client";

import { useEffect, useState } from "react";
import { getVitalityBand, VITALITY_BANDS } from "@/lib/vitality-gauge";

type VitalityGaugeProps = {
  value: number;
  label?: string;
  size?: number;
  stroke?: number;
  locked?: boolean;
  delta?: number | null;
  showBandLabel?: boolean;
  compact?: boolean;
  /** Donker dashboard vs. lichte intake-resultatenpagina. */
  theme?: "dark" | "light";
};

const START_ANGLE = 135;
const SWEEP = 270;

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
}: VitalityGaugeProps) {
  const [disp, setDisp] = useState(0);

  useEffect(() => {
    if (locked) {
      return;
    }
    let raf = 0;
    let start: number | undefined;
    const dur = 1100;
    const tick = (t: number) => {
      if (!start) {
        start = t;
      }
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
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

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2 - 1;
  const clamped = Math.min(100, Math.max(0, disp));
  const band = getVitalityBand(value);
  const progressEnd = START_ANGLE + (SWEEP * clamped) / 100;
  const isLight = theme === "light";
  const trackMuted = isLight ? "rgba(15,28,16,0.12)" : "rgba(255,255,255,0.14)";
  const scoreColor = locked
    ? isLight
      ? "rgba(15,28,16,0.35)"
      : "rgba(255,255,255,0.4)"
    : isLight
      ? "rgba(15,28,16,0.92)"
      : "rgba(255,255,255,0.95)";
  const labelColor = isLight ? "rgba(15,28,16,0.45)" : "rgba(255,255,255,0.4)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? 4 : 12 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} aria-hidden>
          {locked ? (
            <path
              d={arcPath(cx, cy, r, START_ANGLE, START_ANGLE + SWEEP)}
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
                const segStart = START_ANGLE + (SWEEP * segment.min) / 100;
                const segEnd = START_ANGLE + (SWEEP * (next ? next.min : 100)) / 100;
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
                  d={arcPath(cx, cy, r, START_ANGLE, progressEnd)}
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
