"use client";

import VitalityGauge from "@/components/app/VitalityGauge";

type KompasDomainGaugeProps = {
  value: number;
  label: string;
  /** Kleiner op een domeinkop, waar de ring naast de titel staat i.p.v. erboven. */
  size?: number;
};

export default function KompasDomainGauge({ value, label, size = 120 }: KompasDomainGaugeProps) {
  const darkTone = value >= 70;

  return (
    <VitalityGauge
      value={value}
      label={label}
      size={size}
      stroke={Math.max(9, Math.round(size * 0.135))}
      compact
      showBandLabel
      showDomainLabel={false}
      theme={darkTone ? "dark" : "light"}
      tone={darkTone ? "dark" : "light"}
    />
  );
}
