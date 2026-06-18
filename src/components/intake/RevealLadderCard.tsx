"use client";

import PriorityLadder, { LADDER_ROW_H } from "@/components/app/PriorityLadder";
import { REVEAL_CARD_SHADOW, REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealLadderCardProps = {
  model: RevealModel;
};

export default function RevealLadderCard({ model }: RevealLadderCardProps) {
  return (
    <section aria-label="Prioriteitsladder">
      <article
        style={{
          borderRadius: 24,
          border: "1px solid var(--panel-border)",
          background: "var(--panel)",
          padding: 8,
          boxShadow: REVEAL_CARD_SHADOW,
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            padding: "8px 12px 4px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--f-serif)",
              fontSize: 20,
              fontWeight: 400,
              color: "var(--text)",
              margin: 0,
            }}
          >
            {REVEAL_COPY.whereYouStartTitle}
          </h2>
          <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
            {REVEAL_COPY.priorityHint}
          </span>
        </header>
        <div style={{ height: model.ladder.length * LADDER_ROW_H }}>
          <PriorityLadder
            ladder={model.ladder}
            scores={model.scores}
            focusRowHref="/account/login"
            focusRowAriaLabel="Bewaar dit en volg je voortgang — begin bij je prioriteit"
          />
        </div>
      </article>
    </section>
  );
}
