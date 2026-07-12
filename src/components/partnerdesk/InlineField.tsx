"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updatePartnerFieldAction } from "@/lib/partnerdesk/actions";
import type { EditablePartnerField } from "@/lib/partnerdesk/validation";

interface Option {
  value: string;
  label: string;
}

interface InlineFieldProps {
  partnerId: string;
  field: EditablePartnerField;
  value: string;
  variant?: "text" | "textarea" | "select";
  options?: Option[];
  placeholder?: string;
  /** Optioneel: hoe de leeswaarde getoond wordt (bijv. als link). */
  renderValue?: (value: string) => React.ReactNode;
}

export function InlineField({
  partnerId,
  field,
  value,
  variant = "text",
  options,
  placeholder = "— nog invullen",
  renderValue,
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
      const result = await updatePartnerFieldAction({
        partnerId,
        field,
        value: draft,
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
    <button
      type="button"
      onClick={begin}
      className={`group -mx-2 flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-[var(--ps-bg)] ${
        pending ? "opacity-60" : ""
      }`}
      title="Klik om te bewerken"
    >
      <span className={isEmpty ? "text-[var(--ps-muted)]" : "text-[var(--ps-ink)]"}>
        {isEmpty
          ? placeholder
          : renderValue
            ? renderValue(current)
            : selectLabel}
      </span>
    </button>
  );
}
