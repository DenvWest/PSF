"use client";

import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import {
  RICHTING_LABEL,
  teGaan,
  VENSTER_LABEL,
} from "@/lib/nutrition-tekortsysteem-copy";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";

/**
 * Eén stof over vier vensters: vandaag, 7, 14 en 30 dagen naast elkaar.
 *
 * ## Waarom de vier cellen even groot zijn
 *
 * De verleiding is om "vandaag" groot te zetten en de rest klein, want vandaag
 * is het meest recent. Maar dan leest het scherm als een dagstand met wat
 * historie erbij, en dat is precies de omkering die dit systeem vermijdt: een
 * dag zegt minder dan een maand, niet meer. Vier gelijke cellen zeggen dat het
 * vier gelijkwaardige uitspraken zijn — en dat het verschil ertussen de
 * bevinding is.
 *
 * ## Waarom er geen balk in de cel staat
 *
 * Een balk die tot 100 % loopt maakt van de referentie een doel om na te
 * jagen, en van elke cel eronder een halve prestatie. Hier staat het
 * percentage als getal met de eenheid eronder; de referentie is een marker in
 * de kolomkop, geen finish.
 *
 * ## De asymmetrie in de cel
 *
 * Een gedekt venster krijgt een ✓ en sage. Een niet-gedekt venster krijgt
 * *geen* kruis en geen rood — alleen zijn percentage, en in de kolom "te gaan"
 * de afstand tot de referentie. Want de ondergrens bewijst "gehaald" en nooit
 * "niet gehaald": wat je vergat te noemen kan er alleen bij komen.
 */

const KLEUR = {
  gedekt: "#5A8F6A",
  aanwezig: "#C8956C",
  onbewijsbaar: "#C99A3C",
  leeg: "#6F8177",
} as const;

function percentage(aandeel: number | null): string {
  if (aandeel === null) return "—";
  const pct = aandeel * 100;
  // Onder de 10 % is een heel getal grof: 4 % en 4,4 % zijn allebei "4",
  // terwijl het verschil op maandbasis een portie noten is.
  return pct < 10 ? `${pct.toFixed(1).replace(".", ",")}%` : `${Math.round(pct)}%`;
}

export default function PatroonVensterrij({ reeks }: { reeks: Vensterreeks }) {
  const referentie = REFERENCE_INTAKES[reeks.nutrient];
  const eigenDoel = referentie.personalTarget;
  const reden = NIET_BEWIJSBAAR[reeks.nutrient];

  return (
    <li className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="m-0 font-serif text-[15px] font-normal text-[#F1EFE8]">
          {reeks.label}
        </h4>
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-[10px] tabular-nums text-[#6F8177]">
            {eigenDoel
              ? "eigen doel"
              : `referentie ${referentie.value} ${referentie.unit}`}
          </span>
          <span
            className={`text-[10.5px] font-semibold ${
              reeks.richting === "onbekend" ? "text-[#6F8177]" : "text-[#9FB0A6]"
            }`}
          >
            {RICHTING_LABEL[reeks.richting]}
          </span>
        </div>
      </div>

      <ul className="m-0 mt-2.5 grid list-none grid-cols-4 gap-1.5 p-0">
        {reeks.vensters.map((venster) => {
          const leeg = venster.dagen === 0;
          const gedekt = venster.gedekt === true;
          const rest = teGaan(venster, referentie.value);

          const kleur = leeg
            ? KLEUR.leeg
            : reden
              ? KLEUR.onbewijsbaar
              : gedekt
                ? KLEUR.gedekt
                : KLEUR.aanwezig;

          return (
            <li
              key={venster.dagen_terug}
              className="rounded-xl border border-white/8 bg-black/20 px-1 py-2 text-center"
            >
              <b
                className="block font-serif text-[14px] font-normal leading-none"
                style={{ color: kleur }}
              >
                {leeg || eigenDoel ? "—" : percentage(venster.aandeel)}
                {gedekt ? <span className="ml-0.5 text-[11px]">✓</span> : null}
              </b>
              <i className="mt-1 block text-[9px] not-italic leading-tight text-[#7E8C82]">
                {VENSTER_LABEL[venster.dagen_terug]}
              </i>
              <span className="mt-1 block font-mono text-[8.5px] tabular-nums leading-tight text-[#6F8177]">
                {leeg
                  ? "geen dag"
                  : `${venster.gemiddeld} ${reeks.unit} · ${venster.dagen}d`}
              </span>
              {rest !== null && !eigenDoel && !reden ? (
                <span className="mt-0.5 block font-mono text-[8.5px] tabular-nums leading-tight text-[#C8956C]">
                  {rest} {reeks.unit} te gaan
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {reden ? (
        <p className="m-0 mt-2 border-l-2 border-[#C99A3C] pl-2.5 text-[10.5px] leading-relaxed text-[#7E8C82]">
          {reden}
        </p>
      ) : null}

      {!reden && reeks.vensters[0] && reeks.vensters[0].dagen > 0 ? (
        <p className="m-0 mt-2 text-[10.5px] leading-relaxed text-[#6F8177]">
          Een bron voor {reeks.label.toLowerCase()} stond op{" "}
          {reeks.vensters[3]?.dagenMetBron ?? 0} van je{" "}
          {reeks.vensters[3]?.dagen ?? 0} geregistreerde dagen in 30 dagen.
        </p>
      ) : null}
    </li>
  );
}
