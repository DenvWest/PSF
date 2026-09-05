import { nutrientReferences } from "@/data/nutrition/intake-reference";
import {
  getDomainProductStance,
  type ProductStanceDomain,
} from "@/data/domain-product-stance";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";

/**
 * De voedingsroutes die bij een ander domein horen.
 *
 * ## Waarom dit bestaat
 *
 * Op voeding toont laag 6 een tabel: per stof je bord links, de supplementdeur
 * rechts. Op slaap en beweging stond daar alleen een gesloten poort met de
 * regel "het oordeel en het aanbod staan op Keuze" — een deur zonder inhoud,
 * terwijl het oordeel er wel degelijk is. Magnesium (slaap) en eiwit (beweging)
 * hebben allebei een voedingsroute die de check al berekent; hij werd alleen
 * op één scherm getoond.
 *
 * Deze module leidt af welke van die routes bij een domein horen, zodat dat
 * domein dezelfde tabel kan tonen.
 *
 * ## Wat hier níét gebeurt
 *
 * **Geen tweede oordeel.** De statussen komen ongewijzigd uit
 * `nutrition-route-status.ts`, dus uit de voedingscheck. Slaap en beweging
 * krijgen hier geen eigen innameschatting: hun check meet geen inname, en een
 * eigen oordeel zou een claim doen die die check niet draagt. Wat je op slaap
 * ziet is letterlijk wat op voeding staat, gefilterd tot magnesium.
 *
 * **Geen routes voor stress.** `DOMAIN_PRODUCT_STANCE` zet stress op
 * `lifestyle_first`, en dat blijft: STR_FREQ en STR_RCV meten ervaren belasting
 * en herstelgedrag, niet inname. Een supplementkolom zou daar altijd leeg
 * blijven, en een lege kolom die nooit vult is erger dan geen kolom. Deze
 * functie geeft voor stress dus een lege lijst — de gesloten poort met zijn
 * eigen reden blijft daar staan.
 *
 * **Geen kandidaten zonder route.** Creatine staat op beweging in de stance,
 * maar heeft geen voedingsroute: de check schat geen creatine-inname. Het valt
 * daarom buiten deze tabel en blijft via het schap lopen — zichtbaar zijn is
 * iets anders dan een bord-versus-potje-vergelijking hebben.
 */

/**
 * De claim-sleutel van een nutriënt, als brug naar de stance-slugs.
 *
 * `NutrientId` ("protein", "vitamin_d") en de slugs in `DOMAIN_PRODUCT_STANCE`
 * ("eiwitpoeder", "vitamineD") zijn verschillende vocabulaires. `claimKey` op
 * de nutriëntreferentie is precies de tweede — dat is geen toeval maar de reden
 * dat het veld bestaat, en het scheelt hier een tweede handmatige mapping die
 * uit de pas zou lopen.
 */
function claimKeyVoor(status: NutrientRouteStatus): string | null {
  return nutrientReferences[status.nutrient]?.claimKey ?? null;
}

/**
 * De routes die op dit domein getoond mogen worden.
 *
 * Voeding krijgt ze allemaal — daar wordt inname gemeten, en de tabel is er de
 * hele laag. De andere domeinen krijgen de doorsnede van hun kandidaten met de
 * routes die de voedingscheck berekende.
 */
export function routesVoorDomein(
  domain: ProductStanceDomain,
  routes: readonly NutrientRouteStatus[],
): NutrientRouteStatus[] {
  const stance = getDomainProductStance(domain);
  if (stance.kind !== "candidates") {
    return [];
  }
  return routes.filter((status) => {
    const key = claimKeyVoor(status);
    return key != null && stance.slugs.has(key);
  });
}

/**
 * De regel die zegt waar dit oordeel vandaan komt.
 *
 * Staat er alleen buiten voeding. Op het voedingsscherm is de herkomst
 * vanzelfsprekend; op slaap en beweging is het de kern van de boodschap — je
 * leest hier een uitkomst van je *voedings*check, en zonder die check staat er
 * niets. Dat expliciet maken voorkomt de indruk dat de slaapcheck iets over
 * magnesiuminname zou hebben gemeten.
 */
export function routeHerkomstRegel(
  domain: ProductStanceDomain,
  routes: readonly NutrientRouteStatus[],
): string | null {
  if (domain === "nutrition" || routes.length === 0) {
    return null;
  }
  const namen = routes.map((status) => status.label.toLowerCase());
  const lijst =
    namen.length === 1
      ? namen[0]
      : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
  return `Dit komt uit je voedingscheck, niet uit deze check — die meet geen inname. Voor ${lijst} weten we daar wél of je bord het levert.`;
}
