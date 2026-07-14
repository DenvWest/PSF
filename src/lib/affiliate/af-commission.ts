// Commissie-resolutie voor het eigen affiliate-programma — puur, geen database.
// Bepaalt per conversie welke afspraak geldt en het bedrag. Grondvorm:
// kandidaat-filter → winnaar → bedrag. ISO-datums (YYYY-MM-DD) lexicaal.

import type { AfCommissionRule, AfConversionType } from "@/types/affiliate";

export interface ResolvedAfCommission {
  amountCents: number;
  rule: AfCommissionRule;
}

function typeRank(ruleType: string): number {
  return ruleType === "promo" ? 2 : 1;
}

function covers(rule: AfCommissionRule, type: AfConversionType): boolean {
  return rule.applies_to === "both" || rule.applies_to === type;
}

function validOn(rule: AfCommissionRule, dateIso: string): boolean {
  if (rule.archived_at) return false;
  if (rule.valid_from !== null && rule.valid_from > dateIso) return false;
  if (rule.valid_to !== null && rule.valid_to < dateIso) return false;
  return true;
}

/** Winnaar-eerst: promo > standaard, dan recentste valid_from, dan created_at. */
function compareRules(a: AfCommissionRule, b: AfCommissionRule): number {
  const t = typeRank(b.rule_type) - typeRank(a.rule_type);
  if (t !== 0) return t;
  const vf = (b.valid_from ?? "").localeCompare(a.valid_from ?? "");
  if (vf !== 0) return vf;
  return b.created_at.localeCompare(a.created_at);
}

export function resolveAfCommission(
  rules: AfCommissionRule[],
  type: AfConversionType,
  dateIso: string,
  revenueCents: number,
): ResolvedAfCommission | null {
  const candidates = rules.filter((r) => covers(r, type) && validOn(r, dateIso));
  if (candidates.length === 0) return null;
  const winner = [...candidates].sort(compareRules)[0];
  const amountCents =
    winner.value_type === "percent"
      ? Math.round((revenueCents * (winner.rate_percent ?? 0)) / 100)
      : (winner.amount_cents ?? 0);
  return { amountCents, rule: winner };
}

/** Bevroren snapshot van de winnende regel voor in het grootboek (§5 plan). */
export function ruleSnapshot(rule: AfCommissionRule): Record<string, unknown> {
  return {
    rule_id: rule.id,
    value_type: rule.value_type,
    rate_percent: rule.rate_percent,
    amount_cents: rule.amount_cents,
    rule_type: rule.rule_type,
    applies_to: rule.applies_to,
  };
}
