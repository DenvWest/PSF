"use client";

import { useMemo, useState } from "react";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import * as Icons from "@/components/app/icons";
import { bedragVanItem, type DagboekItemBron } from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * Het portie-invoerscherm: hoeveel, in welke eenheid, wanneer — met de
 * bijdrage aan de dekking live erbij.
 *
 * Voeding rekent in gram met een vrij invoerveld (net als het bestaande
 * dagboek); een supplement kiest uit zijn eigen portievormen (capsule,
 * tablet, schep) en telt in aantallen. Beide gebruiken `bedragVanItem` voor de
 * live berekening, dezelfde functie die de opslag straks ook gebruikt — het
 * getal dat je hier ziet is dus exact wat er na bevestigen bij komt.
 */
export default function DagboekPortieInvoer({
  bron,
  itemKey,
  nutrient,
  onBevestig,
  onTerug,
  busy = false,
}: {
  bron: DagboekItemBron;
  itemKey: string;
  /** De stof waarvandaan je kwam — bepaalt welke bijdrage hier getoond wordt. */
  nutrient: NutrientId;
  onBevestig: (moment: EetmomentId, grams: number) => void;
  onTerug: () => void;
  busy?: boolean;
}) {
  const voedingEntry = bron === "voeding" ? catalogEntry(itemKey) : null;
  const supplementEntry = bron === "supplement" ? supplementCatalogEntry(itemKey) : null;
  const label = voedingEntry?.labelNl ?? supplementEntry?.labelNl ?? null;

  const [moment, setMoment] = useState<EetmomentId>("ontbijt");
  const [aantalPorties, setAantalPorties] = useState(1);

  // Voeding start op de gangbare portie in gram; een supplement telt in
  // hele porties (1 capsule, 2 tabletten) — vandaar de twee invoervormen.
  const standaardGram = voedingEntry?.porties[0]?.grams ?? 100;
  const [grams, setGrams] = useState(standaardGram);

  const effectieveGrams = bron === "supplement" ? aantalPorties : grams;

  const bijdrage = useMemo(() => {
    if (!label) return null;
    return bedragVanItem({ moment, bron, key: itemKey, grams: effectieveGrams }, nutrient);
  }, [label, moment, bron, itemKey, effectieveGrams, nutrient]);

  if (!label) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-[12px] text-[#7E8C82]">Dit product bestaat niet (meer).</p>
        <button
          type="button"
          onClick={onTerug}
          className="cursor-pointer self-start rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#9FB0A6]"
        >
          Terug
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#F1EFE8]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 className="m-0 min-w-0 truncate font-serif text-[17px] font-normal text-[#F1EFE8]">
          {label}
        </h2>
      </header>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6F8177]">
          Eetmoment
        </span>
        <select
          value={moment}
          onChange={(event) => setMoment(event.target.value as EetmomentId)}
          className="rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-2 text-[13px] text-[#F1EFE8] outline-none transition-colors focus:border-white/40"
        >
          {EETMOMENTEN.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      {bron === "voeding" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6F8177]">
            Hoeveelheid
          </span>
          <div className="flex items-center gap-2">
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
              className="w-24 rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[#F1EFE8] outline-none transition-colors focus:border-white/40"
            />
            <span className="text-[12px] text-[#6F8177]">gram</span>
            {voedingEntry?.porties.length ? (
              <span className="text-[11px] text-[#6F8177]">
                ({voedingEntry.porties[0]?.labelNl} ≈ {voedingEntry.porties[0]?.grams} g)
              </span>
            ) : null}
          </div>
        </label>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6F8177]">
            Aantal
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={aantalPorties}
              disabled={busy}
              onChange={(event) =>
                setAantalPorties(Math.max(1, Math.trunc(Number(event.target.value)) || 1))
              }
              className="w-24 rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[#F1EFE8] outline-none transition-colors focus:border-white/40"
            />
            <span className="text-[12px] text-[#6F8177]">
              × {supplementEntry?.porties[0]?.labelNl ?? "portie"}
            </span>
          </div>
        </label>
      )}

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
        <p className="m-0 text-[13px] text-[#9FB0A6]">
          {bijdrage
            ? (
                <>
                  Levert{" "}
                  <b className="font-semibold text-[#F1EFE8]">
                    {Math.round(bijdrage.value * 10) / 10} {bijdrage.unit}
                  </b>{" "}
                  {nutrientReferences[nutrient].label.toLowerCase()}.
                </>
              )
            : "Geen bekend gehalte voor deze stof."}
        </p>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => onBevestig(moment, effectieveGrams)}
        className="cursor-pointer rounded-xl bg-[#5A8F6A] px-4 py-2.5 text-[13px] font-semibold text-[#0f1c10] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Toevoegen
      </button>
    </div>
  );
}
