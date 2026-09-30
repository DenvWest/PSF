import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { InlineField } from "@/components/partnerdesk/InlineField";
import { CatalogTabs } from "@/components/product-admin/CatalogTabs";
import { NewBrandForm } from "@/components/product-admin/NewBrandForm";
import { listBrands } from "@/lib/product-admin/queries";

export const dynamic = "force-dynamic";

export default async function MerkenPage() {
  const brands = await listBrands();

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Merken</h1>
          <p className="mt-0.5 text-sm text-[var(--ps-body)]">
            {brands.length} {brands.length === 1 ? "merk" : "merken"}
          </p>
        </div>
        <NewBrandForm />
      </header>
      <CatalogTabs />

      {brands.length === 0 ? (
        <EmptyState title="Nog geen merken">Voeg een merk toe voordat je een product aanmaakt.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="px-5 py-3 font-medium">Naam</th>
                <th className="px-3 py-3 font-medium">Fabrikant</th>
                <th className="px-3 py-3 font-medium">Land</th>
                <th className="px-3 py-3 font-medium">Website</th>
                <th className="px-3 py-3 font-medium">Transparantie</th>
                <th className="px-5 py-3 text-right font-medium">Producten</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-[var(--ps-border)] align-top last:border-0">
                  <td className="px-5 py-2">
                    <InlineField entity="brand" id={b.id} field="name" value={b.name} />
                    <span className="text-xs text-[var(--ps-muted)]">{b.slug}</span>
                  </td>
                  <td className="px-3 py-2"><InlineField entity="brand" id={b.id} field="manufacturer" value={b.manufacturer ?? ""} placeholder="—" /></td>
                  <td className="px-3 py-2"><InlineField entity="brand" id={b.id} field="country" value={b.country ?? ""} placeholder="—" /></td>
                  <td className="px-3 py-2"><InlineField entity="brand" id={b.id} field="website" value={b.website ?? ""} placeholder="—" asLink /></td>
                  <td className="px-3 py-2"><InlineField entity="brand" id={b.id} field="transparency_note" value={b.transparency_note ?? ""} variant="textarea" placeholder="—" /></td>
                  <td className="px-5 py-2 text-right tabular-nums">{b.productCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
