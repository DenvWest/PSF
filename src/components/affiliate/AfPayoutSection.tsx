"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createPayoutAction,
  markPayoutPaidAction,
} from "@/lib/affiliate/payout-actions";
import { formatMoney, formatNlDay } from "@/lib/partnerdesk/format";
import type { AfPayout } from "@/types/affiliate";

const STATUS_LABEL: Record<string, string> = {
  draft: "Concept",
  approved: "Goedgekeurd",
  sent: "Verzonden",
  paid: "Uitbetaald",
  failed: "Mislukt",
};

export function AfPayoutSection({
  affiliateId,
  affiliateRef,
  approvedCents,
  payouts,
}: {
  affiliateId: string;
  affiliateRef: string;
  approvedCents: number;
  payouts: AfPayout[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Er ging iets mis.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--ps-body)]">
          Goedgekeurd saldo: <span className="font-semibold text-[var(--ps-ink)]">{formatMoney(approvedCents)}</span>
        </p>
        <button
          type="button"
          onClick={() => run(() => createPayoutAction({ affiliateId, ref: affiliateRef }))}
          disabled={pending || approvedCents <= 0}
          className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          Uitbetaling voorbereiden
        </button>
      </div>

      {payouts.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen uitbetalingen.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--ps-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="px-3 py-2 font-medium">Periode</th>
                <th className="px-3 py-2 font-medium text-right">Bedrag</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Actie</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-[var(--ps-border)] last:border-0">
                  <td className="px-3 py-2">{p.period}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatMoney(p.total_cents)}</td>
                  <td className="px-3 py-2 text-[var(--ps-body)]">
                    {STATUS_LABEL[p.status] ?? p.status}
                    {p.paid_at && <span className="ml-1 text-xs text-[var(--ps-muted)]">· {formatNlDay(p.paid_at)}</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p.status !== "paid" && (
                      <button
                        type="button"
                        onClick={() => run(() => markPayoutPaidAction({ payoutId: p.id, ref: affiliateRef }))}
                        disabled={pending}
                        className="text-xs text-[var(--ps-body)] hover:underline"
                      >
                        Markeer betaald
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-[var(--ps-muted)]">
        Betaald markeren verplaatst het saldo naar uitbetaald en schrijft een
        outbox-rij voor de boekhouding.
      </p>
    </div>
  );
}
