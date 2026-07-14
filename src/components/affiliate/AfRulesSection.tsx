"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AfRuleForm } from "@/components/affiliate/AfRuleForm";
import { archiveAfRuleAction } from "@/lib/affiliate/actions";
import { formatMoney } from "@/lib/partnerdesk/format";
import { formatNlDay } from "@/lib/partnerdesk/format";
import type { AfCommissionRule } from "@/types/affiliate";

const APPLIES_LABEL: Record<string, string> = {
  lead: "lead",
  sale: "verkoop",
  both: "lead + verkoop",
};

function ruleValue(rule: AfCommissionRule): string {
  return rule.value_type === "percent"
    ? `${rule.rate_percent}%`
    : formatMoney(rule.amount_cents);
}

export function AfRulesSection({
  affiliateId,
  affiliateRef,
  rules,
}: {
  affiliateId: string;
  affiliateRef: string;
  rules: AfCommissionRule[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function archive(ruleId: string) {
    startTransition(async () => {
      await archiveAfRuleAction({ ruleId, ref: affiliateRef });
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {rules.length === 0 && !adding && (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen commissieafspraken.</p>
      )}

      {rules.map((rule) =>
        editId === rule.id ? (
          <AfRuleForm
            key={rule.id}
            affiliateId={affiliateId}
            affiliateRef={affiliateRef}
            existing={rule}
            onDone={() => setEditId(null)}
          />
        ) : (
          <div key={rule.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--ps-border)] p-3 text-sm">
            <span className="rounded-full bg-[var(--ps-bg)] px-2 py-0.5 text-xs text-[var(--ps-body)]">
              {rule.rule_type === "promo" ? "actie" : "standaard"}
            </span>
            <span className="font-semibold">{ruleValue(rule)}</span>
            <span className="text-[var(--ps-muted)]">· {APPLIES_LABEL[rule.applies_to]}</span>
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
        ),
      )}

      {adding ? (
        <AfRuleForm
          affiliateId={affiliateId}
          affiliateRef={affiliateRef}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg border border-[var(--ps-border)] px-3.5 py-2 text-sm font-medium text-[var(--ps-body)] hover:bg-[var(--ps-bg)]"
        >
          + Commissieafspraak
        </button>
      )}
    </div>
  );
}
