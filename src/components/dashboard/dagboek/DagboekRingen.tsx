"use client";

import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { NutrientOndergrens } from "@/lib/nutrition-dagboek-items";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";

/**
 * De ronde meters boven het dagboek: per stof hoeveel van de referentie-inname
 * je registratie minstens dekt.
 *
 * ## Waarom een boog en niet een balk
 *
 * Een balk leest als voortgang naar een doel — hoe voller hoe beter, en de
 * rest is wat je nog "moet". Een ring leest als een stand: dit is waar je nu
 * staat. Dat verschil doet ertoe omdat dit scherm registreert en niet
 * oordeelt; de vergelijking over meerdere dagen hoort op Je patroon.
 *
 * ## Waarom de boog stopt bij vol maar het cijfer doorloopt
 *
 * Een cirkel kan niet meer dan rond. Bij 104 % en bij 760 % is de boog dus
 * gelijk, en dat zou beweren dat die twee hetzelfde zijn. Daarom staat het
 * echte percentage altijd in het midden, en krijgt een gedekte stof een vinkje
 * in het label — de boog zegt "vol", het cijfer zegt hoeveel.
 *
 * ## Geen kleur als oordeel
 *
 * Sage betekent "dekking bewezen", terra "bron aanwezig maar niet bewezen",
 * amber "met een dagboek niet aan te tonen". Die laatste is geen slechtere
 * uitkomst dan terra — het is een eigenschap van de meetmethode. Zink en
 * vitamine D staan er permanent op, en het label zegt waarom.
 */

const STRAAL = 27;
const OMTREK = 2 * Math.PI * STRAAL;

type RingKleur = "sage" | "terra" | "amber";

function kleurVoor(
  nutrient: NutrientOndergrens["nutrient"],
  aandeel: number | null,
): RingKleur {
  if (nutrient in NIET_BEWIJSBAAR) return "amber";
  if (aandeel !== null && aandeel >= 1) return "sage";
  return "terra";
}

const STREEK: Record<RingKleur, string> = {
  sage: "var(--vd-sage)",
  terra: "var(--vd-terra)",
  amber: "var(--vd-amber)",
};

export default function DagboekRingen({
  stoffen,
}: {
  stoffen: readonly NutrientOndergrens[];
}) {
  if (stoffen.length === 0) {
    return null;
  }

  return (
    <ul
      className="m-0 grid list-none gap-2 p-0"
      style={{
        // Even breed verdelen over wat er ís. Een vast 2-kolomsraster laat bij
        // drie stoffen een halve rij leeg, en dat leest als een ontbrekende
        // meting in plaats van als een stof die deze dag geen bron had.
        gridTemplateColumns: `repeat(${Math.min(stoffen.length, 4)}, minmax(0, 1fr))`,
      }}
    >
      {stoffen.map((stof) => {
        const ri = REFERENCE_INTAKES[stof.nutrient];
        // Eiwit heeft geen zinnig etikettarget: het doel komt uit gewicht en
        // belasting. Dan tonen we de hoeveelheid zonder percentage.
        const aandeel = ri.personalTarget ? null : stof.minstens / ri.value;
        const kleur = kleurVoor(stof.nutrient, aandeel);
        const vol = aandeel === null ? 0 : Math.min(aandeel, 1);
        const gedekt = aandeel !== null && aandeel >= 1;

        return (
          <li
            key={stof.nutrient}
            className="flex flex-col items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.02] px-1 py-2.5 text-center"
          >
            <span className="relative block h-[64px] w-[64px]">
              <svg viewBox="0 0 64 64" className="block h-[64px] w-[64px] -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={STRAAL}
                  fill="none"
                  stroke="var(--vd-track)"
                  strokeWidth="6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={STRAAL}
                  fill="none"
                  stroke={STREEK[kleur]}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={OMTREK}
                  strokeDashoffset={OMTREK * (1 - vol)}
                />
              </svg>
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <b className="font-serif text-[15px] font-normal leading-none text-[var(--vd-ink)]">
                  {aandeel === null ? "—" : `${Math.round(aandeel * 100)}%`}
                </b>
                <i className="mt-0.5 text-[9px] not-italic text-[var(--vd-ink-3)]">
                  {aandeel === null ? "eigen doel" : "van RI"}
                </i>
              </span>
            </span>

            <span className="text-[10.5px] font-semibold leading-tight text-[var(--vd-ink-2)]">
              {nutrientReferences[stof.nutrient].label}
              {gedekt ? <span className="ml-1 text-[var(--vd-sage)]">✓</span> : null}
            </span>
            <span className="font-mono text-[9px] tabular-nums text-[var(--vd-ink-4)]">
              minstens {stof.minstens} {stof.unit}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
