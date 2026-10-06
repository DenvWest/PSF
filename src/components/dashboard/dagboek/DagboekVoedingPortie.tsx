"use client";

import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import NevoMacroBlok from "@/components/dashboard/dagboek/NevoMacroBlok";
import PortieRijenScherm from "@/components/dashboard/dagboek/PortieRijenScherm";
import * as Icons from "@/components/app/icons";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import { weergaveVanItem } from "@/lib/nutrition-dagboek-items";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";

/**
 * De portie-invoer voor een voedingsmiddel uit de catalogus: dezelfde rijen als
 * een NEVO-product (`PortieRijenScherm`), met de kernstoffen-bijdrage die het
 * tekortsysteem draagt en — als de regel aan NEVO gekoppeld is — de calorieën
 * en macro's ernaast.
 *
 * Vanuit een nutriëntdetail draagt dit scherm één `nutrient` en toont het
 * alleen die bijdrage; vanuit een maaltijd alle stoffen die het dagboek volgt.
 * Supplementen houden `DagboekPortieInvoer` (telt in hele porties).
 */
export default function DagboekVoedingPortie({
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
  nutrient?: NutrientId | null;
  moment: EetmomentId;
  favorieten: readonly DagboekFavoriet[];
  onBevestig: (moment: EetmomentId, grams: number) => void;
  onBewaarFavoriet: (bron: "voeding", key: string) => void;
  onVerwijderFavoriet: (bron: "voeding", key: string) => void;
  onTerug: () => void;
  busy?: boolean;
  busyFavoriet?: boolean;
}) {
  const entry = catalogEntry(itemKey);

  if (!entry) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-[12px] text-[var(--vd-ink-3)]">Dit product bestaat niet (meer).</p>
        <button
          type="button"
          onClick={onTerug}
          className="w-fit cursor-pointer rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[12px] text-[var(--vd-ink-2)]"
        >
          Terug
        </button>
      </div>
    );
  }

  const bewaard = favorieten.some((f) => f.bron === "voeding" && f.key === itemKey);

  return (
    <PortieRijenScherm
      naam={entry.labelNl}
      moment={moment}
      startGram={entry.porties[0]?.grams ?? 100}
      snelkeuzes={entry.porties}
      busy={busy}
      onBevestig={onBevestig}
      onTerug={onTerug}
      kopActie={
        <button
          type="button"
          disabled={busyFavoriet}
          onClick={() => (bewaard ? onVerwijderFavoriet("voeding", itemKey) : onBewaarFavoriet("voeding", itemKey))}
          aria-label={bewaard ? `Verwijder ${entry.labelNl} uit favorieten` : `Bewaar ${entry.labelNl} als favoriet`}
          aria-pressed={bewaard}
          className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
            bewaard ? "text-[var(--vd-amber)]" : "text-[var(--vd-ink-4)] hover:text-[var(--vd-amber)]"
          }`}
        >
          <Icons.Star s={18} filled={bewaard} />
        </button>
      }
    >
      {(totaalGram) => {
        const bijdragen = NUTRIENT_ORDER.flatMap((n) => {
          if (nutrient && n !== nutrient) return [];
          const weergave = weergaveVanItem({ moment, bron: "voeding", key: itemKey, grams: totaalGram }, n);
          if (weergave.soort === "onbekend") return [];
          if (weergave.soort !== "waarde" && !nutrient) return [];
          return [{ nutrient: n, weergave }];
        });
        const benadering = bijdragen.find((rij) => rij.weergave.benadering)?.weergave.benadering ?? null;
        return (
          <>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="m-0 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-4)]">
                Levert
              </p>
              {bijdragen.length === 0 ? (
                <p className="m-0 text-[12px] leading-relaxed text-[var(--vd-ink-4)]">
                  {nutrient
                    ? "Geen bekend gehalte voor deze stof."
                    : "Geen bekend gehalte voor de stoffen die dit dagboek volgt."}
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {bijdragen.map((rij) => (
                    <li
                      key={rij.nutrient}
                      className="flex items-center justify-between gap-2 text-[12.5px] text-[var(--vd-ink-2)]"
                    >
                      <span>{nutrientReferences[rij.nutrient].label}</span>
                      <span className="font-mono tabular-nums text-[var(--vd-ink)]">
                        {rij.weergave.benadering ? "≈ " : null}
                        {rij.weergave.soort === "waarde"
                          ? `${Math.round(rij.weergave.value * 10) / 10} ${rij.weergave.unit}`
                          : rij.weergave.soort === "spoor"
                            ? "spoor"
                            : `0 ${rij.weergave.unit}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {benadering ? (
                <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-[var(--vd-ink-4)]">
                  ≈ Benadering: waarden van &lsquo;{benadering}&rsquo; (NEVO). Telt niet mee in je dag.
                </p>
              ) : null}
            </div>

            <NevoMacroBlok entry={entry} grams={totaalGram} />
          </>
        );
      }}
    </PortieRijenScherm>
  );
}
