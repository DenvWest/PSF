"use client";

import PriorityLadderPreview from "@/components/intake/PriorityLadderPreview";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealPriorityPanelProps = {
  model: RevealModel;
  onViewDashboard: () => void;
};

export default function RevealPriorityPanel({ model, onViewDashboard }: RevealPriorityPanelProps) {
  return (
    <div>
      <p className="mb-3 text-xs text-intake-ink-subtle">{REVEAL_COPY.priorityHint}</p>
      <PriorityLadderPreview
        topLadder={model.topLadder}
        scores={model.scores}
        totalPillars={model.ladder.length}
        onViewDashboard={onViewDashboard}
      />
    </div>
  );
}
