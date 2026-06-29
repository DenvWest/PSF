"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";
import { getVitalityBand } from "@/lib/vitality-gauge";

type RevealVitalityInstrumentProps = {
  value: number;
  variant?: "hero" | "compact";
  locked?: boolean;
  delta?: number | null;
  className?: string;
};

function useHeroGaugeSize() {
  const [size, setSize] = useState(152);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setSize(mq.matches ? 200 : 152);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return size;
}

export default function RevealVitalityInstrument({
  value,
  variant = "hero",
  locked = false,
  delta = null,
  className = "",
}: RevealVitalityInstrumentProps) {
  const heroSize = useHeroGaugeSize();
  const size = variant === "compact" ? 104 : heroSize;
  const stroke = variant === "compact" ? 7 : Math.round(size * 0.065);
  const band = getVitalityBand(value);

  return (
    <div
      className={`reveal-vitality-instrument reveal-vitality-instrument--${variant}${className ? ` ${className}` : ""}`}
    >
      <div className="reveal-vitality-instrument__shell">
        <div className="reveal-vitality-instrument__grid" aria-hidden />
        <div className="reveal-vitality-instrument__ring" aria-hidden />
        <div className="reveal-vitality-instrument__gauge">
          <VitalityGauge
            value={value}
            locked={locked}
            delta={delta}
            size={size}
            stroke={stroke}
            variant="hero"
            theme="dark"
            tone="dark"
            showBandLabel={false}
          />
        </div>
      </div>

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
