"use client";

import type { CSSProperties } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";
import { getVitalityBand } from "@/lib/vitality-gauge";

type RevealVitalityInstrumentProps = {
  value: number;
  size?: number;
  variant?: "hero" | "compact";
  locked?: boolean;
  delta?: number | null;
  className?: string;
};

export default function RevealVitalityInstrument({
  value,
  size = 96,
  locked = false,
  delta = null,
  className = "",
}: RevealVitalityInstrumentProps) {
  const stroke = Math.max(6, Math.round(size * 0.08));
  const band = getVitalityBand(value);

  return (
    <div className={`reveal-vitality-instrument${className ? ` ${className}` : ""}`}>
      <VitalityGauge
        value={value}
        locked={locked}
        delta={delta}
        size={size}
        stroke={stroke}
        theme="light"
        compact
        showBandLabel={false}
      />
      <div className="reveal-vitality-instrument__signal">
        <span
          className="reveal-vitality-instrument__band"
          style={{ "--reveal-vitality-band-color": band.color } as CSSProperties}
        >
          <span className="reveal-vitality-instrument__band-dot" aria-hidden />
          {band.label}
        </span>
        <span className="reveal-vitality-instrument__score">{Math.round(value)}/100</span>
      </div>
    </div>
  );
}
