"use client";

import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { aandeelVanRi } from "@/data/nutrition/reference-intake";
import type { NutrientOndergrens } from "@/lib/nutrition-dagboek-items";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * De vier klikbare balken onder de hero: magnesium, eiwit, zink, omega-3.
 *
 * Zelfde ring-opzet als `DagboekRingen.tsx` (boog + middenwaarde + label),
 * maar als rij van precies vier met een klikhandler naar het detailscherm per
 * stof, in plaats van een raster dat meegroeit met wat er die dag geregistreerd
 * is. Zink houdt zijn amber-kleur: dat is geen ontbrekende norm maar de
 * bestaande waarschuwing dat een dagboek deze stof zelden als "gedekt" toont
 * (zie `NIET_BEWIJSBAAR` in nutrition-tekortsysteem.ts).
 */

const BALKEN_NUTRIENTEN: readonly NutrientId[] = ["magnesium", "protein", "zinc", "omega3"];

const STRAAL = 22;
const OMTREK = 2 * Math.PI * STRAAL;

type RingKleur = "sage" | "amber";

const STREEK: Record<RingKleur, string> = {
  sage: "#5A8F6A",
  amber: "#C99A3C",
};

function aandeelVoor(
  nutrient: NutrientId,
  stof: NutrientOndergrens | undefined,
  proteinTarget: ProteinTargetRange | null,
): number | null {
  if (!stof) return null;
  if (nutrient === "protein") {
    if (!proteinTarget || proteinTarget.gramsLow <= 0) return null;
    return stof.minstens / proteinTarget.gramsLow;
  }
  return aandeelVanRi(nutrient, stof.minstens);
}

export default function DagboekNutrientBalken({
  stoffen,
  proteinTarget,
  onSelect,
}: {
  stoffen: readonly NutrientOndergrens[];
  proteinTarget: ProteinTargetRange | null;
  onSelect: (nutrient: NutrientId) => void;
}) {
  return (
    <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0">
      {BALKEN_NUTRIENTEN.map((nutrient) => {
        const stof = stoffen.find((s) => s.nutrient === nutrient);
        const aandeel = aandeelVoor(nutrient, stof, proteinTarget);
        const kleur: RingKleur = nutrient in NIET_BEWIJSBAAR ? "amber" : "sage";
        const vol = aandeel === null ? 0 : Math.min(aandeel, 1);

        return (
          <li key={nutrient}>
            <button
              type="button"
              onClick={() => onSelect(nutrient)}
              className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.02] px-1 py-2.5 text-center transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              <span className="relative block h-[52px] w-[52px]">
                <svg viewBox="0 0 52 52" className="block h-[52px] w-[52px] -rotate-90">
                  <circle
                    cx="26"
                    cy="26"
                    r={STRAAL}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r={STRAAL}
                    fill="none"
                    stroke={STREEK[kleur]}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={OMTREK}
                    strokeDashoffset={OMTREK * (1 - vol)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center">
                  <b className="font-serif text-[12px] font-normal leading-none text-[#F1EFE8]">
                    {aandeel === null ? "—" : `${Math.round(aandeel * 100)}%`}
                  </b>
                </span>
              </span>
              <span className="text-[10px] font-semibold leading-tight text-[#9FB0A6]">
                {nutrientReferences[nutrient].label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
