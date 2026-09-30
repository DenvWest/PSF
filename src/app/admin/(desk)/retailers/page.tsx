import Link from "next/link";
import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { InlineField } from "@/components/partnerdesk/InlineField";
import { CatalogTabs } from "@/components/product-admin/CatalogTabs";
import { NewRetailerForm, RetailerActiveToggle } from "@/components/product-admin/RetailerControls";
import { listPartnerOptions, listRetailers } from "@/lib/product-admin/queries";

export const dynamic = "force-dynamic";

export default async function RetailersPage() {
  const [retailers, partners] = await Promise.all([listRetailers(), listPartnerOptions()]);
  const partnerOptions = [{ value: "", label: "— geen —" }, ...partners.map((p) => ({ value: p.id, label: p.name }))];

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Retailers</h1>
        <p className="mt-0.5 text-sm text-[var(--ps-body)]">
          {retailers.length} {retailers.length === 1 ? "retailer" : "retailers"}. Contract, cookieduur en commissie staan in het
          PartnerDesk-dossier; hier alleen de koppeling en het meetpad.
        </p>
      </header>
      <CatalogTabs />

      <div className="mb-5 rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] p-4">
        <NewRetailerForm partners={partners} />
      </div>

      {retailers.length === 0 ? (
        <EmptyState title="Nog geen retailers">Retailers komen uit de aanbiedingen-backfill of voeg er hierboven een toe.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="px-5 py-3 font-medium">Naam</th>
                <th className="px-3 py-3 font-medium">Soort</th>
                <th className="px-3 py-3 font-medium">PartnerDesk</th>
                <th className="px-3 py-3 font-medium">Basis-URL</th>
                <th className="px-3 py-3 font-medium">Tracking-param</th>
                <th className="px-3 py-3 font-medium">Vermelding</th>
                <th className="px-3 py-3 text-right font-medium">Aanbiedingen</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {retailers.map((r) => (
                <tr key={r.id} className="border-b border-[var(--ps-border)] align-top last:border-0">
                  <td className="px-5 py-2">
                    <InlineField entity="retailer" id={r.id} field="name" value={r.name} />
                    <span className="text-xs text-[var(--ps-muted)]">{r.slug}</span>
                  </td>
                  <td className="px-3 py-3 text-[var(--ps-body)]">{r.relationship === "direct" ? "Direct" : "Netwerk"}</td>
                  <td className="px-3 py-2">
                    <InlineField
                      entity="retailer"
                      id={r.id}
                      field="pd_partner_id"
                      value={r.pd_partner_id ?? ""}
                      variant="select"
                      options={partnerOptions}
                      placeholder="— geen —"
                    />
                    {r.partner && (
                      <Link href={`/admin/partners/${r.partner.slug}`} className="text-xs text-[var(--ps-green-hover)] hover:underline">
                        Open dossier →
                      </Link>
                    )}
                  </td>
                  <td className="px-3 py-2"><InlineField entity="retailer" id={r.id} field="base_url" value={r.base_url ?? ""} placeholder="—" asLink /></td>
                  <td className="px-3 py-2"><InlineField entity="retailer" id={r.id} field="tracking_param" value={r.tracking_param ?? ""} placeholder="—" /></td>
                  <td className="px-3 py-2"><InlineField entity="retailer" id={r.id} field="disclosure_label" value={r.disclosure_label ?? ""} placeholder="—" /></td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.offerCount}</td>
                  <td className="px-5 py-3"><RetailerActiveToggle retailerId={r.id} active={r.active} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
