"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { updateAffiliateAction } from "@/lib/affiliate/actions";
import { AFFILIATE_STATUSES } from "@/lib/affiliate/validation";
import type { AffiliateStatus, AfAffiliate } from "@/types/affiliate";

const STATUS_LABEL: Record<AffiliateStatus, string> = {
  active: "Actief",
  paused: "Gepauzeerd",
  ended: "Beëindigd",
};

export function AffiliateForm({ affiliate }: { affiliate: AfAffiliate }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState(affiliate.display_name);
  const [company, setCompany] = useState(affiliate.company ?? "");
  const [email, setEmail] = useState(affiliate.email ?? "");
  const [status, setStatus] = useState<AffiliateStatus>(affiliate.status);
  const [notes, setNotes] = useState(affiliate.notes ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateAffiliateAction({
        affiliateId: affiliate.id,
        ref: affiliate.ref,
        displayName,
        company: company || null,
        email: email || null,
        status,
        notes: notes || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const inputCls =
    "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Naam</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Bedrijf</span>
          <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as AffiliateStatus)} className={`${inputCls} bg-[var(--ps-surface)]`}>
            {AFFILIATE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--ps-body)]">Notities</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          {pending ? "Opslaan…" : "Opslaan"}
        </button>
        {saved && <span className="text-xs text-[var(--ps-green-hover)]">Opgeslagen ✓</span>}
      </div>
    </form>
  );
}
