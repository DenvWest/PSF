"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  createRuleAction,
  updateRuleAction,
} from "@/lib/partnerdesk/contract-actions";
import { COMMISSION_KIND_LABEL } from "@/lib/partnerdesk/format";
import {
  COMMISSION_KINDS,
  COMMISSION_RULE_TYPES,
} from "@/lib/partnerdesk/validation";
import type {
  CommissionKind,
  CommissionRuleType,
  CommissionScope,
  PdCategory,
  PdCommissionRule,
  PdContract,
} from "@/types/partnerdesk";

const RULE_TYPE_LABEL: Record<CommissionRuleType, string> = {
  standard: "Standaard",
  exception: "Uitzondering",
  promo: "Tijdelijke actie",
  bonus: "Bonus",
};

export function RuleForm({
  partnerId,
  slug,
  contracts,
  categories,
  existing,
  onDone,
}: {
  partnerId: string;
  slug: string;
  contracts: PdContract[];
  categories: PdCategory[];
  existing?: PdCommissionRule;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [contractId, setContractId] = useState(existing?.contract_id ?? contracts[0]?.id ?? "");
  const [kind, setKind] = useState<CommissionKind>(existing?.kind ?? "cps_percent");
  const [percent, setPercent] = useState(existing?.rate_percent != null ? String(existing.rate_percent) : "");
  const [euro, setEuro] = useState(existing?.amount_cents != null ? String(existing.amount_cents / 100) : "");
  const [scope, setScope] = useState<CommissionScope>(existing?.scope ?? "all");
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? "");
  const [ruleType, setRuleType] = useState<CommissionRuleType>(existing?.rule_type ?? "standard");
  const [validFrom, setValidFrom] = useState(existing?.valid_from ?? "");
  const [validTo, setValidTo] = useState(existing?.valid_to ?? "");

  const isPercent = kind === "cps_percent";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      partnerId,
      slug,
      contractId,
      kind,
      ratePercent: isPercent && percent.trim() !== "" ? Number(percent) : null,
      amountCents: !isPercent && euro.trim() !== "" ? Math.round(Number(euro) * 100) : null,
      scope,
      categoryId: scope === "category" ? categoryId || null : null,
      ruleType,
      validFrom: validFrom || null,
      validTo: validTo || null,
    };
    startTransition(async () => {
      const result = existing
        ? await updateRuleAction({ ...payload, ruleId: existing.id })
        : await createRuleAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  const inputCls =
    "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-[var(--ps-border)] bg-[var(--ps-bg)] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Contract</span>
          <select value={contractId} onChange={(e) => setContractId(e.target.value)} className={inputCls}>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>{c.number}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as CommissionKind)} className={inputCls}>
            {COMMISSION_KINDS.map((k) => (
              <option key={k} value={k}>{COMMISSION_KIND_LABEL[k]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">{isPercent ? "Percentage (%)" : "Bedrag (€)"}</span>
          {isPercent ? (
            <input type="number" step="0.01" value={percent} onChange={(e) => setPercent(e.target.value)} className={inputCls} />
          ) : (
            <input type="number" step="0.01" value={euro} onChange={(e) => setEuro(e.target.value)} className={inputCls} />
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Soort</span>
          <select value={ruleType} onChange={(e) => setRuleType(e.target.value as CommissionRuleType)} className={inputCls}>
            {COMMISSION_RULE_TYPES.map((t) => (
              <option key={t} value={t}>{RULE_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Bereik</span>
          <select value={scope} onChange={(e) => setScope(e.target.value as CommissionScope)} className={inputCls}>
            <option value="all">Alle producten</option>
            <option value="category">Categorie</option>
          </select>
        </label>
        {scope === "category" && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--ps-body)]">Categorie</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">— kies —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Geldig vanaf</span>
          <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Geldig t/m {ruleType === "promo" && <span className="text-red-600">*</span>}</span>
          <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className={inputCls} />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-lg px-3.5 py-2 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-surface)]">
          Annuleren
        </button>
        <button type="submit" disabled={pending} className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50">
          {pending ? "Opslaan…" : existing ? "Opslaan" : "Regel toevoegen"}
        </button>
      </div>
    </form>
  );
}
