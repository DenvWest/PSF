"use client";

import type { AffiliateReportRow } from "@/lib/affiliate/reporting";

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function AfReportExport({
  rows,
  from,
  to,
}: {
  rows: AffiliateReportRow[];
  from: string;
  to: string;
}) {
  function onExport() {
    const header = ["ref", "naam", "clicks", "leads", "sales", "omzet_eur", "commissie_eur", "conversie_pct", "epc_eur"];
    const lines = rows.map((r) =>
      [
        r.affiliate.ref,
        r.affiliate.display_name,
        r.clicks,
        r.leads,
        r.sales,
        (r.revenueCents / 100).toFixed(2),
        (r.commissionCents / 100).toFixed(2),
        r.conversionPct ?? "",
        r.epcCents !== null ? (r.epcCents / 100).toFixed(2) : "",
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiliate-rapportage-${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={onExport}
      disabled={rows.length === 0}
      className="rounded-lg border border-[var(--ps-border)] px-3.5 py-2 text-sm font-medium text-[var(--ps-body)] hover:bg-[var(--ps-bg)] disabled:opacity-50"
    >
      Exporteer CSV
    </button>
  );
}
