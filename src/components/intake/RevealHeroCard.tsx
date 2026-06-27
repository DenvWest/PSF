"use client";

import Link from "next/link";
import VitalityScoreCard from "@/components/app/VitalityScoreCard";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealModel } from "@/lib/reveal-model";

type RevealHeroCardProps = {
  model: RevealModel;
  sessionId: string | null;
  firstName?: string | null;
};

export default function RevealHeroCard({ model, sessionId, firstName = null }: RevealHeroCardProps) {
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
    <VitalityScoreCard
      value={model.vitality}
      firstName={firstName}
      bodyLine={focusLine}
      showRhythm={false}
      footer={
        <div className="flex flex-col items-center gap-4 text-center">
          {model.strengthLine ? (
            <p className="m-0 max-w-[320px] text-[14px] font-medium leading-relaxed text-[#57534e]">
              {model.strengthLine}
            </p>
          ) : null}
          <Link
            href={model.primaryPillarHref}
            onClick={handlePillarClick}
            className="inline-flex min-h-[44px] items-center rounded-full border border-[rgba(90,143,106,0.35)] bg-white px-5 text-[18px] text-[#1c1917] no-underline shadow-[0_4px_14px_rgba(15,28,16,0.08)] transition-all hover:border-[#5A8F6A] hover:shadow-[0_6px_18px_rgba(90,143,106,0.18)]"
            style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
          >
            Lees over {model.primaryPillarLabel.toLowerCase()} →
          </Link>
          <p className="m-0 text-[13px] font-medium leading-relaxed text-[#a8a29e]">{REVEAL_COPY.contextLine}</p>
        </div>
      }
    />
  );
}
