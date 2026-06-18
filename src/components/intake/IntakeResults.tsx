"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import type { PillarId } from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import IntakeFeedback from "@/components/intake/IntakeFeedback";
import RevealCtaStack from "@/components/intake/RevealCtaStack";
import RevealFirstStep from "@/components/intake/RevealFirstStep";
import RevealFooterPanel from "@/components/intake/RevealFooterPanel";
import RevealHeroGrid from "@/components/intake/RevealHeroGrid";
import RevealMethodologyPanel from "@/components/intake/RevealMethodologyPanel";
import ResultsRevealShell, {
  type ResultsRevealShellVariant,
} from "@/components/intake/ResultsRevealShell";
import SupplementDisclosure from "@/components/supplements/SupplementDisclosure";
import type { PillarStatus } from "@/components/pyramid/FoundationPyramid";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { matchesOvertrainerAnswers } from "@/lib/getSupplementRoute";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { getMailConfirmation } from "@/lib/intake-greetings";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import { buildRevealModel } from "@/lib/reveal-model";
import { buildRevealSupplementDisclosure } from "@/lib/reveal-supplement";
import { getDisplayStatus } from "@/lib/score-display";

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

function buildPillarStatuses(
  scores: DomainScores,
): Partial<Record<PillarId, PillarStatus>> {
  return {
    stress: getDisplayStatus(scores.stress_score),
    sleep: getDisplayStatus(scores.sleep_score),
    nutrition: getDisplayStatus(scores.nutrition_score),
    movement: getDisplayStatus(scores.movement_score),
    connection: "Niet gemeten",
  };
}

export default function IntakeResults({
  scores,
  answers,
  symptoms,
  sessionId,
  rapportUrl = null,
  firstName,
  hasActiveMarketingEmailConsent = false,
  shellVariant = "fullscreen-dark",
  onRestart,
  onConsentRevoked,
}: IntakeResultsProps) {
  const themeRevealedEmittedRef = useRef(false);
  const primaryTheme = getPrimaryTheme(scores, answers);
  const isOvertrainer = matchesOvertrainerAnswers(answers);
  const model = buildRevealModel(scores, isOvertrainer, symptoms);
  const pillarStatuses = buildPillarStatuses(scores);
  const supplementDisclosure = buildRevealSupplementDisclosure(model.priority);
  const emailLine = hasActiveMarketingEmailConsent
    ? getMailConfirmation(firstName)
    : null;

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
      <header style={{ marginBottom: 20, textAlign: "center" }}>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--sage)",
          }}
        >
          {REVEAL_COPY.eyebrow}
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--f-serif)",
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.15,
            color: "var(--text)",
          }}
        >
          {REVEAL_COPY.heroTitle}
        </h1>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <RevealHeroGrid model={model} />
        <RevealFirstStep model={model} />
        {supplementDisclosure ? <SupplementDisclosure data={supplementDisclosure} /> : null}
        <RevealCtaStack emailLine={emailLine} />
        <IntakeFeedback sessionId={sessionId} />
        <RevealMethodologyPanel pillarStatuses={pillarStatuses} />
      </div>

      {rapportUrl ? (
        <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 14 }}>
          <Link
            href={rapportUrl}
            style={{
              color: "var(--sage)",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Bekijk je 30-dagen rapport →
          </Link>
        </p>
      ) : null}

      <RevealFooterPanel
        sessionId={sessionId}
        onRestart={onRestart}
        onConsentRevoked={onConsentRevoked}
      />
    </ResultsRevealShell>
  );
}
