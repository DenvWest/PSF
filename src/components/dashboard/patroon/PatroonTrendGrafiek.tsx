"use client";

import { useState } from "react";
import type { StofTrend, StofTrendPunt, StofTrendStaat, TrendDetail } from "@/lib/nutrition-stof-trend";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";

/**
 * Eén stof als staafgrafiek over de gekozen periode: per maaltijd (één dag),
 * per dag (tot 14 dagen) of per week. Voor kernstoffen én gevolgde stoffen.
 *
 * - **Een box van 0 tot 100% van de norm.** De bovenrand ís de norm, dus je
 *   ziet meteen hoe vol een dag is. Boven de norm vult de staaf de box en
 *   krijgt hij een label ("140%"). Zonder norm (eiwit zonder doel) blijft de
 *   schaal in de eenheid van de stof.
 * - **Gestippeld bovenop een onvolledige dag:** wat je gebruikelijke
 *   ontbrekende maaltijd levert, uit je eigen registraties. Een schatting,
 *   dus geen kleur.
 * - **Een paneel naast de grafiek** (eronder op een smalle tegel) met het
 *   gekozen punt: verdeling per maaltijd, top 3 bronnen en de feiten over de
 *   periode. Staat standaard op het laatste gemeten punt; hover of tik
 *   wisselt het, ook op een telefoon.
 * - **Een leeg punt blijft een gat** met een streepje, geen staaf van nul.
 *
 * Kleur: sage gehaald, terra onder de norm op een volledige dag, gearceerd
 * onvolledig, één neutrale tint waar geen oordeel hoort. Nooit rood.
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

function Paneel({
  punt,
  trend,
  redenen,
}: {
  punt: StofTrendPunt | undefined;
  trend: StofTrend;
  redenen: readonly string[];
}) {
  const detail: TrendDetail | null = punt?.detail ?? null;
  const momenten = trend.schaal === "maaltijd" ? [] : (detail?.momenten ?? []);
  return (
    <aside className="flex min-w-0 flex-col gap-2 text-[12px] leading-snug text-[var(--vd-ink-2)] @[560px]:w-[260px] @[560px]:shrink-0 @[560px]:border-l @[560px]:border-[var(--vd-line)] @[560px]:pl-4">
      <p aria-live="polite" className="m-0 min-h-[18px] text-[var(--vd-ink)]">
        {punt?.uitleg ?? ""}
      </p>
      {detail?.schatting ? <p className="m-0">{detail.schatting}</p> : null}

      {momenten.length > 0 ? (
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          {momenten.map((regel) => (
            <div key={regel.moment} className="contents">
              <dt className="text-[var(--vd-ink-3)]">{regel.label}</dt>
              <dd className="m-0 text-right tabular-nums">
                {regel.waarde !== null ? (
                  <>
                    {hoeveelheid(regel.waarde)} {trend.unit}
                    {trend.schaal === "week" ? <span className="text-[var(--vd-ink-4)]"> · {regel.keer}×</span> : null}
                  </>
                ) : regel.geschat !== null ? (
                  <span className="text-[var(--vd-ink-3)]">
                    — · ≈ {hoeveelheid(regel.geschat)} {trend.unit}
                  </span>
                ) : (
                  <span className="text-[var(--vd-ink-4)]">—</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {detail && detail.bronnen.length > 0 ? (
        <p className="m-0">
          <span className="text-[var(--vd-ink-3)]">{trend.schaal === "week" ? "Top die week: " : "Top: "}</span>
          {detail.bronnen.map((b) => `${b.naam} (${hoeveelheid(b.bedrag)} ${trend.unit})`).join(" · ")}
        </p>
      ) : null}

      {redenen.length > 0 ? (
        <ul
          aria-label={`Waarom ${trend.label.toLowerCase()} niet aan de norm voldoet`}
          className="m-0 mt-1 flex list-none flex-col gap-1 border-t border-[var(--vd-line)] p-0 pt-2"
        >
          {redenen.map((reden) => (
            <li key={reden}>{reden}</li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

export type TrendWeergave = "staaf" | "lijn";

function Punt({ staat, actief }: { staat: StofTrendStaat; actief: boolean }) {
  const open = staat === "onvolledig";
  return (
    <span
      aria-hidden
      data-staat={staat}
      className={`absolute left-1/2 block h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border ${
        open ? "border-[var(--vd-ink-3)] bg-[var(--vd-surface)]" : "border-transparent"
      }`}
      style={{ background: open ? undefined : achtergrond(staat), opacity: actief ? 1 : 0.7 }}
    />
  );
}

export default function PatroonTrendGrafiek({
  trend,
  redenen = [],
  weergave = "staaf",
}: {
  trend: StofTrend;
  redenen?: readonly string[];
  weergave?: TrendWeergave;
}) {
  const { punten } = trend;
  const norm = trend.norm;
  const laatsteGemeten = punten.reduce((laatst, punt, index) => (punt.waarde !== null ? index : laatst), -1);
  const [actief, setActief] = useState<number | null>(null);
  const index = actief ?? (laatsteGemeten >= 0 ? laatsteGemeten : punten.length - 1);
  const gekozen: StofTrendPunt | undefined = punten[index];

  const procent = norm !== null && norm > 0;
  const hoogsteWaarde = Math.max(...punten.map((p) => (p.waarde ?? 0) + (p.aanvulling ?? 0)), 0.0001) * 1.12;
  const fractie = (waarde: number) => (procent ? Math.min(waarde / norm!, 1) : waarde / hoogsteWaarde);
  const kolommen = { gridTemplateColumns: `repeat(${punten.length}, minmax(0, 1fr))` };
  const smal = punten.length > 8;
  const lijn = weergave === "lijn";
  // Lijn: geen tussenruimte, zodat het midden van elke kolom exact op (i + ½) / n ligt.
  const tussenruimte = lijn ? "gap-0" : smal ? "gap-0.5" : "gap-1.5";
  const hoogteVan = (punt: StofTrendPunt) => (punt.waarde === null ? null : fractie(punt.waarde));
  // Een lijn alleen tussen twee buren die allebei gemeten zijn: over een lege dag tekenen we niets.
  const segmenten = punten.flatMap((punt, i) => {
    const volgende = punten[i + 1];
    const y1 = hoogteVan(punt);
    const y2 = volgende ? hoogteVan(volgende) : null;
    if (y1 === null || y2 === null) return [];
    return [{ x1: ((i + 0.5) / punten.length) * 100, y1: (1 - y1) * 100, x2: ((i + 1.5) / punten.length) * 100, y2: (1 - y2) * 100 }];
  });

  return (
    <div className="@container w-full">
      <div className="flex flex-col gap-3 @[560px]:flex-row @[560px]:items-start @[560px]:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {procent ? (
            <div className="flex">
              <span className="w-8 shrink-0" />
              <div className={`grid flex-1 ${tussenruimte}`} style={kolommen}>
                {punten.map((punt) => (
                  <span key={punt.sleutel} className="h-3 text-center text-[9px] leading-3 text-[var(--vd-ink-3)]">
                    {punt.aandeel !== null && punt.aandeel > 1 ? percentageADH(punt.aandeel) : ""}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex">
            <div className="relative w-8 shrink-0 text-[9.5px] leading-none text-[var(--vd-ink-4)]" style={{ height: HOOGTE }}>
              {procent ? (
                <>
                  <span className="absolute top-0 right-1.5">100%</span>
                  <span className="absolute top-1/2 right-1.5 -translate-y-1/2">50%</span>
                  <span className="absolute right-1.5 bottom-0">0</span>
                </>
              ) : null}
            </div>
            <div
              data-testid="trend-box"
              className={`relative grid flex-1 border-b border-[var(--vd-line-2)] ${procent ? "border-t border-t-[var(--vd-ink-4)]" : ""} ${tussenruimte}`}
              style={{ height: HOOGTE, ...kolommen }}
              onMouseLeave={() => setActief(null)}
            >
              {procent ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-0 left-0 border-t border-dashed border-[var(--vd-line-2)]"
                />
              ) : null}

              {lijn ? (
                <svg
                  aria-hidden
                  data-testid="trend-lijn"
                  className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {segmenten.map((seg) => (
                    <line
                      key={`${seg.x1}`}
                      {...seg}
                      stroke="var(--vd-ink-3)"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
              ) : null}

              {punten.map((punt, i) => {
                const isActief = i === index;
                const gemeten = punt.waarde === null ? 0 : Math.max(0.02, fractie(punt.waarde));
                const metSchatting =
                  punt.waarde !== null && punt.aanvulling !== null ? fractie(punt.waarde + punt.aanvulling) : gemeten;
                const geschat = Math.max(0, metSchatting - gemeten);
                return (
                  <button
                    key={punt.sleutel}
                    type="button"
                    onMouseEnter={() => setActief(i)}
                    onFocus={() => setActief(i)}
                    onClick={() => setActief(i)}
                    aria-label={punt.uitleg}
                    aria-pressed={isActief}
                    className="relative z-10 flex h-full cursor-pointer flex-col items-center justify-end rounded-md bg-transparent outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-1 focus-visible:ring-[var(--vd-ink-3)]"
                  >
                    {punt.waarde === null ? (
                      <span aria-hidden className="mb-0.5 block w-full max-w-[24px] border-t border-dashed border-[var(--vd-ink-4)]" />
                    ) : lijn ? (
                      <>
                        {geschat > 0 ? (
                          <span
                            aria-hidden
                            data-schatting
                            className="absolute left-1/2 block -translate-x-1/2 border-l border-dashed border-[var(--vd-ink-3)]"
                            style={{ bottom: `${gemeten * 100}%`, height: `${geschat * 100}%` }}
                          />
                        ) : null}
                        <span className="absolute inset-x-0" style={{ bottom: `${gemeten * 100}%` }}>
                          <Punt staat={punt.staat} actief={isActief} />
                        </span>
                      </>
                    ) : (
                      <>
                        {geschat > 0 ? (
                          <span
                            aria-hidden
                            data-schatting
                            className="block w-full max-w-[24px] rounded-t-[4px] border border-b-0 border-dashed border-[var(--vd-ink-3)]"
                            style={{ height: `${geschat * 100}%`, opacity: isActief ? 1 : 0.55 }}
                          />
                        ) : null}
                        <span
                          aria-hidden
                          data-staat={punt.staat}
                          className={`block w-full max-w-[24px] transition-opacity ${geschat > 0 ? "" : "rounded-t-[4px]"} ${
                            punt.staat === "onvolledig" ? "border border-b-0 border-[var(--vd-ink-4)]" : ""
                          }`}
                          style={{
                            height: `${gemeten * 100}%`,
                            background: achtergrond(punt.staat),
                            opacity: isActief ? 1 : 0.55,
                          }}
                        />
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex">
            <span className="w-8 shrink-0" />
            <div className={`grid flex-1 ${tussenruimte}`} style={kolommen}>
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
          </div>
          {procent ? (
            <p className="m-0 pl-8 text-[10px] text-[var(--vd-ink-4)]">
              100% = {trend.schaal === "maaltijd" ? trend.normNaam.dag : trend.normNaam.de} {hoeveelheid(norm!)} {trend.unit}
            </p>
          ) : null}
        </div>

        <Paneel punt={gekozen} trend={trend} redenen={redenen} />
      </div>

      <div className="sr-only">
        <table>
          <caption>{trend.label}</caption>
          <tbody>
            {punten.map((punt) => (
              <tr key={punt.sleutel}>
                <td>{[punt.uitleg, punt.detail?.schatting].filter(Boolean).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
