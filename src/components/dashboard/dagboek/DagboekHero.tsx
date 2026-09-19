"use client";

import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * De hero-cirkel boven de nutriëntbalken: één boog voor "hoeveel van vandaag
 * is gedekt", gemiddeld over de vier gekozen stoffen — gesplitst in wat uit
 * voeding kwam en wat uit een supplement.
 *
 * ## Waarom een gemiddelde en geen nieuwe score
 *
 * Dit telt geen tweede keer wat de vier balken al apart tonen — het is puur
 * het rekenkundig gemiddelde van hun eigen aandeel, elk eerst gecapt op 100%
 * zodat één stof op 800% de cirkel niet in zijn eentje vult. Er komt geen
 * eigen gewicht of weging bij; wie de balken optelt en deelt door vier komt op
 * hetzelfde getal.
 *
 * ## Waarom eiwit meetelt met een ander doel
 *
 * Eiwit heeft geen vaste referentie-inname om dekking tegen af te meten —
 * `aandeelVanRi("protein", …)` geeft altijd `null` (zie reference-intake.ts).
 * In plaats daarvan rekent dit blok eiwit tegen `proteinTarget.gramsLow`, het
 * persoonlijke doel uit gewicht en trainingsbelasting. Ontbreekt dat doel
 * (geen gewicht bekend), dan telt eiwit niet mee in het gemiddelde — net zoals
 * een stof zonder enige bron niet meetelt.
 *
 * ## De twee bogen
 *
 * Het voeding-aandeel tekent eerst, vanaf de klok-12-positie; het
 * supplement-aandeel sluit er direct op aan. Samen vullen ze nooit meer dan de
 * volle cirkel — elk aandeel is al vóór het gemiddelde gecapt op 100%, dus de
 * twee bogen kunnen elkaar niet overlappen.
 */

const BALKEN_NUTRIENTEN = ["magnesium", "protein", "zinc", "omega3"] as const;

/** RI per nutriënt, in dezelfde eenheid als `NutrientOndergrens.minstens`. `null` voor eiwit — dat rekent tegen `proteinTarget`. */
const REFERENTIE_INNAME: Record<(typeof BALKEN_NUTRIENTEN)[number], number | null> = {
  magnesium: REFERENCE_INTAKES.magnesium.value,
  protein: null,
  zinc: REFERENCE_INTAKES.zinc.value,
  omega3: REFERENCE_INTAKES.omega3.value,
};

const VOEDING_KLEUR = "#5A8F6A";
const SUPPLEMENT_KLEUR = "#6C8FC9";

const STRAAL = 60;
const OMTREK = 2 * Math.PI * STRAAL;

function aandelenVoor(
  nutrient: (typeof BALKEN_NUTRIENTEN)[number],
  stoffen: readonly NutrientOndergrensGesplitst[],
  proteinTarget: ProteinTargetRange | null,
): { voeding: number; supplement: number } | null {
  const stof = stoffen.find((s) => s.nutrient === nutrient);
  if (!stof) return null;

  // De noemer waar voeding- en supplement-deel allebei tegen afgezet worden:
  // het persoonlijke doel voor eiwit, anders de wettelijke referentie-inname.
  const noemer =
    nutrient === "protein"
      ? proteinTarget && proteinTarget.gramsLow > 0
        ? proteinTarget.gramsLow
        : null
      : REFERENTIE_INNAME[nutrient];
  if (noemer === null) return null;

  return { voeding: stof.uitVoeding / noemer, supplement: stof.uitSupplement / noemer };
}

export default function DagboekHero({
  stoffen,
  proteinTarget,
}: {
  stoffen: readonly NutrientOndergrensGesplitst[];
  proteinTarget: ProteinTargetRange | null;
}) {
  const aandelen = BALKEN_NUTRIENTEN.map((nutrient) =>
    aandelenVoor(nutrient, stoffen, proteinTarget),
  ).filter((aandeel): aandeel is { voeding: number; supplement: number } => aandeel !== null);

  const gemiddeldVoeding =
    aandelen.length > 0
      ? aandelen.reduce((som, a) => som + Math.min(a.voeding, 1), 0) / aandelen.length
      : 0;
  const gemiddeldSupplement =
    aandelen.length > 0
      ? aandelen.reduce((som, a) => som + Math.min(a.supplement, 1 - Math.min(a.voeding, 1)), 0) /
        aandelen.length
      : 0;
  const totaal = aandelen.length > 0 ? gemiddeldVoeding + gemiddeldSupplement : null;

  const voedingLengte = OMTREK * gemiddeldVoeding;
  const supplementLengte = OMTREK * gemiddeldSupplement;

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <span className="relative block h-[136px] w-[136px]">
        <svg viewBox="0 0 136 136" className="block h-[136px] w-[136px] -rotate-90">
          <circle
            cx="68"
            cy="68"
            r={STRAAL}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="11"
          />
          <circle
            cx="68"
            cy="68"
            r={STRAAL}
            fill="none"
            stroke={VOEDING_KLEUR}
            strokeWidth="11"
            strokeLinecap="butt"
            strokeDasharray={`${voedingLengte} ${OMTREK - voedingLengte}`}
          />
          <circle
            cx="68"
            cy="68"
            r={STRAAL}
            fill="none"
            stroke={SUPPLEMENT_KLEUR}
            strokeWidth="11"
            strokeLinecap="butt"
            strokeDasharray={`${supplementLengte} ${OMTREK - supplementLengte}`}
            strokeDashoffset={-voedingLengte}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <b className="font-serif text-[28px] font-normal leading-none text-[#F1EFE8]">
            {totaal === null ? "—" : `${Math.round(totaal * 100)}%`}
          </b>
          <i className="mt-1 text-[10px] not-italic uppercase tracking-[0.08em] text-[#7E8C82]">
            dekking vandaag
          </i>
        </span>
      </span>
      <p className="m-0 flex max-w-[240px] flex-col items-center gap-1 text-center text-[11px] leading-relaxed text-[#7E8C82]">
        <span>
          Gemiddeld over magnesium, eiwit, zink en omega-3 — een ondergrens,
          geen dagtotaal.
        </span>
        <span className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className="block h-[7px] w-[7px] rounded-full"
              style={{ background: VOEDING_KLEUR }}
            />
            voeding
          </span>
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className="block h-[7px] w-[7px] rounded-full"
              style={{ background: SUPPLEMENT_KLEUR }}
            />
            supplement
          </span>
        </span>
      </p>
    </div>
  );
}
