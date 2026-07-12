"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { InlineField } from "@/components/partnerdesk/InlineField";
import {
  isStaleContact,
  lastContactLabel,
} from "@/lib/partnerdesk/contact-recency";
import { todayIso } from "@/lib/partnerdesk/dates";
import {
  archiveContactAction,
  exportContactAction,
  scrubContactAction,
  setPrimaryContactAction,
} from "@/lib/partnerdesk/contact-actions";
import { logMailToContactAction } from "@/lib/partnerdesk/timeline-actions";
import type { PdContact } from "@/types/partnerdesk";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-2 py-1 text-sm">
      <span className="pt-1 text-[var(--ps-body)]">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function ContactCard({
  contact,
  partnerId,
  slug,
}: {
  contact: PdContact;
  partnerId: string;
  slug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const now = todayIso();
  const stale = isStaleContact(contact.last_contact_at, now);

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

  function onMail() {
    if (!contact.email) return;
    startTransition(async () => {
      await logMailToContactAction({
        partnerId,
        contactId: contact.id,
        contactName: contact.name,
        contactEmail: contact.email ?? "",
        slug,
      });
      router.refresh();
      window.location.href = `mailto:${contact.email}`;
    });
  }

  function onExport() {
    startTransition(async () => {
      const result = await exportContactAction({ contactId: contact.id });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const blob = new Blob([result.data.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="rounded-lg border border-[var(--ps-border)] bg-[var(--ps-surface)] p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              run(() =>
                setPrimaryContactAction({ partnerId, contactId: contact.id, slug }),
              )
            }
            disabled={pending || contact.is_primary}
            title={contact.is_primary ? "Primair contact" : "Maak primair"}
            className={contact.is_primary ? "text-amber-500" : "text-[var(--ps-muted)] hover:text-amber-500"}
            aria-label="Primair contact"
          >
            {contact.is_primary ? "★" : "☆"}
          </button>
          <div className="font-medium">
            <InlineField
              entity="contact"
              id={contact.id}
              field="name"
              value={contact.name}
              slug={slug}
              placeholder="Naam"
            />
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
            stale
              ? "bg-amber-50 text-amber-700"
              : "bg-[var(--ps-bg)] text-[var(--ps-body)]"
          }`}
        >
          {lastContactLabel(contact.last_contact_at, now)}
        </span>
      </div>

      <div className="divide-y divide-[var(--ps-border)]">
        <Field label="Functie">
          <InlineField entity="contact" id={contact.id} field="role" value={contact.role ?? ""} slug={slug} />
        </Field>
        <Field label="E-mail">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <InlineField
                entity="contact"
                id={contact.id}
                field="email"
                value={contact.email ?? ""}
                slug={slug}
              />
            </div>
            <button
              type="button"
              onClick={onMail}
              disabled={!contact.email || pending}
              className="shrink-0 rounded-md border border-[var(--ps-border)] px-2 py-0.5 text-xs text-[var(--ps-body)] hover:bg-[var(--ps-bg)] disabled:opacity-40"
              title={contact.email ? "Mail + log in tijdlijn" : "Geen e-mailadres"}
            >
              Mail
            </button>
          </div>
        </Field>
        <Field label="Telefoon">
          <InlineField entity="contact" id={contact.id} field="phone" value={contact.phone ?? ""} slug={slug} />
        </Field>
        <Field label="LinkedIn">
          <InlineField entity="contact" id={contact.id} field="linkedin_url" value={contact.linkedin_url ?? ""} slug={slug} />
        </Field>
        <Field label="Verantwoordelijk">
          <InlineField entity="contact" id={contact.id} field="responsibility" value={contact.responsibility ?? ""} slug={slug} />
        </Field>
        <Field label="Notities">
          <InlineField entity="contact" id={contact.id} field="notes" value={contact.notes ?? ""} slug={slug} variant="textarea" />
        </Field>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--ps-body)]">
        <button type="button" onClick={onExport} disabled={pending} className="hover:underline">
          Exporteer (AVG)
        </button>
        <button
          type="button"
          disabled={pending}
          className="hover:underline"
          onClick={() => {
            if (
              window.confirm(
                "Contactgegevens onherstelbaar wissen (AVG-verzoek)? Naam, e-mail, telefoon en notities worden gepseudonimiseerd.",
              )
            ) {
              run(() => scrubContactAction({ contactId: contact.id, partnerId, slug }));
            }
          }}
        >
          Wissen (AVG)
        </button>
        <button
          type="button"
          disabled={pending}
          className="ml-auto hover:underline"
          onClick={() => {
            if (window.confirm("Contact archiveren?")) {
              run(() => archiveContactAction({ contactId: contact.id, partnerId, slug }));
            }
          }}
        >
          Archiveer
        </button>
      </div>
    </div>
  );
}
