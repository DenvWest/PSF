"use client";

import { aandeelVanRi } from "@/data/nutrition/reference-intake";
import type { NutrientOndergrens } from "@/lib/nutrition-dagboek-items";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * De hero-cirkel boven de nutriëntbalken: één boog voor "hoeveel van vandaag
 * is gedekt", gemiddeld over de vier gekozen stoffen.
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
 */

const BALKEN_NUTRIENTEN = ["magnesium", "protein", "zinc", "omega3"] as const;

const VOEDING_KLEUR = "#5A8F6A";

const STRAAL = 60;
const OMTREK = 2 * Math.PI * STRAAL;

function aandeelVoor(
  nutrient: (typeof BALKEN_NUTRIENTEN)[number],
  stoffen: readonly NutrientOndergrens[],
  proteinTarget: ProteinTargetRange | null,
): number | null {
  const stof = stoffen.find((s) => s.nutrient === nutrient);
  if (!stof) return null;

  if (nutrient === "protein") {
    if (!proteinTarget || proteinTarget.gramsLow <= 0) return null;
    return stof.minstens / proteinTarget.gramsLow;
  }
  return aandeelVanRi(nutrient, stof.minstens);
}

export default function DagboekHero({
  stoffen,
  proteinTarget,
}: {
  stoffen: readonly NutrientOndergrens[];
  proteinTarget: ProteinTargetRange | null;
}) {
  const aandelen = BALKEN_NUTRIENTEN.map((nutrient) =>
    aandeelVoor(nutrient, stoffen, proteinTarget),
  ).filter((aandeel): aandeel is number => aandeel !== null);

  const gemiddelde =
    aandelen.length > 0
      ? aandelen.reduce((som, aandeel) => som + Math.min(aandeel, 1), 0) / aandelen.length
      : null;

  const vol = gemiddelde ?? 0;

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
            strokeLinecap="round"
            strokeDasharray={OMTREK}
            strokeDashoffset={OMTREK * (1 - vol)}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <b className="font-serif text-[28px] font-normal leading-none text-[#F1EFE8]">
            {gemiddelde === null ? "—" : `${Math.round(gemiddelde * 100)}%`}
          </b>
          <i className="mt-1 text-[10px] not-italic uppercase tracking-[0.08em] text-[#7E8C82]">
            dekking vandaag
          </i>
        </span>
      </span>
      <p className="m-0 max-w-[240px] text-center text-[11px] leading-relaxed text-[#7E8C82]">
        Gemiddeld over magnesium, eiwit, zink en omega-3 — een ondergrens, geen
        dagtotaal.
      </p>
    </div>
  );
}
