"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createProductAction } from "@/lib/product-admin/edit-actions";

interface Option {
  id: string;
  name: string;
}

const inputCls =
  "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";

export function NewProductForm({ brands, categories }: { brands: Option[]; categories: Option[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [variant, setVariant] = useState("");
  const [form, setForm] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createProductAction({ name, brandId, categoryId, variant, form });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/producten/${result.data.slug}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="text-[var(--ps-body)]">Productnaam</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="bijv. Magnesium Bisglycinaat" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Merk</span>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputCls}>
            <option value="">— kies —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Categorie</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
            <option value="">— kies —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Variant (optioneel)</span>
          <input value={variant} onChange={(e) => setVariant(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Vorm (optioneel)</span>
          <input value={form} onChange={(e) => setForm(e.target.value)} className={inputCls} placeholder="bijv. capsule" />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          {pending ? "Aanmaken…" : "Product aanmaken"}
        </button>
      </div>
    </form>
  );
}
