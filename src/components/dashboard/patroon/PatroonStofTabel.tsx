"use client";

import type { NutrientId } from "@/data/nutrition/intake-reference";
import { normLabel, normVoor } from "@/lib/nutrition-normen";
import type { Richting } from "@/lib/nutrition-tekortsysteem";
import {
  hoeveelheid,
  percentageADH,
  RICHTING_TEKEN,
  RICHTING_TOON,
} from "@/lib/nutrition-tekortsysteem-copy";
import type { WeekRij } from "@/lib/nutrition-weekoverzicht";
import PatroonStofRij from "@/components/dashboard/patroon/PatroonStofRij";
import { isKernstofMetNorm } from "@/lib/account-kernstof-profiel";
import { useKernstofNormen, useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * De kernstoffen over de gekozen periode, elk tegen de norm die voor jou
 * geldt, met de bron eronder. Eén tabel, geen tweede met andere vensters
 * ernaast: de periode kies je erboven.
 *
 * ## Waarom "norm" en niet "ADH"
 *
 * Sinds `BESLUIT_KERNSTOF_NORMEN_2026-10.md` rekent dit tegen de
 * persoonlijke norm (voedingsnormen.ts), niet tegen de etiket-ADH (RI). Het label
 * zegt dat nu ook, en elke rij noemt de bron en voor wie de norm geldt.
 *
 * ## Wat een tik doet
 *
 * Een rij opent de stof in Per stof: de norm met bron, je eigen bronnen en de
 * rijkste voedingsbronnen. De supplementvergelijking staat daar onderaan,
 * niet als eerste stap (`BESLUIT_PATROON_PER_MAALTIJD_2026-10.md` §2).
 */

export default function PatroonStofTabel({
  rijen,
  richting,
  dagenInPeriode,
  onOpen,
}: {
  rijen: readonly WeekRij[];
  richting: ReadonlyMap<NutrientId, Richting>;
  dagenInPeriode: number;
  onOpen: (nutrient: NutrientId) => void;
}) {
  const normen = useKernstofNormen();
  const { streefwaarden } = useKernstofProfiel();

  return (
    <ul aria-label="Kernstoffen" className="m-0 mt-3.5 flex list-none flex-col gap-2 p-0">
      {rijen.map((rij) => {
        const norm = normVoor(normen, rij.nutrient);
        const leeg = rij.dagenMetBron === 0 && rij.totaal === 0;
        const heeftBalk = rij.bewijsbaar && rij.aandeel !== null && !leeg;
        const r = richting.get(rij.nutrient);
        const streef = isKernstofMetNorm(rij.nutrient) ? (streefwaarden[rij.nutrient] ?? null) : null;
        const streefAandeel =
          streef === null || leeg
            ? null
            : rij.lezing === "periodetotaal"
              ? rij.totaal / (streef * dagenInPeriode)
              : rij.gemiddeld / streef;

        const ondertitel = !norm
          ? "doel op Je doelen (gewicht en activiteit)"
          : rij.lezing === "periodetotaal"
            ? `${normLabel(norm)}/dag = ${hoeveelheid(rij.normPeriode ?? 0)} ${norm.unit} in ${dagenInPeriode} ${dagenInPeriode === 1 ? "dag" : "dagen"} · ${norm.bron}`
            : `${normLabel(norm)} · ${norm.geldtVoor} · ${norm.bron}`;

        const regels = [
          ondertitel,
          ...(streef !== null
            ? [
                `eigen streefwaarde ${hoeveelheid(streef)} ${rij.unit}/dag${streefAandeel !== null ? ` · ${percentageADH(streefAandeel)}` : ""}`,
              ]
            : []),
          ...(!rij.bewijsbaar ? ["met een dagboek niet aan te tonen"] : []),
        ];

        return (
          <PatroonStofRij
            key={rij.nutrient}
            naam={rij.label}
            pil={rij.gedekt ? { tekst: "gehaald", toon: "sage" } : !rij.bewijsbaar ? { tekst: "n.t.b.", toon: "amber" } : undefined}
            waarde={
              leeg
                ? "n.o."
                : rij.lezing === "periodetotaal"
                  ? `${rij.benaderd ? "≈ " : "≥"}${hoeveelheid(rij.totaal)} ${rij.unit} totaal`
                  : `${rij.benaderd ? "≈ " : ""}${hoeveelheid(rij.gemiddeld)} ${rij.unit}`
            }
            aandeelTekst={heeftBalk ? `${rij.benaderd ? "≈ " : ""}${percentageADH(rij.aandeel)}` : "—"}
            aandeel={heeftBalk ? rij.aandeel : null}
            toon={rij.gedekt ? "sage" : heeftBalk ? "terra" : "neutraal"}
            balkLabel={`${rij.label}, ${percentageADH(rij.aandeel)} van de norm`}
            regels={regels}
            richting={r && rij.bewijsbaar ? { teken: RICHTING_TEKEN[r], toon: RICHTING_TOON[r] } : null}
            onOpen={() => onOpen(rij.nutrient)}
          />
        );
      })}
    </ul>
  );
}
