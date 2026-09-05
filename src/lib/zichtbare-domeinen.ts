import type { PillarId } from "@/types/dashboard";

/**
 * Welke domeinen het dashboard tóónt.
 *
 * ## Waarom dit bestand bestaat
 *
 * Verbinding is per 5 september uit de interface. Niet omdat het domein niet
 * meetbaar zou zijn, maar omdat dit platform over supplementen gaat: op
 * verbinding valt niets te vergelijken en niets te kiezen, en een domein dat
 * op elk scherm een lege plank toont kost aandacht die naar de vergelijking
 * hoort te gaan.
 *
 * De domeinlijst stond in ruim tien bestanden los herhaald — de Kompas-rail,
 * de URL-parser, het schap, de agenda-categorieën, de dev-data. Eén domein
 * verbergen betekende tien keer dezelfde bewerking, en dat is precies het soort
 * wijziging waarbij er één achterblijft. Dit bestand is die ene plek.
 *
 * ## Wat dit expliciet níét doet
 *
 * **De score blijft bestaan.** `connection_score` wordt onverminderd berekend,
 * opgeslagen en meegewogen in vitaliteit — dat is het gemiddelde van vijf
 * interventiedomeinen (zie `vitaliteit.ts`), en verbinding daaruit halen zou
 * elke bestaande vitaliteitsscore veranderen zonder dat er aan iemands gedrag
 * iets veranderde. Bij hermeting leest dat als vooruitgang die er niet is. De
 * check blijft CON_SOC dus gewoon stellen, en oude sessies blijven leesbaar.
 *
 * Dit is met andere woorden een **weergavefilter**, geen engine-wijziging. Wie
 * verbinding ooit dieper wil verwijderen — uit de vitaliteitsformule of uit de
 * vragenlijst — heeft een RULES_VERSION-bump plus een grens in de
 * delta-berekening nodig, en dat is een besluit op zich.
 *
 * ## Omkeerbaar
 *
 * Verbinding terugzetten is `VERBORGEN_DOMEINEN` leegmaken. Dat is de reden dat
 * de filters hieronder over een lijst lopen in plaats van dat er overal
 * `!== "verbinding"` staat: het besluit hoort op één plek te staan, met zijn
 * reden erbij.
 */

/**
 * Domeinen die wel gemeten maar niet getoond worden.
 *
 * Leeg = alles zichtbaar. Elk domein hier verdwijnt uit rails, navigatie,
 * schappen en deeplinks, maar houdt zijn score.
 */
export const VERBORGEN_DOMEINEN: readonly PillarId[] = ["verbinding"];

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
