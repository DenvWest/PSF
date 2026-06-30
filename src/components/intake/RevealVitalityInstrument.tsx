"use client";

import { useEffect, useState } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";

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
      setLayout(mq.matches ? { size: 280, padding: 32 } : { size: 236, padding: 36 });
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

  return (
    <div className={`reveal-vitality-instrument${className ? ` ${className}` : ""}`}>
      <VitalityGauge
        value={value}
        locked={locked}
        size={size}
        stroke={stroke}
        variant="hero"
        theme="light"
        showBandLabel
        heroDisc="kompas"
        heroRingInset={4}
        heroCenterNudgeX={-5}
        heroInnerDiscRatio={0.63}
        layoutPadding={padding}
      />
    </div>
  );
}
