"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { DeskIcon } from "@/components/partnerdesk/DeskIcon";
import { createPartnerAction } from "@/lib/partnerdesk/actions";
import type { PdNetwork } from "@/types/partnerdesk";

export function NewPartnerPanel({ networks }: { networks: PdNetwork[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [networkId, setNetworkId] = useState(networks[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setName("");
    setNetworkId(networks[0]?.id ?? "");
    setError(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPartnerAction({ name, networkId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      router.push(`/admin/partners/${result.data.slug}`);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)]"
      >
        <DeskIcon name="plus" width={16} height={16} />
        Partner
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Sluiten"
            className="absolute inset-0 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-md flex-col bg-[var(--ps-surface)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--ps-border)] px-6 py-4">
              <h2 className="text-base font-semibold">Nieuwe partner</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-[var(--ps-body)] hover:bg-[var(--ps-bg)]"
                aria-label="Sluiten"
              >
                <DeskIcon name="chevron" className="rotate-180" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-6 py-5">
              <p className="text-sm text-[var(--ps-body)]">
                Alleen naam en netwerk nu — de rest vul je in het dossier aan.
              </p>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Naam</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-[var(--ps-border)] px-3 py-2 outline-none focus:border-[var(--ps-green)]"
                  placeholder="Bijv. Vitaminstore"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Netwerk</span>
                <select
                  value={networkId}
                  onChange={(e) => setNetworkId(e.target.value)}
                  className="rounded-lg border border-[var(--ps-border)] bg-[var(--ps-surface)] px-3 py-2 outline-none focus:border-[var(--ps-green)]"
                >
                  {networks.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                      {n.kind === "direct" ? " (direct)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="mt-auto flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3.5 py-2 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-bg)]"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
                >
                  {pending ? "Aanmaken…" : "Aanmaken"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
