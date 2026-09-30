"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createBrandAction } from "@/lib/product-admin/actions";

export function NewBrandForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createBrandAction({ name });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Naam nieuw merk…"
        aria-label="Naam nieuw merk"
        className="rounded-md border border-[var(--ps-border)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]"
      />
      <button
        type="submit"
        disabled={pending || name.trim() === ""}
        className="rounded-lg bg-[var(--ps-green)] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
      >
        + Merk
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
