"use client";

import VitalityScoreCard from "@/components/app/VitalityScoreCard";
import { getMomentopnameHeading } from "@/lib/intake-greetings";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealHeroCardProps = {
  model: RevealModel;
  firstName?: string | null;
};

export default function RevealHeroCard({ model, firstName = null }: RevealHeroCardProps) {
  const focusLine =
    model.driverLine ??
    `Begin bij ${model.primaryPillarLabel.toLowerCase()} — hier ligt je eerste hefboom.`;

  return (
    <VitalityScoreCard
      value={model.vitality}
      firstName={firstName}
      headingLine={getMomentopnameHeading(firstName)}
      bodyLine={focusLine}
      showRhythm={false}
      layoutVariant="reveal-premium"
      revealBadge={REVEAL_COPY.vitalityBadge}
      revealMeta={REVEAL_COPY.vitalityMeta}
      revealEyebrow={REVEAL_COPY.vitalityEyebrow}
      revealSignalLabel={REVEAL_COPY.vitalitySignalLabel}
      footer={
        <>
          {model.strengthLine ? (
            <p className="reveal-vitality-premium__strength">{model.strengthLine}</p>
          ) : null}
          <p className="reveal-vitality-premium__disclaimer">{REVEAL_COPY.contextLine}</p>
        </>
      }
    />
  );
}
