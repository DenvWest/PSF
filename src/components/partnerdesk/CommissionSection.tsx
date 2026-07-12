"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RuleForm } from "@/components/partnerdesk/RuleForm";
import { TierEditor } from "@/components/partnerdesk/TierEditor";
import { resolveCommissions } from "@/lib/partnerdesk/commission-resolution";
import { archiveRuleAction } from "@/lib/partnerdesk/contract-actions";
import {
  COMMISSION_KIND_LABEL,
  formatCommissionValue,
  formatNlDay,
} from "@/lib/partnerdesk/format";
import type {
  PdCategory,
  PdCommissionRule,
  PdCommissionTier,
  PdContract,
} from "@/types/partnerdesk";

const RULE_TYPE_LABEL: Record<string, string> = {
  standard: "standaard",
  exception: "uitzondering",
  promo: "actie",
  bonus: "bonus",
};

export function CommissionSection({
  partnerId,
  slug,
  today,
  contracts,
  rules,
  tiers,
  categories,
}: {
  partnerId: string;
  slug: string;
  today: string;
  contracts: PdContract[];
  rules: PdCommissionRule[];
  tiers: PdCommissionTier[];
  categories: PdCategory[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const resolution = useMemo(
    () => resolveCommissions(rules, contracts, today),
    [rules, contracts, today],
  );
  const categoryName = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const bonusTermsById = useMemo(
    () => new Map(rules.map((r) => [r.id, r.bonus_terms])),
    [rules],
  );

  function archive(ruleId: string) {
    startTransition(async () => {
      await archiveRuleAction({ ruleId, partnerId, slug });
      router.refresh();
    });
  }

  const hasContracts = contracts.length > 0;

  return (
    <div className="space-y-5">
      {/* Nu geldig */}
      <div className="rounded-lg border border-[var(--ps-green)] bg-[var(--ps-green-light)]/40 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ps-green-hover)]">
          Nu geldig
        </p>
        {!resolution.hasAny ? (
          <p className="text-sm text-[var(--ps-body)]">
            Geen geldige commissieregel op een actief contract.
          </p>
        ) : (
          <div className="space-y-2">
            {resolution.groups.map((g) => (
              <div key={g.kind} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <span className="font-semibold">
                  {formatCommissionValue(g.kind, g.winner.rate_percent, g.winner.amount_cents)}
                </span>
                <span className="text-[var(--ps-body)]">{COMMISSION_KIND_LABEL[g.kind]}</span>
                <span className="text-[var(--ps-muted)]">
                  · {g.contractNumber}
                  {g.validUntil ? ` · t/m ${formatNlDay(g.validUntil)}` : ""}
                </span>
                <details className="ml-auto text-xs text-[var(--ps-body)]">
                  <summary className="cursor-pointer select-none hover:underline">waarom?</summary>
                  <ul className="mt-1 space-y-0.5 pl-1">
                    {g.reasoning.map((r) => (
                      <li key={r.rule.id} className={r.won ? "font-medium" : "text-[var(--ps-muted)]"}>
                        {r.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
            {resolution.bonuses.length > 0 && (
              <div className="border-t border-[var(--ps-green)]/30 pt-2 text-sm">
                <span className="text-[var(--ps-body)]">Bonussen: </span>
                {resolution.bonuses.map((b, i) => {
                  const terms = bonusTermsById.get(b.id);
                  return (
                    <span key={b.id}>
                      {i > 0 ? ", " : ""}
                      {formatCommissionValue(b.kind, b.rate_percent, b.amount_cents)}
                      {terms ? ` (${terms})` : ""}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Regeltabel */}
      {rules.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen commissieregels.</p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) =>
            editId === rule.id ? (
              <RuleForm
                key={rule.id}
                partnerId={partnerId}
                slug={slug}
                contracts={contracts}
                categories={categories}
                existing={rule}
                onDone={() => setEditId(null)}
              />
            ) : (
              <div key={rule.id} className="rounded-lg border border-[var(--ps-border)] p-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-[var(--ps-bg)] px-2 py-0.5 text-xs text-[var(--ps-body)]">
                    {RULE_TYPE_LABEL[rule.rule_type]}
                  </span>
                  <span className="font-semibold">
                    {formatCommissionValue(rule.kind, rule.rate_percent, rule.amount_cents)}
                  </span>
                  <span className="text-[var(--ps-body)]">{COMMISSION_KIND_LABEL[rule.kind]}</span>
                  <span className="text-[var(--ps-muted)]">
                    ·{" "}
                    {rule.scope === "category"
                      ? categoryName.get(rule.category_id ?? "") ?? "categorie"
                      : "alle producten"}
                  </span>
                  {(rule.valid_from || rule.valid_to) && (
                    <span className="text-[var(--ps-muted)]">
                      · {rule.valid_from ? formatNlDay(rule.valid_from) : "…"} – {rule.valid_to ? formatNlDay(rule.valid_to) : "…"}
                    </span>
                  )}
                  <span className="ml-auto flex gap-3 text-xs text-[var(--ps-body)]">
                    <button type="button" onClick={() => setEditId(rule.id)} className="hover:underline">Bewerk</button>
                    <button type="button" onClick={() => archive(rule.id)} disabled={pending} className="hover:underline">Archiveer</button>
                  </span>
                </div>
                <TierEditor
                  ruleId={rule.id}
                  kind={rule.kind}
                  tiers={tiers.filter((t) => t.commission_rule_id === rule.id)}
                  slug={slug}
                />
              </div>
            ),
          )}
        </div>
      )}

      {adding ? (
        <RuleForm
          partnerId={partnerId}
          slug={slug}
          contracts={contracts}
          categories={categories}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={!hasContracts}
          title={hasContracts ? undefined : "Voeg eerst een contract toe"}
          className="rounded-lg border border-[var(--ps-border)] px-3.5 py-2 text-sm font-medium text-[var(--ps-body)] hover:bg-[var(--ps-bg)] disabled:opacity-50"
        >
          + Regel
        </button>
      )}
    </div>
  );
}
