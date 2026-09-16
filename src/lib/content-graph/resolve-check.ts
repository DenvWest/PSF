import {
  CONTENT_CHECKS,
  type ContentCheck,
  type ContentCheckId,
} from "@/data/content-graph/checks";
import type { ContentMetadata } from "@/data/insight-metadata";

/**
 * Welke check hoort bij dit stuk content?
 *
 * ## Waarom dit een functie is en geen veld
 *
 * Honderdzeventien handmatige toewijzingen lopen uit de pas. Een functie niet:
 * verandert het beleid, dan verandert één regel en verschuiven alle stukken
 * mee. `checkOverride` bestaat voor de gevallen waar de afleiding aantoonbaar
 * de verkeerde kant op wijst — dat hoort zeldzaam te zijn.
 *
 * ## Waarom de stof vóór het thema gaat
 *
 * `/blog/magnesium-en-slaap` draagt `theme: "sleep"`, maar de vraag die de
 * lezer overhoudt is *"haal ik genoeg magnesium uit mijn eten?"* — en dat meet
 * de voedingscheck, niet de slaapcheck. De stof is specifieker dan het domein,
 * dus de stof wint.
 *
 * Draagt een stuk géén stof, dan valt hij terug op het gemeten domein. Voor een
 * creatine-artikel levert dat de beweegcheck op, en dat klopt: creatine is geen
 * voedingsstof die je uit je bord haalt, en de trainingsbelasting is wél de
 * factor die bepaalt of het ergens over gaat.
 *
 * ## Waarom `connection` bij de leefstijlcheck uitkomt
 *
 * Verbinding wordt gemeten maar staat niet in de interface
 * (`VERBORGEN_DOMEINEN`). Er is dus geen losse verbindingscheck om naar te
 * wijzen, en de brede leefstijlcheck is het eerlijke alternatief.
 */
export function resolveCheck(meta: ContentMetadata): ContentCheckId {
  if (meta.checkOverride) return meta.checkOverride;

  // De stof is specifieker dan het domein.
  if (meta.nutrients && meta.nutrients.length > 0) return "voeding";

  switch (meta.theme) {
    case "nutrition":
      return "voeding";
    case "sleep":
      return "slaap";
    case "stress":
      return "stress";
    case "movement":
      return "beweging";
    default:
      return "leefstijl";
  }
}

export function resolveCheckEntry(meta: ContentMetadata): ContentCheck {
  return CONTENT_CHECKS[resolveCheck(meta)];
}

/**
 * De tweede check, als die er is.
 *
 * Draagt een stuk een stof én een niet-voedingsdomein (magnesium × slaap), dan
 * is er een tweede meting die er inhoudelijk toe doet. Die hoort als één
 * secundaire regel te verschijnen, niet als tweede knop: twee gelijkwaardige
 * CTA's is de keuzeparalyse die de huidige gestapelde blokken al veroorzaken.
 */
export function resolveSecondaryCheck(
  meta: ContentMetadata,
): ContentCheckId | null {
  const primary = resolveCheck(meta);
  if (primary !== "voeding") return null;
  if (!meta.nutrients || meta.nutrients.length === 0) return null;

  switch (meta.theme) {
    case "sleep":
      return "slaap";
    case "stress":
      return "stress";
    case "movement":
      return "beweging";
    default:
      return null;
  }
}
