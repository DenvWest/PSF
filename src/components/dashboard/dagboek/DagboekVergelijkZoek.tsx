"use client";

import { useMemo, useState } from "react";
import { catalogEntry, searchCatalog, type CatalogEntry } from "@/data/nutrition/food-catalog";
import {
  searchSupplementCatalog,
  supplementCatalogEntry,
  type SupplementCatalogEntry,
} from "@/data/nutrition/supplement-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import * as Icons from "@/components/app/icons";
import type { DagboekItem, DagboekItemBron } from "@/lib/nutrition-dagboek-items";

const MAX_TREFFERS = 8;
export const MAX_VERGELIJK = 4;

export type VergelijkResultaat =
  | { bron: "voeding"; entry: CatalogEntry }
  | { bron: "supplement"; entry: SupplementCatalogEntry };

function resultaatVoor(bron: DagboekItemBron, key: string): VergelijkResultaat | null {
  if (bron === "voeding") {
    const entry = catalogEntry(key);
    return entry ? { bron: "voeding", entry } : null;
  }
  const entry = supplementCatalogEntry(key);
  return entry ? { bron: "supplement", entry } : null;
}

/**
 * Zoekscherm voor de productvergelijking: dezelfde zoek/"eerder gebruikt"-
 * logica als `DagboekCatalogusZoek`, maar met een selectie-set in plaats van
 * kies-en-navigeer. Elke rij is een toggle; een chip-balk erboven toont wat
 * je al koos, met een limiet van {@link MAX_VERGELIJK} — meer dan dat wordt
 * een tabel die niet meer op een telefoon past.
 */
export default function DagboekVergelijkZoek({
  eerderGebruikt,
  geselecteerd,
  onToggle,
  onVergelijk,
  onTerug,
}: {
  eerderGebruikt: readonly DagboekItem[];
  geselecteerd: readonly VergelijkResultaat[];
  onToggle: (resultaat: VergelijkResultaat) => void;
  onVergelijk: () => void;
  onTerug: () => void;
}) {
  const [zoek, setZoek] = useState("");

  const isGeselecteerd = (bron: DagboekItemBron, key: string) =>
    geselecteerd.some((r) => r.bron === bron && r.entry.key === key);

  const recent = useMemo(() => {
    const gezien = new Set<string>();
    const uit: VergelijkResultaat[] = [];
    for (const item of eerderGebruikt) {
      const dedupSleutel = `${item.bron}:${item.key}`;
      if (gezien.has(dedupSleutel)) continue;
      const resultaat = resultaatVoor(item.bron, item.key);
      if (!resultaat) continue;
      gezien.add(dedupSleutel);
      uit.push(resultaat);
      if (uit.length >= MAX_TREFFERS) return uit;
    }
    return uit;
  }, [eerderGebruikt]);

  const treffers = useMemo((): VergelijkResultaat[] => {
    const term = zoek.trim();
    if (!term) return [];
    const voeding = searchCatalog(term, MAX_TREFFERS).map(
      (entry): VergelijkResultaat => ({ bron: "voeding", entry }),
    );
    const supplementen = searchSupplementCatalog(term, MAX_TREFFERS).map(
      (entry): VergelijkResultaat => ({ bron: "supplement", entry }),
    );
    return [...voeding, ...supplementen].slice(0, MAX_TREFFERS * 2);
  }, [zoek]);

  const resultaten = zoek.trim() ? treffers : recent;
  const vol = geselecteerd.length >= MAX_VERGELIJK;

  return (
    <div className="flex flex-col gap-2.5">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug naar je dag"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 className="m-0 min-w-0 flex-1 truncate font-serif text-[16px] font-normal text-[var(--vd-ink)]">
          Vergelijk producten
        </h2>
      </header>

      {geselecteerd.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2">
          {geselecteerd.map((resultaat) => (
            <button
              key={`${resultaat.bron}-${resultaat.entry.key}`}
              type="button"
              onClick={() => onToggle(resultaat)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--vd-sage)] bg-[rgb(var(--vd-sage-rgb)/15%)] py-1 pl-1 pr-2.5 text-[12px] font-medium text-[var(--vd-sage-2)] transition-colors hover:bg-[rgb(var(--vd-sage-rgb)/25%)]"
            >
              {resultaat.bron === "voeding" ? (
                <FoodThumbnail entry={resultaat.entry} size={40} />
              ) : (
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--vd-accent-2-rgb)/25%)] text-[11px] font-semibold text-[var(--vd-accent-2)]"
                >
                  {resultaat.entry.labelNl.trim().charAt(0).toUpperCase() || "?"}
                </span>
              )}
              <span className="max-w-[110px] truncate">{resultaat.entry.labelNl}</span>
              <span aria-hidden className="text-[14px] leading-none">
                &times;
              </span>
            </button>
          ))}

          <button
            type="button"
            disabled={geselecteerd.length < 2}
            onClick={onVergelijk}
            className="ml-auto cursor-pointer whitespace-nowrap rounded-lg border border-[var(--vd-sage)] bg-[var(--vd-sage)] px-3 py-1.5 text-[12px] font-semibold text-[var(--vd-bg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:border-white/15 disabled:bg-white/[0.05] disabled:text-[var(--vd-ink-4)] disabled:opacity-100"
          >
            Vergelijk ({geselecteerd.length})
          </button>
        </div>
      ) : (
        <p className="m-0 text-[11.5px] leading-relaxed text-[var(--vd-ink-4)]">
          Kies 2 tot {MAX_VERGELIJK} producten om naast elkaar te zien wat ze leveren.
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="border-b border-white/10 bg-white/[0.03] px-3 py-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vd-ink-4)]">
              <Icons.Search s={15} />
            </span>
            <input
              type="search"
              autoFocus
              value={zoek}
              onChange={(event) => setZoek(event.target.value)}
              placeholder="Zoek een voedingsmiddel of supplement…"
              aria-label="Zoek een voedingsmiddel of supplement"
              className="w-full rounded-xl border border-white/15 bg-black/20 py-2.5 pl-9 pr-3 text-[16px] sm:text-[13px] text-[var(--vd-ink)] outline-none transition-colors placeholder:text-[var(--vd-ink-4)] focus:border-white/40"
            />
          </div>
        </div>

        {!zoek.trim() && resultaten.length > 0 ? (
          <p className="m-0 border-b border-white/10 px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[var(--vd-ink-4)]">
            Eerder gebruikt
          </p>
        ) : null}

        {resultaten.length === 0 ? (
          <p className="m-0 px-4 py-6 text-center text-[12px] leading-relaxed text-[var(--vd-ink-4)]">
            {zoek.trim() ? "Niets gevonden." : "Nog niets eerder geregistreerd."}
          </p>
        ) : (
          <ul className="m-0 list-none divide-y divide-white/[0.06] p-0">
            {resultaten.map((resultaat) => {
              const key = `${resultaat.bron}-${resultaat.entry.key}`;
              const label = resultaat.entry.labelNl;
              const portieLabel = resultaat.entry.porties[0]?.labelNl ?? "";
              const actief = isGeselecteerd(resultaat.bron, resultaat.entry.key);
              const uitgeschakeld = !actief && vol;
              return (
                <li key={key}>
                  <button
                    type="button"
                    disabled={uitgeschakeld}
                    onClick={() => onToggle(resultaat)}
                    aria-pressed={actief}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      actief ? "bg-[rgb(var(--vd-sage-rgb)/12%)]" : "hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {resultaat.bron === "voeding" ? (
                        <FoodThumbnail entry={resultaat.entry} size={40} />
                      ) : (
                        <span
                          aria-hidden
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--vd-accent-2-rgb)/20%)] text-[17px] font-medium text-[var(--vd-accent-2)]"
                        >
                          {label.trim().charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] text-[var(--vd-ink)]">
                          {label}
                        </span>
                        {resultaat.bron === "supplement" ? (
                          <span className="block text-[10px] text-[var(--vd-ink-4)]">supplement</span>
                        ) : null}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-[10.5px] text-[var(--vd-ink-4)]">{portieLabel}</span>
                      <span
                        aria-hidden
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[13px] ${
                          actief
                            ? "border-[var(--vd-sage)] bg-[var(--vd-sage)] text-[var(--vd-bg)]"
                            : "border-white/20 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
