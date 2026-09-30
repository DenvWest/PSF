"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import {
  addSourceAction,
  removeSourceAction,
  setOfferActiveAction,
  updateActiveAction,
  updateImageAction,
  updateOfferPriceAction,
} from "@/lib/product-admin/edit-actions";
import {
  DOSAGE_UNITS,
  IMAGE_SOURCES,
  IMAGE_SOURCE_LABEL,
  SOURCE_KINDS,
  parseEuroToCents,
} from "@/lib/product-admin/edit-validation";
import type { ProductActiveRow, ProductImageRow, ProductOfferRow, ProductSourceRow } from "@/lib/product-admin/queries";

const inputCls =
  "rounded-md border border-[var(--ps-border)] px-2 py-1 text-sm outline-none focus:border-[var(--ps-green)]";
const primaryBtn =
  "rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50";
const ghostBtn = "rounded-lg px-3 py-1.5 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-bg)] disabled:opacity-50";

type Result = { ok: boolean; error?: string };

function useRun() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function run(fn: () => Promise<Result>) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Er ging iets mis.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }
  return { run, pending, error, saved };
}

function Feedback({ error, saved }: { error: string | null; saved: boolean }) {
  if (error) return <p className="text-xs text-red-600">{error}</p>;
  if (saved) return <p className="text-xs text-[var(--ps-green-hover)]">Opgeslagen</p>;
  return null;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[var(--ps-body)]">
      {label}
      {children}
    </label>
  );
}

export function ActiveEditor({ active, productId, slug }: { active: ProductActiveRow; productId: string; slug: string }) {
  const { run, pending, error, saved } = useRun();
  const [amount, setAmount] = useState(active.amount_per_serving != null ? String(active.amount_per_serving) : "");
  const [unit, setUnit] = useState(active.unit ?? "mg");

  return (
    <li className="flex flex-wrap items-end gap-3 border-t border-[var(--ps-border)] py-2 first:border-t-0">
      <span className="w-40 pb-1.5 text-sm">
        {active.nutrient_key}
        {active.form_key && <span className="ml-1 text-xs text-[var(--ps-muted)]">{active.form_key}</span>}
      </span>
      <Field label="Per portie">
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputCls} w-24`} />
      </Field>
      <Field label="Eenheid">
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls}>
          {DOSAGE_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </Field>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          run(() =>
            updateActiveAction({
              activeId: active.id,
              productId,
              slug,
              amount: Number(amount.replace(",", ".")),
              unit,
            }),
          )
        }
        className={primaryBtn}
      >
        Opslaan
      </button>
      <Feedback error={error} saved={saved} />
    </li>
  );
}

export function ImageEditor({ image, productId, slug }: { image: ProductImageRow; productId: string; slug: string }) {
  const { run, pending, error, saved } = useRun();
  const [source, setSource] = useState(image.source ?? "");
  const [licenseNote, setLicenseNote] = useState(image.license_note ?? "");
  const [alt, setAlt] = useState(image.alt ?? "");

  return (
    <div className="mt-2 space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Bron">
          <select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
            <option value="">— kies —</option>
            {IMAGE_SOURCES.map((s) => (
              <option key={s} value={s}>
                {IMAGE_SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Licentie-notitie">
          <input value={licenseNote} onChange={(e) => setLicenseNote(e.target.value)} className={inputCls} placeholder="bijv. eigen foto, of waar de toestemming staat" />
        </Field>
        <Field label="Alt-tekst">
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className={`${inputCls} sm:col-span-2`} />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => updateImageAction({ imageId: image.id, productId, slug, source, licenseNote, alt }))}
          className={primaryBtn}
        >
          Opslaan
        </button>
        <Feedback error={error} saved={saved} />
      </div>
    </div>
  );
}

export function OfferEditor({ offer, productId, slug }: { offer: ProductOfferRow; productId: string; slug: string }) {
  const { run, pending, error, saved } = useRun();
  const [price, setPrice] = useState(offer.price_cents != null ? (offer.price_cents / 100).toFixed(2).replace(".", ",") : "");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Prijs (€)">
        <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputCls} w-24`} />
      </Field>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => updateOfferPriceAction({ offerId: offer.id, productId, slug, priceCents: parseEuroToCents(price) }))}
        className={primaryBtn}
      >
        Prijs gecontroleerd
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setOfferActiveAction({ offerId: offer.id, productId, slug, active: !offer.active }))}
        className={ghostBtn}
      >
        {offer.active ? "Deactiveren" : "Activeren"}
      </button>
      <Feedback error={error} saved={saved} />
    </div>
  );
}

export function SourcesEditor({ sources, productId, slug }: { sources: ProductSourceRow[]; productId: string; slug: string }) {
  const { run, pending, error, saved } = useRun();
  const [kind, setKind] = useState<string>(SOURCE_KINDS[0]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  return (
    <div className="space-y-4">
      {sources.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen bronnen.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {sources.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className="text-[var(--ps-muted)]">{s.kind}</span>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline">
                  {s.title ?? s.url} ↗
                </a>
              ) : (
                <span>{s.title ?? "—"}</span>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (window.confirm("Bron verwijderen?")) run(() => removeSourceAction({ sourceId: s.id, productId, slug }));
                }}
                className="ml-auto text-xs text-[var(--ps-muted)] hover:text-red-600"
              >
                Verwijder
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-3 rounded-lg bg-[var(--ps-bg)] p-3">
        <Field label="Soort">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
            {SOURCE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="URL">
          <input value={url} onChange={(e) => setUrl(e.target.value)} className={`${inputCls} w-64`} placeholder="https://…" />
        </Field>
        <Field label="Titel">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputCls} w-48`} />
        </Field>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            run(async () => {
              const result = await addSourceAction({ productId, slug, kind, url, title });
              if (result.ok) {
                setUrl("");
                setTitle("");
              }
              return result;
            });
          }}
          className={primaryBtn}
        >
          + Bron toevoegen
        </button>
      </div>
      <Feedback error={error} saved={saved} />
    </div>
  );
}
