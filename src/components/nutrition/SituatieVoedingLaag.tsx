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
    <div className="mt-4 flex flex-col gap-4">
      <section>
        <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
          Wat we van je meewegen
        </p>
        <p className="m-0 max-w-[58ch] text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
          {sufficiency.contextLine ??
            "Vul gewicht en beweging in je profiel aan — dan kunnen we je eiwitdoel en trainingsbelasting meenemen."}
        </p>
        {sufficiency.trainingLoadLabel ? (
          <p className="mb-0 mt-1.5 text-[12px] text-[#9FB0A6]">{sufficiency.trainingLoadLabel}</p>
        ) : null}
        {/* Deze laag heet "Op jouw situatie". Zonder deze regel leest dat als
            een belofte dat álles is meegenomen — ook een ploegendienst, die we
            nergens uitvragen. */}
        {sufficiency.blindeVlekken.length > 0 ? (
          <p className="mb-0 mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
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
