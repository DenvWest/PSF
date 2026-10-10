import type { NutrientId } from "@/data/nutrition/intake-reference";
import {
  etenKeuzeId,
  isStofKeuzeFavoriet,
  itemMomentIdsVoor,
  momentKeuzeIdsVoorStof,
  productKeuzeIdsVoorStof,
} from "@/lib/keuze-product-keuze";
import {
  nutritionRouteChoiceId,
  parseNutritionRouteChoice,
  resolveNutritionRouteChoice,
  routeChoiceFavoriteTitle,
} from "@/lib/nutrition-route-choice";
import type { VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";

/**
 * Wat een wisactie in de zijkolom met je bewaarde keuzes doet: welke items
 * eruit gaan en welke erbij komen. Het omgekeerde plan is de "Ongedaan maken".
 * De dagboeksterren blijven staan — dit wist alleen je keuzes, niet je dagboek.
 */
export type WisPlan = { verwijder: VoortgangFavoriteItem[]; voegToe: VoortgangFavoriteItem[] };

export function omgekeerdWisPlan(plan: WisPlan): WisPlan {
  return { verwijder: plan.voegToe, voegToe: plan.verwijder };
}

function metIds(items: readonly VoortgangFavoriteItem[], ids: readonly string[]): VoortgangFavoriteItem[] {
  const set = new Set(ids);
  return items.filter((item) => set.has(item.id));
}

export function planEtenWeg(
  nutrient: NutrientId,
  key: string,
  items: readonly VoortgangFavoriteItem[],
): WisPlan {
  return {
    verwijder: metIds(items, [etenKeuzeId(nutrient, key), ...itemMomentIdsVoor(nutrient, key, items)]),
    voegToe: [],
  };
}

/** Het supplement met zijn moment; koos je ook eten (route "beide"), dan blijft "uit mijn eten" staan. */
export function planSupplementWeg(nutrient: NutrientId, items: readonly VoortgangFavoriteItem[]): WisPlan {
  const route = resolveNutritionRouteChoice(nutrient, items);
  const routeIds = items
    .filter((item) => parseNutritionRouteChoice(item.id)?.nutrient === nutrient)
    .map((item) => item.id);
  const ids = [
    ...productKeuzeIdsVoorStof(nutrient, items),
    ...momentKeuzeIdsVoorStof(nutrient, items, "supplement"),
    ...routeIds,
  ];
  const voegToe: VoortgangFavoriteItem[] =
    route === "beide"
      ? [
          {
            id: nutritionRouteChoiceId(nutrient, "bord"),
            title: routeChoiceFavoriteTitle(nutrient, "bord"),
            kind: "activiteit",
            domain: "voeding",
            source: "mijn_keuze",
          },
        ]
      : [];
  return { verwijder: metIds(items, ids), voegToe };
}

export function planAllesWeg(items: readonly VoortgangFavoriteItem[]): WisPlan {
  return { verwijder: items.filter((item) => isStofKeuzeFavoriet(item.id)), voegToe: [] };
}
