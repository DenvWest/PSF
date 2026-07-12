"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { ContactCard } from "@/components/partnerdesk/ContactCard";
import { createContactAction } from "@/lib/partnerdesk/contact-actions";
import type { PdContact } from "@/types/partnerdesk";

export function ContactsSection({
  partnerId,
  slug,
  contacts,
}: {
  partnerId: string;
  slug: string;
  contacts: PdContact[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createContactAction({ partnerId, name, slug });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen contactpersonen.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((c) => (
            <ContactCard key={c.id} contact={c} partnerId={partnerId} slug={slug} />
          ))}
        </div>
      )}

      <form onSubmit={onAdd} className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Naam nieuwe contactpersoon…"
          className="flex-1 rounded-lg border border-[var(--ps-border)] px-3 py-2 text-sm outline-none focus:border-[var(--ps-green)]"
        />
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="rounded-lg bg-[var(--ps-green)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
        >
          + Contact
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
