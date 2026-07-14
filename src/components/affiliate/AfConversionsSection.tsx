"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  importConversionsCsvAction,
  recordManualConversionAction,
  setConversionStatusAction,
} from "@/lib/affiliate/conversion-actions";
import { formatMoney, formatNlDay } from "@/lib/partnerdesk/format";
import { todayIso } from "@/lib/partnerdesk/dates";
import type { AfConversion, AfConversionType } from "@/types/affiliate";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "In behandeling", cls: "bg-amber-50 text-amber-700" },
  approved: { label: "Goedgekeurd", cls: "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]" },
  rejected: { label: "Afgekeurd", cls: "bg-stone-100 text-stone-500" },
};

export function AfConversionsSection({
  affiliateId,
  affiliateRef,
  conversions,
}: {
  affiliateId: string;
  affiliateRef: string;
  conversions: AfConversion[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<AfConversionType>("sale");
  const [occurredOn, setOccurredOn] = useState(todayIso());
  const [revenueEur, setRevenueEur] = useState("");
  const [orderRef, setOrderRef] = useState("");

  const [csvOpen, setCsvOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [csvResult, setCsvResult] = useState<string | null>(null);

  function onManual(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await recordManualConversionAction({
        affiliateId,
        ref: affiliateRef,
        type,
        occurredOn,
        revenueEur,
        orderRef,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRevenueEur("");
      setOrderRef("");
      router.refresh();
    });
  }

  function setStatus(conversionId: string, status: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const result = await setConversionStatusAction({ conversionId, status, ref: affiliateRef });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function onCsv() {
    setError(null);
    setCsvResult(null);
    startTransition(async () => {
      const result = await importConversionsCsvAction({ affiliateId, ref: affiliateRef, csv });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCsvResult(`${result.data.imported} geïmporteerd, ${result.data.skipped} overgeslagen`);
      setCsv("");
      router.refresh();
    });
  }

  const inputCls =
    "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";

  return (
    <div className="space-y-4">
      {conversions.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen conversies.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--ps-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Datum</th>
                <th className="px-3 py-2 font-medium text-right">Omzet</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Actie</th>
              </tr>
            </thead>
            <tbody>
              {conversions.map((c) => {
                const s = STATUS_LABEL[c.status];
                return (
                  <tr key={c.id} className="border-b border-[var(--ps-border)] last:border-0">
                    <td className="px-3 py-2">{c.type === "sale" ? "Verkoop" : "Lead"}</td>
                    <td className="px-3 py-2 text-[var(--ps-body)]">{formatNlDay(c.occurred_at)}</td>
                    <td className="px-3 py-2 text-right">{c.type === "sale" ? formatMoney(c.revenue_cents) : "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="flex justify-end gap-2 text-xs text-[var(--ps-body)]">
                        {c.status === "pending" && (
                          <button type="button" onClick={() => setStatus(c.id, "approved")} disabled={pending} className="hover:underline">
                            Goedkeuren
                          </button>
                        )}
                        {c.status !== "rejected" && (
                          <button type="button" onClick={() => setStatus(c.id, "rejected")} disabled={pending} className="hover:underline">
                            Afkeuren
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={onManual} className="flex flex-wrap items-end gap-2 rounded-lg border border-[var(--ps-border)] bg-[var(--ps-bg)] p-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[var(--ps-body)]">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as AfConversionType)} className={`${inputCls} bg-[var(--ps-surface)]`}>
            <option value="sale">Verkoop</option>
            <option value="lead">Lead</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[var(--ps-body)]">Datum</span>
          <input type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} className={inputCls} />
        </label>
        {type === "sale" && (
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-[var(--ps-body)]">Omzet (€)</span>
            <input type="number" step="0.01" value={revenueEur} onChange={(e) => setRevenueEur(e.target.value)} className={inputCls} />
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-[var(--ps-body)]">Order-ref (optioneel)</span>
          <input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} className={inputCls} />
        </label>
        <button type="submit" disabled={pending} className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50">
          + Conversie
        </button>
      </form>

      <div>
        <button type="button" onClick={() => setCsvOpen((o) => !o)} className="text-xs text-[var(--ps-body)] hover:underline">
          {csvOpen ? "− CSV-import verbergen" : "+ CSV-import"}
        </button>
        {csvOpen && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-[var(--ps-muted)]">
              Formaat per regel: <code>external_id,type,datum,omzet_eur,order_ref</code> — type is <code>lead</code> of <code>sale</code>, datum <code>JJJJ-MM-DD</code>.
            </p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={4} className={`${inputCls} w-full font-mono`} placeholder="ord-123,sale,2026-07-01,49.95,ORD-123" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={onCsv} disabled={pending || !csv.trim()} className="rounded-lg border border-[var(--ps-border)] px-3 py-1.5 text-sm hover:bg-[var(--ps-bg)] disabled:opacity-50">
                Importeer
              </button>
              {csvResult && <span className="text-xs text-[var(--ps-green-hover)]">{csvResult}</span>}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
