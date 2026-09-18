"use client";

import { useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import {
  catalogByCategory,
  searchCatalog,
  type CatalogEntry,
} from "@/data/nutrition/food-catalog";
import {
  FOOD_CATEGORIES,
  foodCategory,
  type FoodCategoryId,
} from "@/data/nutrition/food-taxonomy";
import { DAGBOEK_LABELS } from "@/lib/nutrition-dagboek";

/**
 * Een voedingsmiddel zoeken en toevoegen aan het open eetmoment.
 *
 * ## Wat "toevoegen" hier betekent
 *
 * De catalogus kent 500+ voedingsmiddelen, maar het dagboek registreert per
 * voedselgroep — niet per product (zie `nutrition-dagboek.ts`: dertien vaste
 * groepen, geen calorieën of grammen). "Kwark" en "Griekse yoghurt" tellen
 * dus allebei mee als één portie zuivel; er is geen aparte teller per product.
 *
 * Dit scherm is daarmee een *vindhulp* boven de bestaande groepentelling, geen
 * productenlogboek: zoeken maakt het makkelijker om de juiste groep te vinden
 * ("Whey Eiwit Shake" → zuivel), de telling zelf blijft ongewijzigd. Wie geen
 * treffer vindt kan in `NutritionDagInvoer` nog steeds direct een groep kiezen
 * — de catalogus dekt nooit alles, en dat hoeft ook niet (zie
 * `food-catalog.ts`: "mag groeien zonder risico" is een belofte over de
 * toekomst, geen garantie voor vandaag).
 */

const ADD_KNOP =
  "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#5A8F6A]/55 bg-[#5A8F6A]/20 text-[#F1EFE8] transition-colors disabled:opacity-50";

export default function NutritionVoedingsmiddelZoeken({
  momentLabel,
  onAdd,
  onClose,
  busy = false,
}: {
  momentLabel: string;
  onAdd: (entry: CatalogEntry) => void;
  onClose: () => void;
  busy?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [categorie, setCategorie] = useState<FoodCategoryId | null>(null);
  const [zojuistToegevoegd, setZojuistToegevoegd] = useState<string | null>(null);

  const term = query.trim();

  const resultaten = useMemo(() => {
    if (term.length > 0) return searchCatalog(term, 25);
    if (categorie) return catalogByCategory(categorie);
    return [];
  }, [term, categorie]);

  function kies(entry: CatalogEntry) {
    onAdd(entry);
    setZojuistToegevoegd(entry.key);
    window.setTimeout(() => {
      setZojuistToegevoegd((huidig) => (huidig === entry.key ? null : huidig));
    }, 1200);
  }

  return (
    <div className="mt-2.5 rounded-[12px] border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Zoeken sluiten"
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-[#9FB0A6] hover:text-[#E7EDE8]"
        >
          <Icons.ChevronLeft s={15} />
        </button>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{`Voedingsmiddel zoeken voor ${momentLabel.toLowerCase()}`}</span>
          <span
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7E8C82]"
          >
            <Icons.Search s={13} />
          </span>
          <input
            type="text"
            value={query}
            disabled={busy}
            autoFocus
            onChange={(event) => {
              setQuery(event.target.value);
              setCategorie(null);
            }}
            placeholder="Zoek een voedingsmiddel…"
            className="min-h-8 w-full rounded-full border border-white/10 bg-black/30 py-1 pl-8 pr-3 text-[12.5px] text-[#F1EFE8] placeholder:text-[#7E8C82]"
          />
        </label>
      </div>

      {term.length === 0 && !categorie ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              disabled={busy}
              onClick={() => setCategorie(cat.id)}
              className="inline-flex min-h-7 cursor-pointer items-center rounded-full border border-white/10 bg-transparent px-2.5 text-[11px] font-medium text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#E7EDE8] disabled:opacity-50"
            >
              {cat.labelNl}
            </button>
          ))}
        </div>
      ) : null}

      {categorie && term.length === 0 ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7E8C82]">
            {foodCategory(categorie)?.labelNl}
          </span>
          <button
            type="button"
            onClick={() => setCategorie(null)}
            className="cursor-pointer border-none bg-transparent text-[11px] text-[#9CC5A9]"
          >
            Alle categorieën
          </button>
        </div>
      ) : null}

      {resultaten.length > 0 ? (
        <ul
          className="m-0 mt-2 flex max-h-64 list-none flex-col gap-0.5 overflow-y-auto p-0"
          role="list"
        >
          {resultaten.map((entry) => {
            const portie = entry.porties[0];
            const toegevoegd = zojuistToegevoegd === entry.key;
            return (
              <li
                key={entry.key}
                className="flex items-center justify-between gap-2 rounded-[8px] px-1.5 py-1.5 transition-colors hover:bg-white/[0.03]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] leading-snug text-[#E7EDE8]">
                    {entry.labelNl}
                  </span>
                  <span className="block truncate text-[10.5px] leading-snug text-[#7E8C82]">
                    {DAGBOEK_LABELS[entry.groep]}
                    {portie ? ` · ${portie.labelNl}` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => kies(entry)}
                  aria-label={`${entry.labelNl} toevoegen bij ${momentLabel.toLowerCase()}`}
                  className={ADD_KNOP}
                >
                  {toegevoegd ? <Icons.Check s={13} /> : <Icons.Plus s={13} />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : term.length > 0 ? (
        <p className="m-0 mt-2 text-[11.5px] leading-relaxed text-[#7E8C82]">
          Niets gevonden. Kies hieronder direct een voedselgroep.
        </p>
      ) : !categorie ? (
        <p className="m-0 mt-2 text-[11.5px] leading-relaxed text-[#7E8C82]">
          Typ een naam, of kies een categorie.
        </p>
      ) : null}
    </div>
  );
}
