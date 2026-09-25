"use client";

import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import type { ProteinTargetRange } from "@/lib/protein-target";

/**
 * De hero-cirkel boven de nutriëntbalken: een telling van hoeveel bewijsbare
 * stoffen vandaag gedekt zijn — gesplitst in wat uit voeding kwam en wat uit
 * een supplement.
 *
 * ## Waarom een telling en geen gemiddelde
 *
 * De vorige versie middelde het aandeel van vier stoffen, zink incluis. Zink
 * staat in {@link NIET_BEWIJSBAAR}: bronnen leveren 1–4 mg tegen een RI van
 * 10 mg, dus een dagboek dat niet alles vangt komt er vrijwel nooit aan. Zink
 * meewegen in een gemiddelde gaf de cirkel daarmee een structureel plafond
 * van ongeveer 75% — ook bij perfecte registratie. Een gemiddelde percentage
 * is bovendien niet interpreteerbaar: 50% kan "twee stoffen vol, twee leeg"
 * betekenen of "vier stoffen halfvol", met een wezenlijk ander verhaal achter
 * hetzelfde getal.
 *
 * Een telling ("2 van 3 gedekt") is eerlijk en optelbaar. Alleen bewijsbare
 * stoffen tellen mee — dezelfde asymmetrie-regel als het tekortsysteem
 * (`nutrition-tekortsysteem.ts`): een venster dat de RI haalt bewijst dekking,
 * een venster dat hem niet haalt bewijst niets. Zink krijgt daarom geen plek
 * in de telling, maar een eigen regel met de reden.
 *
 * ## Waarom eiwit meetelt met een ander doel
 *
 * Eiwit heeft geen vaste referentie-inname om dekking tegen af te meten —
 * `aandeelVanRi("protein", …)` geeft altijd `null` (zie reference-intake.ts).
 * In plaats daarvan rekent dit blok eiwit tegen `proteinTarget.gramsLow`, het
 * persoonlijke doel uit gewicht en trainingsbelasting. Ontbreekt dat doel
 * (geen gewicht bekend), dan telt eiwit niet mee — net zoals een stof zonder
 * enige bron niet meetelt.
 *
 * ## De twee bogen
 *
 * De ring vult naar rato van het aantal gedekte stoffen, niet naar een
 * gemiddeld aandeel. Elke gedekte stof draagt een gelijk deel van de cirkel;
 * dat deel kleurt naar voeding of supplement naar gelang waar de meeste
 * dekking vandaan kwam.
 */

const BALKEN_NUTRIENTEN = ["magnesium", "protein", "omega3"] as const;

/** RI per nutriënt, in dezelfde eenheid als `NutrientOndergrens.minstens`. `null` voor eiwit — dat rekent tegen `proteinTarget`. */
const REFERENTIE_INNAME: Record<(typeof BALKEN_NUTRIENTEN)[number], number | null> = {
  magnesium: REFERENCE_INTAKES.magnesium.value,
  protein: null,
  omega3: REFERENCE_INTAKES.omega3.value,
};

const VOEDING_KLEUR = "var(--vd-sage)";
const SUPPLEMENT_KLEUR = "var(--vd-accent-2)";

const STRAAL = 60;
const OMTREK = 2 * Math.PI * STRAAL;

/** Aandeel van de RI (of het persoonlijke doel bij eiwit), gesplitst naar bron. `null` zonder noemer. */
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

  const totaalStoffen = aandelen.length;
  const gedekteStoffen = aandelen.filter((a) => a.voeding + a.supplement >= 1).length;

  // Elke gedekte stof draagt een gelijk deel van de ring. Binnen dat deel
  // kleurt de ring naar voeding of supplement naar gelang waar de meeste
  // dekking van die stof vandaan kwam — geen gewogen gemiddelde, puur een
  // verdeling van hoeveel van de gedekte stoffen uit welke bron kwamen.
  const deelPerStof = totaalStoffen > 0 ? 1 / totaalStoffen : 0;
  const gedekt = aandelen.filter((a) => a.voeding + a.supplement >= 1);
  const voedingDeel = gedekt.filter((a) => a.voeding >= a.supplement).length * deelPerStof;
  const supplementDeel = gedekt.filter((a) => a.voeding < a.supplement).length * deelPerStof;

  const zink = stoffen.find((s) => s.nutrient === "zinc");

  const voedingLengte = OMTREK * voedingDeel;
  const supplementLengte = OMTREK * supplementDeel;

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <span className="relative block h-[136px] w-[136px]">
        <svg viewBox="0 0 136 136" className="block h-[136px] w-[136px] -rotate-90">
          <circle
            cx="68"
            cy="68"
            r={STRAAL}
            fill="none"
            stroke="var(--vd-track)"
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
          <b className="font-serif text-[28px] font-normal leading-none text-[var(--vd-ink)]">
            {totaalStoffen === 0 ? "—" : `${gedekteStoffen}/${totaalStoffen}`}
          </b>
          <i className="mt-1 text-[10px] not-italic uppercase tracking-[0.08em] text-[var(--vd-ink-3)]">
            gedekt vandaag
          </i>
        </span>
      </span>
      <p className="m-0 flex max-w-[240px] flex-col items-center gap-1 text-center text-[11px] leading-relaxed text-[var(--vd-ink-3)]">
        <span>
          Van magnesium, eiwit en omega-3 — een ondergrens, geen dagtotaal.
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
        {zink ? (
          <span className="mt-1 text-[10px] italic text-[var(--vd-ink-4)]">
            Zink: {zink.bronnen} {zink.bronnen === 1 ? "bron" : "bronnen"} genoemd —{" "}
            {NIET_BEWIJSBAAR.zinc}
          </span>
        ) : null}
      </p>
    </div>
  );
}
