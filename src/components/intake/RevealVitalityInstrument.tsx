"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";
import { getVitalityBand } from "@/lib/vitality-gauge";

type RevealVitalityInstrumentProps = {
  value: number;
  locked?: boolean;
  className?: string;
};

function useHeroGaugeLayout() {
  const [layout, setLayout] = useState({ size: 220, padding: 40 });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () =>
      setLayout(mq.matches ? { size: 280, padding: 32 } : { size: 220, padding: 40 });
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return layout;
}

export default function RevealVitalityInstrument({
  value,
  locked = false,
  className = "",
}: RevealVitalityInstrumentProps) {
  const { size, padding } = useHeroGaugeLayout();
  const stroke = Math.round(size * 0.065);
  const band = getVitalityBand(value);

  return (
    <div className={`reveal-vitality-instrument${className ? ` ${className}` : ""}`}>
      <VitalityGauge
        value={value}
        locked={locked}
        size={size}
        stroke={stroke}
        variant="hero"
        theme="light"
        showBandLabel={false}
        layoutPadding={padding}
      />
      {!locked ? (
        <div className="reveal-vitality-instrument__signal">
          <span
            className="reveal-vitality-instrument__band"
            style={
              {
                "--reveal-vitality-band-color": band.color,
              } as CSSProperties
            }
          >
            <span className="reveal-vitality-instrument__band-dot" aria-hidden />
            {band.label}
          </span>
          <span className="reveal-vitality-instrument__score">
            {Math.round(value)}/100
          </span>
        </div>
      ) : null}
    </div>
  );
}
