"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bulkFillImageLicenseAction } from "@/lib/product-admin/bulk-actions";
import { IMAGE_SOURCES, IMAGE_SOURCE_LABEL } from "@/lib/product-admin/edit-validation";
import type { RetailerOption } from "@/lib/product-admin/queries";

const inputCls =
  "rounded-md border border-[var(--ps-border)] px-2 py-1 text-sm outline-none focus:border-[var(--ps-green)]";

function defaultNote(retailerName: string, today: string): string {
  return `Aanname eigenaar (${today}): gebruik via het affiliate-programma van ${retailerName}; voorwaarden per campagne niet afzonderlijk nagegaan.`;
}

export function BulkImageLicense({ retailers, today }: { retailers: RetailerOption[]; today: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [retailerId, setRetailerId] = useState(retailers[0]?.id ?? "");
  const [source, setSource] = useState<string>("merchant_feed");
  const [note, setNote] = useState(retailers[0] ? defaultNote(retailers[0].name, today) : "");
  const [preview, setPreview] = useState<{ products: number; images: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPreview(null);
    setMessage(null);
    setError(null);
  }

  function run(dryRun: boolean) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await bulkFillImageLicenseAction({ retailerId, source, licenseNote: note, dryRun });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (dryRun) {
        setPreview({ products: result.products, images: result.images });
        return;
      }
      setPreview(null);
      setMessage(`${result.images} afbeelding(en) van ${result.products} product(en) bijgewerkt.`);
      router.refresh();
    });
  }

  return (
    <details className="mb-5 rounded-lg border border-[var(--ps-border)] bg-[var(--ps-surface)] px-4 py-3 text-sm">
      <summary className="cursor-pointer font-medium text-[var(--ps-ink)]">Afbeeldingen invullen per winkel</summary>
      <p className="mt-2 text-xs text-[var(--ps-body)]">
        Zet bron en licentie-notitie bij alle afbeeldingen van producten van deze winkel die nog geen notitie hebben. Bestaande
        notities blijven staan. De notitie moet kloppen: beschrijf wat je hebt nagegaan.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-[var(--ps-body)]">
          Winkel
          <select
            value={retailerId}
            onChange={(e) => {
              const next = retailers.find((r) => r.id === e.target.value);
              setRetailerId(e.target.value);
              if (next) setNote(defaultNote(next.name, today));
              reset();
            }}
            className={inputCls}
          >
            {retailers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--ps-body)]">
          Bron
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              reset();
            }}
            className={inputCls}
          >
            {IMAGE_SOURCES.map((s) => (
              <option key={s} value={s}>
                {IMAGE_SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[20rem] flex-1 flex-col gap-1 text-xs text-[var(--ps-body)]">
          Licentie-notitie
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              reset();
            }}
            rows={2}
            className={inputCls}
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {preview === null ? (
          <button
            type="button"
            disabled={pending || retailerId === ""}
            onClick={() => run(true)}
            className="rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
          >
            Controleer wat er verandert
          </button>
        ) : preview.images === 0 ? (
          <p className="text-xs text-[var(--ps-body)]">Geen afbeeldingen zonder notitie bij deze winkel.</p>
        ) : (
          <>
            <p className="text-xs text-[var(--ps-ink)]">
              {preview.images} afbeelding(en) van {preview.products} product(en) krijgen deze notitie.
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(false)}
              className="rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
            >
              Bevestig en voer uit
            </button>
          </>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        {message && <p className="text-xs text-[var(--ps-green-hover)]">{message}</p>}
      </div>
    </details>
  );
}
