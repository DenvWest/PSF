"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import type { PillarId } from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import RevealCtaStack from "@/components/intake/RevealCtaStack";
import RevealDashboardPreview from "@/components/intake/RevealDashboardPreview";
import RevealFooterPanel from "@/components/intake/RevealFooterPanel";
import RevealPath from "@/components/intake/RevealPath";
import ResultsRevealShell, {
  type ResultsRevealShellVariant,
} from "@/components/intake/ResultsRevealShell";
import type { PillarStatus } from "@/components/pyramid/FoundationPyramid";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { matchesOvertrainerAnswers } from "@/lib/getSupplementRoute";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { getMailConfirmation } from "@/lib/intake-greetings";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import { buildRevealModel } from "@/lib/reveal-model";
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
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const primaryTheme = getPrimaryTheme(scores, answers);
  const isOvertrainer = matchesOvertrainerAnswers(answers);
  const model = buildRevealModel(scores, isOvertrainer, symptoms);
  const pillarStatuses = buildPillarStatuses(scores);
  const emailLine = hasActiveMarketingEmailConsent
    ? getMailConfirmation(firstName)
    : null;

  const openDashboardPreview = () => {
    setPreviewOpen(true);
  };

  const toggleDashboardPreview = () => {
    setPreviewOpen((open) => !open);
  };

  useEffect(() => {
    if (!previewOpen) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      previewScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [previewOpen]);

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
      <header className="mb-4 text-center lg:mb-5">
        <h1 className="font-serif text-[28px] font-normal leading-tight text-intake-ink lg:text-[30px]">
          {REVEAL_COPY.heroTitle}
        </h1>
      </header>

      <RevealPath
        model={model}
        emailLine={emailLine}
        onViewDashboard={openDashboardPreview}
      />

      <RevealCtaStack previewOpen={previewOpen} onPreviewOpen={toggleDashboardPreview} />

      <div ref={previewScrollRef}>
        <RevealDashboardPreview model={model} open={previewOpen} />
      </div>

      {rapportUrl ? (
        <p className="mb-4 text-center text-sm">
          <Link
            href={rapportUrl}
            className="text-intake-sage underline-offset-2 hover:underline"
          >
            Bekijk je 30-dagen rapport →
          </Link>
        </p>
      ) : null}

      <RevealFooterPanel
        sessionId={sessionId}
        pillarStatuses={pillarStatuses}
        onRestart={onRestart}
        onConsentRevoked={onConsentRevoked}
      />
    </ResultsRevealShell>
  );
}
