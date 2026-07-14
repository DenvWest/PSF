"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { updateAffiliateAction } from "@/lib/affiliate/actions";
import { AFFILIATE_STATUSES } from "@/lib/affiliate/validation";
import { formatNlDay } from "@/lib/partnerdesk/format";
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

  const [iban, setIban] = useState(affiliate.iban ?? "");
  const [payoutName, setPayoutName] = useState(affiliate.payout_name ?? "");
  const [vatNumber, setVatNumber] = useState(affiliate.vat_number ?? "");
  const [cocNumber, setCocNumber] = useState(affiliate.coc_number ?? "");
  const [country, setCountry] = useState(affiliate.country ?? "");
  const [address, setAddress] = useState(affiliate.address ?? "");
  const [thresholdEur, setThresholdEur] = useState(
    affiliate.payout_threshold_cents ? String(affiliate.payout_threshold_cents / 100) : "",
  );
  const [acceptTerms, setAcceptTerms] = useState(false);

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
        iban: iban || null,
        payoutName: payoutName || null,
        vatNumber: vatNumber || null,
        cocNumber: cocNumber || null,
        country: country || null,
        address: address || null,
        payoutThresholdCents: thresholdEur.trim() ? Math.round(Number(thresholdEur) * 100) : 0,
        termsAccepted: acceptTerms || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      setAcceptTerms(false);
      router.refresh();
    });
  }

  const inputCls =
    "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";
  const legendCls = "text-xs font-semibold uppercase tracking-wide text-[var(--ps-muted)]";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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

      <fieldset className="space-y-3 rounded-lg border border-[var(--ps-border)] p-4">
        <legend className={legendCls}>Uitbetaalgegevens</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--ps-body)]">IBAN</span>
            <input value={iban} onChange={(e) => setIban(e.target.value)} className={inputCls} placeholder="NL00 BANK 0000 0000 00" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--ps-body)]">Tenaamstelling</span>
            <input value={payoutName} onChange={(e) => setPayoutName(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--ps-body)]">BTW-nummer</span>
            <input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--ps-body)]">KVK-nummer</span>
            <input value={cocNumber} onChange={(e) => setCocNumber(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--ps-body)]">Land</span>
            <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} placeholder="NL" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--ps-body)]">Uitbetaaldrempel (€)</span>
            <input type="number" step="0.01" value={thresholdEur} onChange={(e) => setThresholdEur(e.target.value)} className={inputCls} placeholder="0" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Adres</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
        </label>
      </fieldset>

      <fieldset className="space-y-2 rounded-lg border border-[var(--ps-border)] p-4">
        <legend className={legendCls}>Programmavoorwaarden</legend>
        {affiliate.terms_accepted_at ? (
          <p className="text-sm text-[var(--ps-body)]">
            Akkoord op {formatNlDay(affiliate.terms_accepted_at)}
            {affiliate.terms_version && <span className="text-[var(--ps-muted)]"> · versie {affiliate.terms_version}</span>}
          </p>
        ) : (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <span className="text-[var(--ps-body)]">Affiliate is akkoord met de huidige programmavoorwaarden</span>
          </label>
        )}
      </fieldset>

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
