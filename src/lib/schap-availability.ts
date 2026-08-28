import type { ProductStanceDomain } from "@/data/domain-product-stance";
import type { PillarId } from "@/types/dashboard";

/**
 * Waar het schap echt bestaat.
 *
 * Het schap is sinds P3 geen prebuild-iframe meer maar `SchapView` — React,
 * gevoed uit `account_favorites`, de ladder en de supplement-oordelen van het
 * domein zelf. Daarmee vervalt de reden waarom alleen beweging hier stond:
 * de inhoud volgt nu het domein in plaats van de prebuild.
 *
 * Slaap, beweging en voeding hebben een schap. De andere twee niet, en dat is
 * een oordeel, geen ontbrekende lijst (BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1
 * §D5, §E1, §E2):
 *
 * - **stress** valt af op `lifestyle_first` — de check meet ervaren belasting
 *   en herstelgedrag, niet inname, en daar past geen goedgekeurde EFSA-claim
 *   op. Poortreden `geen_claim`, in elke staat.
 * - **verbinding** valt structureel af. Poortreden `geen_schap`: geen schap
 *   betekent geen aanbod, ook niet ons eigen betaalde aanbod (§E2).
 */
export const SCHAP_DOMAINS: readonly PillarId[] = ["beweging", "slaap", "voeding"];

export function hasSchap(domain: PillarId): boolean {
  return SCHAP_DOMAINS.includes(domain);
}

/**
 * Waaróm een domein geen schap heeft, in gebruikerstaal. Hoort hier en nergens
 * anders: elke plek die de poort toont (de rail op Keuze, de chiprij in
 * `SchapView`) leest dezelfde zin, zodat de reden niet per surface kan
 * verschillen.
 */
export const SCHAP_GATE_REASON: Partial<Record<PillarId, string>> = {
  stress: "Geen aanbod op stress — de check meet belasting en herstelgedrag, geen inname.",
  verbinding: "Geen aanbod op verbinding — hier valt niets te kopen dat werkt.",
};

export function schapGateReason(domain: PillarId): string | null {
  return hasSchap(domain) ? null : (SCHAP_GATE_REASON[domain] ?? "Geen aanbod op dit domein.");
}

/**
 * Het schap-domein waar een deur op uitkomt, of `null` als dit domein er geen
 * heeft. Elke ingang naar Favorieten draait op deze ene functie — de deur op
 * Vandaag (KompasOndersteuningTile) en de rail op Voortgang (VoortgangHub).
 * Anders staat er twee keer "Favorieten" met twee verschillende schermen
 * erachter.
 */
export function resolveSchapDomain(domain: PillarId | null | undefined): PillarId | null {
  return domain && hasSchap(domain) ? domain : null;
}

/**
 * Waar de Keuze-tab op landt als niets anders een schap oplevert: het domein
 * mét schap waar je op dit moment het laagst staat.
 *
 * Nodig omdat Keuze sinds 27 augustus een vaste bestemming in de
 * hoofdnavigatie is. Je prioriteitsdomein kán stress of verbinding zijn, en
 * die hebben geen schap — dan zou de tab leeg opengaan, en een leeg tabblad in
 * de hoofdnavigatie leest als een kapot product in plaats van als een oordeel.
 * De laagste score is de eerlijkste gok: daar valt het meeste te winnen.
 */
export function resolveKeuzeFallbackDomain(
  scores: Record<string, number> | null | undefined,
): PillarId {
  const [first, ...rest] = SCHAP_DOMAINS;
  return rest.reduce(
    (lowest, domain) =>
      (scores?.[domain] ?? 100) < (scores?.[lowest] ?? 100) ? domain : lowest,
    first,
  );
}

/** PillarId → de sleutel die domain-product-stance gebruikt. Alleen de domeinen mét schap. */
export function toProductStanceDomain(domain: PillarId): ProductStanceDomain | null {
  switch (domain) {
    case "beweging":
      return "movement";
    case "slaap":
      return "sleep";
    case "voeding":
      return "nutrition";
    default:
      return null;
  }
}
