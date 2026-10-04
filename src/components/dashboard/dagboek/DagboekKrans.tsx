"use client";

import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * De krans boven het dagboek: één ring met een segment per stof.
 *
 * Vervangt de losse telcirkel plus de rij mini-ringen. Je ziet in één blik wat
 * vol is en wat openstaat, en tikt je op een stof dan opent het logboek van die
 * stof.
 *
 * ## Kleur is identiteit, geen oordeel
 *
 * Elk segment heeft de eigen kleur van zijn stof. Status zit niet in de tint
 * maar in de vulling, het vinkje en de gestippelde rand: zink en vitamine D
 * staan in {@link NIET_BEWIJSBAAR} en krijgen een gestippeld spoor, omdat een
 * dagboek ze niet kan aantonen. Voeding en supplement worden pas in het
 * logboek per product onderscheiden.
 *
 * ## Telling blijft telling
 *
 * "2/3 stoffen gedekt" telt alleen bewijsbare stoffen met een noemer, zoals het
 * tekortsysteem: een gehaalde RI bewijst dekking, een gemiste bewijst niets.
 * Eiwit rekent tegen het persoonlijke doel; zonder doel telt het niet mee.
 */

const KRANS_NUTRIENTEN: readonly NutrientId[] = [
  "magnesium",
  "protein",
  "omega3",
  "zinc",
  "vitamin_d",
];

const REFERENTIE_INNAME: Partial<Record<NutrientId, number>> = {
  magnesium: REFERENCE_INTAKES.magnesium.value,
  zinc: REFERENCE_INTAKES.zinc.value,
  omega3: REFERENCE_INTAKES.omega3.value,
  vitamin_d: REFERENCE_INTAKES.vitamin_d.value,
};

const MIDDEN = 120;
const STRAAL = 92;
const DIKTE = 18;
const SPAN = 360 / KRANS_NUTRIENTEN.length;
const GAT = 7;

function punt(hoek: number): { x: number; y: number } {
  const rad = ((hoek - 90) * Math.PI) / 180;
  return { x: MIDDEN + STRAAL * Math.cos(rad), y: MIDDEN + STRAAL * Math.sin(rad) };
}

function boog(index: number): string {
  const van = punt(index * SPAN + GAT / 2);
  const tot = punt((index + 1) * SPAN - GAT / 2);
  return `M ${van.x} ${van.y} A ${STRAAL} ${STRAAL} 0 0 1 ${tot.x} ${tot.y}`;
}

function aandeelVoor(
  nutrient: NutrientId,
  stof: NutrientOndergrensGesplitst | undefined,
  proteinTarget: ProteinTargetRange | null,
): number | null {
  const noemer =
    nutrient === "protein"
      ? proteinTarget && proteinTarget.gramsLow > 0
        ? proteinTarget.gramsLow
        : null
      : (REFERENTIE_INNAME[nutrient] ?? null);
  if (noemer === null) return null;
  return stof ? stof.minstens / noemer : 0;
}

export default function DagboekKrans({
  stoffen,
  proteinTarget,
  onSelect,
  onBegin,
}: {
  stoffen: readonly NutrientOndergrensGesplitst[];
  proteinTarget: ProteinTargetRange | null;
  onSelect: (nutrient: NutrientId) => void;
  onBegin: () => void;
}) {
  const rijen = KRANS_NUTRIENTEN.map((nutrient) => {
    const stof = stoffen.find((s) => s.nutrient === nutrient);
    const aandeel = aandeelVoor(nutrient, stof, proteinTarget);
    return {
      nutrient,
      aandeel,
      vol: aandeel === null ? 0 : Math.min(aandeel, 1),
      gedekt: aandeel !== null && aandeel >= 1,
      telt: !(nutrient in NIET_BEWIJSBAAR) && aandeel !== null,
      nietBewijsbaar: nutrient in NIET_BEWIJSBAAR,
    };
  });

  const leeg = stoffen.length === 0;
  const totaal = rijen.filter((r) => r.telt).length;
  const gedekt = rijen.filter((r) => r.telt && r.gedekt).length;

  return (
    <section aria-label="Dekking vandaag" className="@container flex w-full flex-col items-center gap-3 py-1">
      <div className="@container/krans relative aspect-square w-full max-w-[220px]">
        <svg
          viewBox="0 0 240 240"
          aria-hidden
          className="block h-full w-full"
        >
          {rijen.map((rij, index) => {
            const kleur = `var(--vd-stof-${rij.nutrient})`;
            return (
              <g
                key={rij.nutrient}
                className="cursor-pointer"
                onClick={() => onSelect(rij.nutrient)}
              >
                <path
                  d={boog(index)}
                  fill="none"
                  stroke="var(--vd-track)"
                  strokeWidth={DIKTE}
                  strokeLinecap="round"
                  strokeDasharray={rij.nietBewijsbaar ? "2 7" : undefined}
                />
                <path
                  d={boog(index)}
                  pathLength={100}
                  fill="none"
                  stroke={kleur}
                  strokeWidth={DIKTE}
                  strokeLinecap="round"
                  strokeDasharray={`${rij.vol * 100} 100`}
                  opacity={rij.nietBewijsbaar ? 0.6 : 1}
                  className="transition-all duration-500"
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[18%] text-center">
          {leeg ? (
            <b className="font-serif text-[clamp(14px,8.6cqw,19px)] font-normal leading-tight text-[var(--vd-ink)]">
              Wat at je vandaag?
            </b>
          ) : (
            <>
              <b className="font-serif text-[clamp(22px,15.5cqw,34px)] font-normal leading-none text-[var(--vd-ink)]">
                {totaal === 0 ? "—" : `${gedekt}/${totaal}`}
              </b>
              <span className="mt-1.5 text-[clamp(9px,5cqw,11px)] leading-tight text-[var(--vd-ink-3)]">
                stoffen gedekt vandaag
              </span>
            </>
          )}
        </div>
      </div>

      {leeg ? (
        <button
          type="button"
          onClick={onBegin}
          className="cursor-pointer rounded-full border border-[rgb(var(--vd-sage-rgb)/40%)] bg-[rgb(var(--vd-sage-rgb)/10%)] px-4 py-2 text-[12.5px] font-semibold text-[var(--vd-sage-2)] transition-colors hover:border-[var(--vd-sage)] hover:bg-[rgb(var(--vd-sage-rgb)/20%)]"
        >
          Voeg je ontbijt toe
        </button>
      ) : null}

      <ul className="m-0 grid w-full list-none grid-cols-3 gap-1.5 @[420px]:grid-cols-5 p-0">
        {rijen.map((rij) => (
          <li key={rij.nutrient}>
            <button
              type="button"
              onClick={() => onSelect(rij.nutrient)}
              className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.02] px-1 py-2.5 text-center transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <span
                aria-hidden
                className={`block h-3 w-3 rounded-full ${rij.nietBewijsbaar ? "border-2 border-dashed bg-transparent" : ""}`}
                style={
                  rij.nietBewijsbaar
                    ? { borderColor: `var(--vd-stof-${rij.nutrient})` }
                    : { background: `var(--vd-stof-${rij.nutrient})` }
                }
              />
              <span className="font-serif text-[15px] leading-none text-[var(--vd-ink)]">
                {rij.aandeel === null ? "—" : `${Math.round(rij.aandeel * 100)}%`}
                {rij.gedekt ? (
                  <span aria-label="gedekt" className="ml-0.5 text-[11px] text-[var(--vd-sage-2)]">
                    ✓
                  </span>
                ) : null}
              </span>
              <span className="text-[10px] font-semibold leading-tight text-[var(--vd-ink-2)]">
                {nutrientReferences[rij.nutrient].label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="m-0 max-w-[280px] text-center text-[11px] leading-relaxed text-[var(--vd-ink-3)]">
        {leeg
          ? "Elk stukje telt mee. Begin met wat je vanochtend at."
          : "Een ondergrens, geen dagtotaal. Gestippeld: zink en vitamine D laten zich met een dagboek niet meten."}
      </p>
    </section>
  );
}
