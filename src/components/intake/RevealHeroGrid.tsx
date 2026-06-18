"use client";

import VitalityRing from "@/components/app/VitalityRing";
import PriorityLadder, { LADDER_ROW_H } from "@/components/app/PriorityLadder";
import { REVEAL_CARD_SHADOW, REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealHeroGridProps = {
  model: RevealModel;
};

export default function RevealHeroGrid({ model }: RevealHeroGridProps) {
  return (
    <section aria-label="Jouw vitaliteit en prioriteit">
      <div
        className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5"
        style={{ alignItems: "stretch" }}
      >
        <article
          style={{
            borderRadius: 24,
            border: "1px solid rgba(90,143,106,0.28)",
            background: "var(--panel)",
            padding: "24px 20px",
            boxShadow: REVEAL_CARD_SHADOW,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <VitalityRing value={model.vitality} size={160} />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              padding: "6px 14px",
              fontFamily: "var(--f-serif)",
              fontSize: 20,
              color: "var(--text)",
              background: "rgba(90,143,106,0.16)",
              border: "1px solid rgba(90,143,106,0.32)",
            }}
          >
            {model.profileName}
          </span>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-subtle)",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {REVEAL_COPY.contextLine}
          </p>
        </article>

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
      </div>
    </section>
  );
}
