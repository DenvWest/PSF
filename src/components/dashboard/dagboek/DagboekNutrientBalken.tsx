"use client";

import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * De vier klikbare balken onder de hero: magnesium, eiwit, zink, omega-3.
 *
 * Zelfde ring-opzet als `DagboekRingen.tsx` (boog + middenwaarde + label),
 * maar als rij van precies vier met een klikhandler naar het detailscherm per
 * stof, in plaats van een raster dat meegroeit met wat er die dag geregistreerd
 * is. Elke ring toont twee segmenten (voeding/supplement), zoals de hero
 * erboven. Zink houdt zijn amber-supplementkleur niet apart — de bestaande
 * "niet-bewijsbaar"-waarschuwing (dat een dagboek deze stof zelden als
 * "gedekt" toont, zie `NIET_BEWIJSBAAR` in nutrition-tekortsysteem.ts) staat
 * als los randje, zodat de voeding/supplement-kleuren consistent blijven
 * over alle vier balken.
 */

const BALKEN_NUTRIENTEN: readonly NutrientId[] = ["magnesium", "protein", "zinc", "omega3"];

const REFERENTIE_INNAME: Partial<Record<NutrientId, number>> = {
  magnesium: REFERENCE_INTAKES.magnesium.value,
  zinc: REFERENCE_INTAKES.zinc.value,
  omega3: REFERENCE_INTAKES.omega3.value,
};

const VOEDING_KLEUR = "var(--vd-sage)";
const SUPPLEMENT_KLEUR = "var(--vd-accent-2)";
const NIET_BEWIJSBAAR_RAND = "var(--vd-amber)";

const STRAAL = 22;
const OMTREK = 2 * Math.PI * STRAAL;

function aandelenVoor(
  nutrient: NutrientId,
  stof: NutrientOndergrensGesplitst | undefined,
  proteinTarget: ProteinTargetRange | null,
): { voeding: number; supplement: number } | null {
  if (!stof) return null;
  const noemer =
    nutrient === "protein"
      ? proteinTarget && proteinTarget.gramsLow > 0
        ? proteinTarget.gramsLow
        : null
      : (REFERENTIE_INNAME[nutrient] ?? null);
  if (noemer === null) return null;
  return { voeding: stof.uitVoeding / noemer, supplement: stof.uitSupplement / noemer };
}

export default function DagboekNutrientBalken({
  stoffen,
  proteinTarget,
  onSelect,
}: {
  stoffen: readonly NutrientOndergrensGesplitst[];
  proteinTarget: ProteinTargetRange | null;
  onSelect: (nutrient: NutrientId) => void;
}) {
  return (
    <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0">
      {BALKEN_NUTRIENTEN.map((nutrient) => {
        const stof = stoffen.find((s) => s.nutrient === nutrient);
        const aandelen = aandelenVoor(nutrient, stof, proteinTarget);
        const nietBewijsbaar = nutrient in NIET_BEWIJSBAAR;

        const voeding = aandelen ? Math.min(aandelen.voeding, 1) : 0;
        const supplement = aandelen
          ? Math.min(aandelen.supplement, 1 - voeding)
          : 0;
        const totaal = aandelen ? voeding + supplement : null;
        const voedingLengte = OMTREK * voeding;
        const supplementLengte = OMTREK * supplement;

        return (
          <li key={nutrient}>
            <button
              type="button"
              onClick={() => onSelect(nutrient)}
              className={`flex w-full cursor-pointer flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-center transition-colors hover:border-white/20 hover:bg-white/[0.04] ${
                nietBewijsbaar ? "border-[rgb(var(--vd-amber-rgb)/30%)]" : "border-white/8"
              } bg-white/[0.02]`}
            >
              <span className="relative block h-[52px] w-[52px]">
                <svg viewBox="0 0 52 52" className="block h-[52px] w-[52px] -rotate-90">
                  <circle
                    cx="26"
                    cy="26"
                    r={STRAAL}
                    fill="none"
                    stroke="var(--vd-track)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r={STRAAL}
                    fill="none"
                    stroke={VOEDING_KLEUR}
                    strokeWidth="5"
                    strokeDasharray={`${voedingLengte} ${OMTREK - voedingLengte}`}
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r={STRAAL}
                    fill="none"
                    stroke={SUPPLEMENT_KLEUR}
                    strokeWidth="5"
                    strokeDasharray={`${supplementLengte} ${OMTREK - supplementLengte}`}
                    strokeDashoffset={-voedingLengte}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center">
                  <b className="font-serif text-[12px] font-normal leading-none text-[var(--vd-ink)]">
                    {totaal === null ? "—" : `${Math.round(totaal * 100)}%`}
                  </b>
                </span>
              </span>
              <span className="text-[10px] font-semibold leading-tight text-[var(--vd-ink-2)]">
                {nutrientReferences[nutrient].label}
                {nietBewijsbaar ? (
                  <span aria-hidden style={{ color: NIET_BEWIJSBAAR_RAND }}>
                    {" "}
                    ●
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
