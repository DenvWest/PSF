"use client";

import { useEffect, useState } from "react";
import VitalityGauge from "@/components/app/VitalityGauge";

type RevealVitalityInstrumentProps = {
  value: number;
  locked?: boolean;
  className?: string;
};

function useHeroGaugeSize() {
  const [size, setSize] = useState(200);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setSize(mq.matches ? 236 : 200);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return size;
}

export default function RevealVitalityInstrument({
  value,
  locked = false,
  className = "",
}: RevealVitalityInstrumentProps) {
  const size = useHeroGaugeSize();
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
      />
    </div>
  );
}
