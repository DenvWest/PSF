// Commissiebedrag — pure functie, geen database. Vertaalt de winnende regel uit
// commission-resolution.ts naar een concreet bedrag voor één conversie.
//
// Losstaand van commission-resolution.ts omdat die laatste alleen resolveert
// WELKE regel geldt (per kind, per datum) — niet HOEVEEL een specifieke
// conversie oplevert. Dat laatste heeft het orderbedrag nodig, wat resolutie
// niet kent en ook niet zou moeten kennen (regel-resolutie is orderonafhankelijk).

import type { CommissionKind } from "@/types/partnerdesk";
import type { ResolvedGroup } from "@/lib/partnerdesk/commission-resolution";

export type ConversionType = "lead" | "sale";

/**
 * Bepaalt welk resolutie-"kind" bij een conversietype hoort, in volgorde van
 * voorkeur. Een 'sale' kan cps_percent of cps_fixed zijn (beide zijn per-
 * verkoop-regels) — cps_percent gaat voor als beide tegelijk actief zijn,
 * omdat een percentageregel meestal de bedoelde hoofdregel is en cps_fixed
 * eerder een uitzondering/bonus ernaast. Een 'lead' hoort bij cpl. cpc/cpa
 * zijn klik-/actiegebaseerd en worden hier niet geresolveerd — die lopen niet
 * via een conversie-omzet.
 */
function kindsForType(type: ConversionType): readonly CommissionKind[] {
  return type === "sale" ? ["cps_percent", "cps_fixed"] : ["cpl"];
}

/**
 * Rekent het verwachte commissiebedrag (in centen) uit voor één conversie,
 * gegeven de al-geresolveerde commissiegroepen (uit resolveCommissions()) en
 * het orderbedrag. Geeft null als er geen toepasselijke regel is — dat is een
 * uitspraak ("geen regel gevonden"), geen 0-bedrag.
 */
export function computeExpectedCommissionCents(
  groups: ResolvedGroup[],
  type: ConversionType,
  revenueCents: number,
): number | null {
  const groupsByKind = new Map(groups.map((g) => [g.kind, g]));
  const applicableKinds = kindsForType(type);
  const group = applicableKinds.map((kind) => groupsByKind.get(kind)).find((g) => g != null);
  if (!group) return null;

  const rule = group.winner;

  if (rule.rate_percent !== null) {
    return Math.round((revenueCents * rule.rate_percent) / 100);
  }
  if (rule.amount_cents !== null) {
    return rule.amount_cents;
  }
  return null;
}
