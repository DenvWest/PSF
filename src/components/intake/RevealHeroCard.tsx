"use client";

import VitalityRing from "@/components/app/VitalityRing";
import { REVEAL_CARD_SHADOW, REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealHeroCardProps = {
  model: RevealModel;
};

export default function RevealHeroCard({ model }: RevealHeroCardProps) {
  return (
    <article
      aria-label="Jouw vitaliteit"
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
  );
}
