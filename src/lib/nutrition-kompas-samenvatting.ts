import { routeNeedsChoice } from "@/lib/nutrition-route-choice";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";
import type { NutritionCheckinReadoutData } from "@/types/dashboard";

/**
 * De twee tellingen waarop het Kompas-tweeluik van voeding rust.
 *
 * Het voeding-kompas droeg tot 1 september het volledige logboek-blok: vijf
 * stoffen met chiprij, uitklapbare dossiers, bronnen en drie knoppen per stof
 * — midden op een scherm dat over je stand en je prioriteit gaat. Dat is het
 * scherm waar je *kijkt waar je staat*, niet het scherm waar je je keuze
 * uitwerkt; dat laatste is het schap, waar hetzelfde blok uitgeklapt en mét
 * zoekveld staat.
 *
 * Wat er op Kompas hoort te staan is dus niet het logboek maar de *stand* van
 * het logboek: hoeveel stoffen vragen aandacht, en hoeveel keuzes staan er
 * open. Twee getallen, twee deuren. Deze module levert die getallen, zodat de
 * twee kaarten niet elk hun eigen telling doen.
 *
 * ## Waarom twee tellingen en niet één
 *
 * Ze beantwoorden verschillende vragen. `aandacht` komt uit je check en is
 * niet van jou: het is wat je antwoorden zeggen over je eetbasis. `open` is
 * wél van jou — het is wat er nog te kiezen valt, en het loopt leeg naarmate
 * je kiest. Een stof kan aandacht blijven vragen terwijl je de keuze al
 * maakte, en dat is precies het verschil tussen "voedingsstatus" en
 * "voedingslogboek".
 *
 * Daarom weegt `open` je bewaarde keuzes mee via {@link routeNeedsChoice} en
 * niet alleen de status: zonder die weging tellen beide kaarten praktisch
 * hetzelfde getal, en dan is het tweeluik één vraag in twee jasjes.
 */
export type NutritionKompasSamenvatting = {
  /** Stoffen waar de check winst of een gat op ziet. */
  aandacht: number;
  /** Stoffen waarvoor nog een keuze openstaat. */
  open: number;
  /** Totaal aantal stoffen dat de check beoordeelt. */
  totaal: number;
  /** De laag waar je winst zit; null zonder check. */
  focusLayer: number | null;
  /** Staat de supplement-poort open, en zo nee waarom niet. */
  gateOpen: boolean;
  gateReason: string | null;
  /** Eén regel over je eetbasis, in de bewoording van je eigen check. */
  statusLine: string;
};

/**
 * Een stof "vraagt aandacht" wanneer de check er een gat of een halve dekking
 * ziet. `off_route` niet: wie geen vis eet mist geen doel, hij heeft een ander
 * doel. `unmeasured` ook niet — niet weten is geen tekort.
 */
const NEEDS_ATTENTION: readonly NutrientRouteStatus["status"][] = ["gap", "partial"];

export function buildNutritionKompasSamenvatting(
  readout: NutritionCheckinReadoutData | null | undefined,
  favorites: readonly VoortgangFavoriteItem[] = [],
): NutritionKompasSamenvatting | null {
  if (!readout || readout.routes.length === 0) {
    return null;
  }

  const routes = readout.routes;
  const aandacht = routes.filter((route) => NEEDS_ATTENTION.includes(route.status)).length;
  const open = routes.filter((route) => routeNeedsChoice(route, favorites)).length;
  const gateOpen = readout.gate.open === true;

  return {
    aandacht,
    open,
    totaal: routes.length,
    focusLayer: readout.focusLayer,
    gateOpen,
    gateReason: gateOpen ? null : (readout.gate.reason ?? null),
    statusLine: readout.headline,
  };
}

/**
 * De regel onder de status-kaart. Telt in stoffen, niet in punten of
 * milligrammen — dezelfde eenheid waarin de check meet.
 */
export function nutritionStatusRegel(samenvatting: NutritionKompasSamenvatting): string {
  if (samenvatting.aandacht === 0) {
    return `Alle ${samenvatting.totaal} stoffen komen uit je eten.`;
  }
  return samenvatting.aandacht === 1
    ? `1 van de ${samenvatting.totaal} stoffen vraagt aandacht.`
    : `${samenvatting.aandacht} van de ${samenvatting.totaal} stoffen vragen aandacht.`;
}

/** De regel onder de logboek-kaart: wat er nog aan jou is. */
export function nutritionLogboekRegel(samenvatting: NutritionKompasSamenvatting): string {
  if (samenvatting.open === 0) {
    return "Je koos voor elke stof een route.";
  }
  return samenvatting.open === 1
    ? "Nog 1 stof zonder keuze."
    : `Nog ${samenvatting.open} stoffen zonder keuze.`;
}
