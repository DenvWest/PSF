"use client";

import RevealPriorityBars from "@/components/intake/RevealPriorityBars";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealLadderCardProps = {
  model: RevealModel;
};

export default function RevealLadderCard({ model }: RevealLadderCardProps) {
  return (
    <div className="reveal-path-ladder">
      <p className="reveal-path-ladder__hint">{REVEAL_COPY.priorityHint}</p>
      <RevealPriorityBars
        ladder={model.topLadder}
        scores={model.scores}
        startHint={REVEAL_COPY.ladderFocusHint}
      />
    </div>
  );
}
