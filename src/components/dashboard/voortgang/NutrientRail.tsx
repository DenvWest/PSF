"use client";

import { useState } from "react";
import { clarityTag } from "@/lib/clarity";
import { surfaceStyles } from "@/lib/dashboard-surface";
import { trackEvent } from "@/lib/ga4";
import {
  BAND_WOORD,
  railBronregel,
  railGroepen,
  type NutrientRailRij,
} from "@/lib/nutrient-rail";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { IntakeBand } from "@/lib/nutrition-intake-estimate";

/**
 * De nutriëntenkolom — je stoffen als staande rail met een balk per stof.
 *
 * Zie `src/lib/nutrient-rail.ts` voor waarom de stoffen de kolom dragen en de
 * prioriteiten de horizontale strip, en waarom hier bánden staan en geen
 * milligrammen.
 *
 * **De balk.** Een dunne baan met een gevuld deel tot waar je staat, en een
 * fijne lijn op de lat. Dat is de vorm die je van een meetinstrument verwacht:
 * je leest in één oogopslag de afstand tot de streep, zonder een getal te
 * hoeven interpreteren.
 *
 * **Waarom hij inklapbaar is (3 sep).** Vijf stoffen met balk, bronblok en
 * groepskoppen is een volwaardig paneel — naast een prioriteitstrip, een
 * werkvlak en de shell-zijbalk is dat de vierde plek die om aandacht vraagt op
 * één scherm. Ingeklapt is hij één regel die zegt wat je moet weten (`3 van de
 * 5 stoffen met ruimte`); uitgeklapt is hij het instrument dat hij was. De
 * staat staat in `open` en niet in de URL: welke kolom je openhad is geen
 * plek waar je naartoe navigeert.
 */

const BAND_KLEUR: Record<IntakeBand, string> = {
  below: "#C8956C",
  around: "#C99A3C",
  meets: "#5A8F6A",
};

/**
 * De meetbalk van één stof.
 *
 * De lat staat op 0.83 — het midden van de "op orde"-band — en niet op 100%:
 * de schaal loopt niet naar een dagbehoefte toe (die kennen we niet) maar naar
 * het punt waarop de frequentievragen "genoeg" zeggen. Een streep op de rand
 * zou een maximum suggereren dat er niet is.
 */
function Meetbalk({ dekking, band }: { dekking: number; band: IntakeBand }) {
  const kleur = BAND_KLEUR[band];
  return (
    <div className="relative mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-white/[0.07]">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
        style={{
          width: `${Math.round(dekking * 100)}%`,
          background: `linear-gradient(90deg, ${kleur}55, ${kleur})`,
        }}
      />
      <span
        aria-hidden
        className="absolute inset-y-0 w-px bg-white/25"
        style={{ left: "83%" }}
      />
    </div>
  );
}

export default function NutrientRail({
  rijen,
  surface,
  focusNutrient = null,
  onKiesNutrient,
  filterRegel = null,
  defaultOpen = false,
}: {
  rijen: readonly NutrientRailRij[];
  surface: string;
  /** De stof waar P6 op geopend staat — die krijgt nadruk. */
  focusNutrient?: NutrientId | null;
  /** Naar de keuze voor deze stof op prioriteit 6. */
  onKiesNutrient?: (nutrient: NutrientId) => void;
  /** Waarom de kolom korter is dan je stoffenlijst, of null als er niet gefilterd is. */
  filterRegel?: string | null;
  /** Staat de kolom bij binnenkomst open? In de zijbalk niet. */
  defaultOpen?: boolean;
}) {
  const s = surfaceStyles("dashboard");
  const [open, setOpen] = useState<NutrientId | null>(null);
  const [uitgeklapt, setUitgeklapt] = useState(defaultOpen);

  if (rijen.length === 0) {
    return null;
  }

  const groepen = railGroepen(rijen);

  return (
    <section aria-label="Je stoffen" className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          const next = !uitgeklapt;
          setUitgeklapt(next);
          if (next) {
            trackEvent("nutrient_rail_uitgeklapt", { surface, stoffen: rijen.length });
            clarityTag("nutrient_rail_uitgeklapt", surface);
          }
        }}
        aria-expanded={uitgeklapt}
        className="flex w-full cursor-pointer items-baseline justify-between gap-2 border-none bg-transparent p-0 text-left font-[inherit]"
      >
        <span className="min-w-0">
          <span
            className={`block text-[9.5px] font-bold uppercase tracking-[0.15em] ${s.zacht}`}
          >
            Je stoffen
          </span>
          <span className={`mt-1 block text-[11.5px] leading-snug ${s.zacht} text-pretty`}>
            {railBronregel(rijen)}
          </span>
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-[11px] ${s.zacht} transition-transform ${
            uitgeklapt ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {uitgeklapt ? (
        <>
          {filterRegel ? (
            <p className={`m-0 text-[11px] leading-relaxed ${s.zacht} text-pretty`}>
              {filterRegel}
            </p>
          ) : null}

          {groepen.map((blok) => (
            <div key={blok.groep}>
              <p className="m-0 mb-2.5 text-[9.5px] font-bold uppercase tracking-[0.13em] text-[#7E8C82]">
                {blok.label}
              </p>
              <ul className="m-0 flex list-none flex-col gap-3.5 p-0" role="list">
                {blok.rijen.map((rij) => {
                  const isOpen = open === rij.nutrient;
                  const isFocus = focusNutrient === rij.nutrient;
                  return (
                    <li key={rij.nutrient} className="min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          const next = isOpen ? null : rij.nutrient;
                          setOpen(next);
                          if (next) {
                            trackEvent("nutrient_rail_open", {
                              surface,
                              nutrient: rij.nutrient,
                              band: rij.band,
                            });
                            clarityTag("nutrient_rail", rij.nutrient);
                          }
                        }}
                        aria-expanded={isOpen}
                        className="w-full cursor-pointer rounded-lg border-none bg-transparent p-0 text-left font-[inherit]"
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={`min-w-0 truncate text-[12.5px] leading-snug ${
                              isFocus ? `font-semibold ${s.tekst}` : s.tekst
                            }`}
                          >
                            {rij.label}
                          </span>
                          <span
                            className="shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
                            style={{ color: BAND_KLEUR[rij.band] }}
                          >
                            {BAND_WOORD[rij.band]}
                          </span>
                        </span>
                        <Meetbalk dekking={rij.dekking} band={rij.band} />
                      </button>

                      {isOpen ? (
                        <div className="mt-2 rounded-lg bg-black/25 px-2.5 py-2">
                          {rij.bronnen.length > 0 ? (
                            <>
                              <p className="m-0 mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#7E8C82]">
                                Wat dit draagt
                              </p>
                              <ul
                                className="m-0 flex list-none flex-col gap-1 p-0"
                                role="list"
                              >
                                {rij.bronnen.map((bron) => (
                                  <li
                                    key={bron.labelNl}
                                    className={`min-w-0 truncate text-[11.5px] ${s.zacht}`}
                                  >
                                    {bron.labelNl}
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <p className={`m-0 text-[11.5px] leading-relaxed ${s.zacht}`}>
                              Je check wijst hier geen dragende bron aan.
                            </p>
                          )}
                          {rij.p6Relevant && onKiesNutrient ? (
                            <button
                              type="button"
                              onClick={() => onKiesNutrient(rij.nutrient)}
                              className={`mt-2 cursor-pointer border-none bg-transparent p-0 text-left text-[11.5px] font-semibold ${s.knop}`}
                            >
                              Wat je hiermee kunt ›
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <p className="m-0 text-[10.5px] leading-relaxed text-[#7E8C82] text-pretty">
            Geschat uit hoe vaak je bronnen eet, niet uit grammen. Daarom banden
            en geen dagtotalen.
          </p>
        </>
      ) : null}
    </section>
  );
}
