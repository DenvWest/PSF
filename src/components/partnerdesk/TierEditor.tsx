"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addTierAction, removeTierAction } from "@/lib/partnerdesk/contract-actions";
import { formatCommissionValue, formatMoney } from "@/lib/partnerdesk/format";
import type { CommissionKind, PdCommissionTier } from "@/types/partnerdesk";

export function TierEditor({
  ruleId,
  kind,
  tiers,
  slug,
}: {
  ruleId: string;
  kind: CommissionKind;
  tiers: PdCommissionTier[];
  slug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [threshold, setThreshold] = useState("");
  const [value, setValue] = useState("");
  const isPercent = kind === "cps_percent";

  function add() {
    if (threshold.trim() === "" || value.trim() === "") return;
    startTransition(async () => {
      await addTierAction({
        ruleId,
        kind,
        thresholdCents: Math.round(Number(threshold) * 100),
        ratePercent: isPercent ? Number(value) : null,
        amountCents: isPercent ? null : Math.round(Number(value) * 100),
        slug,
      });
      setThreshold("");
      setValue("");
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await removeTierAction({ tierId: id, slug });
      router.refresh();
    });
  }

  const inputCls = "w-24 rounded border border-[var(--ps-border)] px-2 py-1 text-xs outline-none focus:border-[var(--ps-green)]";

  return (
    <div className="mt-2 rounded-md bg-[var(--ps-bg)] p-2">
      <p className="mb-1 text-xs font-medium text-[var(--ps-body)]">Staffels</p>
      {tiers.length > 0 && (
        <table className="mb-2 w-full text-xs">
          <tbody>
            {tiers.map((t) => (
              <tr key={t.id}>
                <td className="py-0.5 text-[var(--ps-body)]">vanaf {formatMoney(t.threshold_cents)}/mnd</td>
                <td className="py-0.5">{formatCommissionValue(kind, t.rate_percent, t.amount_cents)}</td>
                <td className="py-0.5 text-right">
                  <button type="button" onClick={() => remove(t.id)} disabled={pending} className="text-[var(--ps-muted)] hover:text-red-600">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex items-center gap-2">
        <input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="drempel €/mnd" className={inputCls} type="number" step="0.01" />
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={isPercent ? "%" : "€"} className={inputCls} type="number" step="0.01" />
        <button type="button" onClick={add} disabled={pending} className="rounded border border-[var(--ps-border)] px-2 py-1 text-xs hover:bg-[var(--ps-surface)]">
          + Staffel
        </button>
      </div>
    </div>
  );
}
