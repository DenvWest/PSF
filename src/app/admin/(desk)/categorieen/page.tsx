import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { InlineField } from "@/components/partnerdesk/InlineField";
import { CatalogTabs } from "@/components/product-admin/CatalogTabs";
import { listCategories } from "@/lib/product-admin/queries";

export const dynamic = "force-dynamic";

export default async function CategorieenPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Categorieën</h1>
        <p className="mt-0.5 text-sm text-[var(--ps-body)]">
          {categories.length} {categories.length === 1 ? "categorie" : "categorieën"}. Slug, claimsleutel en
          vergelijkingspagina zijn gekoppeld aan code en hier alleen te lezen.
        </p>
      </header>
      <CatalogTabs />

      {categories.length === 0 ? (
        <EmptyState title="Nog geen categorieën">Categorieën komen uit de backfill.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="px-5 py-3 font-medium">Naam</th>
                <th className="px-3 py-3 font-medium">Omschrijving</th>
                <th className="px-3 py-3 font-medium">Slug</th>
                <th className="px-3 py-3 font-medium">Claimsleutel</th>
                <th className="px-5 py-3 text-right font-medium">Producten</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-[var(--ps-border)] align-top last:border-0">
                  <td className="px-5 py-2"><InlineField entity="category" id={c.id} field="name" value={c.name} /></td>
                  <td className="px-3 py-2"><InlineField entity="category" id={c.id} field="description" value={c.description ?? ""} variant="textarea" placeholder="—" /></td>
                  <td className="px-3 py-3 text-[var(--ps-body)]">{c.slug}</td>
                  <td className="px-3 py-3 text-[var(--ps-body)]">{c.ingredient_claim_key ?? "—"}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{c.productCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
