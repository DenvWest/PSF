"use client";

import type { SlaapStatusRij } from "@/lib/slaap-statusblok";

/**
 * Compact statusblok op het slaap-domeinscherm — gelegenheid · ritme · gedrag
 * uit dezelfde factRows als de ladder. Geen drieluik, geen nutriënten.
 */
export default function SlaapStatusBlok({ rows }: { rows: SlaapStatusRij[] }) {
  if (rows.length === 0) return null;

  return (
    <section
      aria-label="Je slaapstand"
      className="rounded-2xl border border-[var(--divider)] bg-black/20 px-3.5 py-3"
    >
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
        Je stand uit de slaapcheck
      </p>
      <ul className="m-0 mt-2.5 list-none space-y-2 p-0">
        {rows.map((row) => (
          <li key={row.key} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              <span className="block text-[12px] text-[var(--text-muted)]">{row.label}</span>
              <span className="block text-[11px] text-[var(--text-subtle)] text-pretty">
                {row.whyLine}
              </span>
            </span>
            <span className="shrink-0 text-[13px] font-medium text-[var(--text)]">
              {row.answerLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
