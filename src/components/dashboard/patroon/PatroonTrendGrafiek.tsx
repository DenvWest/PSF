"use client";

import { useEffect, useState } from "react";
import type { StofTrend, StofTrendPunt, TrendDetail } from "@/lib/nutrition-stof-trend";
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
 *   dus geen vulling.
 * - **Een paneel naast de grafiek** (eronder op een smalle tegel) met het
 *   gekozen punt: verdeling per maaltijd, top 3 bronnen en de feiten over de
 *   periode. Staat standaard op het laatste gemeten punt; hover of tik
 *   wisselt het, ook op een telefoon.
 * - **Een leeg punt blijft een gat** met een streepje, geen staaf van nul.
 *
 * ## Kleur is identiteit, het oordeel zit in de vulling
 *
 * Elke kernstof tekent in zijn eigen kleur (`--vd-stof-*`), dezelfde als in
 * de krans: magnesium herken je overal aan dezelfde tint. Hoe het ervoor
 * staat zit in de vulling, niet in de tint: vol met ✓ = gehaald, licht =
 * eronder of geen oordeel, gearceerd = onvolledig. Gevolgde stoffen houden
 * zoals in de krans een neutrale tint, zodat de informatielaag niet als
 * tekort leest. Nooit rood.
 *
 * Bij het openen groeien de staven op (ook bij een andere periode); wie
 * minder beweging wil (`prefers-reduced-motion`) krijgt ze meteen.
 */

const HOOGTE = 128;

/** De identiteitskleur van een stof; gevolgde stoffen neutraal, zoals de buitenring van de krans. */
export function stofKleur(trend: Pick<StofTrend, "stof" | "soort">): string {
  return trend.soort === "kern" ? `var(--vd-stof-${trend.stof})` : "var(--vd-ink-2)";
}

export function getint(kleur: string, procent: number): string {
  return `color-mix(in srgb, ${kleur} ${procent}%, transparent)`;
}

export function gearceerd(kleur: string): string {
  return `repeating-linear-gradient(135deg, ${getint(kleur, 70)} 0 3px, transparent 3px 6px)`;
}

function vulling(trend: StofTrend, punt: StofTrendPunt, kleur: string): string {
  if (punt.staat === "onvolledig" && !punt.normGehaald) return gearceerd(kleur);
  if (punt.normGehaald || punt.staat === "gehaald") return kleur;
  // Per maaltijd en omega-3 per dag oordelen niet: middentint, geen "eronder".
  if (trend.schaal === "maaltijd" || trend.periodetotaal) return getint(kleur, 75);
  return getint(kleur, 40);
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
    <aside
      key={punt?.sleutel}
      className="flex min-w-0 motion-safe:animate-[fadeIn_200ms_ease-out] flex-col gap-2 text-[12px] leading-snug text-[var(--vd-ink-2)] @[560px]:w-[260px] @[560px]:shrink-0 @[560px]:border-l @[560px]:border-[var(--vd-line)] @[560px]:pl-4"
    >
      <p aria-live="polite" className="m-0 min-h-[18px] text-[var(--vd-ink)]">
        {punt?.uitleg ?? ""}
      </p>
      {detail?.schatting ? <p className="m-0">{detail.schatting}</p> : null}

      {momenten.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[var(--vd-ink-3)]">{trend.schaal === "week" ? "Gemiddeld per maaltijd" : "Per maaltijd"}</p>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
            {momenten.map((regel) => (
              <div key={regel.moment} className="contents">
                <dt>
                  {regel.label}
                  {trend.schaal === "week" && regel.keer > 0 ? (
                    <span className="text-[var(--vd-ink-4)]"> ({regel.keer} keer)</span>
                  ) : null}
                </dt>
                <dd className="m-0 text-right tabular-nums">
                  {regel.overgeslagen ? (
                    <span className="text-[var(--vd-ink-3)]">niet gegeten</span>
                  ) : regel.waarde !== null ? (
                    <>
                      {hoeveelheid(regel.waarde)} {trend.unit}
                    </>
                  ) : regel.geschat !== null ? (
                    <span className="text-[var(--vd-ink-3)]">
                      niet opgeschreven, meestal ≈ {hoeveelheid(regel.geschat)} {trend.unit}
                    </span>
                  ) : (
                    <span className="text-[var(--vd-ink-4)]">niet opgeschreven</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {detail && detail.bronnen.length > 0 ? (
        <p className="m-0">
          <span className="text-[var(--vd-ink-3)]">{trend.schaal === "week" ? "Het meeste die week kwam van: " : "Het meeste kwam van: "}</span>
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

export default function PatroonTrendGrafiek({
  trend,
  redenen = [],
}: {
  trend: StofTrend;
  redenen?: readonly string[];
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
  const tussenruimte = smal ? "gap-0.5" : "gap-1.5";
  const kleur = stofKleur(trend);
  const [getekend, setGetekend] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGetekend(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="@container w-full">
      <div className="flex flex-col gap-3 @[560px]:flex-row @[560px]:items-start @[560px]:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {procent ? (
            <div className="flex">
              <span className="w-8 shrink-0" />
              <div className={`grid flex-1 ${tussenruimte}`} style={kolommen}>
                {punten.map((punt) => (
                  <span
                    key={punt.sleutel}
                    className="h-3 truncate text-center text-[9px] leading-3"
                    style={{ color: punt.normGehaald ? kleur : "var(--vd-ink-3)" }}
                  >
                    {[punt.normGehaald ? "✓" : null, punt.aandeel !== null && punt.aandeel > 1 && !smal && !trend.periodetotaal ? percentageADH(punt.aandeel) : null]
                      .filter(Boolean)
                      .join(" ")}
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


              {punten.map((punt, i) => {
                const isActief = i === index;
                const gemeten = punt.waarde === null || !getekend ? 0 : Math.max(0.02, fractie(punt.waarde));
                const metSchatting =
                  getekend && punt.waarde !== null && punt.aanvulling !== null ? fractie(punt.waarde + punt.aanvulling) : gemeten;
                const heeftSchatting = punt.waarde !== null && punt.aanvulling !== null && fractie(punt.waarde) < 1;
                const groei = { transitionDelay: `${Math.min(i, 14) * 20}ms` };
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
                    ) : (
                      <>
                        {heeftSchatting ? (
                          <span
                            aria-hidden
                            data-schatting
                            className="block w-full max-w-[24px] rounded-t-[4px] border border-b-0 border-dashed motion-safe:transition-[height] motion-safe:duration-500 motion-safe:ease-out"
                            style={{ height: `${geschat * 100}%`, borderColor: getint(kleur, 70), opacity: isActief ? 1 : 0.8, ...groei }}
                          />
                        ) : null}
                        <span
                          aria-hidden
                          data-staat={punt.staat}
                          className={`block w-full max-w-[24px] motion-safe:transition-[height,opacity] motion-safe:duration-500 motion-safe:ease-out ${heeftSchatting ? "" : "rounded-t-[4px]"} ${
                            punt.staat === "onvolledig" ? "border border-b-0" : ""
                          }`}
                          style={{
                            height: `${gemeten * 100}%`,
                            background: vulling(trend, punt, kleur),
                            borderColor: getint(kleur, 60),
                            opacity: isActief ? 1 : 0.8,
                            ...groei,
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
              {trend.periodetotaal ? ". Dit telt over alle dagen samen: één keer vette vis dekt meerdere dagen, dus een hoge staaf op één dag is geen probleem." : ""}
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
