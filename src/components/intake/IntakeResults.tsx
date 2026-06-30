"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import type { PillarId } from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import { getProfileLabel } from "@/lib/intake-engine";
import IntakeFeedback from "@/components/intake/IntakeFeedback";
import RevealFooterPanel from "@/components/intake/RevealFooterPanel";
import RevealStoryPath from "@/components/intake/RevealStoryPath";
import ResultsRevealShell, {
  type ResultsRevealShellVariant,
} from "@/components/intake/ResultsRevealShell";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { buildRevealModel } from "@/lib/reveal-model";

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
  const profile = getProfileLabel(scores);
  const model = buildRevealModel(scores, answers, symptoms);

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
      <div className="reveal-results-flow flex flex-col gap-5 pt-2 lg:gap-7 lg:pt-4">
        <section aria-label="Jouw leefstijloverzicht" className="reveal-results-act">
          <RevealStoryPath model={model} profile={profile} answers={answers} firstName={firstName} />
        </section>

        <section aria-label="Feedback" className="reveal-results-act reveal-results-act--feedback">
          <IntakeFeedback sessionId={sessionId} variant="reveal-light" />
        </section>

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
