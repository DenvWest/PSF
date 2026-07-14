"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createAfLinkAction, deleteAfLinkAction } from "@/lib/affiliate/actions";
import type { AfLink } from "@/types/affiliate";

function buildUrl(targetUrl: string, ref: string): string {
  const sep = targetUrl.includes("?") ? "&" : "?";
  return `${targetUrl}${sep}ref=${encodeURIComponent(ref)}`;
}

export function AfLinksSection({
  affiliateId,
  affiliateRef,
  links,
}: {
  affiliateId: string;
  affiliateRef: string;
  links: AfLink[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState("https://perfectsupplement.nl/intake");
  const [campaign, setCampaign] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createAfLinkAction({
        affiliateId,
        affiliateRef,
        targetUrl: target,
        campaign,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCampaign("");
      router.refresh();
    });
  }

  function copy(url: string) {
    navigator.clipboard?.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  function remove(linkId: string) {
    startTransition(async () => {
      await deleteAfLinkAction({ linkId, ref: affiliateRef });
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {links.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen links.</p>
      ) : (
        <ul className="space-y-1.5">
          {links.map((l) => {
            const url = buildUrl(l.target_url, l.ref);
            return (
              <li key={l.id} className="flex items-center gap-2 text-sm">
                <code className="min-w-0 flex-1 truncate rounded bg-[var(--ps-bg)] px-2 py-1 text-xs text-[var(--ps-body)]">
                  {url}
                </code>
                {l.campaign && (
                  <span className="shrink-0 rounded-full bg-[var(--ps-bg)] px-2 py-0.5 text-xs text-[var(--ps-muted)]">
                    {l.campaign}
                  </span>
                )}
                <button type="button" onClick={() => copy(url)} className="shrink-0 text-xs text-[var(--ps-body)] hover:underline">
                  {copied === url ? "gekopieerd" : "kopieer"}
                </button>
                <button type="button" onClick={() => remove(l.id)} disabled={pending} className="shrink-0 text-xs text-[var(--ps-muted)] hover:text-red-600">
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={onAdd} className="flex flex-wrap items-center gap-2">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Doel-URL"
          className="min-w-0 flex-1 rounded-lg border border-[var(--ps-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ps-green)]"
        />
        <input
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          placeholder="Campagne (optioneel)"
          className="rounded-lg border border-[var(--ps-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ps-green)]"
        />
        <button
          type="submit"
          disabled={pending || !target.trim()}
          className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          + Link
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
