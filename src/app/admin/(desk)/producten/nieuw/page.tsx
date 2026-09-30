import Link from "next/link";
import { NewProductForm } from "@/components/product-admin/NewProductForm";
import { listBrands, listCategories } from "@/lib/product-admin/queries";

export const dynamic = "force-dynamic";

export default async function NieuwProductPage() {
  const [brands, categories] = await Promise.all([listBrands(), listCategories()]);

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link href="/admin/producten" className="text-sm text-[var(--ps-body)] hover:underline">
        ← Producten
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Nieuw product</h1>
      <p className="mb-5 mt-0.5 text-sm text-[var(--ps-body)]">
        Het product start als concept. In het dossier vul je daarna werkzame stoffen, afbeelding, aanbieding en bron aan tot de
        publiceerpoort volledig groen is.
      </p>
      {brands.length === 0 ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Er is nog geen merk. <Link href="/admin/merken" className="underline">Maak eerst een merk aan</Link>.
        </p>
      ) : (
        <NewProductForm
          brands={brands.map((b) => ({ id: b.id, name: b.name }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      )}
    </div>
  );
}
