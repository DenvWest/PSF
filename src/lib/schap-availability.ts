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
 * Het schap-domein waar een deur op uitkomt, of `null` als dit domein er geen
 * heeft. Elke ingang naar Favorieten draait op deze ene functie — de deur op
 * Vandaag (KompasOndersteuningTile) en de rail op Voortgang (VoortgangHub).
 * Anders staat er twee keer "Favorieten" met twee verschillende schermen
 * erachter.
 */
export function resolveSchapDomain(domain: PillarId | null | undefined): PillarId | null {
  return domain && hasSchap(domain) ? domain : null;
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
