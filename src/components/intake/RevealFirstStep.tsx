"use client";

import { Leaf } from "@/components/app/icons";
import { REVEAL_CARD_SHADOW, REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealFirstStepProps = {
  model: RevealModel;
};

export default function RevealFirstStep({ model }: RevealFirstStepProps) {
  const firstStep = model.lifestyle[0];
  if (!firstStep) {
    return null;
  }

  return (
    <section aria-label="Je eerste stap">
      <article
        style={{
          borderRadius: 24,
          border: "1px solid rgba(90,143,106,0.26)",
          background: "var(--panel)",
          padding: 20,
          boxShadow: REVEAL_CARD_SHADOW,
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(90,143,106,0.18)",
                color: "var(--sage)",
                border: "1px solid rgba(90,143,106,0.32)",
              }}
            >
              <Leaf s={17} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
              {REVEAL_COPY.lifestyleTrack}
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-subtle)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {REVEAL_COPY.durationBadge}
          </span>
        </header>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
          }}
        >
          {firstStep.win.title}
        </h3>
        <p
          style={{
            fontSize: 16,
            color: "var(--text-muted)",
            lineHeight: 1.55,
            margin: "8px 0 0",
            textWrap: "pretty",
          }}
        >
          {firstStep.win.detail}
        </p>
      </article>
    </section>
  );
}
