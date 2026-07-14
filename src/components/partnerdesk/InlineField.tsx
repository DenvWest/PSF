"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updatePartnerFieldAction } from "@/lib/partnerdesk/actions";
import { updateContactFieldAction } from "@/lib/partnerdesk/contact-actions";

interface Option {
  value: string;
  label: string;
}

interface InlineFieldProps {
  entity: "partner" | "contact";
  id: string;
  field: string;
  value: string;
  slug?: string;
  variant?: "text" | "textarea" | "select";
  options?: Option[];
  placeholder?: string;
  /** Toont naast de waarde een "open"-link (bijv. voor website/login-URL). */
  asLink?: boolean;
}

function normalizeUrl(value: string): string {
  return value.includes("://") ? value : `https://${value}`;
}

export function InlineField({
  entity,
  id,
  field,
  value,
  slug,
  variant = "text",
  options,
  placeholder = "— nog invullen",
  asLink = false,
}: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function begin() {
    setDraft(current);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setDraft(current);
    setError(null);
  }

  function commit() {
    if (draft === current) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result =
        entity === "partner"
          ? await updatePartnerFieldAction({ partnerId: id, field, value: draft })
          : await updateContactFieldAction({
              contactId: id,
              field,
              value: draft,
              slug,
            });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCurrent(draft);
      setEditing(false);
      setError(null);
    });
  }

  if (editing) {
    const shared =
      "w-full rounded-md border border-[var(--ps-green)] px-2 py-1 text-sm outline-none";
    return (
      <div className="flex flex-col gap-1">
        {variant === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
            }}
            className={`${shared} bg-[var(--ps-surface)]`}
          >
            {options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : variant === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
            }}
            className={shared}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
              if (e.key === "Enter") commit();
            }}
            className={shared}
          />
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }

  const isEmpty = current.trim() === "";
  const selectLabel =
    variant === "select"
      ? options?.find((o) => o.value === current)?.label ?? current
      : current;

  return (
    <div className="-mx-2 flex items-center gap-1">
      <button
        type="button"
        onClick={begin}
        className={`group flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-[var(--ps-bg)] ${
          pending ? "opacity-60" : ""
        }`}
        title="Klik om te bewerken"
      >
        <span className={`truncate ${isEmpty ? "text-[var(--ps-muted)]" : "text-[var(--ps-ink)]"}`}>
          {isEmpty ? placeholder : selectLabel}
        </span>
      </button>
      {asLink && !isEmpty && (
        <a
          href={normalizeUrl(current)}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 px-1 text-[var(--ps-body)] hover:text-[var(--ps-ink)]"
          title="Openen in nieuw tabblad"
        >
          ↗
        </a>
      )}
    </div>
  );
}
