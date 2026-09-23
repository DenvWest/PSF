"use client";

import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { aandeelVanRi } from "@/data/nutrition/reference-intake";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import * as Icons from "@/components/app/icons";
import { bedragVanItem, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { toBase } from "@/lib/nutrition-units";

/**
 * Het detailscherm van één gelogd product: wat dít item levert, per stof.
 *
 * Het omgekeerde aanzicht van `DagboekNutrientDetail` (klik op een stof → zie
 * alle bijdragende items): hier klik je op een product en zie je alleen wat
 * dát ene item aan de vijf kernstoffen levert, als ADH-balk per stof — dezelfde
 * balkvorm als de premium nutriëntentabel op Je patroon (`vd-cel`), nu in
 * Tailwind omdat de rest van dit scherm dat idioom gebruikt.
 *
 * ## Waarom hier geen macro's of overige vitamines/mineralen staan
 *
 * Dit systeem trackt bewust maar vijf stoffen (eiwit, omega-3, magnesium,
 * vitamine D, zink) — "laag 5 blijft dicht voor tellen" (zie
 * `nutrition-dagboek-items.ts`). Een volledige voedingswaardetabel zoals op
 * een etiket zou een nieuwe, bredere databron vereisen; die bestaat nog niet.
 * Deze kaart toont daarom alleen wat het systeem al weet, niet wat een
 * etiket zou tonen.
 */

function labelVoor(item: DagboekItem): string | null {
  if (item.bron === "supplement") return supplementCatalogEntry(item.key)?.labelNl ?? null;
  return catalogEntry(item.key)?.labelNl ?? null;
}

function eenheidVoor(item: DagboekItem): string {
  if (item.bron === "supplement") {
    return supplementCatalogEntry(item.key)?.porties[0]?.labelNl ?? "portie";
  }
  return "g";
}

export default function DagboekProductDetail({
  item,
  onTerug,
  onVerwijder,
  busy = false,
}: {
  item: DagboekItem;
  onTerug: () => void;
  onVerwijder: (item: DagboekItem) => void;
  busy?: boolean;
}) {
  const label = labelVoor(item);
  const voedingEntry = item.bron === "voeding" ? catalogEntry(item.key) : null;
  const eenheid = eenheidVoor(item);

  const rijen = NUTRIENT_ORDER.map((nutrient) => {
    const bedrag = bedragVanItem(item, nutrient);
    if (!bedrag) return null;
    const inBasis = toBase(bedrag.value, bedrag.unit, nutrient);
    if (inBasis === null) return null;
    const aandeel = aandeelVanRi(nutrient, inBasis);
    return {
      nutrient,
      label: nutrientReferences[nutrient].label,
      waarde: inBasis,
      unit: bedrag.unit,
      aandeel,
    };
  }).filter((rij): rij is NonNullable<typeof rij> => rij !== null);

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
        <div className="min-w-0">
          <h2 className="m-0 truncate font-serif text-[19px] font-normal text-[var(--vd-ink)]">
            {label}
          </h2>
          <span className="text-[11px] text-[var(--vd-ink-4)]">
            {item.grams} {eenheid}
            {item.bron === "supplement" ? " · supplement" : null}
          </span>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <header className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <h3 className="m-0 font-sans text-[13.5px] font-bold text-[var(--vd-ink)]">
            Wat dit levert
          </h3>
        </header>

        {rijen.length === 0 ? (
          <p className="m-0 px-4 py-6 text-center text-[12px] leading-relaxed text-[var(--vd-ink-4)]">
            Van dit product is nog geen gehalte bekend voor de stoffen die dit dagboek volgt.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-4">
            {rijen.map((rij) => {
              const vulling = rij.aandeel === null ? 0 : Math.min(Math.round(rij.aandeel * 100), 100);
              const gedekt = rij.aandeel !== null && rij.aandeel >= 1;
              return (
                <li key={rij.nutrient} className="flex items-center gap-3">
                  <span className="w-[72px] shrink-0 text-[12px] font-medium text-[var(--vd-ink-2)]">
                    {rij.label}
                  </span>
                  <span className="relative h-[22px] flex-1 overflow-hidden rounded-md bg-[var(--vd-track)]">
                    {rij.aandeel !== null ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 rounded-md"
                        style={{
                          width: `${vulling}%`,
                          background: gedekt ? "var(--vd-sage)" : "var(--vd-terra)",
                        }}
                      />
                    ) : null}
                    <span className="relative flex h-full items-center justify-end px-2 font-mono text-[10.5px] font-bold tabular-nums text-[var(--vd-ink)]">
                      {rij.aandeel === null ? "eigen doel" : `${vulling}% ADH`}
                    </span>
                  </span>
                  <span className="w-[64px] shrink-0 text-right font-mono text-[11px] tabular-nums text-[var(--vd-ink-3)]">
                    {Math.round(rij.waarde * 10) / 10} {rij.unit}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="m-0 rounded-xl border-l-2 border-[var(--vd-sage)] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--vd-ink-2)]">
        Dit is wat <b className="font-semibold text-[var(--vd-ink)]">{item.grams} {eenheid}</b>{" "}
        {label.toLowerCase()} levert — niet je hele dag. Alleen de stoffen die dit dagboek volgt
        staan hier; andere voedingsstoffen (calorieën, macro&apos;s, overige vitamines) meet dit
        systeem bewust niet.
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => onVerwijder(item)}
        className="self-start rounded-lg border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--vd-ink-3)] transition-colors hover:border-[var(--vd-terra)] hover:text-[var(--vd-terra)] disabled:opacity-50"
      >
        Verwijder uit dagboek
      </button>
    </div>
  );
}
