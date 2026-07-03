"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";
import { getVitalityBand } from "@/lib/vitality-gauge";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

type RevealVitalityInstrumentProps = {
  value: number;
  locked?: boolean;
  className?: string;
};

function useHeroGaugeLayout() {
  const [layout, setLayout] = useState({ size: 236, padding: 36 });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () =>
      setLayout(mq.matches ? { size: 260, padding: 36 } : { size: 236, padding: 36 });
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
  const stroke = Math.round(size * 0.069);
  const band = getVitalityBand(value);

  return (
    <div
      className={`reveal-vitality-instrument-shell${className ? ` ${className}` : ""}`}
      aria-label="Je vitaliteitsscore"
    >
      <p className="reveal-vitality-instrument-shell__eyebrow">{REVEAL_COPY.vitalityScoreEyebrow}</p>

      <div className="reveal-vitality-instrument">
        <VitalityGauge
          value={value}
          locked={locked}
          size={size}
          stroke={stroke}
          variant="hero"
          theme="dark"
          tone="dark"
          showBandLabel
          heroDisc="kompas"
          heroRingInset={4}
          heroCenterNudgeX={-5}
          heroInnerDiscRatio={0.63}
          layoutPadding={padding}
        />

        {!locked ? (
          <div className="reveal-vitality-instrument__signal">
            <span
              className="reveal-vitality-instrument__band reveal-vitality-instrument__band--dark"
              style={
                {
                  "--reveal-vitality-band-color": band.color,
                } as CSSProperties
              }
            >
              <span className="reveal-vitality-instrument__band-dot" aria-hidden />
              {band.label}
            </span>
            <span className="reveal-vitality-instrument__score reveal-vitality-instrument__score--dark">
              {Math.round(value)}/100
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
