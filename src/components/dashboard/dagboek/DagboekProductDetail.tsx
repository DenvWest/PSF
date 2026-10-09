"use client";

import { useState } from "react";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import * as Icons from "@/components/app/icons";
import DagboekProductLevert from "@/components/dashboard/dagboek/DagboekProductLevert";
import { supplementVanItem, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * Het detailscherm van één gelogd product: wat dít item levert, per stof.
 *
 * Het omgekeerde aanzicht van `DagboekNutrientDetail` (klik op een stof → zie
 * alle bijdragende items): hier klik je op een product en zie je alleen wat
 * dát ene item aan de vijf kernstoffen levert, als ADH-balk per stof — dezelfde
 * balkvorm als de premium nutriëntentabel op Je patroon (`vd-cel`), nu in
 * Tailwind omdat de rest van dit scherm dat idioom gebruikt.
 *
 * Wat het item levert (kernstoffen + etiket) staat in `DagboekProductLevert`,
 * hetzelfde blok als in de portie-invoer vóór het toevoegen.
 */

function labelVoor(item: DagboekItem): string | null {
  if (item.bron === "supplement") return supplementVanItem(item)?.labelNl ?? null;
  return catalogEntry(item.key)?.labelNl ?? null;
}

function eenheidVoor(item: DagboekItem): string {
  if (item.bron === "supplement") {
    return supplementVanItem(item)?.porties[0]?.labelNl ?? "portie";
  }
  return "g";
}

export default function DagboekProductDetail({
  item,
  onTerug,
  onVerwijder,
  busy = false,
  proteinTarget = null,
}: {
  item: DagboekItem;
  onTerug: () => void;
  onVerwijder: (item: DagboekItem) => void;
  busy?: boolean;
  proteinTarget?: ProteinTargetRange | null;
}) {
  const [bevestig, setBevestig] = useState(false);
  const label = labelVoor(item);
  const voedingEntry = item.bron === "voeding" ? catalogEntry(item.key) : null;
  const eenheid = eenheidVoor(item);

  if (!label) {
    return (
      <div className="flex flex-col gap-4">
        <header className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onTerug}
            aria-label="Terug naar je dag"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
          >
            <Icons.ChevronLeft s={18} />
          </button>
          <h2 className="m-0 font-serif text-[19px] font-normal text-[var(--vd-ink)]">Product</h2>
        </header>
        <p className="m-0 text-[13px] text-[var(--vd-ink-3)]">
          Dit product staat niet meer in de catalogus.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug naar je dag"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        {voedingEntry ? <FoodThumbnail entry={voedingEntry} size={40} /> : null}
        <div className="min-w-0 flex-1">
          <h2 className="m-0 truncate font-serif text-[19px] font-normal text-[var(--vd-ink)]">
            {label}
          </h2>
          <span className="text-[11px] text-[var(--vd-ink-4)]">
            {item.grams} {eenheid}
            {item.bron === "supplement" ? " · supplement" : null}
          </span>
        </div>
        {bevestig ? (
          <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="Verwijderen bevestigen">
            <span className="text-[12px] text-[var(--vd-ink-3)]">Verwijderen?</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => onVerwijder(item)}
              aria-label="Ja, verwijder uit dagboek"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--vd-terra)] text-[var(--vd-terra)] transition-colors hover:bg-white/[0.05] disabled:opacity-50"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => setBevestig(false)}
              aria-label="Nee, laten staan"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 text-[var(--vd-ink-2)] transition-colors hover:border-white/30"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setBevestig(true)}
            aria-label="Verwijder uit dagboek"
            title="Verwijder uit dagboek"
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3 text-[12px] font-semibold text-[var(--vd-ink-3)] transition-colors hover:border-[var(--vd-terra)] hover:text-[var(--vd-terra)] disabled:opacity-50"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 9h6.6l.7-9" />
            </svg>
            Verwijder
          </button>
        )}
      </header>

      <DagboekProductLevert item={item} proteinTarget={proteinTarget} />

      <p className="m-0 rounded-xl border-l-2 border-[var(--vd-sage)] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--vd-ink-2)]">
        Dit is wat <b className="font-semibold text-[var(--vd-ink)]">{item.grams} {eenheid}</b>{" "}
        {label.toLowerCase()} levert — niet je hele dag. Bovenaan de vijf stoffen uit je krans,
        met dezelfde percentages; daaronder de rest van het etiket, zonder oordeel. Je hele dag
        staat onder &ldquo;Voedingsstoffen&rdquo;.
      </p>

    </div>
  );
}
