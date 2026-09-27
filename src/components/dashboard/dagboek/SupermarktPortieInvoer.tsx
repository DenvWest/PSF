"use client";

import { useEffect, useRef, useState } from "react";
import { supermarktCatalogEntry } from "@/data/nutrition/supermarkt-catalog";
import {
  bedragVanSupermarktveld,
  SUPERMARKT_MACRO_VELDEN,
} from "@/lib/nutrition-supermarkt-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * De portie-invoer voor een supermarktproduct (Laag A) — calorie/macro-ring,
 * geen tekort-oordeel.
 *
 * ## Waarom dit een eigen component is en geen tak in `DagboekPortieInvoer`
 *
 * `DagboekPortieInvoer` rekent met `bedragVanItem`/`NutrientId` en draagt de
 * favoriet-ster (bewaren voor "Mijn producten"). Een `SupermarktProduct` heeft
 * geen `NutrientId`-bijdrage en geen favoriet-mechanisme (het is geen
 * `DagboekItemBron`, zie `nutrition-supermarkt-items.ts`) — samenvoegen zou
 * die twee assen in één component laten vervlechten. Zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §3.
 *
 * Zelfde laag-over-de-zoeklijst-vorm en dezelfde `per100g × grams / 100`-
 * berekening, nu met `bedragVanSupermarktveld` in plaats van `bedragVanItem`.
 */
export default function SupermarktPortieInvoer({
  prodId,
  moment,
  onBevestig,
  onTerug,
  busy = false,
}: {
  prodId: string;
  moment: EetmomentId;
  onBevestig: (moment: EetmomentId, grams: number) => void;
  onTerug: () => void;
  busy?: boolean;
}) {
  const product = supermarktCatalogEntry(prodId);
  const momentLabel =
    EETMOMENTEN.find((m) => m.id === moment)?.label.toLowerCase() ?? "je dag";

  const [grams, setGrams] = useState(100);

  const paneel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function opToets(event: KeyboardEvent) {
      if (event.key === "Escape") onTerug();
    }
    document.addEventListener("keydown", opToets);
    paneel.current?.focus();
    return () => document.removeEventListener("keydown", opToets);
  }, [onTerug]);

  if (!product) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product niet gevonden"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-3 pb-3"
      >
        <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[var(--vd-surface)] p-4">
          <p className="m-0 text-[12px] text-[var(--vd-ink-3)]">Dit product bestaat niet (meer).</p>
          <button
            type="button"
            onClick={onTerug}
            className="mt-3 cursor-pointer rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[12px] text-[var(--vd-ink-2)]"
          >
            Terug
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Hoeveel ${product.naam}?`}
    >
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onTerug}
        className="absolute inset-0 cursor-default bg-black/60"
      />

      <div
        ref={paneel}
        tabIndex={-1}
        className="relative flex w-full max-w-lg flex-col gap-3 rounded-t-2xl border border-b-0 border-white/12 bg-[var(--vd-surface)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 outline-none sm:mb-3 sm:rounded-b-2xl sm:border-b"
      >
        <span
          aria-hidden
          className="mx-auto h-1 w-9 shrink-0 rounded-full bg-white/20 sm:hidden"
        />

        <header className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.05] text-[17px] font-medium text-[var(--vd-ink-2)]"
          >
            {product.naam.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold text-[var(--vd-ink)]">
              {product.naam}
            </span>
            <span className="block text-[10.5px] text-[var(--vd-ink-4)]">
              {product.supermarkt} · naar {momentLabel}
            </span>
          </span>
        </header>

        <label className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
            Gram
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={2000}
            value={grams}
            disabled={busy}
            onChange={(event) =>
              setGrams(Math.max(1, Math.trunc(Number(event.target.value)) || 1))
            }
            className="w-20 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[var(--vd-ink)] outline-none transition-colors focus:border-white/40"
          />
        </label>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className="m-0 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
            Levert
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {SUPERMARKT_MACRO_VELDEN.map((veld) => {
              const bedrag = bedragVanSupermarktveld(product, veld.veld, grams);
              return (
                <li
                  key={veld.veld}
                  className="flex items-center justify-between gap-2 text-[12.5px] text-[var(--vd-ink-2)]"
                >
                  <span>{veld.label}</span>
                  <span className="font-mono tabular-nums text-[var(--vd-ink)]">
                    {bedrag === null ? "n.o." : `${Math.round(bedrag * 10) / 10} ${veld.unit}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="m-0 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
          Informatief, geen tekort-oordeel — dit telt niet mee in wat je dagboek verder meet.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTerug}
            className="min-h-[44px] cursor-pointer rounded-xl border border-white/15 bg-white/[0.03] px-4 text-[13px] text-[var(--vd-ink-2)] transition-colors hover:border-white/30"
          >
            Annuleer
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onBevestig(moment, grams)}
            className="min-h-[44px] flex-1 cursor-pointer rounded-xl bg-[var(--vd-sage)] px-4 text-[13px] font-semibold text-[var(--vd-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
