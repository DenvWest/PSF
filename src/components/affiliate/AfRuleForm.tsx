"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  createAfRuleAction,
  updateAfRuleAction,
} from "@/lib/affiliate/actions";
import type {
  AfAppliesTo,
  AfCommissionRule,
  AfRuleType,
  AfValueType,
} from "@/types/affiliate";

export function AfRuleForm({
  affiliateId,
  affiliateRef,
  existing,
  onDone,
}: {
  affiliateId: string;
  affiliateRef: string;
  existing?: AfCommissionRule;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [appliesTo, setAppliesTo] = useState<AfAppliesTo>(existing?.applies_to ?? "sale");
  const [valueType, setValueType] = useState<AfValueType>(existing?.value_type ?? "percent");
  const [percent, setPercent] = useState(existing?.rate_percent != null ? String(existing.rate_percent) : "");
  const [euro, setEuro] = useState(existing?.amount_cents != null ? String(existing.amount_cents / 100) : "");
  const [ruleType, setRuleType] = useState<AfRuleType>(existing?.rule_type ?? "standard");
  const [validFrom, setValidFrom] = useState(existing?.valid_from ?? "");
  const [validTo, setValidTo] = useState(existing?.valid_to ?? "");

  const isPercent = valueType === "percent";
  const percentOnLead = isPercent && appliesTo === "lead";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      affiliateId,
      ref: affiliateRef,
      appliesTo,
      valueType,
      ratePercent: isPercent && percent.trim() !== "" ? Number(percent) : null,
      amountCents: !isPercent && euro.trim() !== "" ? Math.round(Number(euro) * 100) : null,
      ruleType,
      validFrom: validFrom || null,
      validTo: validTo || null,
    };
    startTransition(async () => {
      const result = existing
        ? await updateAfRuleAction({ ...payload, ruleId: existing.id })
        : await createAfRuleAction(payload);
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
          <span className="text-[var(--ps-body)]">Geldt voor</span>
          <select value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as AfAppliesTo)} className={inputCls}>
            <option value="sale">Verkoop</option>
            <option value="lead">Lead</option>
            <option value="both">Beide</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Type</span>
          <select value={valueType} onChange={(e) => setValueType(e.target.value as AfValueType)} className={inputCls}>
            <option value="percent">Percentage van omzet</option>
            <option value="fixed">Vast bedrag</option>
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
          <select value={ruleType} onChange={(e) => setRuleType(e.target.value as AfRuleType)} className={inputCls}>
            <option value="standard">Standaard</option>
            <option value="promo">Tijdelijke actie</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Geldig vanaf</span>
          <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Geldig t/m {ruleType === "promo" && <span className="text-red-600">*</span>}</span>
          <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className={inputCls} />
        </label>
      </div>

      {percentOnLead && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Een percentage op een lead levert €0 — een lead heeft geen omzet. Gebruik
          een vast bedrag voor leads.
        </p>
      )}
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
