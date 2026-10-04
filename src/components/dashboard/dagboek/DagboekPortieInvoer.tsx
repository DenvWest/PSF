"use client";

import { useEffect, useRef, useState } from "react";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import SupplementThumbnail from "@/components/dashboard/voortgang/SupplementThumbnail";
import * as Icons from "@/components/app/icons";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import { bedragVanItem } from "@/lib/nutrition-dagboek-items";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * De portie-invoer voor een supplement: hoeveel, met de bijdrage aan de dekking
 * live erbij. Een supplement telt in hele porties (capsule, tablet, schep);
 * voeding heeft `DagboekVoedingPortie`, met dezelfde rijen als een NEVO-product.
 *
 * Dit is een laag over de zoeklijst, geen eigen scherm: het tweede product is
 * dan één tik verder dan het eerste. Het eetmoment staat op het zoekscherm.
 * `bedragVanItem` is dezelfde functie die de opslag gebruikt, dus het getal dat
 * je hier ziet is exact wat er na bevestigen bij komt.
 *
 * Vanuit een nutriëntdetail draagt dit scherm één `nutrient` en toont het alleen
 * die bijdrage; vanuit een maaltijd alle stoffen die het dagboek volgt.
 */
export default function DagboekPortieInvoer({
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
  itemKey: string;
  /** De stof waarvandaan je kwam — bepaalt welke bijdrage hier getoond wordt. Null vanuit een maaltijd: dan tonen we alle stoffen. */
  nutrient?: NutrientId | null;
  /** Waar dit item heen gaat. Gekozen op het zoekscherm; hier alleen ter bevestiging. */
  moment: EetmomentId;
  /** Handmatig bewaarde favorieten — bepaalt of de ster hier al gevuld staat. */
  favorieten: readonly DagboekFavoriet[];
  onBevestig: (moment: EetmomentId, aantal: number) => void;
  onBewaarFavoriet: (bron: "supplement", key: string) => void;
  onVerwijderFavoriet: (bron: "supplement", key: string) => void;
  onTerug: () => void;
  busy?: boolean;
  busyFavoriet?: boolean;
}) {
  const entry = supplementCatalogEntry(itemKey);
  const label = entry?.labelNl ?? null;
  const bewaard = favorieten.some((f) => f.bron === "supplement" && f.key === itemKey);
  const momentLabel = EETMOMENTEN.find((m) => m.id === moment)?.label.toLowerCase() ?? "je dag";

  const [aantalPorties, setAantalPorties] = useState(1);

  // Geen useMemo: `bedragVanItem` is een opzoeking in twee Maps plus één
  // vermenigvuldiging, en de React Compiler kan deze component alleen
  // optimaliseren als er geen handmatige memoisatie omheen staat.
  const bijdrage =
    label && nutrient
      ? bedragVanItem({ moment, bron: "supplement", key: itemKey, grams: aantalPorties }, nutrient)
      : null;

  /** Zonder stof-context: de bijdrage aan alle stoffen die dit item raakt. */
  const alleBijdragen = label
    ? NUTRIENT_ORDER.map((n) => ({
        nutrient: n,
        bedrag: bedragVanItem({ moment, bron: "supplement", key: itemKey, grams: aantalPorties }, n),
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

  if (!entry || !label) {
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
          <SupplementThumbnail entry={entry} size={40} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold text-[var(--vd-ink)]">
              {label}
            </span>
            <span className="block text-[10.5px] text-[var(--vd-ink-4)]">
              supplement · naar {momentLabel}
            </span>
          </span>
          <button
            type="button"
            disabled={busyFavoriet}
            onClick={() =>
              bewaard
                ? onVerwijderFavoriet("supplement", itemKey)
                : onBewaarFavoriet("supplement", itemKey)
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
            × {entry.porties[0]?.labelNl ?? "portie"}
          </span>
        </label>

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
            onClick={() => onBevestig(moment, aantalPorties)}
            className="min-h-[44px] flex-1 cursor-pointer rounded-xl bg-[var(--vd-sage)] px-4 text-[13px] font-semibold text-[var(--vd-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
