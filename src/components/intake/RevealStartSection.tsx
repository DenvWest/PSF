"use client";

import { useState } from "react";
import RevealFirstStep from "@/components/intake/RevealFirstStep";
import RevealStartChips from "@/components/intake/RevealStartChips";
import type { RevealModel } from "@/lib/reveal-model";

type RevealStartSectionProps = {
  model: RevealModel;
  answers: Record<string, number>;
};

export default function RevealStartSection({ model, answers }: RevealStartSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPillar = model.topLadder[selectedIndex] ?? model.priority;

  return (
    <div className="grid gap-3 px-1">
      <RevealStartChips
        model={model}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />
      <RevealFirstStep model={model} answers={answers} selectedPillar={selectedPillar} />
    </div>
  );
}
