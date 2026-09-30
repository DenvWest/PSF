"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { markProductCheckedAction, setProductStatusAction } from "@/lib/product-admin/actions";
import type { ProductStatus } from "@/lib/product-admin/queries";

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Concept",
  published: "Gepubliceerd",
  archived: "Gearchiveerd",
};

export const PRODUCT_STATUS_CLASS: Record<ProductStatus, string> = {
  draft: "bg-amber-50 text-amber-700",
  published: "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]",
  archived: "bg-[var(--ps-bg)] text-[var(--ps-body)]",
};

const NEXT_ACTIONS: Record<ProductStatus, { to: ProductStatus; label: string }[]> = {
  draft: [
    { to: "published", label: "Publiceren" },
    { to: "archived", label: "Archiveren" },
  ],
  published: [
    { to: "draft", label: "Terug naar concept" },
    { to: "archived", label: "Archiveren" },
  ],
  archived: [{ to: "draft", label: "Herstellen als concept" }],
};

export function ProductStatusControl({
  productId,
  slug,
  status,
}: {
  productId: string;
  slug: string;
  status: ProductStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Er ging iets mis.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs ${PRODUCT_STATUS_CLASS[status]}`}>
          {PRODUCT_STATUS_LABEL[status]}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => markProductCheckedAction({ productId, slug }))}
          className="rounded-lg px-3 py-1.5 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-bg)] disabled:opacity-50"
        >
          Markeer als gecontroleerd
        </button>
        {NEXT_ACTIONS[status].map((a) => (
          <button
            key={a.to}
            type="button"
            disabled={pending}
            onClick={() => run(() => setProductStatusAction({ productId, slug, status: a.to }))}
            className={
              a.to === "published"
                ? "rounded-lg bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
                : "rounded-lg border border-[var(--ps-border)] px-3 py-1.5 text-sm hover:bg-[var(--ps-bg)] disabled:opacity-50"
            }
          >
            {a.label}
          </button>
        ))}
      </div>
      {error && <p className="max-w-md text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
