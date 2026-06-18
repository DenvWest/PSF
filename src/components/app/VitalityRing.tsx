"use client";

import { useEffect, useState } from "react";
import { Lock } from "@/components/app/icons";

type VitalityRingProps = {
  state?: "locked" | "scored";
  value?: number;
  size?: number;
  stroke?: number;
  showLockedHint?: boolean;
};

export default function VitalityRing({
  state = "scored",
  value = 0,
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
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
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
              stroke="var(--sage, #5A8F6A)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct)}
              style={{ filter: "drop-shadow(0 0 6px rgba(90,143,106,0.4))" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="font-serif leading-none tabular-nums"
            style={{
              fontSize: size * 0.32,
              color: locked
                ? "var(--text-subtle, rgba(255,255,255,0.4))"
                : "var(--text, rgba(255,255,255,0.95))",
            }}
          >
            {locked ? "—" : Math.round(disp)}
          </div>
          <div
            className="mt-1.5 text-xs uppercase tracking-[0.12em]"
            style={{ color: "var(--text-subtle, rgba(255,255,255,0.4))" }}
          >
            Vitaliteit
          </div>
        </div>
      </div>
      {showLockedHint ? (
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--text-subtle, rgba(255,255,255,0.4))" }}
        >
          <Lock s={13} />
          <span>Trend zichtbaar na account</span>
        </div>
      ) : null}
    </div>
  );
}
