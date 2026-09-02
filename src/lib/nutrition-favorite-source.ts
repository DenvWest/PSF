import { nutrientReferences, NUTRIENT_IDS, type NutrientId } from "@/data/nutrition/intake-reference";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { NutrientRouteStatus, RouteStatus } from "@/lib/nutrition-route-status";

/**
 * De herkomst van een bewaarde voedingsbron.
 *
 * Wie op zijn schap "Pompoenzaden" ziet staan, weet over twee weken niet meer
 * waaróm dat er staat. De ladder-favorieten lossen dat op met een laagnaam in
 * hun id (`laag-voeding-p1-...`, zie `parseLadderFavoriteLayer`); de bronnen
 * uit het routepaneel hebben een eigen vorm nodig, want ze horen niet bij een
 * laag maar bij een stof.
 *
 * Vorm: `voeding-bron-<nutrient>-<foodSourceKey>`. De stof staat erin zodat het
 * schap kan zeggen "voor je magnesiumroute" zonder een tweede tabel — precies
 * dezelfde afweging als bij `ladderActionFavoriteId`.
 */

const PREFIX = "voeding-bron-";

export function nutritionSourceFavoriteId(
  nutrient: NutrientId,
  foodSourceKey: string,
): string {
  return `${PREFIX}${nutrient}-${foodSourceKey}`;
}

/**
 * De stof waar een bewaarde bron bij hoort, of `null` als dit geen bronrij is.
 *
 * Nutriënt-ids bevatten zelf een underscore (`vitamin_d`), dus splitsen op het
 * eerste koppelteken werkt niet. De ids zijn een gesloten set van vijf, dus
 * matchen op prefix is zowel eenvoudiger als veiliger.
 */
export function parseNutritionSourceFavorite(
  itemId: string,
): { nutrient: NutrientId; foodSourceKey: string } | null {
  if (!itemId.startsWith(PREFIX)) {
    return null;
  }
  const rest = itemId.slice(PREFIX.length);
  for (const nutrient of NUTRIENT_IDS) {
    if (rest.startsWith(`${nutrient}-`)) {
      return { nutrient, foodSourceKey: rest.slice(nutrient.length + 1) };
    }
  }
  return null;
}

/**
 * Eén regel onder een bewaarde bron: waar hij voor staat en wat de route is.
 * Dit is wat de laagnaam doet voor een ladder-favoriet.
 */
export function nutritionSourceFavoriteContext(itemId: string): string | null {
  const parsed = parseNutritionSourceFavorite(itemId);
  if (!parsed) {
    return null;
  }
  const route = nutrientRoute(parsed.nutrient);
  return `Voor je ${nutrientReferences[parsed.nutrient].label.toLowerCase()}-route · ${route.thresholdNl}`;
}

/**
 * Waar je stáát op de route van een bewaarde bron — de tweede regel op het schap.
 *
 * ## Waarom hier geen hoeveelheid staat
 *
 * De verleiding is een getal: "nog 140 mg te gaan", of "deze bron dekt 40%".
 * Dat mag hier niet, en het is dezelfde grens als in `nutrient-routes.ts`: de
 * check meet frequenties, elke rij in `food-sources.ts` staat op
 * `verified: false`, en bij magnesium en zink bepaalt fytaat de opname méér
 * dan het gehalte. Een som zou schijnprecisie zijn op het schérm waar iemand
 * zijn keuze bewaart — precies de plek waar hij er het langst op vertrouwt.
 *
 * Wat er wél staat: zijn eigen antwoord en de richting die daaruit volgt. Dat
 * is bewustwording zonder een getal te claimen dat we niet hebben.
 *
 * `null` zodra de stof niet in de meegegeven statussen zit: dan is de route
 * niet gemeten, en zwijgen is daar het eerlijke antwoord.
 */
export function nutritionSourceFavoriteStatus(
  itemId: string,
  statuses: readonly NutrientRouteStatus[],
): { label: string; status: RouteStatus; answerLabel: string | null } | null {
  const parsed = parseNutritionSourceFavorite(itemId);
  if (!parsed) {
    return null;
  }
  const match = statuses.find((row) => row.nutrient === parsed.nutrient);
  if (!match || match.status === "unmeasured") {
    return null;
  }
  return {
    label: SCHAP_STATUS_LABEL[match.status],
    status: match.status,
    answerLabel: match.answerLabel,
  };
}

/**
 * Schap-taal per routestatus. Bewust anders dan het routepaneel: daar lees je
 * een dossier, hier kijk je naar wat je koos. "Hier ligt winst" blijft, want
 * dat is een richting en geen tekort-oordeel — bij een proxy-route mogen we
 * dat laatste niet zeggen.
 */
const SCHAP_STATUS_LABEL: Record<RouteStatus, string> = {
  covered: "Haal je uit je eten",
  partial: "Onderweg",
  gap: "Hier ligt winst",
  off_route: "Niet via je bord",
  unmeasured: "Niet gemeten",
};
