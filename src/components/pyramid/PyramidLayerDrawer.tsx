"use client";

import { useEffect, useId, useRef } from "react";
import type { FoundationBaseItem, PyramidLayer } from "@/data/foundation-pyramid";

export type PyramidDrawerContent =
  | { kind: "layer"; layer: PyramidLayer }
  | { kind: "base"; item: FoundationBaseItem };

type PyramidLayerDrawerProps = {
  content: PyramidDrawerContent | null;
  onClose: () => void;
};

export default function PyramidLayerDrawer({
  content,
  onClose,
}: PyramidLayerDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!content) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [content, onClose]);

  if (!content) {
    return null;
  }

  const eyebrow =
    content.kind === "layer" ? content.layer.eyebrow : undefined;
  const title =
    content.kind === "layer" ? content.layer.label : content.item.label;
  const summary =
    content.kind === "layer" ? content.layer.summary : content.item.summary;
  const details =
    content.kind === "layer" ? content.layer.details : content.item.details;
  const subtitle =
    content.kind === "layer" ? content.layer.subtitle : undefined;
  const pillars =
    content.kind === "layer" ? content.layer.pillars : undefined;

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Sluit paneel"
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl border border-intake-card-border bg-intake-bg-elevated shadow-2xl outline-none md:bottom-auto md:left-auto md:top-0 md:h-dvh md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-2xl md:border-l md:border-t-0"
      >
        <div className="flex items-start justify-between gap-4 border-b border-intake-divider px-6 py-5 md:px-8 md:py-6">
          <div>
            {eyebrow ? (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
                <span className="text-intake-terra">{eyebrow}</span>
                {" · Laag"}
              </p>
            ) : (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
                Basis
              </p>
            )}
            <h2
              id={titleId}
              className="font-serif text-xl leading-snug text-intake-ink md:text-2xl"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-intake-ink-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-intake-ink-subtle transition-colors hover:text-intake-ink"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 md:px-8 md:py-6">
          <p className="text-base leading-relaxed text-intake-ink">{summary}</p>
          <p className="mt-4 text-sm leading-relaxed text-intake-ink-muted">
            {details}
          </p>

          {pillars && pillars.length > 0 ? (
            <ul className="mt-6 space-y-3 border-t border-intake-divider pt-5">
              {pillars.map((pillar) => (
                <li key={pillar.id}>
                  <p className="text-sm font-medium text-intake-ink">
                    {pillar.label}
                    <span className="font-normal text-intake-ink-subtle">
                      {" "}
                      · {pillar.sublabel}
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-intake-ink-muted">
                    {pillar.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
