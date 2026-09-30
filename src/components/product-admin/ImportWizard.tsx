"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import { commitImportAction, previewImportAction, type ImportCommitResult, type ImportPreview } from "@/lib/product-admin/import-actions";
import { IMPORT_MAX_CHARS } from "@/lib/product-admin/import";

const STATUS_LABEL = { ok: "Klaar", duplicate: "Bestaat al", error: "Fout" } as const;
const STATUS_CLASS = {
  ok: "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]",
  duplicate: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
} as const;

export function ImportWizard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [csv, setCsv] = useState("");
  const [allowNewBrands, setAllowNewBrands] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportCommitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPreview(null);
    setResult(null);
    setError(null);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > IMPORT_MAX_CHARS) {
      setError("Bestand is te groot (max 500 KB).");
      return;
    }
    setCsv(await file.text());
    reset();
  }

  function check() {
    reset();
    startTransition(async () => {
      const res = await previewImportAction({ csv, allowNewBrands });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPreview(res.data);
    });
  }

  function commit() {
    setError(null);
    startTransition(async () => {
      const res = await commitImportAction({ csv, allowNewBrands });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.data);
      setPreview(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] p-5">
        <h2 className="text-base font-semibold">1. Bestand</h2>
        <p className="mt-1 text-sm text-[var(--ps-body)]">
          CSV met kopregel <code className="text-xs">merk;naam;categorie</code> (verplicht) en optioneel{" "}
          <code className="text-xs">variant;vorm;product_url;retailer;prijs;affiliate_url</code>. Puntkomma of komma, max 200 regels.{" "}
          <a href="/api/admin/data/product-import-template" className="text-[var(--ps-green-hover)] hover:underline">
            Download sjabloon
          </a>
        </p>
        <input type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="mt-3 text-sm" aria-label="CSV-bestand kiezen" />
        <label className="mt-3 flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Of plak de inhoud</span>
          <textarea
            value={csv}
            onChange={(e) => {
              setCsv(e.target.value);
              reset();
            }}
            rows={7}
            className="rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 font-mono text-xs outline-none focus:border-[var(--ps-green)]"
          />
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowNewBrands}
            onChange={(e) => {
              setAllowNewBrands(e.target.checked);
              reset();
            }}
            className="accent-[var(--ps-green)]"
          />
          Onbekende merken automatisch aanmaken
        </label>
        <button
          type="button"
          disabled={pending || csv.trim() === ""}
          onClick={check}
          className="mt-4 rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          {pending && !preview ? "Controleren…" : "Controleer"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      {preview && (
        <section className="rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] p-5">
          <h2 className="text-base font-semibold">2. Controle</h2>
          <p className="mt-1 text-sm text-[var(--ps-body)]">
            {preview.summary.total} regels: {preview.summary.ok} klaar om te importeren, {preview.summary.duplicates} bestaan al of komen
            dubbel voor, {preview.summary.errors} met een fout
            {preview.summary.newBrands > 0 && `; ${preview.summary.newBrands} nieuw merk`}. Alles komt als concept binnen; publiceren
            blijft achter de publiceerpoort.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                  <th className="py-1 pr-3 font-medium">Regel</th>
                  <th className="py-1 pr-3 font-medium">Product</th>
                  <th className="py-1 pr-3 font-medium">Categorie</th>
                  <th className="py-1 pr-3 font-medium">Aanbieding</th>
                  <th className="py-1 pr-3 font-medium">Status</th>
                  <th className="py-1 font-medium">Opmerking</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.line} className="border-t border-[var(--ps-border)] align-top">
                    <td className="py-1.5 pr-3 tabular-nums text-[var(--ps-muted)]">{r.line}</td>
                    <td className="py-1.5 pr-3">
                      {r.brandName} {r.name}
                      {r.newBrand && r.status === "ok" && <span className="ml-1 text-xs text-[var(--ps-muted)]">(nieuw merk)</span>}
                    </td>
                    <td className="py-1.5 pr-3 text-[var(--ps-body)]">{r.categoryName || "—"}</td>
                    <td className="py-1.5 pr-3 tabular-nums text-[var(--ps-body)]">{r.offer ? `€ ${(r.offer.priceCents / 100).toFixed(2).replace(".", ",")}` : "—"}</td>
                    <td className="py-1.5 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                    </td>
                    <td className="py-1.5 text-xs text-[var(--ps-body)]">{r.messages.join(" ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            disabled={pending || preview.summary.ok === 0}
            onClick={commit}
            className="mt-4 rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
          >
            {pending ? "Importeren…" : `Importeer ${preview.summary.ok} als concept`}
          </button>
        </section>
      )}

      {result && (
        <section className="rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] p-5 text-sm">
          <h2 className="text-base font-semibold">3. Klaar</h2>
          <p className="mt-1">
            {result.created} product(en) aangemaakt als concept
            {result.newBrands > 0 && `, ${result.newBrands} nieuw merk`}; {result.skipped} overgeslagen.
          </p>
          {result.failures.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-red-700">
              {result.failures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
          <Link href="/admin/producten?status=draft" className="mt-3 inline-block text-[var(--ps-green-hover)] hover:underline">
            Bekijk de concepten →
          </Link>
        </section>
      )}
    </div>
  );
}
