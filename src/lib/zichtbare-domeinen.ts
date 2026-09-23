import type { PillarId } from "@/types/dashboard";

/**
 * Welke domeinen het dashboard tóónt.
 *
 * ## Waarom dit bestand bestaat
 *
 * Verbinding ging op 5 september uit de interface, stress en daarna slaap en
 * beweging op 22 september. Voeding is het enige domein dat overblijft.
 *
 * Niet omdat die domeinen niet meetbaar zouden zijn, maar omdat dit platform
 * over voeding en supplementen gaat. Alleen voeding draagt een echt scherm:
 * een dagboek dat je invult, ladderlagen, een schap, een keuze. De andere vier
 * leverden een cijfer en daarna een lege plank — en een domein dat op elk
 * scherm niets toevoegt kost aandacht die naar het dagboek en de vergelijking
 * hoort te gaan.
 *
 * Dat het er nu vier zijn in plaats van één, verandert niets aan de werking:
 * de filters lopen over de lijst, dus verbergen is en blijft één regel.
 *
 * De domeinlijst stond in ruim tien bestanden los herhaald — de Kompas-rail,
 * de URL-parser, het schap, de agenda-categorieën, de dev-data. Eén domein
 * verbergen betekende tien keer dezelfde bewerking, en dat is precies het soort
 * wijziging waarbij er één achterblijft. Dit bestand is die ene plek.
 *
 * ## Wat dit expliciet níét doet
 *
 * **De scores blijven bestaan.** Elk verborgen domein wordt onverminderd
 * berekend, opgeslagen en meegewogen in vitaliteit — dat is het gemiddelde van
 * vijf interventiedomeinen (zie `vitaliteit.ts`), en er een uit halen zou elke
 * bestaande vitaliteitsscore veranderen zonder dat er aan iemands gedrag iets
 * veranderde. Bij hermeting leest dat als vooruitgang die er niet is. De check
 * blijft die vragen dus gewoon stellen, en oude sessies blijven leesbaar.
 *
 * Dit is met andere woorden een **weergavefilter**, geen engine-wijziging. Wie
 * een domein ooit dieper wil verwijderen — uit de vitaliteitsformule of uit de
 * vragenlijst — heeft een RULES_VERSION-bump plus een grens in de
 * delta-berekening nodig, en dat is een besluit op zich.
 *
 * ## Omkeerbaar
 *
 * Een domein terugzetten is het uit `VERBORGEN_DOMEINEN` halen. Dat is de reden
 * dat de filters hieronder over een lijst lopen in plaats van dat er overal
 * `!== "verbinding"` staat: het besluit hoort op één plek te staan, met zijn
 * reden erbij.
 */

/**
 * Domeinen die wel gemeten maar niet getoond worden.
 *
 * Leeg = alles zichtbaar. Elk domein hier verdwijnt uit rails, navigatie,
 * schappen en deeplinks, maar houdt zijn score.
 */
export const VERBORGEN_DOMEINEN: readonly PillarId[] = [
  "verbinding",
  "stress",
  "slaap",
  "beweging",
];

/** Wordt dit domein nog in de interface getoond? */
export function isZichtbaarDomein(domain: PillarId): boolean {
  return !VERBORGEN_DOMEINEN.includes(domain);
}

/**
 * Filtert een domeinlijst tot wat zichtbaar is, met behoud van volgorde.
 *
 * Generiek over het itemtype zodat hij zowel op kale `PillarId[]` werkt als op
 * lijsten van objecten die een domein dragen — dat scheelt twee vormen van
 * dezelfde filter.
 */
export function filterZichtbareDomeinen<T>(
  items: readonly T[],
  domainOf: (item: T) => PillarId,
): T[] {
  return items.filter((item) => isZichtbaarDomein(domainOf(item)));
}

/** Kale domeinlijst, gefilterd. */
export function zichtbareDomeinen(domains: readonly PillarId[]): PillarId[] {
  return domains.filter(isZichtbaarDomein);
}

/**
 * Welke leefstijlprofiel-domeinen nog een scherm openen.
 *
 * Sinds 22 september valt dit samen met `VERBORGEN_DOMEINEN`: alleen voeding
 * is nog zichtbaar, en die klikt ook door. De twee lijsten blijven gescheiden
 * omdat ze verschillende vragen beantwoorden — "zie ik dit domein?" en "gaat
 * het ergens heen?" — en een domein dat je wél toont maar niet laat openen is
 * een legitieme tussentoestand. Slaap en beweging stonden daar tot vandaag in.
 *
 * Terugzetten is deze lijst uitbreiden. Niet `VERBORGEN_DOMEINEN`: dat haalt
 * een domein helemaal uit beeld, en hier moet het cijfer juist blijven.
 */
export const KLIKBARE_VOORTGANG_DOMEINEN: readonly PillarId[] = ["voeding"];

export function isKlikbaarVoortgangDomein(domain: PillarId): boolean {
  return KLIKBARE_VOORTGANG_DOMEINEN.includes(domain);
}
