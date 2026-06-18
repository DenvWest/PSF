"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { SymptomId } from "@/data/intake-questions";
import type { PillarId } from "@/data/foundation-pyramid";
import type { DomainScores } from "@/lib/intake-engine";
import { Leaf } from "@/components/app/icons";
import PriorityLadder from "@/components/app/PriorityLadder";
import VitalityRing from "@/components/app/VitalityRing";
import IntakeFeedback from "@/components/intake/IntakeFeedback";
import ResultsRevealShell, {
  type ResultsRevealShellVariant,
} from "@/components/intake/ResultsRevealShell";
import ResultsRevealTrust from "@/components/intake/ResultsRevealTrust";
import SupplementDisclosure from "@/components/supplements/SupplementDisclosure";
import FoundationPyramid, {
  type PillarStatus,
} from "@/components/pyramid/FoundationPyramid";
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
  const model = buildRevealModel(scores, isOvertrainer);
  const pillarStatuses = buildPillarStatuses(scores);

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
      <header className="mb-5 text-center lg:mb-6">
        <h1 className="font-serif text-[28px] font-normal leading-tight text-intake-ink lg:text-[30px]">
          {REVEAL_COPY.heroTitle}
        </h1>
      </header>

      {rapportUrl ? (
        <Link
          href={rapportUrl}
          className="mb-5 block rounded-2xl border border-intake-sage/40 bg-intake-sage/10 px-5 py-4 no-underline transition-colors hover:bg-intake-sage/15"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-intake-sage">
            30-dagen hermeting
          </p>
          <p className="mt-1 text-sm font-medium text-intake-ink">
            Bekijk je 30-dagen rapport — zo veranderde je beeld sinds de startmeting →
          </p>
        </Link>
      ) : null}

      {hasActiveMarketingEmailConsent ? (
        <p className="mb-5 text-center text-sm text-intake-ink-muted">
          {getMailConfirmation(firstName)}
        </p>
      ) : null}

      <section aria-label="Jouw vitaliteit" className="mb-5 lg:mb-6">
        <article
          className="rounded-3xl border px-6 py-6 lg:px-8 lg:py-7"
          style={{
            background: "var(--panel, rgba(255,255,255,0.05))",
            borderColor: "rgba(90,143,106,0.28)",
            boxShadow: "0 0 0 1px rgba(90,143,106,0.08)",
          }}
        >
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
            <VitalityRing value={model.vitality} showLockedHint size={160} />
            <div className="text-center lg:text-left">
              <p className="font-serif text-xl text-intake-ink lg:text-[22px]">
                {model.profileName}
              </p>
              <p className="mt-2 text-[13px] text-intake-ink-subtle lg:max-w-[28ch]">
                {REVEAL_COPY.contextLine}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section aria-label="Waar je begint" className="mb-5 lg:mb-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-sage">
              {REVEAL_COPY.priorityEyebrow}
            </p>
            <h2 className="mt-1 font-serif text-xl text-intake-ink">
              {REVEAL_COPY.priorityTitle}
            </h2>
          </div>
          <span className="text-xs text-intake-ink-subtle">{REVEAL_COPY.priorityHint}</span>
        </div>
        <article
          className="rounded-3xl border py-2"
          style={{
            background: "var(--panel, rgba(255,255,255,0.05))",
            borderColor: "var(--panel-border, rgba(255,255,255,0.12))",
          }}
        >
          <PriorityLadder ladder={model.ladder} scores={model.scores} />
        </article>
      </section>

      <section aria-label="Je eerste stap" className="mb-5 lg:mb-6">
        <article
          className="rounded-3xl border p-5 lg:p-6"
          style={{
            background: "var(--panel, rgba(255,255,255,0.05))",
            borderColor: "rgba(90,143,106,0.26)",
            boxShadow: "0 0 0 1px rgba(90,143,106,0.06)",
          }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-intake-sage/30 bg-intake-sage/15 text-intake-sage">
                <Leaf s={17} />
              </span>
              <span className="text-[13px] font-semibold text-intake-ink">
                {REVEAL_COPY.lifestyleTrack}
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.1em] text-intake-ink-subtle">
              {REVEAL_COPY.lifestyleWinLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-intake-ink">
              {model.lifestyleTitle}
            </h3>
            <span
              className="rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
              style={{
                color: model.priority.color,
                background: `${model.priority.color}1f`,
                borderColor: `${model.priority.color}33`,
              }}
            >
              {model.priority.label}
            </span>
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-intake-ink-muted">
            {model.lifestyleDetail}
          </p>
        </article>
      </section>

      {model.supplement ? (
        <div className="mb-8">
          <SupplementDisclosure data={model.supplement} />
        </div>
      ) : null}

      <section aria-label="Bewaar je overzicht" className="mb-5 lg:mb-6">
        <Link
          href="/account/login"
          className="flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-intake-sage px-6 text-[15.5px] font-semibold text-[#0f1c10] no-underline transition-colors hover:bg-[#67a079] lg:mx-auto lg:max-w-md"
        >
          {REVEAL_COPY.cta}
        </Link>
        <p className="mt-3 text-center text-sm leading-relaxed text-intake-ink-muted">
          {REVEAL_COPY.ctaSubtext}
        </p>
      </section>

      <details className="group mb-5 rounded-2xl border border-intake-card-border bg-intake-bg-elevated px-5 py-4">
        <summary className="min-h-11 cursor-pointer list-none text-sm font-medium text-intake-ink [&::-webkit-details-marker]:hidden">
          {REVEAL_COPY.methodDetailsSummary}
        </summary>
        <div className="mt-4 border-t border-intake-divider pt-4">
          <FoundationPyramid mode="personalized" pillarStatuses={pillarStatuses} />
        </div>
      </details>

      <IntakeFeedback sessionId={sessionId} />

      <ResultsRevealTrust
        sessionId={sessionId}
        onRestart={onRestart}
        onConsentRevoked={onConsentRevoked}
      />
    </ResultsRevealShell>
  );
}
