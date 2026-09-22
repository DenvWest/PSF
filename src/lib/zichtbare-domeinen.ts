import type { PillarId } from "@/types/dashboard";

/**
 * Welke domeinen het dashboard tóónt.
 *
 * ## Waarom dit bestand bestaat
 *
 * Verbinding is per 5 september uit de interface, stress per 22 september.
 * Niet omdat die domeinen niet meetbaar zouden zijn, maar omdat dit platform
 * over voeding en supplementen gaat: op verbinding valt niets te vergelijken
 * en niets te kiezen, en stress heeft dezelfde lege plank — geen ladderlagen,
 * geen schap, geen keuze. Een domein dat op elk scherm niets toevoegt kost
 * aandacht die naar het dagboek en de vergelijking hoort te gaan.
 *
 * Slaap en beweging blijven wél staan: die dragen het voeding/supplement-
 * verhaal mee (slaapkwaliteit en herstel zijn de aanleiding waarvoor mensen
 * magnesium zoeken) en ze draaien op een echt scherm, niet op een prebuild.
 *
 * De domeinlijst stond in ruim tien bestanden los herhaald — de Kompas-rail,
 * de URL-parser, het schap, de agenda-categorieën, de dev-data. Eén domein
 * verbergen betekende tien keer dezelfde bewerking, en dat is precies het soort
 * wijziging waarbij er één achterblijft. Dit bestand is die ene plek.
 *
 * ## Wat dit expliciet níét doet
 *
 * **De score blijft bestaan.** `connection_score` en `stress_score` worden
 * onverminderd berekend, opgeslagen en meegewogen in vitaliteit — dat is het
 * gemiddelde van vijf interventiedomeinen (zie `vitaliteit.ts`), en er een
 * uit halen zou elke bestaande vitaliteitsscore veranderen zonder dat er aan
 * iemands gedrag iets veranderde. Bij hermeting leest dat als vooruitgang die
 * er niet is. De check blijft die vragen dus gewoon stellen, en oude sessies
 * blijven leesbaar.
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
export const VERBORGEN_DOMEINEN: readonly PillarId[] = ["verbinding", "stress"];

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
 * Slaap en beweging blijven in de Voortgang-rail en op de hub staan — hun
 * cijfer mag je lezen — maar hun ladderlagen zijn nog leeg, dus een klik landt
 * op een scherm dat niets toevoegt. Voeding heeft wél lagen, en is daarom de
 * enige die doorklikt.
 *
 * Stress staat hier niet meer bij: dat domein is sinds 22 september helemaal
 * verborgen (`VERBORGEN_DOMEINEN`), dus het haalt de rail überhaupt niet.
 *
 * Terugzetten is deze lijst uitbreiden. Niet `VERBORGEN_DOMEINEN`: dat haalt
 * een domein helemaal uit beeld, en hier moet het cijfer juist blijven.
 */
export const KLIKBARE_VOORTGANG_DOMEINEN: readonly PillarId[] = ["voeding"];

export function isKlikbaarVoortgangDomein(domain: PillarId): boolean {
  return KLIKBARE_VOORTGANG_DOMEINEN.includes(domain);
}
