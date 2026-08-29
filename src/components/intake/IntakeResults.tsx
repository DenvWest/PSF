"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { SymptomId } from "@/data/intake-questions";
import type { PillarId } from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import { getProfileLabel } from "@/lib/intake-engine";
import IntakeFeedback from "@/components/intake/IntakeFeedback";
import { MeasurementReminderOptIn } from "@/components/intake/MeasurementReminderOptIn";
import IntakeMarketingContinuityNotice from "@/components/intake/IntakeMarketingContinuityNotice";
import RevealFooterPanel from "@/components/intake/RevealFooterPanel";
import RevealReport from "@/components/intake/RevealReport";
import ResultsRevealShell, {
  type ResultsRevealShellVariant,
} from "@/components/intake/ResultsRevealShell";
import { trackEvent, trackQuizVoltooid } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import { getPrimaryTheme, type MeasuredPillarId } from "@/lib/primary-theme";
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
  primaryTheme?: MeasuredPillarId | null;
  shellVariant?: ResultsRevealShellVariant;
  onRestart?: () => void;
  mainNurtureSkipped?: boolean;
  onConsentRevoked?: () => void;
};

export default function IntakeResults({
  scores,
  answers,
  symptoms,
  sessionId,
  rapportUrl = null,
  firstName,
  hasActiveMarketingEmailConsent = false,
  primaryTheme: primaryThemeProp = null,
  shellVariant = "dark-report",
  onRestart,
  mainNurtureSkipped = false,
  onConsentRevoked,
}: IntakeResultsProps) {
  const searchParams = useSearchParams();
  const themeRevealedEmittedRef = useRef(false);
  const isRemeasureFlow = searchParams.get("hermeting") === "1";
  const showMeasurementReminderOptIn =
    Boolean(sessionId) &&
    !hasActiveMarketingEmailConsent &&
    !isRemeasureFlow &&
    !rapportUrl;
  const primaryTheme = primaryThemeProp ?? getPrimaryTheme(scores, answers);
  const profile = getProfileLabel(scores);
  const model = buildRevealModel(scores, answers, symptoms, primaryTheme);

  useEffect(() => {
    trackEvent("intake_results_viewed", { theme_slug: primaryTheme });
    trackQuizVoltooid({
      doelgroep: profile.name,
      hoofd_symptoom: symptoms[0] ?? primaryTheme,
    });
    if (themeRevealedEmittedRef.current) {
      return;
    }
    themeRevealedEmittedRef.current = true;
    emitIntakeClientEvent("intake.theme_revealed", {
      theme_slug: primaryTheme,
      session_id: sessionId,
    });
  }, [primaryTheme, profile.name, sessionId, symptoms]);

  return (
    <ResultsRevealShell variant={shellVariant}>
      <div className="flex flex-col gap-8 lg:gap-12">
        <RevealReport
          model={model}
          answers={answers}
          sessionId={sessionId}
          firstName={firstName}
        />

        {mainNurtureSkipped ? (
          <section aria-label="E-mail vervolg">
            <IntakeMarketingContinuityNotice
              hasActiveAccount={false}
              mainNurtureActive
              variant="results"
            />
          </section>
        ) : null}

        {rapportUrl ? (
          <div className="text-center">
            <Link
              href={rapportUrl}
              className="text-[14px] text-[#5A8F6A] underline underline-offset-2"
            >
              Bekijk je 30-dagen rapport →
            </Link>
          </div>
        ) : null}

        <section aria-label="Nog even" className="grid gap-4 md:grid-cols-2 md:items-start">
          <IntakeFeedback sessionId={sessionId} variant="reveal-premium" />
          {showMeasurementReminderOptIn && sessionId ? (
            <MeasurementReminderOptIn sessionId={sessionId} tone="dark" />
          ) : null}
        </section>

        <RevealFooterPanel
          sessionId={sessionId}
          onRestart={onRestart}
          onConsentRevoked={onConsentRevoked}
        />
      </div>
    </ResultsRevealShell>
  );
}
