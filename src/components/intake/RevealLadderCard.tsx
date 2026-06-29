"use client";

import PriorityLadder, { LADDER_ROW_H } from "@/components/app/PriorityLadder";
import RevealQuickWin from "@/components/intake/RevealQuickWin";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealLadderCardProps = {
  model: RevealModel;
  showQuickWin?: boolean;
};

export default function RevealLadderCard({
  model,
  showQuickWin = true,
}: RevealLadderCardProps) {
  const topLadder = model.topLadder;

  return (
    <div className="reveal-path-ladder">
      <p className="reveal-path-ladder__hint">{REVEAL_COPY.priorityHint}</p>

      <div className="reveal-path-ladder__matrix">
        <div
          className="reveal-path-ladder__matrix-body"
          style={{ height: topLadder.length * LADDER_ROW_H }}
        >
          <PriorityLadder
            ladder={topLadder}
            scores={model.scores}
            focusHint={REVEAL_COPY.ladderFocusHint}
          />
        </div>
      </div>

      {showQuickWin ? <RevealQuickWin model={model} /> : null}
    </div>
  );
}
