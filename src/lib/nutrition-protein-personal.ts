import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * De persoonlijke eiwitregel in het voedingslogboek — en de grens eromheen.
 *
 * ## Waarom alleen eiwit een getal krijgt
 *
 * Het logboek toont nergens milligrammen: de check meet frequenties en
 * `food-sources.ts` staat op `verified: false`, dus een som zou schijnprecisie
 * zijn (zie de kop van `nutrient-routes.ts`). Eiwit is de enige uitzondering,
 * en niet omdat het daar minder erg zou zijn maar omdat het daar iets ánders
 * is: g/kg lichaamsgewicht is een gepubliceerde, gepersonaliseerde norm
 * (PROT-AGE 2013, ESPEN 2014), geen optelling van tabelwaarden.
 *
 * Die scheiding staat al vast in `nutrient-personalization.ts` — eiwit
 * personaliseren mag, micronutriënten houden hun vaste RI. Dit bestand is de
 * UI-kant daarvan, en het houdt zich aan dezelfde grens: alleen eiwit, alleen
 * een range, en nooit het gewicht zelf.
 *
 * ## Waarom het gewicht hier niet staat
 *
 * `account-dashboard.ts` geeft bewust alleen `gramsLow`/`gramsHigh` aan de
 * client door, niet de kilo's en niet de g/kg-factor. Uit een range van 5 g
 * nauwkeurig is het gewicht niet terug te rekenen; uit "1,2 g/kg en 110 g" wel.
 * Dat is een privacy-grens en geen stijlkeuze, dus deze module krijgt het
 * gewicht ook niet te zien.
 */

/** De leeftijdsband die de eiwitvloer optilt. Eén plek, zodat UI en berekening niet uiteenlopen. */
export const PROTEIN_AGE_BAND = "55+";

export function isProteinAgeBand(ageRange: string | null | undefined): boolean {
  return ageRange === PROTEIN_AGE_BAND;
}

/**
 * "Op jouw gewicht: 95–110 g per dag."
 *
 * `null` zodra er geen range is — zonder gewicht geen getal, en een verzonnen
 * standaard zou hier het slechtste van twee werelden zijn.
 */
export function proteinTargetLine(range: ProteinTargetRange | null): string | null {
  if (!range) {
    return null;
  }
  return `Op jouw gewicht: ${range.gramsLow}–${range.gramsHigh} g per dag.`;
}

/**
 * Waarom die ondergrens hoger ligt in de bovenste leeftijdsband.
 *
 * De zin noemt de verdeling en niet het getal: dat is wat PROT-AGE en ESPEN
 * werkelijk zeggen — boven de vijftig telt hoe je eiwit over de dag verdeelt
 * zwaarder dan het dagtotaal, en dat is ook precies wat de gebruiker eraan kan
 * doen. Een zin die alleen "je hebt meer nodig" zegt geeft hem een groter
 * getal en geen handeling.
 */
export function proteinAgeNote(ageRange: string | null | undefined): string | null {
  if (!isProteinAgeBand(ageRange)) {
    return null;
  }
  return "Vanaf 55 telt de verdeling over de dag zwaarder dan je dagtotaal — daarom ligt je ondergrens hier hoger dan de basis voor 40+.";
}
