"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import type { PillarDrawerLink } from "@/data/foundation-pyramid";
import type { DisplayStatus } from "@/lib/score-display";
import {
  STATUS_TONE_CLASS,
  getDisplayStatusTone,
  type DisplayStatusTone,
} from "@/lib/score-display";

export type PillarDrawerStatus = DisplayStatus | "Niet gemeten";

export type PillarDrawerData = {
  pillarLabel: string;
  pillarSublabel: string;
  status: PillarDrawerStatus;
  explanation: string;
  quickWins: string[];
  links: PillarDrawerLink[];
};

type PyramidPillarDrawerProps = {
  data: PillarDrawerData | null;
  onClose: () => void;
};

function statusTone(status: PillarDrawerStatus): DisplayStatusTone {
  if (status === "Niet gemeten") {
    return "neutral";
  }
  return getDisplayStatusTone(status);
}

export default function PyramidPillarDrawer({
  data,
  onClose,
}: PyramidPillarDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!data) {
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
  }, [data, onClose]);

  if (!data) {
    return null;
  }

  const tone = statusTone(data.status);

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
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-intake-ink-subtle">
              <span className="text-intake-terra">05</span> · Leefstijl
            </p>
            <h2
              id={titleId}
              className="font-serif text-xl leading-snug text-intake-ink md:text-2xl"
            >
              {data.pillarLabel}
            </h2>
            <p className="mt-1 text-sm text-intake-ink-muted">
              {data.pillarSublabel}
            </p>
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
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_TONE_CLASS[tone]}`}
            >
              {data.status}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-intake-ink-muted">
            {data.explanation}
          </p>
          <p className="mt-2 text-xs text-intake-ink-subtle">
            Op basis van je antwoorden — geen medische diagnose.
          </p>

          {data.quickWins.length > 0 ? (
            <section className="mt-6 border-t border-intake-divider pt-5">
              <h3 className="mb-3 text-sm font-semibold text-intake-ink">
                Quick wins deze week
              </h3>
              <ol className="space-y-3">
                {data.quickWins.map((tip, index) => (
                  <li key={tip} className="flex gap-3 text-sm leading-relaxed text-intake-ink-muted">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-intake-sage text-xs font-bold text-intake-ink">
                      {index + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {data.links.length > 0 ? (
            <section className="mt-6 border-t border-intake-divider pt-5">
              <h3 className="mb-3 text-sm font-semibold text-intake-ink">
                Verder lezen
              </h3>
              <ul className="space-y-2">
                {data.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-xl border border-intake-card-border bg-intake-bg px-4 py-3 text-sm font-medium text-intake-ink transition-colors hover:border-intake-sage/40"
                    >
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
