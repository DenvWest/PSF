"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { relativeTimeNl } from "@/lib/partnerdesk/format";
import { todayIso } from "@/lib/partnerdesk/dates";
import { addTimelineEventAction } from "@/lib/partnerdesk/timeline-actions";
import type { PdContact, PdTimelineEvent } from "@/types/partnerdesk";

const EVENT_TYPES = [
  { value: "notitie", label: "Notitie" },
  { value: "mail", label: "Mail" },
  { value: "telefoon", label: "Telefoon" },
  { value: "meeting", label: "Meeting" },
];

const KIND_META: Record<string, { icon: string; system?: boolean }> = {
  note: { icon: "📝" },
  email: { icon: "✉️" },
  call: { icon: "📞" },
  meeting: { icon: "🤝" },
  partner_created: { icon: "✦", system: true },
  partner_status_changed: { icon: "✦", system: true },
  task_completed: { icon: "✓", system: true },
  contact_scrubbed: { icon: "🗑", system: true },
};

type Filter = "alles" | "notities" | "contact" | "systeem";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "alles", label: "Alles" },
  { value: "notities", label: "Notities" },
  { value: "contact", label: "Contact" },
  { value: "systeem", label: "Systeem" },
];

function matchesFilter(ev: PdTimelineEvent, filter: Filter): boolean {
  if (filter === "alles") return true;
  if (filter === "notities") return ev.kind === "note";
  if (filter === "contact") return ["email", "call", "meeting"].includes(ev.kind);
  return ev.actor === "system";
}

function describe(ev: PdTimelineEvent): string {
  if (ev.body) return ev.body;
  if (ev.kind === "partner_created") return "Partner aangemaakt";
  if (ev.kind === "partner_status_changed") {
    const m = ev.metadata as { from?: string; to?: string };
    return `Status gewijzigd: ${m.from ?? "?"} → ${m.to ?? "?"}`;
  }
  return ev.kind;
}

export function TimelineSection({
  partnerId,
  slug,
  events,
  contacts,
}: {
  partnerId: string;
  slug: string;
  events: PdTimelineEvent[];
  contacts: PdContact[];
}) {
  const router = useRouter();
  const [eventType, setEventType] = useState("notitie");
  const [body, setBody] = useState("");
  const [contactId, setContactId] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayIso());
  const [filter, setFilter] = useState<Filter>("alles");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () => events.filter((e) => matchesFilter(e, filter)),
    [events, filter],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addTimelineEventAction({
        partnerId,
        eventType,
        body,
        contactId: contactId || null,
        occurredAt: `${occurredOn}T12:00:00.000Z`,
        slug,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-2 rounded-lg border border-[var(--ps-border)] p-3">
        <div className="flex flex-wrap gap-2">
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="rounded-md border border-[var(--ps-border)] bg-[var(--ps-surface)] px-2 py-1.5 text-sm"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="rounded-md border border-[var(--ps-border)] bg-[var(--ps-surface)] px-2 py-1.5 text-sm"
          >
            <option value="">— geen contact —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            className="rounded-md border border-[var(--ps-border)] bg-[var(--ps-surface)] px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Wat is er gebeurd?"
            className="flex-1 rounded-md border border-[var(--ps-border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--ps-green)]"
          />
          <button
            type="submit"
            disabled={pending || !body.trim()}
            className="rounded-md bg-[var(--ps-green)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--ps-green-hover)] disabled:opacity-50"
          >
            Log
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>

      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs ${
              filter === f.value
                ? "bg-[var(--ps-ink)] text-white"
                : "bg-[var(--ps-bg)] text-[var(--ps-body)] hover:bg-[var(--ps-border)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-[var(--ps-muted)]">Nog geen gebeurtenissen.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((ev) => {
            const meta = KIND_META[ev.kind] ?? { icon: "•" };
            return (
              <li key={ev.id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 w-5 shrink-0 text-center">{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className={meta.system ? "text-[var(--ps-body)]" : "text-[var(--ps-ink)]"}>
                    {describe(ev)}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-[var(--ps-muted)]">
                  {relativeTimeNl(ev.occurred_at)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
