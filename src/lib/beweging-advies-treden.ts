import { WEEK_CATEGORY_OPTIONS } from "@/lib/movement-week-categories";
import type { MovementStartPattern } from "@/lib/movement-prefs";

/**
 * Overgebleven na plak P3 (BESLUIT_BEWEGING_V36 §H): `buildBewegingAdviesTreden`
 * en het bijbehorende `BewegingAdviesTreden`-component zijn verwijderd —
 * Voortgang › Beweging gebruikt nu `DomainSupplementStance domain="movement"`,
 * dezelfde generieke deur die slaap/stress/voeding al gebruiken (matcht
 * `DOMAIN_PRODUCT_STANCE.movement`, ongewijzigd sinds ervoor).
 *
 * `programLabelFor` blijft — `beweging-help-bridge.ts` (Agenda › meer-hulp-
 * sheet) leunt er nog op, en die surface stond buiten de scope van P3.
 */
export function programLabelFor(startPattern: MovementStartPattern | null): string | null {
  if (!startPattern) {
    return null;
  }
  return (
    WEEK_CATEGORY_OPTIONS.find((option) => option.id === startPattern)?.label ?? null
  );
}
