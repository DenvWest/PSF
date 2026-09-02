import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import type { FoodSource } from "@/data/nutrition/food-sources";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import {
  NUTRIENT_ROUTE_ORDER,
  nutrientRoute,
  routeCarriesVerdict,
  type NutrientRoute,
} from "@/data/nutrition/nutrient-routes";
import { nutritionSliderQuestion } from "@/data/nutrition/lifescore-questions";
import {
  resolveNutritionOptOut,
  type NutritionLadderReport,
} from "@/lib/nutrition-ladder";

/**
 * "Haal je dit uit je eten, of niet?" — per nutriënt, met de route ernaast.
 *
 * Dit is de veralgemening van wat omega-3 al deed. De vraag die de gebruiker
 * stelt is steeds dezelfde: *wat moet ik eten om hier vanaf te komen, en
 * wanneer lukt dat niet meer met eten?* Voor omega-3 was dat antwoord er al
 * ("2× vette vis per week, anders een supplement"); voor de andere vier stond
 * het nergens.
 *
 * ## Wat hier bewust niet gebeurt
 *
 * Er komt **geen milligram-som** uit deze module. Niet als getal, niet als
 * percentage van een ADH, niet als "nog zoveel te gaan". De check meet
 * frequenties en `food-sources.ts` staat op `verified: false` — een som zou
 * schijnprecisie zijn, en bij magnesium en zink bepaalt fytaat de opname méér
 * dan het gehalte. Zie de kop van `nutrient-routes.ts`.
 *
 * Wat er wél uitkomt: waar hij staat ten opzichte van een drempel in de
 * eenheid die we echt meten, wat de eerstvolgende handeling is, welke bronnen
 * die handeling dragen, en — alleen wanneer de route dicht zit — de deur naar
 * vergelijken.
 */

/**
 * Waar iemand staat op één voedingsroute.
 *
 * `covered` en `gap` zijn oordelen; `unmeasured` zegt dat we het niet weten en
 * `off_route` dat deze route voor hem niet bestaat (hij eet geen vis). Die
 * laatste twee zijn geen zwakkere vorm van `gap` — ze zijn een andere soort
 * uitkomst, en de UI hoort ze ook anders te tonen.
 */
export type RouteStatus = "covered" | "partial" | "gap" | "off_route" | "unmeasured";

export type NutrientRouteStatus = {
  nutrient: NutrientId;
  /** Gebruikerslabel van de stof: "Magnesium". */
  label: string;
  route: NutrientRoute;
  status: RouteStatus;
  /** Letterlijk zijn eigen antwoord op de vraag die deze route meet. */
  answerLabel: string | null;
  /**
   * Of we op deze status een tekort mogen uitspreken. Bij een `proxy`-route
   * niet: er is geen grens in de eenheid die we meten, dus "je komt tekort"
   * zou een precisie claimen die er niet is. De UI toont dan een richting
   * ("hier ligt winst") in plaats van een oordeel.
   */
  carriesVerdict: boolean;
  /** De sterkste bronnen voor deze route, met hun reden. */
  sources: readonly (FoodSource & { whyNl: string })[];
  /**
   * Of de supplement-deur voor déze stof open mag. Alleen wanneer de
   * voedingsroute aantoonbaar dicht zit — niet bij een gat dat je met eten
   * kunt dichten.
   */
  supplementDoorOpen: boolean;
  /** Waarom de deur open of dicht staat, in gebruikerstaal. */
  doorReasonNl: string;
  /** Bestaand `/beste/*`-pad. Alleen volgen wanneer de deur open is. */
  comparisonPath: string;
};

function answerFor(report: NutritionLadderReport, sliderId: string): string | null {
  const question = nutritionSliderQuestion(sliderId);
  const index = report.sliders[sliderId];
  if (!question || typeof index !== "number" || !Number.isFinite(index)) {
    return null;
  }
  const clamped = Math.min(Math.max(Math.trunc(index), 0), question.stops.length - 1);
  return question.stops[clamped]?.label ?? null;
}

/**
 * De drempel per route, uitgedrukt als slider-index. Eén plek, zodat de
 * drempel in `thresholdNl` en de grens in de code niet uiteen kunnen lopen.
 *
 * `partialFrom` is de stop waarop hij "onderweg" is; `coveredFrom` de stop
 * waarop de route staat. Bij de twee proxy-routes ligt `coveredFrom` bewust
 * niet op de hoogste stop: we beweren daar geen dekking, alleen dat de bron
 * dagelijks aanwezig is.
 */
const ROUTE_STOPS: Record<NutrientId, { partialFrom: number; coveredFrom: number }> = {
  // oilyFish, perWeek: 0 nooit · 1 = 1×/week (Gezondheidsraad-basis) · 2 = 2×.
  omega3: { partialFrom: 1, coveredFrom: 2 },
  // proteinMeals, perDay: 3 = drie eiwitrijke momenten (PROT-AGE).
  protein: { partialFrom: 2, coveredFrom: 3 },
  // daylight: 2 = 3×/week · 5 = dagelijks.
  vitamin_d: { partialFrom: 2, coveredFrom: 5 },
  // vegetables, perDay: proxy — 2 porties is onderweg, 3 is dagelijks aanwezig.
  magnesium: { partialFrom: 2, coveredFrom: 3 },
  // meatLegumes, perDay: proxy — 1 portie is onderweg, 2 is dagelijks aanwezig.
  zinc: { partialFrom: 1, coveredFrom: 2 },
};

/** De opt-out die deze route helemaal afsluit, waar die bestaat. */
const ROUTE_OPT_OUT: Partial<
  Record<NutrientId, "oilyFish" | "meatLegumes" | "dairy" | "nutsSeedsLegumes" | "wholegrain">
> = {
  omega3: "oilyFish",
  zinc: "meatLegumes",
};

function resolveStatus(
  nutrient: NutrientId,
  report: NutritionLadderReport,
): { status: RouteStatus; answerLabel: string | null } {
  const route = nutrientRoute(nutrient);
  const answerLabel = answerFor(report, route.sliderId);

  const optOutSlider = ROUTE_OPT_OUT[nutrient];
  if (optOutSlider && resolveNutritionOptOut(optOutSlider, report)) {
    return { status: "off_route", answerLabel };
  }

  const index = report.sliders[route.sliderId];
  if (typeof index !== "number" || !Number.isFinite(index)) {
    return { status: "unmeasured", answerLabel };
  }

  const stops = ROUTE_STOPS[nutrient];
  if (index >= stops.coveredFrom) return { status: "covered", answerLabel };
  if (index >= stops.partialFrom) return { status: "partial", answerLabel };
  return { status: "gap", answerLabel };
}

/**
 * Mag de supplement-deur voor déze stof open?
 *
 * Dit is de per-stof tegenhanger van de laag-6-poort, en hij is strenger dan
 * "er is een tekort". Een gat dat je met eten kunt dichten is precies het gat
 * dat je met eten hóórt te dichten — dan blijft de deur dicht en staat de
 * route ervoor in de plaats. De deur gaat alleen open waar het bord de stof
 * aantoonbaar niet meer kan leveren:
 *
 * - **off_route** — hij eet de bron niet (geen vis → geen EPA/DHA). Het bord
 *   heeft hier geen alternatief, en dat is geen keuze die wij terugdraaien.
 * - **vitamine D in het winterhalfjaar** — de zon staat in Nederland te laag;
 *   geen enkel eetpatroon dicht dit. Aanvullen is dan de normale route.
 *
 * Bij `covered` blijft de deur dicht om de omgekeerde reden: er valt niets aan
 * te vullen. Dat is dezelfde regel als de laag-6-poort, één niveau fijner.
 */
function resolveDoor(
  nutrient: NutrientId,
  status: RouteStatus,
  route: NutrientRoute,
  isDarkSeason: boolean,
): { open: boolean; reasonNl: string } {
  if (status === "off_route") {
    return { open: true, reasonNl: route.boardCannotCoverNl };
  }
  if (nutrient === "vitamin_d" && isDarkSeason && status !== "covered") {
    return { open: true, reasonNl: route.boardCannotCoverNl };
  }
  if (status === "covered") {
    return {
      open: false,
      // Vitamine D komt van je huid, niet van je bord — "uit je eten" zou daar
      // de hele boodschap van de route tegenspreken.
      reasonNl:
        nutrient === "vitamin_d"
          ? "Je komt genoeg buiten. Dan is er niets om aan te vullen."
          : "Je haalt dit uit je eten. Dan is er niets om aan te vullen.",
    };
  }
  if (status === "unmeasured") {
    return {
      open: false,
      reasonNl: "Deze vraag stelden we je nog niet — zonder antwoord geen advies.",
    };
  }
  return {
    open: false,
    // Vitamine D in het lichte halfjaar is het enige gat dat je met je agenda
    // dicht in plaats van met je bord. Hetzelfde onderscheid als hierboven.
    reasonNl:
      nutrient === "vitamin_d"
        ? `Dit haal je zelf binnen: ${route.actionNl.toLowerCase()}`
        : `Dit kun je met je bord dichten: ${route.actionNl.toLowerCase()}`,
  };
}

function sourcesFor(route: NutrientRoute): (FoodSource & { whyNl: string })[] {
  const table = FOOD_SOURCES[route.nutrient];
  const out: (FoodSource & { whyNl: string })[] = [];
  for (const entry of route.sources) {
    const match = table.find((source) => source.key === entry.foodSourceKey);
    if (match) {
      out.push({ ...match, whyNl: entry.whyNl });
    }
  }
  return out;
}

export function buildNutrientRouteStatus(
  nutrient: NutrientId,
  report: NutritionLadderReport,
  options: { isDarkSeason?: boolean } = {},
): NutrientRouteStatus {
  const route = nutrientRoute(nutrient);
  const { status, answerLabel } = resolveStatus(nutrient, report);
  const door = resolveDoor(nutrient, status, route, options.isDarkSeason === true);

  return {
    nutrient,
    label: nutrientReferences[nutrient].label,
    route,
    status,
    answerLabel,
    carriesVerdict: routeCarriesVerdict(route),
    sources: sourcesFor(route),
    supplementDoorOpen: door.open,
    doorReasonNl: door.reasonNl,
    comparisonPath: nutrientReferences[nutrient].comparisonPath,
  };
}

/** Alle vijf routes, in de vaste volgorde: bord-eerst, huid apart. */
export function buildNutrientRouteStatuses(
  report: NutritionLadderReport,
  options: { isDarkSeason?: boolean } = {},
): NutrientRouteStatus[] {
  return NUTRIENT_ROUTE_ORDER.map((nutrient) =>
    buildNutrientRouteStatus(nutrient, report, options),
  );
}

/**
 * De routes die nu je aandacht vragen, sterkste signaal eerst.
 *
 * Een open deur staat bovenaan omdat daar een keuze te maken valt die eten
 * niet oplost. Daarna de gaten die je wél kunt eten — dat is de volgorde van
 * de noordster, en niet die van het schap.
 */
export function sortRoutesByAttention(
  statuses: readonly NutrientRouteStatus[],
): NutrientRouteStatus[] {
  const rank: Record<RouteStatus, number> = {
    gap: 1,
    partial: 2,
    off_route: 3,
    unmeasured: 4,
    covered: 5,
  };
  return [...statuses].sort((a, b) => {
    if (a.supplementDoorOpen !== b.supplementDoorOpen) {
      return a.supplementDoorOpen ? -1 : 1;
    }
    return rank[a.status] - rank[b.status];
  });
}
