import { formatMoney, formatNlDay } from "@/lib/partnerdesk/format";
import type { AffiliateLedger } from "@/lib/affiliate/queries";

const KIND_LABEL: Record<string, string> = {
  accrual: "Commissie",
  reversal: "Terugboeking",
  adjustment: "Correctie",
  payout: "Uitbetaling",
  fee: "Kosten",
};
const STATE_LABEL: Record<string, string> = {
  pending: "In behandeling",
  approved: "Goedgekeurd",
  paid: "Uitbetaald",
  rejected: "Afgekeurd",
};

function Tile({ label, cents, accent }: { label: string; cents: number; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--ps-border)] px-4 py-3">
      <div className="text-xs text-[var(--ps-muted)]">{label}</div>
      <div className={`text-lg font-semibold ${accent ? "text-[var(--ps-green-hover)]" : ""}`}>
        {formatMoney(cents)}
      </div>
    </div>
  );
}

export function AfLedgerSection({ ledger }: { ledger: AffiliateLedger }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Tile label="Openstaand" cents={ledger.outstandingCents} accent />
        <Tile label="Goedgekeurd" cents={ledger.approvedCents} />
        <Tile label="Uitbetaald" cents={ledger.paidCents} />
      </div>

      {ledger.entries.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen grootboekregels.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--ps-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="px-3 py-2 font-medium">Soort</th>
                <th className="px-3 py-2 font-medium">Periode</th>
                <th className="px-3 py-2 font-medium">Geboekt</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {ledger.entries.map((e) => (
                <tr key={e.id} className="border-b border-[var(--ps-border)] last:border-0">
                  <td className="px-3 py-2">{KIND_LABEL[e.kind] ?? e.kind}</td>
                  <td className="px-3 py-2 text-[var(--ps-body)]">{e.period}</td>
                  <td className="px-3 py-2 text-[var(--ps-body)]">{formatNlDay(e.posted_at)}</td>
                  <td className="px-3 py-2 text-[var(--ps-body)]">{STATE_LABEL[e.state] ?? e.state}</td>
                  <td className={`px-3 py-2 text-right ${e.amount_cents < 0 ? "text-red-600" : ""}`}>
                    {formatMoney(e.amount_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-[var(--ps-muted)]">
        Uitbetaling van het goedgekeurde saldo komt in plak A4.
      </p>
    </div>
  );
}
