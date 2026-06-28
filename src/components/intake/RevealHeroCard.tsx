"use client";

import VitalityScoreCard from "@/components/app/VitalityScoreCard";
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
      bodyLine={focusLine}
      showRhythm={false}
      footer={
        <div className="flex flex-col items-center gap-4 text-center">
          {model.strengthLine ? (
            <p className="m-0 max-w-[320px] text-[14px] font-medium leading-relaxed text-[#57534e]">
              {model.strengthLine}
            </p>
          ) : null}
          <p className="m-0 text-[13px] font-medium leading-relaxed text-[#a8a29e]">
            {REVEAL_COPY.contextLine}
          </p>
        </div>
      }
    />
  );
}
