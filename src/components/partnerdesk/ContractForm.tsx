"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  createContractAction,
  updateContractAction,
} from "@/lib/partnerdesk/contract-actions";
import type { PdContract } from "@/types/partnerdesk";

function numOrNull(v: string): number | null {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function ContractForm({
  partnerId,
  slug,
  existing,
  onDone,
}: {
  partnerId: string;
  slug: string;
  existing?: PdContract;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [number, setNumber] = useState(existing?.number ?? "");
  const [startsOn, setStartsOn] = useState(existing?.starts_on ?? "");
  const [endsOn, setEndsOn] = useState(existing?.ends_on ?? "");
  const [notice, setNotice] = useState(
    existing?.notice_period_days != null ? String(existing.notice_period_days) : "",
  );
  const [cookie, setCookie] = useState(
    existing?.cookie_days != null ? String(existing.cookie_days) : "",
  );
  const [exclusivity, setExclusivity] = useState(existing?.exclusivity ?? "");
  const [approval, setApproval] = useState(existing?.approval_terms ?? "");
  const [autoRenews, setAutoRenews] = useState(existing?.auto_renews ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      partnerId,
      slug,
      number,
      startsOn,
      endsOn: endsOn || null,
      noticePeriodDays: numOrNull(notice),
      cookieDays: numOrNull(cookie),
      exclusivity: exclusivity || null,
      approvalTerms: approval || null,
      autoRenews,
      notes: notes || null,
    };
    startTransition(async () => {
      const result = existing
        ? await updateContractAction({ ...payload, contractId: existing.id })
        : await createContractAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  const inputCls =
    "rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-lg border border-[var(--ps-border)] bg-[var(--ps-bg)] p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Contractnummer</span>
          <input value={number} onChange={(e) => setNumber(e.target.value)} className={inputCls} placeholder="#2026-01" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Cookieduur (dagen)</span>
          <input type="number" value={cookie} onChange={(e) => setCookie(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Startdatum</span>
          <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Einddatum</span>
          <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Opzegtermijn (dagen)</span>
          <input type="number" value={notice} onChange={(e) => setNotice(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--ps-body)]">Exclusiviteit</span>
          <input value={exclusivity} onChange={(e) => setExclusivity(e.target.value)} className={inputCls} placeholder="bijv. categorie slaap" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--ps-body)]">Goedkeuringsvoorwaarden</span>
        <textarea value={approval} onChange={(e) => setApproval(e.target.value)} rows={2} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--ps-body)]">Notities</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={autoRenews} onChange={(e) => setAutoRenews(e.target.checked)} className="accent-[var(--ps-green)]" />
        Verlengt automatisch
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-lg px-3.5 py-2 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-surface)]">
          Annuleren
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          {pending ? "Opslaan…" : existing ? "Opslaan" : "Contract toevoegen"}
        </button>
      </div>
    </form>
  );
}
