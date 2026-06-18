"use client";

import { useEffect, useState } from "react";
import { Lock } from "@/components/app/icons";

type VitalityRingProps = {
  state?: "locked" | "scored";
  value?: number;
  delta?: number | null;
  size?: number;
  stroke?: number;
  showLockedHint?: boolean;
};

export default function VitalityRing({
  state = "scored",
  value = 0,
  delta = null,
  size = 160,
  stroke = 13,
  showLockedHint = false,
}: VitalityRingProps) {
  const locked = state === "locked";
  const [disp, setDisp] = useState(0);

  useEffect(() => {
    if (locked) {
      return;
    }
    let raf = 0;
    let start: number | undefined;
    const dur = 1150;
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
    const settle = window.setTimeout(() => setDisp(value), dur + 150);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [value, locked]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, disp)) / 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          {locked ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray="2 10"
            />
          ) : (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--sage)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct)}
              style={{ filter: "drop-shadow(0 0 6px rgba(90,143,106,0.4))" }}
            />
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
          }}
        >
          <div
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: size * 0.32,
              color: locked ? "var(--text-subtle)" : "var(--text)",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {locked ? "—" : Math.round(disp)}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-subtle)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            Vitaliteit
          </div>
        </div>
      </div>
      {locked ? (
        showLockedHint ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--text-subtle)",
            }}
          >
            <Lock s={13} />
            <span>Trend zichtbaar na account</span>
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: "var(--text-subtle)" }}>Nog geen score</div>
        )
      ) : (
        delta != null && (
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: delta >= 0 ? "var(--sage)" : "var(--terra)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {delta >= 0 ? "+" : ""}
            {delta} sinds je vorige check
          </div>
        )
      )}
    </div>
  );
}
