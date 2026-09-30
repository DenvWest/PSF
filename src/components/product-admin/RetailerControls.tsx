"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createRetailerAction, setRetailerActiveAction } from "@/lib/product-admin/retailer-actions";
import { RETAILER_RELATIONSHIPS } from "@/lib/product-admin/retailer-validation";

const inputCls =
  "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";

const RELATIONSHIP_LABEL: Record<(typeof RETAILER_RELATIONSHIPS)[number], string> = {
  direct: "Direct (eigen click_token)",
  network: "Via netwerk (subid)",
};

export function RetailerActiveToggle({ retailerId, active }: { retailerId: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex flex-col items-start gap-0.5">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await setRetailerActiveAction({ retailerId, active: !active });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          })
        }
        className={`rounded-full px-2.5 py-0.5 text-xs ${
          active ? "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]" : "bg-[var(--ps-bg)] text-[var(--ps-body)]"
        } disabled:opacity-50`}
        title={active ? "Klik om te deactiveren" : "Klik om te activeren"}
      >
        {active ? "Actief" : "Inactief"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}

export function NewRetailerForm({ partners }: { partners: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<string>("network");
  const [pdPartnerId, setPdPartnerId] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createRetailerAction({ name, relationship, pdPartnerId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      setPdPartnerId("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-[var(--ps-body)]">
        Naam
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Nieuwe retailer…" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--ps-body)]">
        Soort
        <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className={inputCls}>
          {RETAILER_RELATIONSHIPS.map((r) => (
            <option key={r} value={r}>
              {RELATIONSHIP_LABEL[r]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-[var(--ps-body)]">
        PartnerDesk-dossier
        <select value={pdPartnerId} onChange={(e) => setPdPartnerId(e.target.value)} className={inputCls}>
          <option value="">— geen —</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending || name.trim() === ""}
        className="rounded-lg bg-[var(--ps-green)] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
      >
        + Retailer
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
