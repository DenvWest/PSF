"use client";

import { useState } from "react";
import type { StofTrend, StofTrendPunt, StofTrendStaat } from "@/lib/nutrition-stof-trend";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";

/**
 * Eén stof als staafgrafiek over de gekozen periode: per maaltijd (één dag),
 * per dag (tot 14 dagen) of per week. Voor kernstoffen én gevolgde stoffen.
 *
 * - **Een uitleesregel boven de grafiek** met wat het punt precies is. Staat
 *   standaard op het laatste gemeten punt; hover of tik wisselt hem. Werkt
 *   dus ook op een telefoon, zonder zwevende tooltip.
 * - **De norm als doorgetrokken lijn met label** in een eigen kantlijn rechts.
 * - **Een leeg punt blijft een gat** met een streepje, geen staaf van nul: wat
 *   je niet registreerde is onbekend.
 * - **Onvolledig is gearceerd**: een dag zonder alle hoofdmaaltijden onder de
 *   norm zegt niets, dus geen terra-kleur.
 *
 * Kleur: sage gehaald, terra onder de norm op een volledige dag, gearceerd
 * onvolledig, één neutrale tint waar geen oordeel hoort (gevolgde stoffen,
 * per maaltijd, omega-3 per dag). Nooit rood.
 */

const HOOGTE = 128;

const ARCERING =
  "repeating-linear-gradient(135deg, var(--vd-ink-4) 0 3px, transparent 3px 6px)";

function achtergrond(staat: StofTrendStaat): string {
  if (staat === "gehaald") return "var(--vd-sage)";
  if (staat === "onder") return "var(--vd-terra)";
  if (staat === "onvolledig") return ARCERING;
  return "var(--vd-ink-3)";
}

export default function PatroonTrendGrafiek({ trend }: { trend: StofTrend }) {
  const { punten, unit } = trend;
  const referentie = trend.norm;
  const laatsteGemeten = punten.reduce((laatst, punt, index) => (punt.waarde !== null ? index : laatst), -1);
  const [actief, setActief] = useState<number | null>(null);
  const index = actief ?? (laatsteGemeten >= 0 ? laatsteGemeten : punten.length - 1);
  const gekozen: StofTrendPunt | undefined = punten[index];

  const hoogsteWaarde = Math.max(...punten.map((p) => p.waarde ?? 0), referentie ?? 0, 0.0001) * 1.12;
  // Per maaltijd is de dagnorm geen lat voor één staaf; de lijn zou elke maaltijd als "te laag" tekenen.
  const toonLijn = referentie !== null && trend.schaal !== "maaltijd";
  const referentieTop = toonLijn ? 100 - (referentie / hoogsteWaarde) * 100 : null;
  const kolommen = { gridTemplateColumns: `repeat(${punten.length}, minmax(0, 1fr))` };
  const smal = punten.length > 8;

  return (
    <div className="flex w-full max-w-[640px] flex-col gap-2">
      <p aria-live="polite" className="m-0 min-h-[18px] text-[12px] leading-snug text-[var(--vd-ink-2)]">
        {gekozen?.uitleg ?? ""}
      </p>

      <div className="flex">
        <div
          className={`relative grid flex-1 border-b border-[var(--vd-line-2)] ${smal ? "gap-0.5" : "gap-1.5"}`}
          style={{ height: HOOGTE, ...kolommen }}
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
                key={punt.sleutel}
                type="button"
                onMouseEnter={() => setActief(i)}
                onFocus={() => setActief(i)}
                onClick={() => setActief(i)}
                aria-label={punt.uitleg}
                aria-pressed={isActief}
                className="relative flex h-full cursor-pointer items-end justify-center rounded-md bg-transparent outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-1 focus-visible:ring-[var(--vd-ink-3)]"
              >
                {punt.waarde === null ? (
                  <span aria-hidden className="mb-0.5 block w-full max-w-[24px] border-t border-dashed border-[var(--vd-ink-4)]" />
                ) : (
                  <span
                    aria-hidden
                    data-staat={punt.staat}
                    className={`block w-full max-w-[24px] rounded-t-[4px] transition-opacity ${
                      punt.staat === "onvolledig" ? "border border-b-0 border-[var(--vd-ink-4)]" : ""
                    }`}
                    style={{
                      height: `${hoogte}%`,
                      background: achtergrond(punt.staat),
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
              norm
              <br />
              {hoeveelheid(referentie)} {unit}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex">
        <div className={`grid flex-1 ${smal ? "gap-0.5" : "gap-1.5"}`} style={kolommen}>
          {punten.map((punt, i) => (
            <span
              key={punt.sleutel}
              className={`flex min-w-0 flex-col items-center text-center leading-tight ${smal ? "text-[9px]" : "text-[10px]"} ${
                i === index ? "text-[var(--vd-ink)]" : "text-[var(--vd-ink-4)]"
              }`}
            >
              <span className="max-w-full truncate">{punt.label}</span>
              <span className="text-[9px]">{punt.sublabel}</span>
            </span>
          ))}
        </div>
        <span className="w-12 shrink-0" />
      </div>

      <table className="sr-only">
        <caption>{trend.label}</caption>
        <tbody>
          {punten.map((punt) => (
            <tr key={punt.sleutel}>
              <td>{punt.uitleg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
