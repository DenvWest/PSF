"use client";

import { useState } from "react";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";
import { weekKort } from "@/lib/nutrition-trend";
import { weekDatums, weekLabel } from "@/lib/nutrition-weekoverzicht";

/**
 * Eén stof over zes weken als staafgrafiek, voor kernstoffen én gevolgde
 * stoffen.
 *
 * De vorige versie was zes kale staafjes zonder getal en een naamloze
 * stippellijn: je zag dat er iets op en neer ging, niet wat. Nu:
 *
 * - **Een uitleesregel boven de grafiek** met week, gemiddelde, % van de
 *   referentie en het aantal dagen. Staat standaard op de laatste gemeten
 *   week; hover of tik op een andere week wisselt hem. Werkt dus ook op een
 *   telefoon, zonder zwevende tooltip die onder je vinger verdwijnt.
 * - **De referentie als doorgetrokken lijn met label** in een eigen kantlijn
 *   rechts, zodat het label nooit over een staaf valt.
 * - **De huidige week benoemd** ("nu") en de dagen per week onder het label:
 *   een week van één dag weegt anders dan een week van vijf.
 * - **Een lege week blijft een gat** met een streepje, geen staaf van nul —
 *   zie `PatroonTrend.tsx` waarom geen lijn.
 *
 * Kleur: bij kernstoffen dezelfde drie staten als de rest van Je patroon
 * (sage gehaald, terra niet bewezen); bij gevolgde stoffen één neutrale tint,
 * zonder oordeel.
 */

export type TrendGrafiekPunt = {
  weekStart: string;
  waarde: number | null;
  aandeel: number | null;
  dagen: number;
};

const HOOGTE = 128;

function kleurVoor(punt: TrendGrafiekPunt, toon: "oordeel" | "neutraal"): string {
  if (toon === "neutraal") return "var(--vd-ink-3)";
  return punt.aandeel !== null && punt.aandeel >= 1 ? "var(--vd-sage)" : "var(--vd-terra)";
}

export default function PatroonTrendGrafiek({
  label,
  punten,
  unit,
  referentie,
  referentieNaam,
  toon,
  huidigeWeek,
}: {
  label: string;
  punten: readonly TrendGrafiekPunt[];
  unit: string;
  referentie: number | null;
  /** "norm" bij kernstoffen, "RI" bij gevolgde stoffen. */
  referentieNaam: string;
  toon: "oordeel" | "neutraal";
  huidigeWeek: string;
}) {
  const laatsteGemeten = punten.reduce((laatst, punt, index) => (punt.waarde !== null ? index : laatst), -1);
  const [actief, setActief] = useState<number | null>(null);
  const index = actief ?? (laatsteGemeten >= 0 ? laatsteGemeten : punten.length - 1);
  const gekozen = punten[index];

  const hoogsteWaarde = Math.max(...punten.map((p) => p.waarde ?? 0), referentie ?? 0, 0.0001) * 1.12;
  const referentieTop = referentie !== null ? 100 - (referentie / hoogsteWaarde) * 100 : null;

  const uitlees = gekozen
    ? [
        gekozen.weekStart === huidigeWeek ? "Deze week" : weekKort(gekozen.weekStart),
        gekozen.waarde === null
          ? "niets geregistreerd"
          : `${hoeveelheid(gekozen.waarde)} ${unit} per dag`,
        gekozen.aandeel !== null ? `${Math.round(gekozen.aandeel * 100)}% van de ${referentieNaam}` : null,
        gekozen.dagen > 0 ? `${gekozen.dagen} ${gekozen.dagen === 1 ? "dag" : "dagen"} gemeten` : null,
      ].filter((deel): deel is string => deel !== null)
    : [];

  return (
    <div className="flex flex-col gap-2">
      <p aria-live="polite" className="m-0 min-h-[18px] text-[12px] leading-snug text-[var(--vd-ink-2)]">
        {uitlees.map((deel, i) => (
          <span key={deel}>
            {i > 0 ? <span className="text-[var(--vd-ink-4)]"> · </span> : null}
            {i === 1 && gekozen?.waarde !== null ? <b className="font-semibold text-[var(--vd-ink)]">{deel}</b> : deel}
          </span>
        ))}
        {gekozen ? (
          <span className="block text-[10.5px] text-[var(--vd-ink-4)]">
            {weekLabel(gekozen.weekStart, weekDatums(gekozen.weekStart)[6] ?? gekozen.weekStart)}
          </span>
        ) : null}
      </p>

      <div className="flex">
        <div
          className="relative grid flex-1 grid-cols-6 gap-1.5 border-b border-[var(--vd-line-2)]"
          style={{ height: HOOGTE }}
          onMouseLeave={() => setActief(null)}
        >
          {referentieTop !== null ? (
            <span
              aria-hidden
              className="pointer-events-none absolute -right-12 left-0 z-10 border-t border-[var(--vd-ink-4)]"
              style={{ top: `${referentieTop}%` }}
            />
          ) : null}

          {punten.map((punt, i) => {
            const hoogte = punt.waarde === null ? 0 : Math.max(2, (punt.waarde / hoogsteWaarde) * 100);
            const isActief = i === index;
            return (
              <button
                key={punt.weekStart}
                type="button"
                onMouseEnter={() => setActief(i)}
                onFocus={() => setActief(i)}
                onClick={() => setActief(i)}
                aria-label={`${weekKort(punt.weekStart)}: ${
                  punt.waarde === null ? "niets geregistreerd" : `${hoeveelheid(punt.waarde)} ${unit} per dag`
                }`}
                aria-pressed={isActief}
                className="relative flex h-full cursor-pointer items-end justify-center rounded-md bg-transparent outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-1 focus-visible:ring-[var(--vd-ink-3)]"
              >
                {punt.waarde === null ? (
                  <span aria-hidden className="mb-0.5 block w-full max-w-[24px] border-t border-dashed border-[var(--vd-ink-4)]" />
                ) : (
                  <span
                    aria-hidden
                    className="block w-full max-w-[24px] rounded-t-[4px] transition-opacity"
                    style={{
                      height: `${hoogte}%`,
                      background: kleurVoor(punt, toon),
                      opacity: isActief ? 1 : 0.55,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="relative w-12 shrink-0" style={{ height: HOOGTE }}>
          {referentieTop !== null && referentie !== null ? (
            <span
              className="absolute right-0 -translate-y-full pb-0.5 text-right text-[9.5px] leading-tight text-[var(--vd-ink-3)]"
              style={{ top: `${referentieTop}%` }}
            >
              {referentieNaam}
              <br />
              {hoeveelheid(referentie)} {unit}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex">
        <div className="grid flex-1 grid-cols-6 gap-1.5">
          {punten.map((punt, i) => (
            <span
              key={punt.weekStart}
              className={`flex flex-col items-center text-center text-[10px] leading-tight ${
                i === index ? "text-[var(--vd-ink)]" : "text-[var(--vd-ink-4)]"
              }`}
            >
              <span className={punt.weekStart === huidigeWeek ? "font-semibold" : undefined}>
                {punt.weekStart === huidigeWeek ? "nu" : weekKort(punt.weekStart)}
              </span>
              <span className="text-[9px]">{punt.dagen > 0 ? `${punt.dagen} d` : "—"}</span>
            </span>
          ))}
        </div>
        <span className="w-12 shrink-0" />
      </div>

      <table className="sr-only">
        <caption>{label} per week</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            <th scope="col">Gemiddeld per dag</th>
            <th scope="col">Deel van de {referentieNaam}</th>
            <th scope="col">Dagen gemeten</th>
          </tr>
        </thead>
        <tbody>
          {punten.map((punt) => (
            <tr key={punt.weekStart}>
              <th scope="row">{weekKort(punt.weekStart)}</th>
              <td>{punt.waarde === null ? "niets geregistreerd" : `${hoeveelheid(punt.waarde)} ${unit}`}</td>
              <td>{punt.aandeel === null ? "—" : `${Math.round(punt.aandeel * 100)}%`}</td>
              <td>{punt.dagen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
