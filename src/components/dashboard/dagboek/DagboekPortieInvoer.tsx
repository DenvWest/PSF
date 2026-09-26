"use client";

import { useEffect, useRef, useState } from "react";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import * as Icons from "@/components/app/icons";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import { bedragVanItem, type DagboekItemBron } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
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
 *
 * ## Met of zonder stof-context
 *
 * Vanuit een nutriëntdetail draagt dit scherm één `nutrient` en toont het
 * alleen die bijdrage ("Levert 40 mg magnesium"). Vanuit een maaltijd is er
 * geen stof gekozen — dan toont dit scherm de bijdrage aan alle stoffen die
 * het dagboek volgt, dezelfde lijst als `DagboekProductDetail`.
 */
export default function DagboekPortieInvoer({
  bron,
  itemKey,
  nutrient = null,
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
  /** De stof waarvandaan je kwam — bepaalt welke bijdrage hier getoond wordt. Null vanuit een maaltijd: dan tonen we alle stoffen. */
  nutrient?: NutrientId | null;
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
  const bijdrage =
    label && nutrient
      ? bedragVanItem({ moment, bron, key: itemKey, grams: effectieveGrams }, nutrient)
      : null;

  /** Zonder stof-context: de bijdrage aan alle stoffen die dit item raakt. */
  const alleBijdragen = label
    ? NUTRIENT_ORDER.map((n) => ({
        nutrient: n,
        bedrag: bedragVanItem({ moment, bron, key: itemKey, grams: effectieveGrams }, n),
      })).filter(
        (rij): rij is { nutrient: NutrientId; bedrag: NonNullable<typeof rij.bedrag> } =>
          rij.bedrag !== null,
      )
    : [];

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
        className="relative flex w-full max-w-lg flex-col gap-3 rounded-t-2xl border border-b-0 border-white/12 bg-[var(--vd-surface)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 outline-none sm:mb-3 sm:rounded-b-2xl sm:border-b"
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--vd-accent-2-rgb)/20%)] text-[17px] font-medium text-[var(--vd-accent-2)]"
            >
              {label.trim().charAt(0).toUpperCase() || "?"}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold text-[var(--vd-ink)]">
              {label}
            </span>
            <span className="block text-[10.5px] text-[var(--vd-ink-4)]">
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
              bewaard ? "text-[var(--vd-amber)]" : "text-[var(--vd-ink-4)] hover:text-[var(--vd-amber)]"
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
                          ? "border-[var(--vd-sage)] bg-[rgb(var(--vd-sage-rgb)/20%)] font-semibold text-[var(--vd-sage-2)]"
                          : "border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] hover:border-white/30"
                      }`}
                    >
                      {portie.labelNl}
                      <span className="ml-1.5 text-[10.5px] text-[var(--vd-ink-4)]">
                        {portie.grams} g
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

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
          </>
        ) : (
          <label className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
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
              className="w-20 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[var(--vd-ink)] outline-none transition-colors focus:border-white/40"
            />
            <span className="text-[12px] text-[var(--vd-ink-4)]">
              × {supplementEntry?.porties[0]?.labelNl ?? "portie"}
            </span>
          </label>
        )}

        {nutrient ? (
          <p className="m-0 flex items-center gap-2 rounded-xl border border-[rgb(var(--vd-sage-rgb)/25%)] bg-[rgb(var(--vd-sage-rgb)/6%)] px-3 py-2 text-[12.5px] leading-relaxed text-[var(--vd-ink-2)]">
            <span aria-hidden className="shrink-0 text-[var(--vd-sage-2)]">
              <Icons.TrendUp s={14} />
            </span>
            {bijdrage ? (
              <>
                Levert{" "}
                <b className="font-semibold text-[var(--vd-ink)]">
                  {Math.round(bijdrage.value * 10) / 10} {bijdrage.unit}
                </b>{" "}
                {nutrientReferences[nutrient].label.toLowerCase()}.
              </>
            ) : (
              "Geen bekend gehalte voor deze stof."
            )}
          </p>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="m-0 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
              Levert
            </p>
            {alleBijdragen.length === 0 ? (
              <p className="m-0 text-[12px] leading-relaxed text-[var(--vd-ink-4)]">
                Geen bekend gehalte voor de stoffen die dit dagboek volgt.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {alleBijdragen.map((rij) => (
                  <li
                    key={rij.nutrient}
                    className="flex items-center justify-between gap-2 text-[12.5px] text-[var(--vd-ink-2)]"
                  >
                    <span>{nutrientReferences[rij.nutrient].label}</span>
                    <span className="font-mono tabular-nums text-[var(--vd-ink)]">
                      {Math.round(rij.bedrag.value * 10) / 10} {rij.bedrag.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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
            onClick={() => onBevestig(moment, effectieveGrams)}
            className="min-h-[44px] flex-1 cursor-pointer rounded-xl bg-[var(--vd-sage)] px-4 text-[13px] font-semibold text-[var(--vd-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
