"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import type { PillarId } from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import IntakeFeedback from "@/components/intake/IntakeFeedback";
import RevealCtaStack from "@/components/intake/RevealCtaStack";
import RevealFooterPanel from "@/components/intake/RevealFooterPanel";
import RevealHeroCard from "@/components/intake/RevealHeroCard";
import RevealLadderCard from "@/components/intake/RevealLadderCard";
import ResultsRevealShell, {
  type ResultsRevealShellVariant,
} from "@/components/intake/ResultsRevealShell";
import SupplementDisclosure from "@/components/supplements/SupplementDisclosure";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { buildRevealModel } from "@/lib/reveal-model";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";

type IntakeResultsProps = {
  scores: DomainScores;
  answers: Record<string, number>;
  symptoms: SymptomId[];
  sessionId: string | null;
  rapportUrl?: string | null;
  firstName?: string | null;
  hasActiveMarketingEmailConsent?: boolean;
  hideLegacyPlanSections?: boolean;
  secondaryTheme?: PillarId | null;
  shellVariant?: ResultsRevealShellVariant;
  onRestart?: () => void;
  onConsentRevoked?: () => void;
};

export default function IntakeResults({
  scores,
  answers,
  symptoms,
  sessionId,
  rapportUrl = null,
  firstName,
  shellVariant = "fullscreen",
  onRestart,
  onConsentRevoked,
}: IntakeResultsProps) {
  const themeRevealedEmittedRef = useRef(false);
  const primaryTheme = getPrimaryTheme(scores, answers);
  const model = buildRevealModel(scores, answers, symptoms);
  const input = buildRecommendationInput({ scores, answers });
  const supplementDisclosure = buildSupplementDisclosure(model.priority, input, "results");

  useEffect(() => {
    trackEvent("intake_results_viewed", { theme_slug: primaryTheme });
    if (themeRevealedEmittedRef.current) {
      return;
    }
    themeRevealedEmittedRef.current = true;
    emitIntakeClientEvent("intake.theme_revealed", {
      theme_slug: primaryTheme,
      session_id: sessionId,
    });
  }, [primaryTheme, sessionId]);

  return (
    <ResultsRevealShell variant={shellVariant}>
      <div className="reveal-results-flow flex flex-col gap-8 pt-2 lg:gap-12 lg:pt-6">
        <section aria-label="Jouw leefstijloverzicht" className="reveal-results-act">
          <div className="reveal-premium-stack mx-auto w-full max-w-[680px]">
            <RevealHeroCard model={model} firstName={firstName} />
            <RevealLadderCard model={model} />
            <RevealCtaStack />
          </div>
        </section>

        <section aria-label="Feedback" className="reveal-results-act reveal-results-act--feedback">
          <IntakeFeedback sessionId={sessionId} variant="reveal-premium" />
        </section>

        {supplementDisclosure ? (
          <div className="mx-auto w-full max-w-[680px]">
            <SupplementDisclosure data={supplementDisclosure} tone="light" />
          </div>
        ) : null}

        {rapportUrl ? (
          <div className="text-center">
            <Link
              href={rapportUrl}
              style={{
                fontSize: 14,
                color: "var(--sage)",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Bekijk je 30-dagen rapport →
            </Link>
          </div>
        ) : null}

        <RevealFooterPanel
          sessionId={sessionId}
          onRestart={onRestart}
          onConsentRevoked={onConsentRevoked}
        />
      </div>
    </ResultsRevealShell>
  );
}
