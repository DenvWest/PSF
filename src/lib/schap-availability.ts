import type { PillarId } from "@/types/dashboard";

/**
 * Waar het schap echt bestaat.
 *
 * Het schap is de prebuild `favorieten-schap-v3.html`, en die draagt
 * beweeg-inhoud: `SCHAP_BASIS_CARDS` en de supplement-oordelen van beweging,
 * ongeacht welk domein je in de URL zet. Een deur naar "het schap van slaap"
 * zou dus beweeg-inhoud tonen onder een slaap-kop. Beweging is de blauwdruk;
 * uitrol naar de andere vier domeinen zet ze hier bij — één plek, geen tweede
 * lijst.
 */
export const SCHAP_DOMAINS: readonly PillarId[] = ["beweging"];

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
