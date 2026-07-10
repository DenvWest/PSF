"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import NutritionIntakeHero from "@/components/intake/NutritionIntakeHero";
import ProteinTargetCard from "@/components/intake/ProteinTargetCard";
import {
  nutrientReferences,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import { trackEvent } from "@/lib/ga4";
import type { NutritionAdviceItem } from "@/lib/nutrition-advice";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import { deltaStatementFor, type NutrientDelta } from "@/lib/nutrition-delta";
import { getVitalityBandMessage } from "@/lib/vitality-gauge";

interface NutritionResultViewProps {
  score: number;
  estimate: IntakeEstimate[];
  statements: string[];
  advice: NutritionAdviceItem[];
  delta: NutrientDelta[] | null;
  proteinMealsPerDay?: number;
  fromDashboard: boolean;
  originDomain: string | null;
}

const KOMPAS_LIGHT_PANEL =
  "overflow-hidden rounded-[28px] border border-[#e4e0da] bg-gradient-to-b from-[#fefdfb] to-white shadow-[0_16px_48px_rgba(15,28,16,0.10)]";

export default function NutritionResultView({
  score,
  estimate,
  statements,
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
  const supplementRevealTracked = useRef(false);

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
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className={`w-full max-w-lg px-6 py-8 sm:px-8 ${KOMPAS_LIGHT_PANEL}`}>
        <h1 className="mb-4 text-center font-serif text-3xl font-normal text-[#1c1917]">
          Je voedingsscore
        </h1>

        <NutritionIntakeHero
          score={score}
          estimate={estimate}
          statements={statements}
        />

        <p className="mb-8 text-center text-sm leading-relaxed text-[#57534e]">
          {getVitalityBandMessage(score, "Je voeding")} Een reflectie van hoe vaak je
          iets eet — geen diagnose.
        </p>

        <h2 className="mb-2 text-center font-serif text-xl font-normal text-[#1c1917]">
          Wat je binnenkrijgt
        </h2>
        <p className="mb-4 text-center text-sm font-medium text-[#1c1917]">
          {summaryLine}
        </p>

        {focusRef ? (
          <section
            aria-labelledby="focus-heading"
            className={`mb-6 rounded-[14px] border px-5 py-5 ${
              focusNutrient === "protein"
                ? "border-[#C8956C]/35 bg-[#C8956C]/[0.08]"
                : "border-[#ebe7e2] bg-[#faf9f7]"
            }`}
          >
            <h2
              id="focus-heading"
              className={`mb-3 text-xs font-semibold uppercase tracking-[0.16em] ${
                focusNutrient === "protein"
                  ? "text-[#B07F52]"
                  : "text-[#78716c]"
              }`}
            >
              Focus: {focusRef.label}
            </h2>
            <p className="text-sm leading-relaxed text-[#1c1917]">
              {focusRef.lifestyleAction}
            </p>

            {focusNutrient === "protein" ? (
              <details className="group mt-4 rounded-[12px] border border-[#ebe7e2] bg-white/60">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-[#5A8F6A] [&::-webkit-details-marker]:hidden">
                  Bereken je precieze eiwitdoel
                </summary>
                <div className="border-t border-[#ebe7e2] px-2 pb-3 pt-2">
                  <ProteinTargetCard
                    surface="light"
                    proteinMealsYesterday={proteinMealsPerDay}
                  />
                </div>
              </details>
            ) : null}
          </section>
        ) : (
          <p className="mb-6 text-center text-sm leading-relaxed text-[#57534e]">
            Houd vast wat voor jou werkt — je frequentie geeft geen
            aandachtspunten.
          </p>
        )}

        {otherGaps.length > 0 ? (
          <details className="group mb-4 rounded-[14px] border border-[#ebe7e2] bg-[#faf9f7]">
            <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-[#5A8F6A] [&::-webkit-details-marker]:hidden">
              Jouw stappen ({otherGaps.length})
            </summary>
            <ul className="flex flex-col gap-2 border-t border-[#ebe7e2] px-3 pb-3 pt-3">
              {otherGaps.map((e) => (
                <li
                  key={e.nutrient}
                  className="rounded-[12px] border border-[#ebe7e2] bg-white px-4 py-3 text-sm leading-relaxed text-[#1c1917]"
                >
                  <span className="font-medium text-[#1c1917]">
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
          <details className="group mb-4 rounded-[14px] border border-[#ebe7e2] bg-[#faf9f7]">
            <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-[#5A8F6A] [&::-webkit-details-marker]:hidden">
              Supplementen, indien gewenst
            </summary>
            <ul className="flex flex-col gap-2 border-t border-[#ebe7e2] px-3 pb-3 pt-3">
              {supplements.map((item) => (
                <li key={item.nutrient}>
                  <Link
                    href={item.comparisonPath}
                    className="block rounded-[12px] border border-[#C8956C]/30 bg-[#C8956C]/5 px-4 py-3 text-sm font-medium text-[#B07F52] transition-colors hover:bg-[#C8956C]/10"
                  >
                    Vergelijk {nutrientReferences[item.nutrient].label} →
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {visibleDeltas && visibleDeltas.length > 0 ? (
          <details className="group mb-8 rounded-[14px] border border-[#5A8F6A]/30 bg-[#5A8F6A]/10">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-[#57534e] [&::-webkit-details-marker]:hidden">
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
            <ul className="flex flex-col gap-2 border-t border-[#ebe7e2] px-3 pb-3 pt-3">
              {visibleDeltas.map((d, i) => (
                <li
                  key={i}
                  className="rounded-[12px] border border-[#5A8F6A]/30 bg-white/70 px-4 py-3 text-sm leading-relaxed text-[#57534e]"
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
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-[#C8956C] px-6 py-3.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
            >
              Terug naar dashboard →
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] border border-[#e4e0da] bg-[#faf9f7] px-6 py-3.5 text-sm font-semibold text-[#1c1917] no-underline transition-colors hover:bg-[#f5f3ef]"
            >
              Sluiten
            </Link>
          )}
          {!fromDashboard ? (
            <p className="text-xs leading-relaxed text-[#78716c]">
              Of{" "}
              <Link
                href="/intake"
                className="font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px] hover:decoration-[#5A8F6A]"
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
