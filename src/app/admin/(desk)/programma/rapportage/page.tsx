import Link from "next/link";
import { AfReportExport } from "@/components/affiliate/AfReportExport";
import { getProgramReport } from "@/lib/affiliate/reporting";
import { formatMoney } from "@/lib/partnerdesk/format";
import { todayIso } from "@/lib/partnerdesk/dates";

export const dynamic = "force-dynamic";

export default async function RapportagePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const today = todayIso();
  const from = sp.from || `${today.slice(0, 7)}-01`;
  const to = sp.to || today;
  const report = await getProgramReport(from, to);

  const totals = report.rows.reduce(
    (acc, r) => ({
      clicks: acc.clicks + r.clicks,
      leads: acc.leads + r.leads,
      sales: acc.sales + r.sales,
      revenue: acc.revenue + r.revenueCents,
      commission: acc.commission + r.commissionCents,
    }),
    { clicks: 0, leads: 0, sales: 0, revenue: 0, commission: 0 },
  );
  const totalEpc = totals.clicks > 0 ? Math.round(totals.commission / totals.clicks) : null;

  const inputCls = "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm";

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/programma" className="text-sm text-[var(--ps-body)] hover:underline">
            ← Affiliates
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Rapportage</h1>
        </div>
        <div className="flex items-end gap-3">
          <form method="get" className="flex items-end gap-2">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--ps-body)]">Van</span>
              <input type="date" name="from" defaultValue={from} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--ps-body)]">Tot</span>
              <input type="date" name="to" defaultValue={to} className={inputCls} />
            </label>
            <button type="submit" className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)]">
              Toon
            </button>
          </form>
          <AfReportExport rows={report.rows} from={from} to={to} />
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
              <th className="px-5 py-3 font-medium">Affiliate</th>
              <th className="px-5 py-3 font-medium text-right">Clicks</th>
              <th className="px-5 py-3 font-medium text-right">Leads</th>
              <th className="px-5 py-3 font-medium text-right">Sales</th>
              <th className="px-5 py-3 font-medium text-right">Conv.%</th>
              <th className="px-5 py-3 font-medium text-right">Omzet</th>
              <th className="px-5 py-3 font-medium text-right">Commissie</th>
              <th className="px-5 py-3 font-medium text-right">EPC</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((r) => (
              <tr key={r.affiliate.id} className="border-b border-[var(--ps-border)] hover:bg-[var(--ps-bg)]">
                <td className="px-5 py-3">
                  <Link href={`/admin/programma/${r.affiliate.ref}`} className="font-medium hover:underline">
                    {r.affiliate.display_name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-right text-[var(--ps-body)]">{r.clicks}</td>
                <td className="px-5 py-3 text-right text-[var(--ps-body)]">{r.leads}</td>
                <td className="px-5 py-3 text-right text-[var(--ps-body)]">{r.sales}</td>
                <td className="px-5 py-3 text-right text-[var(--ps-body)]">{r.conversionPct !== null ? `${r.conversionPct}%` : "—"}</td>
                <td className="px-5 py-3 text-right text-[var(--ps-body)]">{formatMoney(r.revenueCents)}</td>
                <td className="px-5 py-3 text-right font-medium">{formatMoney(r.commissionCents)}</td>
                <td className="px-5 py-3 text-right text-[var(--ps-body)]">{r.epcCents !== null ? formatMoney(r.epcCents) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--ps-border)] font-semibold">
              <td className="px-5 py-3">Totaal</td>
              <td className="px-5 py-3 text-right">{totals.clicks}</td>
              <td className="px-5 py-3 text-right">{totals.leads}</td>
              <td className="px-5 py-3 text-right">{totals.sales}</td>
              <td className="px-5 py-3 text-right">—</td>
              <td className="px-5 py-3 text-right">{formatMoney(totals.revenue)}</td>
              <td className="px-5 py-3 text-right">{formatMoney(totals.commission)}</td>
              <td className="px-5 py-3 text-right">{totalEpc !== null ? formatMoney(totalEpc) : "—"}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
