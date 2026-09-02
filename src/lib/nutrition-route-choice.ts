import { nutrientReferences, NUTRIENT_IDS, type NutrientId } from "@/data/nutrition/intake-reference";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { NutrientRouteStatus, RouteStatus } from "@/lib/nutrition-route-status";
import type { VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";

/**
 * Waar iemand deze stof vandaan gaat halen: van zijn bord, uit een potje, of
 * uit allebei.
 *
 * ## Waarom dit een eigen keuze is en geen afgeleide
 *
 * `nutrition-route-status.ts` beantwoordt de vraag *waar sta je* — een oordeel
 * uit de check. Dit bestand beantwoordt de vraag die daarná komt en die alleen
 * de gebruiker kan beantwoorden: *en wat ga je eraan doen?* Twee mannen met
 * exact dezelfde `gap` op eiwit kiezen verschillend, en dat verschil is geen
 * meetfout maar de kern van de zaak. Wij mogen de status berekenen; de route
 * kiest hij.
 *
 * ## Waarom er geen tabel voor is
 *
 * De keuze woont in `account_favorites`, onder een eigen id-vorm — dezelfde
 * afweging als `nutritionSourceFavoriteId`. Een keuze is een bewaarde rij, en
 * dat is precies wat die tabel al doet, inclusief de weg naar Keuze ›
 * Favorieten waar hij hem terugziet. Een eigen tabel zou een tweede stand
 * introduceren die met de eerste uit de pas kan lopen.
 *
 * Vorm: `voeding-route-<nutrient>-<keuze>`. Eén keuze tegelijk per stof: bij
 * het kiezen wordt de vorige weggeschreven, zodat er nooit twee routes voor
 * dezelfde stof naast elkaar staan.
 */

export type NutritionRouteChoice = "bord" | "potje" | "beide";

export const NUTRITION_ROUTE_CHOICES: readonly NutritionRouteChoice[] = [
  "bord",
  "potje",
  "beide",
];

const PREFIX = "voeding-route-";

export function nutritionRouteChoiceId(
  nutrient: NutrientId,
  choice: NutritionRouteChoice,
): string {
  return `${PREFIX}${nutrient}-${choice}`;
}

/**
 * Nutriënt-ids bevatten zelf een underscore (`vitamin_d`), dus splitsen op het
 * eerste koppelteken werkt niet — matchen op de gesloten set van vijf wel.
 * Zelfde vorm als `parseNutritionSourceFavorite`.
 */
export function parseNutritionRouteChoice(
  itemId: string,
): { nutrient: NutrientId; choice: NutritionRouteChoice } | null {
  if (!itemId.startsWith(PREFIX)) {
    return null;
  }
  const rest = itemId.slice(PREFIX.length);
  for (const nutrient of NUTRIENT_IDS) {
    if (!rest.startsWith(`${nutrient}-`)) {
      continue;
    }
    const tail = rest.slice(nutrient.length + 1);
    const choice = NUTRITION_ROUTE_CHOICES.find((option) => option === tail);
    return choice ? { nutrient, choice } : null;
  }
  return null;
}

/** De keuze die nu bewaard staat voor deze stof, of `null` als hij nog niets koos. */
export function resolveNutritionRouteChoice(
  nutrient: NutrientId,
  items: readonly VoortgangFavoriteItem[],
): NutritionRouteChoice | null {
  for (const item of items) {
    const parsed = parseNutritionRouteChoice(item.id);
    if (parsed && parsed.nutrient === nutrient) {
      return parsed.choice;
    }
  }
  return null;
}

/**
 * Mag hij deze route kiezen?
 *
 * `bord` mag altijd — je bord meer laten doen is nooit een verkeerd antwoord,
 * ook niet als de route al staat. `potje` en `beide` hangen aan dezelfde deur
 * als de vergelijk-link in `NutrientRoutePanel`: alleen waar het bord de stof
 * aantoonbaar niet meer kan leveren. Dat is geen dubbele regel maar dezelfde,
 * en hij hóórt hier te staan — anders is de keuzeknop een omweg om de
 * laag-6-poort heen.
 */
export function isRouteChoiceAllowed(
  choice: NutritionRouteChoice,
  status: NutrientRouteStatus,
  gateOpen: boolean,
): boolean {
  if (choice === "bord") {
    return true;
  }
  return gateOpen && status.supplementDoorOpen;
}

/**
 * Waarom een dichte keuze dicht is, in de bewoording van de stof zelf. Een
 * uitgegrijsde knop zonder reden leest als een storing; met reden leest hij
 * als een oordeel — en dat is het ook.
 */
export function routeChoiceBlockedReason(
  status: NutrientRouteStatus,
  gateOpen: boolean,
): string {
  if (!gateOpen) {
    return "Eerst je voedingsbasis. Zolang die niet staat, vergelijken we nog niets.";
  }
  return status.doorReasonNl;
}

const CHOICE_LABEL: Record<NutritionRouteChoice, string> = {
  bord: "Uit mijn eten",
  potje: "Uit een supplement",
  beide: "Allebei",
};

export function routeChoiceLabel(choice: NutritionRouteChoice): string {
  return CHOICE_LABEL[choice];
}

/**
 * Wat de keuze betekent voor deze stof, in één regel onder de knoppen. Bewust
 * per stof en niet generiek: "uit mijn eten" betekent bij vitamine D iets
 * anders (naar buiten) dan bij eiwit (drie momenten), en een generieke zin zou
 * bij precies die twee onzin worden.
 */
export function routeChoiceConfirmation(
  choice: NutritionRouteChoice,
  status: NutrientRouteStatus,
): string {
  const route = status.route;
  switch (choice) {
    case "bord":
      return `Je haalt dit uit je eten. ${route.actionNl} Dat staat nu op je lijst.`;
    case "potje":
      return `Je vult dit aan. ${route.boardCannotCoverNl}`;
    case "beide":
      return `Je doet allebei: ${route.actionNl.toLowerCase()} én aanvullen zolang je route nog niet staat.`;
  }
}

/** De titel waaronder de keuze op Keuze › Favorieten terugkomt. */
export function routeChoiceFavoriteTitle(
  nutrient: NutrientId,
  choice: NutritionRouteChoice,
): string {
  return `${nutrientReferences[nutrient].label}: ${routeChoiceLabel(choice).toLowerCase()}`;
}

/**
 * De regel onder een bewaarde routekeuze op het schap: waar hij voor staat en
 * wat de drempel is. Tegenhanger van `nutritionSourceFavoriteContext`.
 */
export function routeChoiceFavoriteContext(itemId: string): string | null {
  const parsed = parseNutritionRouteChoice(itemId);
  if (!parsed) {
    return null;
  }
  const route = nutrientRoute(parsed.nutrient);
  return `Je route voor ${nutrientReferences[parsed.nutrient].label.toLowerCase()} · ${route.thresholdNl}`;
}

/**
 * Of deze stof nog een keuze open heeft staan.
 *
 * `covered` telt niet mee: daar valt niets te kiezen, want de route loopt al.
 * `unmeasured` ook niet — zonder antwoord geen keuze. Deze filter woont hier
 * en niet in een component, zodat Kompas en Keuze hem delen in plaats van hem
 * elk apart te herhalen.
 */
export function routeNeedsChoice(
  status: NutrientRouteStatus,
  items: readonly VoortgangFavoriteItem[],
): boolean {
  if (status.status === "covered" || status.status === "unmeasured") {
    return false;
  }
  return resolveNutritionRouteChoice(status.nutrient, items) === null;
}

const UNSET: readonly RouteStatus[] = ["covered", "unmeasured"];

/** Alleen de stoffen waar een keuze te maken valt, in de volgorde die binnenkomt. */
export function routesWithOpenChoice(
  statuses: readonly NutrientRouteStatus[],
): NutrientRouteStatus[] {
  return statuses.filter((status) => !UNSET.includes(status.status));
}

/**
 * De statuskleur per route, als hex.
 *
 * Tot 1 september stond deze tabel drie keer in de codebase: in
 * `NutrientRoutePanel`, in `NutrientRouteChoiceCard` en in `SchapView` — elk
 * als eigen Tailwind-klasse. Zolang alle drie hetzelfde tonen valt dat niet
 * op; zodra er een vierde drager bij komt (de stofchips) is het een kwestie
 * van tijd voor een route op het ene scherm oranje is en op het andere groen.
 *
 * Hex en geen klassenaam, want de chips kleuren een stip via `style` en
 * Tailwind kan een klasse die hij niet letterlijk in de bron ziet staan niet
 * in de build meenemen.
 */
export const ROUTE_STATUS_COLOR: Record<RouteStatus, string> = {
  covered: "#9CC5A9",
  partial: "#C99A3C",
  gap: "#C8956C",
  off_route: "#C8956C",
  unmeasured: "#7E8C82",
};

/** Het statuslabel, in de taal van het keuzescherm. Zelfde bron, zelfde woorden. */
export const ROUTE_STATUS_LABEL: Record<RouteStatus, string> = {
  covered: "Haal je uit je eten",
  partial: "Onderweg",
  gap: "Hier ligt winst",
  off_route: "Niet via je bord",
  unmeasured: "Niet gemeten",
};

/**
 * Of deze route matcht op een zoekterm.
 *
 * ## Waarom de bronnen meetellen
 *
 * Bij vijf stoffen zou zoeken op alleen de stofnaam meubilair zijn — daar zijn
 * de chips voor. De zoekterm die er wél toe doet is de andere: iemand die
 * "haring" of "kwark" typt weet níet welke stof daarbij hoort, en dat is
 * precies de vraag die het logboek beantwoordt. Zoeken op bron leidt hem naar
 * de stof; zoeken op stof leidt hem naar de bron. Beide kanten op.
 *
 * Dat is ook de reden dat dit meegroeit: komt er een zesde stof bij, of een
 * langere bronnenlijst, dan werkt hetzelfde veld zonder aanpassing.
 *
 * Accentloos en hoofdletterongevoelig, want "Magnésium" en "magnesium" horen
 * hetzelfde te vinden — een gebruiker die een accent typt of juist weglaat mag
 * daar geen leeg scherm voor terugkrijgen.
 */
export function routeMatchesQuery(
  status: NutrientRouteStatus,
  query: string,
): boolean {
  const needle = normalizeSearch(query);
  if (needle.length === 0) {
    return true;
  }
  const haystack = [
    status.label,
    status.route.thresholdNl,
    status.route.actionNl,
    ...status.sources.map((source) => source.labelNl),
  ];
  return haystack.some((entry) => normalizeSearch(entry).includes(needle));
}

/** Kleine letters, accenten weg, randspaties weg. Eén plek, zodat naald en hooiberg gelijk normaliseren. */
function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
