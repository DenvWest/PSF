"use client";

import Link from "next/link";
import VitalityRing from "@/components/app/VitalityRing";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { REVEAL_CARD_SHADOW, REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealHeroCardProps = {
  model: RevealModel;
  sessionId: string | null;
};

export default function RevealHeroCard({ model, sessionId }: RevealHeroCardProps) {
  const focusLine =
    model.driverLine ??
    `Begin bij ${model.primaryPillarLabel.toLowerCase()} — hier ligt je eerste hefboom.`;

  function handlePillarClick() {
    clarityTag("reveal_primary_pillar", model.primaryPillarId);
    trackEvent("intake_cta_to_pillar", {
      theme_slug: model.primaryTheme,
      destination: model.primaryPillarHref,
      surface: "reveal_hero",
    });
    emitIntakeClientEvent("intake.cta_to_pillar", {
      theme_slug: model.primaryTheme,
      hub_route: model.primaryPillarHref,
      session_id: sessionId,
    });
  }

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
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.5,
          color: "var(--text)",
          textAlign: "center",
          margin: 0,
          maxWidth: 280,
          textWrap: "pretty",
        }}
      >
        {focusLine}
      </p>
      {model.strengthLine ? (
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.45,
            color: "var(--text-muted)",
            textAlign: "center",
            margin: 0,
            maxWidth: 280,
            textWrap: "pretty",
          }}
        >
          {model.strengthLine}
        </p>
      ) : null}
      <Link
        href={model.primaryPillarHref}
        onClick={handlePillarClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 999,
          padding: "6px 14px",
          fontFamily: "var(--f-serif)",
          fontSize: 18,
          color: "var(--text)",
          background: "rgba(90,143,106,0.16)",
          border: "1px solid rgba(90,143,106,0.32)",
          textDecoration: "none",
        }}
      >
        Lees over {model.primaryPillarLabel.toLowerCase()} →
      </Link>
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
