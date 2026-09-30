import { CatalogTabs } from "@/components/product-admin/CatalogTabs";
import { ImportWizard } from "@/components/product-admin/ImportWizard";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Import</h1>
        <p className="mt-0.5 text-sm text-[var(--ps-body)]">
          Producten in bulk aanmaken uit een CSV. Eerst een controle zonder iets te schrijven, daarna importeren als concept.
        </p>
      </header>
      <CatalogTabs />
      <ImportWizard />
    </div>
  );
}
