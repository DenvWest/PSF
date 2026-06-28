"use client";

import PriorityLadder, { LADDER_ROW_H } from "@/components/app/PriorityLadder";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealLadderCardProps = {
  model: RevealModel;
};

export default function RevealLadderCard({ model }: RevealLadderCardProps) {
  return (
    <section aria-label="Prioriteitsladder" className="reveal-ladder-premium reveal-premium-panel">
      <div className="reveal-ladder-premium__inner reveal-premium-panel__inner">
        <div className="reveal-premium-panel__top">
          <span className="reveal-premium-panel__badge">{REVEAL_COPY.ladderBadge}</span>
          <span className="reveal-premium-panel__meta">{REVEAL_COPY.ladderMeta}</span>
        </div>

        <header className="reveal-ladder-premium__header">
          <div className="reveal-ladder-premium__title-block">
            <p className="reveal-premium-panel__eyebrow">{REVEAL_COPY.ladderEyebrow}</p>
            <h2 className="reveal-ladder-premium__title">{REVEAL_COPY.whereYouStartTitle}</h2>
          </div>
          <span className="reveal-ladder-premium__hint">{REVEAL_COPY.priorityHint}</span>
        </header>

        <div className="reveal-ladder-premium__matrix">
          <div className="reveal-ladder-premium__matrix-grid" aria-hidden />
          <div
            className="reveal-ladder-premium__matrix-body"
            style={{ height: model.ladder.length * LADDER_ROW_H }}
          >
            <PriorityLadder
              ladder={model.ladder}
              scores={model.scores}
              focusRowHref="/account/login?from=intake"
              focusRowAriaLabel="Bewaar dit en volg je voortgang — begin bij je prioriteit"
              focusHint={REVEAL_COPY.ladderFocusHint}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
