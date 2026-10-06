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
    <div className="vd-tabel vd-tabel--los">
      <div className="vd-tabel-kop grid-cols-[1fr_64px_72px_20px]">
        <span>Stof · norm · bron</span>
        <span>Gem./dag</span>
        <span>Van norm</span>
        <span aria-label="Richting" />
      </div>

      {rijen.map((rij) => {
        const norm = normVoor(normen, rij.nutrient);
        const leeg = rij.dagenMetBron === 0 && rij.totaal === 0;
        const vulling = rij.aandeel === null ? 0 : Math.min(Math.round(rij.aandeel * 100), 100);
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

        return (
          <button
            key={rij.nutrient}
            type="button"
            onClick={() => onOpen(rij.nutrient)}
            className="vd-tabel-rij w-full cursor-pointer hover:bg-[var(--vd-surface-2)] grid-cols-[1fr_64px_72px_20px] border-x-0 border-t-0 bg-transparent text-left font-[inherit] text-inherit"
          >
            <span className="vd-naam">
              <span className="vd-naam-kop">
                {rij.label}
                {rij.gedekt ? (
                  <span className="vd-pil" data-toon="sage">
                    gehaald
                  </span>
                ) : !rij.bewijsbaar ? (
                  <span className="vd-pil" data-toon="amber">
                    n.t.b.
                  </span>
                ) : null}
              </span>
              <i>{ondertitel}</i>
              {streef !== null ? (
                <i>
                  eigen streefwaarde {hoeveelheid(streef)} {rij.unit}/dag
                  {streefAandeel !== null ? ` · ${percentageADH(streefAandeel)}` : ""}
                </i>
              ) : null}
              {!rij.bewijsbaar ? <i>met een dagboek niet aan te tonen</i> : null}
            </span>

            <span className="vd-getal">
              {leeg
                ? "n.o."
                : rij.lezing === "periodetotaal"
                  ? `≥${hoeveelheid(rij.totaal)} ${rij.unit} totaal`
                  : `${hoeveelheid(rij.gemiddeld)} ${rij.unit}`}
            </span>

            <span className="vd-cel">
              {heeftBalk ? (
                <span
                  style={{
                    width: `${vulling}%`,
                    background: rij.gedekt ? "var(--vd-sage)" : "var(--vd-terra)",
                  }}
                />
              ) : null}
              <b data-gevuld={heeftBalk && vulling > 0 ? "ja" : "nee"}>
                {heeftBalk ? percentageADH(rij.aandeel) : "—"}
              </b>
            </span>

            <span
              className="vd-trend"
              data-richting={r && rij.bewijsbaar ? RICHTING_TOON[r] : "vlak"}
              aria-hidden
            >
              {r && rij.bewijsbaar ? RICHTING_TEKEN[r] : "›"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
