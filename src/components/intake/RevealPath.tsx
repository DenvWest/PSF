"use client";

import RevealHero from "@/components/intake/RevealHero";
import RevealJourneyRail from "@/components/intake/RevealJourneyRail";
import RevealWhereYouStart from "@/components/intake/RevealWhereYouStart";
import type { RevealModel } from "@/lib/reveal-model";

type RevealPathProps = {
  model: RevealModel;
  emailLine?: string | null;
  onViewDashboard: () => void;
};

export default function RevealPath({ model, emailLine, onViewDashboard }: RevealPathProps) {
  return (
    <div className="space-y-4 lg:space-y-5">
      <RevealHero model={model} emailLine={emailLine} />
      <RevealJourneyRail />
      <RevealWhereYouStart model={model} onViewDashboard={onViewDashboard} />
    </div>
  );
}
