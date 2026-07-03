"use client";

import VitalityGauge from "@/components/app/VitalityGauge";

type KompasDomainGaugeProps = {
  value: number;
  label: string;
};

export default function KompasDomainGauge({ value, label }: KompasDomainGaugeProps) {
  const darkTone = value >= 70;

  return (
    <VitalityGauge
      value={value}
      label={label}
      size={120}
      stroke={14}
      compact
      showBandLabel
      theme={darkTone ? "dark" : "light"}
      tone={darkTone ? "dark" : "light"}
    />
  );
}
