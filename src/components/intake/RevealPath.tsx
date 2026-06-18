"use client";

import RevealFirstStepCard from "@/components/intake/RevealFirstStepCard";
import RevealHero from "@/components/intake/RevealHero";
import RevealJourneyRail from "@/components/intake/RevealJourneyRail";
import type { RevealModel } from "@/lib/reveal-model";

type RevealPathProps = {
  model: RevealModel;
  emailLine?: string | null;
};

export default function RevealPath({ model, emailLine }: RevealPathProps) {
  const firstStep = model.lifestyle[0];
  if (!firstStep) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <RevealHero model={model} emailLine={emailLine} />
      <RevealJourneyRail />
      <RevealFirstStepCard item={firstStep} />
    </div>
  );
}
