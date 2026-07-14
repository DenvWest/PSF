"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addPartnerLabelAction,
  removePartnerLabelAction,
} from "@/lib/partnerdesk/actions";
import type { PdLabel } from "@/types/partnerdesk";

export function PartnerLabels({
  partnerId,
  slug,
  current,
  all,
}: {
  partnerId: string;
  slug: string;
  current: PdLabel[];
  all: PdLabel[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  const currentIds = new Set(current.map((l) => l.id));
  const available = all.filter((l) => !currentIds.has(l.id));

  function run(fn: () => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {current.map((l) => (
        <span
          key={l.id}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--ps-bg)] px-2 py-0.5 text-xs text-[var(--ps-body)]"
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
          {l.name}
          <button
            type="button"
            onClick={() => run(() => removePartnerLabelAction({ partnerId, labelId: l.id, slug }))}
            disabled={pending}
            className="text-[var(--ps-muted)] hover:text-red-600"
            aria-label={`Label ${l.name} verwijderen`}
          >
            ×
          </button>
        </span>
      ))}

      {available.length > 0 &&
        (adding ? (
          <select
            autoFocus
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                run(() => addPartnerLabelAction({ partnerId, labelId: e.target.value, slug }));
                setAdding(false);
              }
            }}
            onBlur={() => setAdding(false)}
            className="rounded-full border border-[var(--ps-border)] bg-[var(--ps-surface)] px-2 py-0.5 text-xs"
          >
            <option value="" disabled>kies label…</option>
            {available.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full border border-dashed border-[var(--ps-border)] px-2 py-0.5 text-xs text-[var(--ps-muted)] hover:text-[var(--ps-ink)]"
          >
            + label
          </button>
        ))}
    </div>
  );
}
