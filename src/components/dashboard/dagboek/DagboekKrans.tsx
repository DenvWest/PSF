"use client";

import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import type { NutrientOndergrensGesplitst } from "@/lib/nutrition-dagboek-items";
import { aandeelVanNorm, type KernstofNormen } from "@/lib/nutrition-normen";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";
import type { ProteinTargetRange } from "@/lib/protein-target";
import { useKernstofNormen } from "@/lib/use-kernstof-normen";

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
 * "2 van 3 gedekt" telt alleen bewijsbare stoffen met een noemer, zoals het
 * tekortsysteem: een gehaalde norm bewijst dekking, een gemiste bewijst niets.
 * Eiwit rekent tegen het persoonlijke doel; zonder doel telt het niet mee en
 * toont de tegel grammen in plaats van een streep. Tegels die niet meetellen
 * staan gedempt en de regel eronder noemt ze, zodat de noemer in het midden
 * te herleiden is tot wat je ziet.
 *
 * Een segment zonder vulling tekent niets: met een afgerond lijnuiteinde wordt
 * een boog van lengte nul een stip, en die leest als voortgang.
 */

const KRANS_NUTRIENTEN: readonly NutrientId[] = [
  "magnesium",
  "protein",
  "omega3",
  "zinc",
  "vitamin_d",
];

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
  normen: KernstofNormen,
): number | null {
  if (nutrient !== "protein") return aandeelVanNorm(normen, nutrient, stof?.minstens ?? 0);
  if (!proteinTarget || proteinTarget.gramsLow <= 0) return null;
  return stof ? stof.minstens / proteinTarget.gramsLow : 0;
}

function lijst(namen: string[]): string {
  if (namen.length <= 1) return namen.join("");
  return `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
}

function telRegel(
  rijen: readonly { nutrient: NutrientId; telt: boolean; nietBewijsbaar: boolean }[],
): string {
  const naam = (nutrient: NutrientId) => {
    const label = nutrientReferences[nutrient].label;
    return label.charAt(0).toLowerCase() + label.slice(1);
  };
  const tellend = rijen.filter((r) => r.telt).map((r) => naam(r.nutrient));
  const delen = [
    tellend.length > 0
      ? `Een ondergrens, geen dagtotaal. De telling gaat over ${lijst(tellend)}.`
      : "Een ondergrens, geen dagtotaal.",
  ];
  if (rijen.some((r) => r.nutrient === "protein" && !r.telt)) {
    delen.push("Eiwit telt mee zodra je een eiwitdoel hebt.");
  }
  const gestippeld = rijen.filter((r) => r.nietBewijsbaar).map((r) => naam(r.nutrient));
  if (gestippeld.length > 0) {
    delen.push(`Gestippeld: ${lijst(gestippeld)} laten zich met een dagboek niet meten.`);
  }
  return delen.join(" ");
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
  const normen = useKernstofNormen();
  const rijen = KRANS_NUTRIENTEN.map((nutrient) => {
    const stof = stoffen.find((s) => s.nutrient === nutrient);
    const aandeel = aandeelVoor(nutrient, stof, proteinTarget, normen);
    return {
      nutrient,
      minstens: stof?.minstens ?? 0,
      unit: stof?.unit ?? null,
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
                {rij.vol > 0 ? (
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
                ) : null}
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
                {totaal === 0 ? "—" : `${gedekt} van ${totaal}`}
              </b>
              <span className="mt-1.5 text-[clamp(9px,5cqw,11px)] leading-tight text-[var(--vd-ink-3)]">
                {totaal === 0 ? "nog niets te tellen" : "meetbare stoffen gedekt"}
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
              aria-label={`${nutrientReferences[rij.nutrient].label}${rij.telt ? "" : ", telt niet mee in de telling"}`}
              className={`flex w-full cursor-pointer flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-center transition-colors hover:border-white/20 hover:bg-white/[0.05] ${
                rij.telt ? "border-white/12 bg-white/[0.03]" : "border-dashed border-white/8 bg-transparent opacity-70"
              }`}
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
                {rij.aandeel !== null
                  ? `${Math.round(rij.aandeel * 100)}%`
                  : rij.unit
                    ? `${Math.round(rij.minstens)} ${rij.unit}`
                    : "—"}
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

      <p className="m-0 max-w-[320px] text-center text-[11px] leading-relaxed text-[var(--vd-ink-3)]">
        {leeg ? "Elk stukje telt mee. Begin met wat je vanochtend at." : telRegel(rijen)}
      </p>
    </section>
  );
}
