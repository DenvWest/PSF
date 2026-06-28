"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import type { PillarId } from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import IntakeFeedback from "@/components/intake/IntakeFeedback";
import { MeasurementReminderOptIn } from "@/components/intake/MeasurementReminderOptIn";
import RevealCtaStack from "@/components/intake/RevealCtaStack";
import RevealFirstStep from "@/components/intake/RevealFirstStep";
import RevealFooterPanel from "@/components/intake/RevealFooterPanel";
import RevealHeroCard from "@/components/intake/RevealHeroCard";
import RevealLadderCard from "@/components/intake/RevealLadderCard";
import RevealMethodologyPanel from "@/components/intake/RevealMethodologyPanel";
import ResultsRevealShell, {
  type ResultsRevealShellVariant,
} from "@/components/intake/ResultsRevealShell";
import SupplementDisclosure from "@/components/supplements/SupplementDisclosure";
import type { PillarStatus } from "@/components/pyramid/FoundationPyramid";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { getMailConfirmation } from "@/lib/intake-greetings";
import { isUsableFirstName } from "@/lib/intake-greetings";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import { buildRevealModel } from "@/lib/reveal-model";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { buildSupplementDisclosure } from "@/lib/reveal-supplement";
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
  shellVariant = "fullscreen",
  onRestart,
  onConsentRevoked,
}: IntakeResultsProps) {
  const themeRevealedEmittedRef = useRef(false);
  const primaryTheme = getPrimaryTheme(scores, answers);
  const model = buildRevealModel(scores, answers, symptoms);
  const pillarStatuses = buildPillarStatuses(scores);
  const input = buildRecommendationInput({ scores, answers });
  const supplementDisclosure = buildSupplementDisclosure(model.priority, input, "results");
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
      {/*
        Header: gecentreerd, boven de grid.
        Op desktop: max-width bewust niet beperkt — vult de brede container.
      */}
      <header style={{ marginBottom: 24, textAlign: "center", padding: "0 4px" }}>
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
          {isUsableFirstName(firstName)
            ? `JOUW MOMENTOPNAME · ${firstName!.trim().toUpperCase()}`
            : REVEAL_COPY.eyebrow}
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
        {model.recognitionLine ? (
          <p
            style={{
              margin: "12px auto 0",
              maxWidth: 480,
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--text-muted)",
              textWrap: "pretty",
            }}
          >
            {model.recognitionLine}
          </p>
        ) : null}
        {emailLine ? (
          <p
            style={{
              margin: "10px auto 0",
              maxWidth: 480,
              fontSize: 14,
              lineHeight: 1.5,
              color: "var(--text-subtle)",
            }}
          >
            {emailLine}
          </p>
        ) : null}
      </header>

      {/*
        Twee-koloms magazine-grid op lg+, één kolom op mobiel.

        DOM-volgorde = mobiele leesvolgorde:
          hero → ladder → eerste-stap → supplement → CTA → feedback → methodiek → footer

        Op lg+ herpositioneert CSS grid met grid-auto-flow dense:
          Kolom 1: hero (rij 1) → CTA (rij 2, dense) → feedback (rij 3, dense)
          Kolom 2: ladder (rij 1) → eerste-stap (rij 2) → supplement (rij 3)
          Vol breed: methodiek → rapport → footer
      */}
      <div
        className={[
          "flex flex-col gap-5",
          "lg:grid lg:grid-flow-dense lg:gap-x-10 lg:gap-y-5",
          "lg:[grid-template-columns:minmax(340px,1fr)_minmax(380px,1.05fr)]",
        ].join(" ")}
      >
        {/*
          Linker kolom rij 1: hero-kaart + CTA als één visueel blok.
          Op mobiel: hero → CTA direct (logisch: score zien → direct opslaan).
          Op desktop: neemt de hele linker kolom rij 1 in beslag.
        */}
        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <RevealHeroCard model={model} sessionId={sessionId} firstName={firstName} />
          <RevealCtaStack />
        </div>

        {/* Rechter kolom rij 1: prioriteitsladder */}
        <div className="lg:col-start-2 lg:row-start-1">
          <RevealLadderCard model={model} />
        </div>

        {/* Rechter kolom rij 2: eerste stap */}
        <div className="lg:col-start-2">
          <RevealFirstStep model={model} />
        </div>

        {/* Rechter kolom rij 3: supplement (conditioneel) */}
        {supplementDisclosure ? (
          <div className="lg:col-start-2">
            <SupplementDisclosure data={supplementDisclosure} tone="light" />
          </div>
        ) : null}

        {/* Linker kolom rij 2 (dense): feedback */}
        <div className="lg:col-start-1">
          <IntakeFeedback sessionId={sessionId} />
        </div>

        {/* Vol breed: methodiek */}
        <div className="lg:col-[1/-1]">
          <RevealMethodologyPanel pillarStatuses={pillarStatuses} />
        </div>

        {/* Vol breed: rapport-link (conditioneel) */}
        {rapportUrl ? (
          <div className="lg:col-[1/-1]" style={{ textAlign: "center" }}>
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

        {sessionId ? (
          <div className="lg:col-[1/-1]">
            <MeasurementReminderOptIn sessionId={sessionId} />
          </div>
        ) : null}

        {/* Vol breed: footer (disclaimer, AVG, restart) */}
        <div className="lg:col-[1/-1]">
          <RevealFooterPanel
            sessionId={sessionId}
            onRestart={onRestart}
            onConsentRevoked={onConsentRevoked}
          />
        </div>
      </div>
    </ResultsRevealShell>
  );
}
