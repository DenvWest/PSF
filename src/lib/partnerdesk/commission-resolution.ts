// Commissie-resolutie (PRD BR-08) — puur, geen database. Bepaalt per commissie-
// soort ("kind") welke regel NU geldt, met volledige herleiding voor de
// "waarom dit bedrag?"-tooltip. ISO-datums (YYYY-MM-DD) vergelijken lexicaal.

import type {
  CommissionKind,
  CommissionRuleType,
  CommissionScope,
} from "@/types/partnerdesk";

export interface ResolutionRule {
  id: string;
  contract_id: string;
  kind: CommissionKind;
  rate_percent: number | null;
  amount_cents: number | null;
  scope: CommissionScope;
  category_id: string | null;
  rule_type: CommissionRuleType;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  archived_at: string | null;
}

export interface ResolutionContract {
  id: string;
  number: string;
  starts_on: string;
  ends_on: string | null;
  archived_at: string | null;
}

export interface ReasonEntry {
  rule: ResolutionRule;
  won: boolean;
  reason: string;
}

export interface ResolvedGroup {
  kind: CommissionKind;
  winner: ResolutionRule;
  contractNumber: string;
  validUntil: string | null;
  reasoning: ReasonEntry[];
}

export interface CommissionResolution {
  groups: ResolvedGroup[];
  bonuses: ResolutionRule[];
  hasAny: boolean;
}

const SCOPE_RANK: Record<CommissionScope, number> = { category: 2, all: 1 };
const TYPE_RANK: Record<CommissionRuleType, number> = {
  exception: 3,
  promo: 2,
  standard: 1,
  bonus: 0,
};

export function describeRule(rule: ResolutionRule): string {
  const typeLabel =
    rule.rule_type === "exception"
      ? "uitzondering"
      : rule.rule_type === "promo"
        ? "tijdelijke actie"
        : rule.rule_type === "bonus"
          ? "bonus"
          : "contract-standaard";
  return rule.scope === "category" ? `${typeLabel} (categorie)` : typeLabel;
}

function contractActiveOn(
  contract: ResolutionContract | undefined,
  dateIso: string,
): boolean {
  if (!contract || contract.archived_at) return false;
  if (contract.starts_on > dateIso) return false; // concept
  if (contract.ends_on !== null && contract.ends_on < dateIso) return false; // verlopen
  return true;
}

function ruleValidOn(rule: ResolutionRule, dateIso: string): boolean {
  if (rule.archived_at) return false;
  if (rule.valid_from !== null && rule.valid_from > dateIso) return false;
  if (rule.valid_to !== null && rule.valid_to < dateIso) return false;
  return true;
}

/** Winnaar-eerst: hogere scope-specificiteit, dan rule_type, dan recentste. */
function compareRules(a: ResolutionRule, b: ResolutionRule): number {
  const scope = SCOPE_RANK[b.scope] - SCOPE_RANK[a.scope];
  if (scope !== 0) return scope;
  const type = TYPE_RANK[b.rule_type] - TYPE_RANK[a.rule_type];
  if (type !== 0) return type;
  const vf = (b.valid_from ?? "").localeCompare(a.valid_from ?? "");
  if (vf !== 0) return vf;
  return b.created_at.localeCompare(a.created_at);
}

export function resolveCommissions(
  rules: ResolutionRule[],
  contracts: ResolutionContract[],
  dateIso: string,
): CommissionResolution {
  const contractById = new Map(contracts.map((c) => [c.id, c]));

  const candidates = rules.filter(
    (r) =>
      ruleValidOn(r, dateIso) &&
      contractActiveOn(contractById.get(r.contract_id), dateIso),
  );

  const bonuses = candidates.filter((r) => r.rule_type === "bonus");
  const scored = candidates.filter((r) => r.rule_type !== "bonus");

  const byKind = new Map<CommissionKind, ResolutionRule[]>();
  for (const rule of scored) {
    const list = byKind.get(rule.kind) ?? [];
    list.push(rule);
    byKind.set(rule.kind, list);
  }

  const groups: ResolvedGroup[] = [];
  for (const [kind, kindRules] of byKind) {
    const sorted = [...kindRules].sort(compareRules);
    const winner = sorted[0];
    const contract = contractById.get(winner.contract_id);
    const validUntil = winner.valid_to ?? contract?.ends_on ?? null;

    const reasoning: ReasonEntry[] = sorted.map((rule, i) => ({
      rule,
      won: i === 0,
      reason:
        i === 0
          ? `Geldt nu — ${describeRule(rule)}${validUntil ? `, t/m ${validUntil}` : ""}`
          : `Overschreven door ${describeRule(winner)}`,
    }));

    groups.push({
      kind,
      winner,
      contractNumber: contract?.number ?? "—",
      validUntil,
      reasoning,
    });
  }

  // Stabiele volgorde: op kind-naam.
  groups.sort((a, b) => a.kind.localeCompare(b.kind));

  return { groups, bonuses, hasAny: groups.length > 0 };
}
