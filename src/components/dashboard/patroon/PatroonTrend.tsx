"use client";

import Link from "next/link";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import PatroonTrendGrafiek from "@/components/dashboard/patroon/PatroonTrendGrafiek";
import type { GevolgdeWeekReeks } from "@/lib/nutrition-gevolgde-weken";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";
import type { NutrientTrend } from "@/lib/nutrition-trend";

/**
 * De trend per stof: hetzelfde weekgemiddelde als het weekoverzicht, nu over
 * meerdere weken als staafjes op een rij.
 *
 * ## Waarom staafjes en geen lijngrafiek
 *
 * Een lijn suggereert een continue meting tussen de punten in — als je twee
 * weken niet registreerde, tekent een lijn er dwars doorheen een waarde bij
 * die er niet is. Staafjes met een lege plek voor een niet-gemeten week zijn
 * eerlijker: je ziet letterlijk het gat in je registratie, niet een
 * geïnterpoleerd getal.
 *
 * ## De stippellijn is de referentie, geen doelbalk
 *
 * Zoals overal in dit scherm: de referentie is een marker om tegen af te
 * zetten, geen vak dat "vol" moet raken. Een staaf die eroverheen komt (een
 * zalmweek) mag gewoon hoger zijn dan de lijn.
 *
 * De grafiek zelf staat in `PatroonTrendGrafiek.tsx`. Hier per stof de kop
 * met een telling ("gehaald in 3 van 5 gemeten weken") en, onder de
 * kernstoffen, de gevolgde stoffen zonder oordeel.
 */

function telRegel(trend: NutrientTrend): string | null {
  const gemeten = trend.punten.filter((p) => p.waarde !== null);
  if (gemeten.length === 0) return "nog geen gemeten weken";
  if (trend.referentie === null) return `${gemeten.length} ${gemeten.length === 1 ? "week" : "weken"} gemeten`;
  const gehaald = gemeten.filter((p) => p.gehaald).length;
  return `norm gehaald in ${gehaald} van ${gemeten.length} gemeten ${gemeten.length === 1 ? "week" : "weken"}`;
}

function hoofdletter(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function PatroonTrend({
  trends,
  gevolgd,
  huidigeWeek,
}: {
  trends: readonly NutrientTrend[];
  gevolgd: readonly GevolgdeWeekReeks[];
  huidigeWeek: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {trends.map((trend) => (
          <li key={trend.nutrient} className="vd-tabel" style={{ padding: "0.875rem" }}>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <Link
                href={nutrientReferences[trend.nutrient].comparisonPath}
                className="vd-naam"
                style={{ textDecoration: "none" }}
              >
                <b style={{ color: "var(--vd-ink)" }}>{trend.label}</b>
              </Link>
              <span className="vd-getal" data-toon="stil">
                {trend.bewijsbaar ? telRegel(trend) : "geen oordeel"}
              </span>
            </div>

            {!trend.bewijsbaar ? (
              <p className="vd-note" data-toon="amber" style={{ marginTop: "0.5rem" }}>
                Met een dagboek niet aan te tonen — geen trend, alleen je bronnen.
              </p>
            ) : (
              <PatroonTrendGrafiek
                label={trend.label}
                punten={trend.punten.map((p) => ({
                  weekStart: p.weekStart,
                  waarde: p.waarde,
                  aandeel: p.aandeel,
                  gehaald: p.gehaald,
                  benaderd: p.benaderd,
                  dagen: p.dagenGeregistreerd,
                }))}
                unit={trend.unit}
                referentie={trend.referentie}
                referentieNaam="norm"
                toon="oordeel"
                huidigeWeek={huidigeWeek}
              />
            )}
          </li>
        ))}
      </ul>

      {gevolgd.length > 0 ? (
        <section aria-labelledby="patroon-trend-gevolgd" className="flex flex-col gap-3">
          <p id="patroon-trend-gevolgd" className="vd-eyebrow" style={{ margin: "0.5rem 0 0" }}>
            Ook gevolgd · zonder oordeel
          </p>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {gevolgd.map((reeks) => (
              <li key={reeks.veld} className="vd-tabel" style={{ padding: "0.875rem" }}>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <b className="text-[var(--vd-ink)]">{hoofdletter(reeks.label)}</b>
                  <span className="vd-getal" data-toon="stil">
                    {reeks.norm !== null ? `norm ${hoeveelheid(reeks.norm)} ${reeks.unit}` : "gem. per dag"}
                  </span>
                </div>
                <PatroonTrendGrafiek
                  label={hoofdletter(reeks.label)}
                  punten={reeks.punten.map((p) => ({
                    weekStart: p.weekStart,
                    waarde: p.gemiddeld,
                    aandeel: p.aandeel,
                    dagen: p.dagen,
                  }))}
                  unit={reeks.unit}
                  referentie={reeks.norm}
                  referentieNaam="norm"
                  toon="neutraal"
                  huidigeWeek={huidigeWeek}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
