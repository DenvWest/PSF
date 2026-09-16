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
 * De tweede check — altijd de brede leefstijlcheck, en nooit een tweede knop.
 *
 * ## Waarom de domeincheck hier níét staat
 *
 * Het oorspronkelijke ontwerp gaf een stuk over magnesium × slaap de
 * voedingscheck als primaire en de sláápcheck als secundaire stap. Dat leek
 * logisch — twee relevante metingen — maar het klopt niet, om twee redenen die
 * pas zichtbaar werden toen een test vroeg waar de leefstijlcheck dan nog werd
 * aangeboden.
 *
 * 1. **Ze overlappen.** De leefstijlcheck meet slaap al; hij heeft
 *    `sleep_score` als een van zijn zes domeinen. Slaapcheck én leefstijlcheck
 *    naast elkaar aanbieden is dezelfde vraag twee keer stellen.
 * 2. **Koud verkeer heeft nog niets gemeten.** Een micro-check van één minuut
 *    levert iemand die net uit Google komt één losse deelscore zonder context.
 *    De micro-checks zijn hermetings-instrumenten: ze horen bij het dashboard
 *    en bij terugkerend verkeer, niet bij de tweede stap op een contentpagina.
 *
 * Dus: de primaire stap is de meest specifieke check voor het onderwerp van de
 * pagina, en de tweede is altijd de brede check. Een domeincheck is óf
 * primair, óf hij wordt vanuit content niet aangeboden.
 *
 * ## Waarom de brede check nooit uit beeld mag
 *
 * De micro-checks leveren een deelscore. De leefstijlcheck levert
 * `domain_scores`, `profile_label`, `urgency_level` én de e-mailopt-in — de
 * hele personalisatie- en nurture-ruggengraat.
 *
 * Toen `resolveCheck()` voor het eerst over alle content liep, bleek de
 * afleiding hem terug te brengen tot vrijwel nul contentpagina's. Dat zou een
 * verschuiving in de diepte van het conversiemoment zijn geweest die niemand
 * gekozen had — een bijwerking van een afleidingsregel.
 *
 * De oplossing is niet de primaire regel verzwakken: een magnesium-artikel
 * hoort naar de voedingscheck te wijzen, niet naar een vragenlijst van drie
 * minuten. De oplossing is dat de brede check als tweede regel blijft staan.
 *
 * Twee gelijkwaardige knoppen is geen optie — dat is de keuzeparalyse die de
 * huidige gestapelde CTA-blokken al veroorzaken. Eén regel, onder de primaire.
 */
export function resolveSecondaryCheck(
  meta: ContentMetadata,
): ContentCheckId | null {
  // Op de leefstijlcheck zelf valt niets terug te vallen.
  if (resolveCheck(meta) === "leefstijl") return null;
  return "leefstijl";
}
