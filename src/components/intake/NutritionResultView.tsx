"use client";

import Link from "next/link";
import ProteinTargetCard from "@/components/intake/ProteinTargetCard";
import VitalityGauge from "@/components/app/VitalityGauge";
import {
  nutrientReferences,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import { trackEvent } from "@/lib/ga4";
import {
  NUTRITION_BAND_SHORT,
} from "@/lib/nutrition-band-labels";
import type { NutritionAdviceItem } from "@/lib/nutrition-advice";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import { deltaStatementFor, type NutrientDelta } from "@/lib/nutrition-delta";
import { getVitalityBandMessage } from "@/lib/vitality-gauge";

interface NutritionResultViewProps {
  score: number;
  estimate: IntakeEstimate[];
  advice: NutritionAdviceItem[];
  delta: NutrientDelta[] | null;
  proteinMealsPerDay?: number;
  fromDashboard: boolean;
  originDomain: string | null;
}

function badgeClassName(band: IntakeEstimate["band"]): string {
  if (band === "below") {
    return "border-intake-terra/40 bg-intake-terra/10 text-intake-ink";
  }
  return "border-intake-card-border bg-intake-bg-elevated text-intake-ink-muted";
}

export default function NutritionResultView({
  score,
  estimate,
  advice,
  delta,
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

  const focusRef = focusNutrient ? nutrientReferences[focusNutrient] : null;

  function handleDashboardReturn() {
    trackEvent("nutrition_result_dashboard_return", {
      from: "dashboard",
      origin_domain: originDomain ?? "none",
    });
  }
  const dashboardHref =
    fromDashboard && originDomain
      ? `/dashboard?tab=vandaag&kompas=${originDomain}`
      : "/dashboard";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-lg px-6 py-12">
        <h1 className="mb-6 text-center font-serif text-3xl font-normal text-intake-ink">
          Je voedingsscore
        </h1>

        <div className="mb-4 flex justify-center">
          <VitalityGauge value={score} label="Voeding" size={208} delta={null} theme="light" />
        </div>

        <p className="mb-8 text-center text-sm leading-relaxed text-intake-ink-muted">
          {getVitalityBandMessage(score, "Je voeding")} Een reflectie van hoe vaak je
          iets eet — geen diagnose.
        </p>

        <h2 className="mb-2 text-center font-serif text-xl font-normal text-intake-ink">
          Wat je binnenkrijgt
        </h2>
        <p className="mb-4 text-center text-sm font-medium text-intake-ink">
          {summaryLine}
        </p>

        <div
          className="mb-8 flex flex-wrap justify-center gap-2"
          aria-label="Inname per nutriënt"
        >
          {estimate.map((e) => {
            const ref = nutrientReferences[e.nutrient];
            return (
              <span
                key={e.nutrient}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${badgeClassName(e.band)}`}
              >
                <span className="font-medium">{ref.label}</span>
                <span aria-hidden="true">·</span>
                <span>{NUTRITION_BAND_SHORT[e.band]}</span>
              </span>
            );
          })}
        </div>

        {focusRef ? (
          <section
            aria-labelledby="focus-heading"
            className={`mb-6 rounded-[14px] border px-5 py-5 ${
              focusNutrient === "protein"
                ? "border-intake-terra/30 bg-intake-terra/5"
                : "border-intake-card-border bg-intake-bg-elevated"
            }`}
          >
            <h2
              id="focus-heading"
              className={`mb-3 text-xs font-semibold uppercase tracking-[0.16em] ${
                focusNutrient === "protein"
                  ? "text-intake-terra"
                  : "text-intake-ink-subtle"
              }`}
            >
              Focus: {focusRef.label}
            </h2>
            <p className="text-sm leading-relaxed text-intake-ink">
              {focusRef.lifestyleAction}
            </p>

            {focusNutrient === "protein" ? (
              <details className="group mt-4 rounded-[12px] border border-intake-card-border bg-intake-bg-elevated/40">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
                  Bereken je precieze eiwitdoel
                </summary>
                <div className="border-t border-intake-divider px-2 pb-3 pt-2">
                  <ProteinTargetCard
                    proteinMealsYesterday={proteinMealsPerDay}
                  />
                </div>
              </details>
            ) : null}
          </section>
        ) : (
          <p className="mb-6 text-center text-sm leading-relaxed text-intake-ink-muted">
            Houd vast wat voor jou werkt — je frequentie geeft geen
            aandachtspunten.
          </p>
        )}

        {otherGaps.length > 0 ? (
          <details className="group mb-4 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated/40">
            <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
              Jouw stappen ({otherGaps.length})
            </summary>
            <ul className="flex flex-col gap-2 border-t border-intake-divider px-3 pb-3 pt-3">
              {otherGaps.map((e) => (
                <li
                  key={e.nutrient}
                  className="rounded-[12px] border border-intake-card-border bg-intake-bg-elevated px-4 py-3 text-sm leading-relaxed text-intake-ink"
                >
                  <span className="font-medium text-intake-ink">
                    {nutrientReferences[e.nutrient].label}
                  </span>
                  {" — "}
                  {nutrientReferences[e.nutrient].lifestyleAction}
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {supplements.length > 0 ? (
          <details className="group mb-4 rounded-[14px] border border-intake-card-border bg-intake-bg-elevated/40">
            <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-intake-sage [&::-webkit-details-marker]:hidden">
              Supplementen, indien gewenst
            </summary>
            <ul className="flex flex-col gap-2 border-t border-intake-divider px-3 pb-3 pt-3">
              {supplements.map((item) => (
                <li key={item.nutrient}>
                  <Link
                    href={item.comparisonPath}
                    className="block rounded-[12px] border border-intake-terra/30 bg-intake-terra/5 px-4 py-3 text-sm font-medium text-intake-terra transition-colors hover:bg-intake-terra/10"
                  >
                    Vergelijk {nutrientReferences[item.nutrient].label} →
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {visibleDeltas && visibleDeltas.length > 0 ? (
          <details className="group mb-8 rounded-[14px] border border-intake-sage/30 bg-intake-sage/10">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-intake-ink-muted [&::-webkit-details-marker]:hidden">
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
            <ul className="flex flex-col gap-2 border-t border-intake-divider px-3 pb-3 pt-3">
              {visibleDeltas.map((d, i) => (
                <li
                  key={i}
                  className="rounded-[12px] border border-intake-sage/30 bg-intake-sage/10 px-4 py-3 text-sm leading-relaxed text-intake-ink-muted"
                >
                  {deltaStatementFor(d)}
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <div className="mt-8 space-y-4 text-center">
          {fromDashboard ? (
            <Link
              href={dashboardHref}
              onClick={handleDashboardReturn}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-intake-terra px-6 py-3.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
            >
              Terug naar dashboard →
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] border border-intake-card-border bg-intake-bg-elevated px-6 py-3.5 text-sm font-semibold text-intake-ink no-underline transition-colors hover:bg-intake-bg-elevated/80"
            >
              Sluiten
            </Link>
          )}
          {!fromDashboard ? (
            <p className="text-xs leading-relaxed text-intake-ink-subtle">
              Of{" "}
              <Link
                href="/intake"
                className="font-medium text-intake-sage underline decoration-intake-sage/35 underline-offset-[3px] hover:decoration-intake-sage"
              >
                doe de volledige Leefstijlcheck
              </Link>{" "}
              voor jouw volgorde over alle pijlers.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
