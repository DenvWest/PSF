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
import type { NutrientDelta } from "@/lib/nutrition-delta";
import { getVitalityBandMessage } from "@/lib/vitality-gauge";
import NutritionEvidenceDisclosure from "@/components/evidence/NutritionEvidenceDisclosure";
import { evidenceForExtra } from "@/data/nutrition/nutrient-evidence-map";
import { withNutritionReturn } from "@/lib/nutrition-return-link";
import VerhoudingTabel from "@/components/nutrition/VerhoudingTabel";
import NutrientResultRows from "@/components/intake/NutrientResultRows";
import { buildNutrientResultRows } from "@/lib/nutrition-result-rows";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
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
  /**
   * Per stof: waar sta je, wat haalt je eten eruit, en — alleen bij een gemeten
   * gat — de deur naar vergelijken. Leeg als de sliders niet in state staan.
   */
  routeStatuses?: readonly NutrientRouteStatus[];
  /**
   * Of de supplementdeur überhaupt open mag. Komt uit `resolveNutritionGate`:
   * zonder check weten we niet of er iets aan te vullen valt, en dan blijft
   * hij dicht.
   */
  nutritionGateOpen?: boolean;
  /** Waarom de deur dicht is — een dichte deur zonder reden leest als storing. */
  nutritionGateReason?: string | null;
  proteinMealsPerDay?: number;
  fromDashboard: boolean;
  originDomain: string | null;
  loggedAt?: string | null;
  previousLoggedAt?: string | null;
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
  routeStatuses = [],
  nutritionGateOpen = false,
  nutritionGateReason = null,
  proteinMealsPerDay,
  fromDashboard,
  originDomain,
  loggedAt = null,
  previousLoggedAt = null,
}: NutritionResultViewProps) {
  const gaps = estimate.filter((e) => e.band === "below");
  const proteinEstimate = estimate.find((e) => e.nutrient === "protein");
  const proteinIsGap = proteinEstimate?.band === "below";

  const focusNutrient: NutrientId | null = proteinIsGap
    ? "protein"
    : (gaps[0]?.nutrient ?? null);

  const supplements = advice.filter(
    (a): a is Extract<NutritionAdviceItem, { kind: "supplement" }> =>
      a.kind === "supplement",
  );
  const supplementRevealTracked = useRef(false);
  const lifestyleExtraTracked = useRef(false);

  function adviceTextFor(nutrient: NutrientId): string | null {
    const fromAdvice = advice.find(
      (item): item is Extract<NutritionAdviceItem, { kind: "lifestyle" }> =>
        item.kind === "lifestyle" && item.nutrient === nutrient,
    );
    return fromAdvice?.text ?? null;
  }

  function lifestyleTextFor(nutrient: NutrientId): string {
    return adviceTextFor(nutrient) ?? nutrientReferences[nutrient].lifestyleAction;
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
  const rows = buildNutrientResultRows({
    routeStatuses,
    gateOpen: nutritionGateOpen,
    focusNutrient,
    delta,
    loggedAt,
    previousLoggedAt,
    lifestyleTextFor: adviceTextFor,
  });

  function proteinExtra(nutrient: NutrientId) {
    if (nutrient !== "protein") {
      return null;
    }
    return (
      <details className={`group ${PANEL}`}>
        <summary className={DETAILS_SUMMARY}>Bereken je precieze eiwitdoel</summary>
        <div className="border-t border-white/10 px-2 pb-3 pt-2">
          <ProteinTargetCard hideHeading proteinMealsYesterday={proteinMealsPerDay} />
        </div>
      </details>
    );
  }

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

              {focusRef && focusNutrient ? (
                <section
                  aria-labelledby="focus-heading"
                  className={`mt-6 rounded-2xl border px-5 py-4 ${
                    focusNutrient === "protein"
                      ? "border-[#C8956C]/35 bg-[#C8956C]/[0.08]"
                      : PANEL
                  }`}
                >
                  <h2
                    id="focus-heading"
                    className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#C8956C]"
                  >
                    Begin bij {focusRef.label.toLowerCase()}
                  </h2>
                  <p className="m-0 text-sm leading-relaxed text-[#F1EFE8] text-pretty">
                    {lifestyleTextFor(focusNutrient)}
                  </p>
                  {fromDashboard ? (
                    <p className="mt-3 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                      Dit is je weekpatroon-stap — geen dagelijkse tekort-meting. Zet hem op Mijn Dag
                      en bouw 14 dagen aan voordat je opnieuw logt.
                    </p>
                  ) : null}
                  {rows.length > 0 ? (
                    <a
                      href={`#stof-${focusNutrient}`}
                      className={`mt-3 inline-block text-[12.5px] ${FOOTNOTE_LINK}`}
                    >
                      Waarom, en alle {rows.length} stoffen op een rij ↓
                    </a>
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

          <details className={`group ${PANEL}`}>
            <summary className={DETAILS_SUMMARY}>Hoe werkt PerfectSupplement?</summary>
            <div className="grid gap-3 border-t border-white/10 px-5 pb-4 pt-3 text-[13px] leading-relaxed text-[#C6D1C9]">
              <p className="m-0 text-pretty">
                Je check meet hoe vaak je iets eet, per stof vergeleken met een
                richtlijn. Hieronder staat elke stof als eigen rij: wat je nu
                doet, wat de richtlijn is, en wat er te doen valt.
              </p>
              <p className="m-0 text-pretty">
                Elke rij geeft twee opties. <strong className="text-[#F1EFE8]">Bekijk jouw voeding</strong>{" "}
                brengt je naar je dagboek — voeding staat bij ons voorop, en
                voor de meeste gaten is dat de eerste stap. Lukt dat niet, of
                heb je liever een aanvulling?{" "}
                <strong className="text-[#F1EFE8]">Liever een supplement</strong> staat
                er altijd naast en brengt je naar de vergelijking voor die stof.
              </p>
              <p className="m-0 text-pretty">
                We wegen supplementen alleen op wetenschappelijk onderbouwde
                claims (EFSA) — dat bepaalt welke tekst we over een product
                mogen tonen, niet of je een supplement mag overwegen.
              </p>
            </div>
          </details>

          <NutrientResultRows
            rows={rows}
            gateNote={nutritionGateOpen ? null : nutritionGateReason}
            evidenceFrom={evidenceFrom}
            extraFor={proteinExtra}
          />

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
