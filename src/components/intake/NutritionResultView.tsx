"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import DomeinIjkpuntCheckPrompt from "@/components/intake/DomeinIjkpuntCheckPrompt";
import NutritionIntakeHero from "@/components/intake/NutritionIntakeHero";
import ProteinTargetCard from "@/components/intake/ProteinTargetCard";
import ResultsRevealShell from "@/components/intake/ResultsRevealShell";
import {
  nutrientReferences,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardAgendaHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import type { NutritionAdviceItem } from "@/lib/nutrition-advice";
import { buildNutritionHeadline } from "@/lib/nutrition-conclusion";
import type { LifestyleExtra } from "@/lib/nutrition-lifestyle-extras";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import { deltaStatementFor, type NutrientDelta } from "@/lib/nutrition-delta";
import { getVitalityBandMessage } from "@/lib/vitality-gauge";
import NutritionEvidenceDisclosure from "@/components/evidence/NutritionEvidenceDisclosure";
import {
  evidenceForExtra,
  evidenceForGap,
} from "@/data/nutrition/nutrient-evidence-map";
import { withNutritionReturn } from "@/lib/nutrition-return-link";
import VerhoudingTabel from "@/components/nutrition/VerhoudingTabel";
import KwaliteitEetwijzer from "@/components/nutrition/KwaliteitEetwijzer";
import type { NutritionFactRow } from "@/lib/nutrition-ladder";

interface NutritionResultViewProps {
  score: number;
  estimate: IntakeEstimate[];
  statements: string[];
  advice: NutritionAdviceItem[];
  lifestyleExtras?: LifestyleExtra[];
  delta: NutrientDelta[] | null;
  /** Feitenrijen uit dezelfde antwoorden; leeg als de sliders niet in state staan. */
  factRows?: readonly NutritionFactRow[];
  proteinMealsPerDay?: number;
  fromDashboard: boolean;
  originDomain: string | null;
}

const PANEL =
  "rounded-2xl border border-white/10 bg-black/20";
const DETAILS_SUMMARY =
  "cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-[#9CC5A9] [&::-webkit-details-marker]:hidden";
const SECONDARY_CTA =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-[#F1EFE8] no-underline transition hover:bg-white/[0.07]";
const PRIMARY_CTA =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#5A8F6A] px-6 py-3.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90";
const FOOTNOTE_LINK =
  "font-medium text-[#9CC5A9] underline decoration-[#9CC5A9]/35 underline-offset-[3px] hover:decoration-[#9CC5A9]";

export default function NutritionResultView({
  score,
  estimate,
  advice,
  lifestyleExtras = [],
  delta,
  factRows = [],
  proteinMealsPerDay,
  fromDashboard,
  originDomain,
}: NutritionResultViewProps) {
  const gaps = estimate.filter((e) => e.band === "below");
  const proteinEstimate = estimate.find((e) => e.nutrient === "protein");
  const proteinIsGap = proteinEstimate?.band === "below";

  const focusNutrient: NutrientId | null = proteinIsGap
    ? "protein"
    : (gaps[0]?.nutrient ?? null);

  const otherGaps = gaps.filter((e) => e.nutrient !== focusNutrient);
  const supplements = advice.filter(
    (a): a is Extract<NutritionAdviceItem, { kind: "supplement" }> =>
      a.kind === "supplement",
  );
  const supplementRevealTracked = useRef(false);
  const lifestyleExtraTracked = useRef(false);

  function lifestyleTextFor(nutrient: NutrientId): string {
    const fromAdvice = advice.find(
      (item): item is Extract<NutritionAdviceItem, { kind: "lifestyle" }> =>
        item.kind === "lifestyle" && item.nutrient === nutrient,
    );
    return fromAdvice?.text ?? nutrientReferences[nutrient].lifestyleAction;
  }

  useEffect(() => {
    if (lifestyleExtraTracked.current || lifestyleExtras.length === 0) {
      return;
    }
    lifestyleExtraTracked.current = true;
    trackEvent("nutrition_lifestyle_extra_shown", {
      extra_ids: lifestyleExtras.map((item) => item.id).join(","),
      from: fromDashboard ? "dashboard" : "direct",
    });
    for (const extra of lifestyleExtras) {
      if (extra.id === "fiber_low_wholegrain") {
        clarityTag("nutrition_extra", "fiber");
      }
      if (extra.id === "b12_vegan") {
        clarityTag("nutrition_extra", "b12");
      }
      if (extra.id === "sugar_high_signal") {
        clarityTag("nutrition_extra", "sugar");
      }
    }
  }, [lifestyleExtras, fromDashboard]);

  useEffect(() => {
    if (supplementRevealTracked.current || supplements.length === 0) {
      return;
    }
    supplementRevealTracked.current = true;
    trackEvent("nutrition_supplement_revealed", {
      count: supplements.length,
      nutrients: supplements.map((item) => item.nutrient).join(","),
      from: fromDashboard ? "dashboard" : "direct",
    });
  }, [supplements, fromDashboard]);

  const visibleDeltas = delta
    ? delta.filter((d) => d.direction !== "unchanged")
    : null;
  const deltaImproved =
    visibleDeltas?.filter((d) => d.direction === "improved") ?? [];
  const deltaWorsened =
    visibleDeltas?.filter((d) => d.direction === "worsened") ?? [];

  const summaryLine = proteinIsGap
    ? "Eiwit is je grootste winst nu"
    : gaps.length > 0
      ? `${gaps.length} aandachtspunt${gaps.length === 1 ? "" : "en"} op je frequentie`
      : "Op basis van je frequentie geen aandachtspunten";

  const headline =
    factRows.length > 0 ? buildNutritionHeadline(factRows) : summaryLine;

  const focusRef = focusNutrient ? nutrientReferences[focusNutrient] : null;

  function handleDashboardReturn() {
    trackEvent("nutrition_result_dashboard_return", {
      from: "dashboard",
      origin_domain: originDomain ?? "none",
    });
  }

  function handleAgendaClick() {
    trackEvent("nutrition_result_agenda_cta_click", {
      from: fromDashboard ? "dashboard" : "direct",
      has_focus_gap: gaps.length > 0,
    });
    clarityTag("nutrition_result", "agenda_cta");
  }

  const dashboardHref = fromDashboard ? "/dashboard?tab=vandaag" : "/dashboard";
  const agendaHref = buildDashboardAgendaHref();

  const evidenceFrom = fromDashboard ? "dashboard" : "direct";
  const focusGapEvidence = focusNutrient ? evidenceForGap(focusNutrient) : null;

  return (
    <ResultsRevealShell variant="dark-report">
      <div className="flex flex-col gap-8 lg:gap-12">
        <div className="grid gap-6 lg:gap-8">
          <header>
            <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
              Je voedingscheck
            </p>
          </header>

          <section
            aria-label="Jouw voedingsbeeld"
            className="grid gap-6 rounded-3xl border border-white/12 bg-white/[0.035] p-4 sm:p-6 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:gap-8 md:p-7"
          >
            <NutritionIntakeHero score={score} />

            <div className="min-w-0 border-t border-white/[0.07] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <div className="grid gap-2">
                <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#7E8C82]">
                  Uit je antwoorden
                </p>
                <h1
                  className="m-0 text-[26px] leading-tight text-[#F1EFE8] sm:text-[30px]"
                  style={{ fontFamily: "var(--f-serif, Georgia, serif)" }}
                >
                  {headline}
                </h1>
                <p
                  className="m-0 max-w-[46ch] text-[13.5px] leading-relaxed text-[#C6D1C9]"
                  style={{ textWrap: "pretty" }}
                >
                  {getVitalityBandMessage(score, "Je voeding")} Een reflectie van
                  hoe vaak je iets eet — geen diagnose.
                </p>
              </div>

              {focusRef ? (
                <section
                  aria-labelledby="focus-heading"
                  className={`mt-6 rounded-2xl border px-5 py-5 ${
                    focusNutrient === "protein"
                      ? "border-[#C8956C]/35 bg-[#C8956C]/[0.08]"
                      : PANEL
                  }`}
                >
                  <h2
                    id="focus-heading"
                    className={`mb-3 text-xs font-semibold uppercase tracking-[0.16em] ${
                      focusNutrient === "protein"
                        ? "text-[#C8956C]"
                        : "text-[#7E8C82]"
                    }`}
                  >
                    Focus: {focusRef.label}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#F1EFE8]">
                    {lifestyleTextFor(focusNutrient)}
                  </p>
                  {fromDashboard ? (
                    <p className="mt-3 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                      Dit is je weekpatroon-stap — geen dagelijkse tekort-meting. Zet hem op Mijn Dag
                      en bouw 14 dagen aan voordat je opnieuw logt.
                    </p>
                  ) : null}

                  {focusGapEvidence ? (
                    <NutritionEvidenceDisclosure
                      evidence={focusGapEvidence.primary}
                      secondaryQuestionIds={focusGapEvidence.secondaryIds}
                      surface="result"
                      contextId={focusNutrient!}
                      from={evidenceFrom}
                    />
                  ) : null}

                  {focusNutrient === "protein" ? (
                    <details className={`group mt-4 ${PANEL}`}>
                      <summary className={DETAILS_SUMMARY}>
                        Bereken je precieze eiwitdoel
                      </summary>
                      <div className="border-t border-white/10 px-2 pb-3 pt-2">
                        <ProteinTargetCard
                          hideHeading
                          proteinMealsYesterday={proteinMealsPerDay}
                        />
                      </div>
                    </details>
                  ) : null}
                </section>
              ) : (
                <p className="mt-6 text-sm leading-relaxed text-[#9FB0A6]">
                  Houd vast wat voor jou werkt — je frequentie geeft geen
                  aandachtspunten.
                </p>
              )}
            </div>
          </section>

          {factRows.length > 0 ? (
            <VerhoudingTabel rijen={factRows} surface="check" />
          ) : null}

          <details className={`group ${PANEL}`}>
            <summary className={DETAILS_SUMMARY}>
              Kwaliteit — wat er op groente en fruit zit
            </summary>
            <div className="border-t border-white/10 p-3">
              <KwaliteitEetwijzer surface="check" />
            </div>
          </details>

          {lifestyleExtras.length > 0 ? (
            <section
              aria-labelledby="lifestyle-extras-heading"
              className={`${PANEL} px-5 py-5`}
            >
              <h2
                id="lifestyle-extras-heading"
                className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#7E8C82]"
              >
                Ook relevant voor jou
              </h2>
              <ul className="flex flex-col gap-3">
                {lifestyleExtras.map((extra) => (
                  <li key={extra.id}>
                    <p className="text-sm leading-relaxed text-[#F1EFE8]">{extra.text}</p>
                    <NutritionEvidenceDisclosure
                      evidence={evidenceForExtra(extra.id)}
                      surface="result"
                      contextId={extra.id}
                      from={evidenceFrom}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {otherGaps.length > 0 ? (
            <details className={`group ${PANEL}`}>
              <summary className={DETAILS_SUMMARY}>
                Jouw stappen ({otherGaps.length})
              </summary>
              <ul className="flex flex-col gap-2 border-t border-white/10 px-3 pb-3 pt-3">
                {otherGaps.map((e) => {
                  const gapEvidence = evidenceForGap(e.nutrient);
                  return (
                    <li
                      key={e.nutrient}
                      className="rounded-[12px] border border-white/10 bg-black/25 px-4 py-3 text-sm leading-relaxed text-[#C6D1C9]"
                    >
                      <span className="font-medium text-[#F1EFE8]">
                        {nutrientReferences[e.nutrient].label}
                      </span>
                      {" — "}
                      {lifestyleTextFor(e.nutrient)}
                      <NutritionEvidenceDisclosure
                        evidence={gapEvidence.primary}
                        secondaryQuestionIds={gapEvidence.secondaryIds}
                        surface="result"
                        contextId={e.nutrient}
                        from={evidenceFrom}
                      />
                    </li>
                  );
                })}
              </ul>
            </details>
          ) : null}

          {supplements.length > 0 ? (
            <details className={`group ${PANEL}`}>
              <summary className={DETAILS_SUMMARY}>
                Supplementen, indien gewenst
              </summary>
              <ul className="flex flex-col gap-2 border-t border-white/10 px-3 pb-3 pt-3">
                {supplements.map((item) => (
                  <li key={item.nutrient}>
                    <Link
                      href={item.comparisonPath}
                      className="block rounded-[12px] border border-[#C8956C]/30 bg-[#C8956C]/10 px-4 py-3 text-sm font-medium text-[#C8956C] transition-colors hover:bg-[#C8956C]/20"
                    >
                      Vergelijk {nutrientReferences[item.nutrient].label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {visibleDeltas && visibleDeltas.length > 0 ? (
            <details className="group rounded-2xl border border-[#5A8F6A]/30 bg-[#5A8F6A]/10">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[#C6D1C9] [&::-webkit-details-marker]:hidden">
                Sinds je vorige check —{" "}
                {[
                  deltaImproved.length > 0
                    ? `${deltaImproved.length} verbeterd`
                    : null,
                  deltaWorsened.length > 0
                    ? `${deltaWorsened.length} terug`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </summary>
              <ul className="flex flex-col gap-2 border-t border-white/10 px-3 pb-3 pt-3">
                {visibleDeltas.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-[12px] border border-white/10 bg-black/25 px-4 py-3 text-sm leading-relaxed text-[#C6D1C9]"
                  >
                    {deltaStatementFor(d)}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <DomeinIjkpuntCheckPrompt domain="voeding" domainLabel="Voeding" />

          <div className="space-y-4 text-center">
            {fromDashboard ? (
              <>
                <Link
                  href={agendaHref}
                  onClick={handleAgendaClick}
                  className={PRIMARY_CTA}
                >
                  Zet op Mijn Dag →
                </Link>
                <Link
                  href={dashboardHref}
                  onClick={handleDashboardReturn}
                  className={SECONDARY_CTA}
                >
                  Terug naar dashboard
                </Link>
              </>
            ) : (
              <Link href="/" className={SECONDARY_CTA}>
                Sluiten
              </Link>
            )}
            {!fromDashboard ? (
              <p className="text-xs leading-relaxed text-[#7E8C82]">
                Of{" "}
                <Link href="/intake" className={FOOTNOTE_LINK}>
                  doe de volledige Leefstijlcheck
                </Link>{" "}
                voor jouw volgorde over alle pijlers.
              </p>
            ) : null}
            <p className="text-xs leading-relaxed text-[#7E8C82]">
              <Link
                href={withNutritionReturn(
                  "/onderbouwing/voeding",
                  fromDashboard ? "dashboard" : undefined,
                )}
                className={FOOTNOTE_LINK}
              >
                Wetenschappelijke onderbouwing van de voedingscheck
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ResultsRevealShell>
  );
}
