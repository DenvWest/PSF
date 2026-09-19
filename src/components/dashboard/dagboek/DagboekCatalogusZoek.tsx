"use client";

import { useMemo, useState } from "react";
import { catalogEntry, searchCatalog, type CatalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import {
  searchSupplementCatalog,
  supplementCatalogEntry,
  type SupplementCatalogEntry,
} from "@/data/nutrition/supplement-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import * as Icons from "@/components/app/icons";
import type { DagboekItem, DagboekItemBron } from "@/lib/nutrition-dagboek-items";

const MAX_TREFFERS = 8;

type Resultaat =
  | { bron: "voeding"; entry: CatalogEntry }
  | { bron: "supplement"; entry: SupplementCatalogEntry };

/**
 * Het zoekscherm binnen een nutriëntdetail: zoekt in beide catalogi tegelijk,
 * met "eerder gebruikt" als startpunt vóór er getypt is.
 *
 * Zoekt over de hele catalogus, niet gefilterd op `nutrient` — wie "kaas"
 * typt wil kaas kunnen kiezen ook al draagt die niets bij aan omega-3. De
 * `nutrient`-context bepaalt alleen welk detailscherm je hierna terugbrengt.
 */
export default function DagboekCatalogusZoek({
  nutrient,
  eerderGebruikt,
  onKies,
  onTerug,
}: {
  nutrient: NutrientId;
  /** Items uit eerdere dagen, meest recent eerst — voor de "eerder gebruikt"-lijst. */
  eerderGebruikt: readonly DagboekItem[];
  onKies: (bron: DagboekItemBron, key: string) => void;
  onTerug: () => void;
}) {
  const [zoek, setZoek] = useState("");

  const recent = useMemo(() => {
    const gezien = new Set<string>();
    const uit: Resultaat[] = [];
    for (const item of eerderGebruikt) {
      const dedupSleutel = `${item.bron}:${item.key}`;
      if (gezien.has(dedupSleutel)) continue;

      if (item.bron === "voeding") {
        const entry = catalogEntry(item.key);
        if (!entry) continue;
        gezien.add(dedupSleutel);
        uit.push({ bron: "voeding", entry });
      } else {
        const entry = supplementCatalogEntry(item.key);
        if (!entry) continue;
        gezien.add(dedupSleutel);
        uit.push({ bron: "supplement", entry });
      }

      if (uit.length >= MAX_TREFFERS) return uit;
    }
    return uit;
  }, [eerderGebruikt]);

  const treffers = useMemo((): Resultaat[] => {
    const term = zoek.trim();
    if (!term) return [];
    const voeding = searchCatalog(term, MAX_TREFFERS).map(
      (entry): Resultaat => ({ bron: "voeding", entry }),
    );
    const supplementen = searchSupplementCatalog(term, MAX_TREFFERS).map(
      (entry): Resultaat => ({ bron: "supplement", entry }),
    );
    return [...voeding, ...supplementen].slice(0, MAX_TREFFERS * 2);
  }, [zoek]);

  const resultaten = zoek.trim() ? treffers : recent;

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#F1EFE8]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 className="m-0 font-serif text-[17px] font-normal text-[#F1EFE8]">
          Voeg toe bij {nutrientReferences[nutrient].label.toLowerCase()}
        </h2>
      </header>

      <div className="relative">
        <input
          type="search"
          autoFocus
          value={zoek}
          onChange={(event) => setZoek(event.target.value)}
          placeholder="Zoek een voedingsmiddel of supplement…"
          aria-label="Zoek een voedingsmiddel of supplement"
          className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-[13px] text-[#F1EFE8] outline-none transition-colors placeholder:text-[#6F8177] focus:border-white/40"
        />
      </div>

      {!zoek.trim() && resultaten.length > 0 ? (
        <p className="m-0 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#6F8177]">
          Eerder gebruikt
        </p>
      ) : null}

      {resultaten.length === 0 ? (
        <p className="m-0 rounded-xl border border-dashed border-white/10 px-3.5 py-3 text-[12px] leading-relaxed text-[#7E8C82]">
          {zoek.trim() ? "Niets gevonden." : "Nog niets eerder geregistreerd."}
        </p>
      ) : (
        <ul className="m-0 list-none divide-y divide-white/[0.06] rounded-xl border border-white/10 p-0">
          {resultaten.map((resultaat) => {
            const key = `${resultaat.bron}-${resultaat.entry.key}`;
            const label = resultaat.entry.labelNl;
            const portieLabel = resultaat.entry.porties[0]?.labelNl ?? "";
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onKies(resultaat.bron, resultaat.entry.key)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {resultaat.bron === "voeding" ? (
                      <FoodThumbnail entry={resultaat.entry} size={40} />
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6C8FC9]/20 text-[17px] font-medium text-[#9DB3E0]"
                      >
                        {label.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-[#F1EFE8]">
                        {label}
                      </span>
                      {resultaat.bron === "supplement" ? (
                        <span className="block text-[10px] text-[#6F8177]">supplement</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10.5px] text-[#6F8177]">{portieLabel}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
