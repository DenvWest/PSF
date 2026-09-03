"use client";

import { useEffect } from "react";
import {
  FOOD_SOURCES,
  NEVO_CITATION,
  type FoodSource,
} from "@/data/nutrition/food-sources";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { formatVerifiedFoodPortionNl } from "@/lib/nutrition-p4-food-display";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { NutrientContribution } from "@/lib/nutrition-contribution";
import type {
  NutritionPersonalizationContext,
  NutritionSufficiencySummary,
  SufficiencyOutcome,
} from "@/lib/nutrition-sufficiency";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";

const OUTCOME_STYLE: Record<SufficiencyOutcome, { label: string; className: string }> = {
  sufficient: { label: "Volstaat waarschijnlijk", className: "text-[#9CC5A9]" },
  uncertain: { label: "Onzeker — meer context nodig", className: "text-[#C99A3C]" },
  insufficient: { label: "Waarschijnlijk niet genoeg", className: "text-[#C8956C]" },
};

const BAND_LABEL = {
  below: "onder de band",
  around: "rond de band",
  meets: "op de band",
} as const;

function foodSourcesForNutrient(nutrient: NutrientId): readonly FoodSource[] {
  return FOOD_SOURCES[nutrient] ?? [];
}

function formatVerifiedPortion(source: FoodSource): string | null {
  return formatVerifiedFoodPortionNl(source);
}

function BronnenSkeleton({
  nutrient,
  contribution,
}: {
  nutrient: NutrientId;
  contribution: NutrientContribution | undefined;
}) {
  const route = nutrientRoute(nutrient);
  const routeKeys = new Set(route.sources.map((source) => source.foodSourceKey));
  const tableSources = foodSourcesForNutrient(nutrient).filter((source) =>
    routeKeys.has(source.key),
  );
  const leadingFields = new Set(
    (contribution?.sources ?? [])
      .filter((source) => !source.missing && source.weighted > 0)
      .slice(0, 3)
      .map((source) => source.field),
  );

  const hasVerified = tableSources.some((source) => source.verified && source.nutrientValue);

  return (
    <div className="mt-2 rounded-lg border border-white/10 bg-black/15 px-3 py-2.5">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
        Waar komt het vandaan
      </p>
      {hasVerified ? (
        <ul className="m-0 list-none space-y-1.5 p-0">
          {tableSources.slice(0, 4).map((source) => {
            const portionLine = formatVerifiedPortion(source);
            return (
              <li key={source.key} className="text-[12px] leading-relaxed text-[#CDD7D0]">
                <span className="font-medium text-[#E7EDE8]">{source.labelNl}</span>
                {portionLine ? (
                  <span className="block text-[#9FB0A6]">{portionLine}</span>
                ) : (
                  <span className="block text-[#7E8C82]">Indicatief — bron nog niet geverifieerd</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <ul className="m-0 list-none space-y-1 p-0">
            {tableSources.slice(0, 4).map((source) => (
              <li key={source.key} className="text-[12px] text-[#CDD7D0]">
                {source.labelNl}
                {leadingFields.size > 0 ? (
                  <span className="text-[#7E8C82]"> · past bij jouw antwoorden</span>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="mb-0 mt-2 text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
            Per eten tonen we straks wat je binnenkrijgt — zodra de NEVO-bronnen zijn
            geverifieerd. Tot die tijd geen milligrammen op dit scherm.
          </p>
        </>
      )}
      {hasVerified ? (
        <p className="mb-0 mt-2 text-[10.5px] leading-relaxed text-[#7E8C82]">{NEVO_CITATION}</p>
      ) : null}
    </div>
  );
}

/**
 * P4 Op jouw situatie — volstaat je inname gegeven werk en sport?
 * NEVO-getallen alleen wanneer `verified: true`.
 */
export default function SituatieVoedingLaag({
  sufficiency,
  contribution,
  routes,
  personalization,
  surface,
  onGoP6,
}: {
  sufficiency: NutritionSufficiencySummary;
  contribution: readonly NutrientContribution[];
  routes: readonly NutrientRouteStatus[];
  personalization: NutritionPersonalizationContext;
  surface: string;
  onGoP6?: (nutrient: NutrientId) => void;
}) {
  const contributionByNutrient = new Map(contribution.map((item) => [item.nutrient, item]));

  /**
   * De invoer waarop dit oordeel rust, met de gaten zichtbaar.
   *
   * Een leeg veld is hier informatie: het zegt welke knop je kunt omzetten om
   * dit scherm scherper te maken. Daarom staan lege velden er wél in, met
   * "niet ingevuld" — weglaten zou de indruk wekken dat alles bekend is.
   */
  const situatieVelden: { label: string; waarde: string | null }[] = [
    {
      label: "Gewicht",
      waarde: personalization.weightKg != null ? `${personalization.weightKg} kg` : null,
    },
    { label: "Trainingsbelasting", waarde: sufficiency.trainingLoadLabel },
    { label: "Leeftijd", waarde: personalization.ageRange },
    {
      label: "Eiwitdoel",
      waarde: personalization.proteinTarget
        ? `${personalization.proteinTarget.gramsLow}–${personalization.proteinTarget.gramsHigh} g/dag`
        : null,
    },
  ];

  useEffect(() => {
    trackEvent("nutrition_sufficiency_view", {
      surface,
      layer_state: sufficiency.layerState,
      focus_count: sufficiency.focusNutrients.length,
    });
    emitAccountClientEvent("nutrition.sufficiency_viewed", {
      surface,
      layer_state: sufficiency.layerState,
      focus_count: sufficiency.focusNutrients.length,
    });
    clarityTag("nutrition_p4_open", "true");
  }, [surface, sufficiency.focusNutrients.length, sufficiency.layerState]);

  const gapRoutes = routes.filter(
    (route) => route.status === "gap" || route.status === "partial" || route.status === "unmeasured",
  );

  return (
    <div className="@container mt-4 flex flex-col gap-4">
      {/* Wat er van jou meeweegt, als box in plaats van als alinea.
          
          Deze laag heet "Op jouw situatie", en die situatie is niet alleen
          voeding: je gewicht, hoe hard je traint en je leeftijd sturen wat
          "genoeg" betekent. Als losse zinnen leest dat als context bij de
          lijst eronder; als box is het wat het is — de invoer waarop het
          oordeel rust, met de gaten er zichtbaar in. */}
      <section
        aria-label="Wat we van je meewegen"
        className="overflow-hidden rounded-xl border border-white/10 bg-black/20"
      >
        <p className="m-0 border-b border-white/10 px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
          Wat we van je meewegen
        </p>
        <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-0 px-3.5 py-1 @[520px]:grid-cols-3">
          {situatieVelden.map((veld) => (
            <div key={veld.label} className="min-w-0 border-b border-white/[0.06] py-2 last:border-b-0">
              <dt className="m-0 text-[10.5px] uppercase tracking-[0.08em] text-[#7E8C82]">
                {veld.label}
              </dt>
              <dd
                className={`m-0 mt-0.5 truncate text-[13px] font-semibold ${
                  veld.waarde ? "text-[#E7EDE8]" : "text-[#5F6C64]"
                }`}
                title={veld.waarde ?? undefined}
              >
                {veld.waarde ?? "niet ingevuld"}
              </dd>
            </div>
          ))}
        </dl>
        {sufficiency.contextLine ? (
          <p className="m-0 border-t border-white/10 px-3.5 py-2 text-[12px] leading-relaxed text-[#CDD7D0] text-pretty">
            {sufficiency.contextLine}
          </p>
        ) : null}
        {/* Deze laag belooft dat werk, sport en voorkeuren je stappen kleuren.
            Sport en gewicht wegen mee; werk vragen we nergens uit. Die belofte
            half waarmaken zonder het te zeggen laat de lezer denken dat een
            ploegendienst is meegenomen. */}
        {sufficiency.blindeVlekken.length > 0 ? (
          <p className="m-0 border-t border-white/10 px-3.5 py-2 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
            Nog niet meegewogen: {sufficiency.blindeVlekken.join(", ")}.
          </p>
        ) : null}
      </section>

      <section>
        <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
          Volstaat dit voor jou?
        </p>
        <p className="mb-3 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          Geen dagtotaal — wel of je band, gegeven werk en sport, waarschijnlijk genoeg is.
        </p>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {sufficiency.nutrients.map((item) => {
            const style = OUTCOME_STYLE[item.outcome];
            const contrib = contributionByNutrient.get(item.nutrient);
            return (
              <li
                key={item.nutrient}
                className="rounded-xl border border-white/10 bg-black/20 px-3.5 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-[#E7EDE8]">{item.label}</span>
                  <span className={`text-[11.5px] font-semibold ${style.className}`}>
                    {style.label}
                  </span>
                </div>
                <p className="mb-0 mt-1 text-[12px] text-[#9FB0A6]">
                  Check-band: {BAND_LABEL[item.band]}
                </p>
                {item.contextLine ? (
                  <p className="mb-0 mt-1 text-[12px] leading-relaxed text-[#CDD7D0]">
                    {item.contextLine}
                  </p>
                ) : null}
                {item.leadingSources.length > 0 ? (
                  <p className="mb-0 mt-1 text-[11.5px] text-[#7E8C82]">
                    Bij jou vooral via{" "}
                    {item.leadingSources.map((source) => source.labelNl.toLowerCase()).join(" en ")}
                  </p>
                ) : null}
                <BronnenSkeleton nutrient={item.nutrient} contribution={contrib} />
              </li>
            );
          })}
        </ul>
      </section>

      {sufficiency.focusNutrients.length > 0 ? (
        <section>
          <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
            Brug naar aanvullen (P6)
          </p>
          <p className="mb-2 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
            Wat je bord niet dekt, kun je op P6 vergelijken — eerst eten, dan pas het potje.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sufficiency.focusNutrients.map((nutrient) => {
              const label =
                sufficiency.nutrients.find((item) => item.nutrient === nutrient)?.label ?? nutrient;
              return (
                <button
                  key={nutrient}
                  type="button"
                  onClick={() => onGoP6?.(nutrient)}
                  className="cursor-pointer rounded-full border border-[#9CC5A9]/40 bg-[#9CC5A9]/10 px-2.5 py-1 text-[11.5px] font-semibold text-[#E7EDE8] transition hover:border-[#9CC5A9]"
                >
                  {label} → P6
                </button>
              );
            })}
          </div>
          {gapRoutes.length > 0 ? (
            <p className="mb-0 mt-2 text-[11.5px] text-[#7E8C82]">
              {gapRoutes.length} route{gapRoutes.length === 1 ? "" : "s"} staan open op P6.
            </p>
          ) : null}
        </section>
      ) : (
        <p className="m-0 max-w-[58ch] text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Op basis van je check en trainingsbelasting lijkt je bord te volstaan — P6 blijft
          beschikbaar als je toch wilt vergelijken.
        </p>
      )}

      {personalization.weightKg == null ? (
        <p className="m-0 text-[11.5px] text-[#7E8C82]">
          <a href="/intake" className="text-[#9CC5A9] underline-offset-2 hover:underline">
            Pas je gegevens aan
          </a>{" "}
          als gewicht of activiteit is veranderd.
        </p>
      ) : null}
    </div>
  );
}
