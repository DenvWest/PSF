"use client";

import { useEffect, useRef, useState } from "react";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import * as Icons from "@/components/app/icons";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import { bedragVanItem, type DagboekItemBron } from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * De portie-invoer: hoeveel, met de bijdrage aan de dekking live erbij.
 *
 * ## Waarom dit een laag over de zoeklijst is en geen eigen scherm
 *
 * Een maaltijd is zelden één product. Als portie-invoer een volwaardig scherm
 * is, kost elk volgend product de hele route terug: bevestigen → terug naar
 * zoeken → opnieuw oriënteren. Als laag blijft de lijst eronder staan, en is
 * het tweede product één tik verder dan het eerste.
 *
 * Dat maakt ook het formulier kleiner. Het eetmoment staat op het zoekscherm —
 * daar kies je het één keer voor alles wat je in deze sessie toevoegt, in
 * plaats van bij elk product opnieuw. Wat hier overblijft is de enige vraag
 * die per product verschilt: hoeveel.
 *
 * Voeding rekent in gram met een vrij invoerveld; een supplement telt in hele
 * porties (capsule, tablet, schep). Beide gebruiken `bedragVanItem` voor de
 * live berekening — dezelfde functie die de opslag ook gebruikt, dus het getal
 * dat je hier ziet is exact wat er na bevestigen bij komt.
 */
export default function DagboekPortieInvoer({
  bron,
  itemKey,
  nutrient,
  moment,
  favorieten,
  onBevestig,
  onBewaarFavoriet,
  onVerwijderFavoriet,
  onTerug,
  busy = false,
  busyFavoriet = false,
}: {
  bron: DagboekItemBron;
  itemKey: string;
  /** De stof waarvandaan je kwam — bepaalt welke bijdrage hier getoond wordt. */
  nutrient: NutrientId;
  /** Waar dit item heen gaat. Gekozen op het zoekscherm; hier alleen ter bevestiging. */
  moment: EetmomentId;
  /** Handmatig bewaarde favorieten — bepaalt of de ster hier al gevuld staat. */
  favorieten: readonly DagboekFavoriet[];
  onBevestig: (moment: EetmomentId, grams: number) => void;
  onBewaarFavoriet: (bron: DagboekItemBron, key: string) => void;
  onVerwijderFavoriet: (bron: DagboekItemBron, key: string) => void;
  onTerug: () => void;
  busy?: boolean;
  busyFavoriet?: boolean;
}) {
  const voedingEntry = bron === "voeding" ? catalogEntry(itemKey) : null;
  const supplementEntry = bron === "supplement" ? supplementCatalogEntry(itemKey) : null;
  const label = voedingEntry?.labelNl ?? supplementEntry?.labelNl ?? null;
  const bewaard = favorieten.some((f) => f.bron === bron && f.key === itemKey);
  const momentLabel =
    EETMOMENTEN.find((m) => m.id === moment)?.label.toLowerCase() ?? "je dag";

  const [aantalPorties, setAantalPorties] = useState(1);

  // Voeding start op de gangbare portie in gram; een supplement telt in
  // hele porties (1 capsule, 2 tabletten) — vandaar de twee invoervormen.
  const standaardGram = voedingEntry?.porties[0]?.grams ?? 100;
  const [grams, setGrams] = useState(standaardGram);

  const effectieveGrams = bron === "supplement" ? aantalPorties : grams;

  // Geen useMemo: `bedragVanItem` is een opzoeking in twee Maps plus één
  // vermenigvuldiging, en de React Compiler kan deze component alleen
  // optimaliseren als er geen handmatige memoisatie omheen staat.
  const bijdrage = label
    ? bedragVanItem({ moment, bron, key: itemKey, grams: effectieveGrams }, nutrient)
    : null;

  // Escape sluit de laag — hij ligt over de lijst heen, dus er moet een
  // uitgang zijn die niet van het vinden van een knop afhangt.
  const paneel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function opToets(event: KeyboardEvent) {
      if (event.key === "Escape") onTerug();
    }
    document.addEventListener("keydown", opToets);
    paneel.current?.focus();
    return () => document.removeEventListener("keydown", opToets);
  }, [onTerug]);

  if (!label) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product niet gevonden"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-3 pb-3"
      >
        <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#101A12] p-4">
          <p className="m-0 text-[12px] text-[#7E8C82]">Dit product bestaat niet (meer).</p>
          <button
            type="button"
            onClick={onTerug}
            className="mt-3 cursor-pointer rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#9FB0A6]"
          >
            Terug
          </button>
        </div>
      </div>
    );
  }

  /** De portieknoppen: één tik voor de porties die mensen werkelijk eten. */
  const snelkeuzes = voedingEntry?.porties ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Hoeveel ${label}?`}
    >
      {/* Buiten de laag tikken sluit hem: op mobiel de snelste uitgang. */}
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onTerug}
        className="absolute inset-0 cursor-default bg-black/60"
      />

      <div
        ref={paneel}
        tabIndex={-1}
        className="relative flex w-full max-w-lg flex-col gap-3 rounded-t-2xl border border-b-0 border-white/12 bg-[#101A12] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 outline-none sm:mb-3 sm:rounded-b-2xl sm:border-b"
      >
        <span
          aria-hidden
          className="mx-auto h-1 w-9 shrink-0 rounded-full bg-white/20 sm:hidden"
        />

        <header className="flex items-center gap-3">
          {voedingEntry ? (
            <FoodThumbnail entry={voedingEntry} size={40} />
          ) : (
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6C8FC9]/20 text-[17px] font-medium text-[#9DB3E0]"
            >
              {label.trim().charAt(0).toUpperCase() || "?"}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold text-[#F1EFE8]">
              {label}
            </span>
            <span className="block text-[10.5px] text-[#6F8177]">
              {bron === "supplement" ? "supplement · " : ""}
              naar {momentLabel}
            </span>
          </span>
          <button
            type="button"
            disabled={busyFavoriet}
            onClick={() =>
              bewaard ? onVerwijderFavoriet(bron, itemKey) : onBewaarFavoriet(bron, itemKey)
            }
            aria-label={
              bewaard ? `Verwijder ${label} uit favorieten` : `Bewaar ${label} als favoriet`
            }
            aria-pressed={bewaard}
            className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
              bewaard ? "text-[#C99A3C]" : "text-[#6F8177] hover:text-[#C99A3C]"
            }`}
          >
            <Icons.Star s={18} filled={bewaard} />
          </button>
        </header>

        {bron === "voeding" ? (
          <>
            {snelkeuzes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {snelkeuzes.map((portie) => {
                  const actief = grams === portie.grams;
                  return (
                    <button
                      key={`${portie.labelNl}-${portie.grams}`}
                      type="button"
                      onClick={() => setGrams(portie.grams)}
                      aria-pressed={actief}
                      aria-label={`${portie.labelNl}, ${portie.grams} gram`}
                      className={`min-h-[36px] cursor-pointer rounded-lg border px-3 text-[12.5px] transition-colors ${
                        actief
                          ? "border-[#5A8F6A] bg-[#5A8F6A]/20 font-semibold text-[#9CC5A9]"
                          : "border-white/12 bg-white/[0.03] text-[#9FB0A6] hover:border-white/30"
                      }`}
                    >
                      {portie.labelNl}
                      <span className="ml-1.5 text-[10.5px] text-[#6F8177]">
                        {portie.grams} g
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            <label className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6F8177]">
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
                className="w-20 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[#F1EFE8] outline-none transition-colors focus:border-white/40"
              />
            </label>
          </>
        ) : (
          <label className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6F8177]">
              Aantal
            </span>
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
              className="w-20 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[#F1EFE8] outline-none transition-colors focus:border-white/40"
            />
            <span className="text-[12px] text-[#6F8177]">
              × {supplementEntry?.porties[0]?.labelNl ?? "portie"}
            </span>
          </label>
        )}

        <p className="m-0 flex items-center gap-2 rounded-xl border border-[#5A8F6A]/25 bg-[#5A8F6A]/[0.06] px-3 py-2 text-[12.5px] leading-relaxed text-[#9FB0A6]">
          <span aria-hidden className="shrink-0 text-[#9CC5A9]">
            <Icons.TrendUp s={14} />
          </span>
          {bijdrage ? (
            <>
              Levert{" "}
              <b className="font-semibold text-[#F1EFE8]">
                {Math.round(bijdrage.value * 10) / 10} {bijdrage.unit}
              </b>{" "}
              {nutrientReferences[nutrient].label.toLowerCase()}.
            </>
          ) : (
            "Geen bekend gehalte voor deze stof."
          )}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTerug}
            className="min-h-[44px] cursor-pointer rounded-xl border border-white/15 bg-white/[0.03] px-4 text-[13px] text-[#9FB0A6] transition-colors hover:border-white/30"
          >
            Annuleer
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onBevestig(moment, effectieveGrams)}
            className="min-h-[44px] flex-1 cursor-pointer rounded-xl bg-[#5A8F6A] px-4 text-[13px] font-semibold text-[#0f1c10] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
