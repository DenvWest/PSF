"use client";

import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * De vijf klikbare balken onder de hero: magnesium, eiwit, zink, omega-3,
 * vitamine D — alle stoffen die het dagboek kent.
 *
 * Zelfde ring-opzet als `DagboekRingen.tsx` (boog + middenwaarde + label),
 * maar als vaste rij met een klikhandler naar het detailscherm per stof, in
 * plaats van een raster dat meegroeit met wat er die dag geregistreerd is.
 * Elke ring toont twee segmenten (voeding/supplement), zoals de hero erboven.
 * Zink en vitamine D houden hun amber-supplementkleur niet apart — de
 * bestaande "niet-bewijsbaar"-waarschuwing (dat een dagboek deze stoffen
 * zelden als "gedekt" toont, zie `NIET_BEWIJSBAAR` in
 * nutrition-tekortsysteem.ts) staat als los randje, zodat de
 * voeding/supplement-kleuren consistent blijven over alle vijf balken.
 */

const BALKEN_NUTRIENTEN: readonly NutrientId[] = [
  "magnesium",
  "protein",
  "zinc",
  "omega3",
  "vitamin_d",
];

const REFERENTIE_INNAME: Partial<Record<NutrientId, number>> = {
  magnesium: REFERENCE_INTAKES.magnesium.value,
  zinc: REFERENCE_INTAKES.zinc.value,
  omega3: REFERENCE_INTAKES.omega3.value,
  vitamin_d: REFERENCE_INTAKES.vitamin_d.value,
};

const VOEDING_KLEUR = "var(--vd-sage)";
const SUPPLEMENT_KLEUR = "var(--vd-accent-2)";
const NIET_BEWIJSBAAR_RAND = "var(--vd-amber)";

const STRAAL = 18;
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
    <ul className="m-0 grid list-none grid-cols-5 gap-1.5 p-0">
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
              <span className="relative block h-[44px] w-[44px]">
                <svg viewBox="0 0 44 44" className="block h-[44px] w-[44px] -rotate-90">
                  <circle
                    cx="22"
                    cy="22"
                    r={STRAAL}
                    fill="none"
                    stroke="var(--vd-track)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={STRAAL}
                    fill="none"
                    stroke={VOEDING_KLEUR}
                    strokeWidth="4"
                    strokeDasharray={`${voedingLengte} ${OMTREK - voedingLengte}`}
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={STRAAL}
                    fill="none"
                    stroke={SUPPLEMENT_KLEUR}
                    strokeWidth="4"
                    strokeDasharray={`${supplementLengte} ${OMTREK - supplementLengte}`}
                    strokeDashoffset={-voedingLengte}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center">
                  <b className="font-serif text-[10.5px] font-normal leading-none text-[var(--vd-ink)]">
                    {totaal === null ? "—" : `${Math.round(totaal * 100)}%`}
                  </b>
                </span>
              </span>
              <span className="text-[9px] font-semibold leading-tight text-[var(--vd-ink-2)]">
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
