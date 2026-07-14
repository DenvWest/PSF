"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTaskAction } from "@/lib/partnerdesk/task-actions";
import { snoozeSignalAction } from "@/lib/partnerdesk/signal-actions";
import { signalAnchor, signalLabel } from "@/lib/partnerdesk/signal-display";
import type { SignalWithPartner } from "@/lib/partnerdesk/queries";

export function SignalRow({ item }: { item: SignalWithPartner }) {
  const { signal, partnerName, partnerSlug } = item;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [snoozing, setSnoozing] = useState(false);
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const label = signalLabel(signal.type, signal.payload);
  const href = partnerSlug
    ? `/admin/partners/${partnerSlug}#${signalAnchor(signal.type)}`
    : "/admin/taken";

  function makeTask() {
    startTransition(async () => {
      await createTaskAction({
        partnerId: signal.partner_id,
        title: label,
        slug: partnerSlug ?? undefined,
      });
      router.refresh();
    });
  }

  function submitSnooze() {
    setError(null);
    startTransition(async () => {
      const result = await snoozeSignalAction({
        signalId: signal.id,
        days,
        reason,
        partnerId: signal.partner_id,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSnoozing(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="border-b border-[var(--ps-border)] py-2 last:border-0">
      <div className="flex items-center gap-3 text-sm">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            signal.severity === "red" ? "bg-red-500" : "bg-amber-500"
          }`}
        />
        <Link href={href} className="flex-1 hover:underline">
          {label}
          {partnerName && (
            <span className="text-[var(--ps-body)]"> — {partnerName}</span>
          )}
        </Link>
        <div className="flex shrink-0 gap-3 text-xs text-[var(--ps-body)]">
          <button type="button" onClick={makeTask} disabled={pending} className="hover:underline">
            + taak
          </button>
          <button type="button" onClick={() => setSnoozing((s) => !s)} className="hover:underline">
            snooze
          </button>
        </div>
      </div>

      {snoozing && (
        <div className="mt-2 flex flex-wrap items-center gap-2 pl-5">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded border border-[var(--ps-border)] bg-[var(--ps-surface)] px-2 py-1 text-xs"
          >
            <option value={7}>7 dgn</option>
            <option value={30}>30 dgn</option>
            <option value={90}>90 dgn</option>
          </select>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reden (verplicht)"
            className="flex-1 rounded border border-[var(--ps-border)] px-2 py-1 text-xs outline-none focus:border-[var(--ps-green)]"
          />
          <button
            type="button"
            onClick={submitSnooze}
            disabled={pending}
            className="rounded bg-[var(--ps-ink)] px-2.5 py-1 text-xs text-white disabled:opacity-50"
          >
            Uitstellen
          </button>
          {error && <span className="w-full text-xs text-red-600">{error}</span>}
        </div>
      )}
    </div>
  );
}
