"use client";

import Link from "next/link";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";
import type { NutrientTrend } from "@/lib/nutrition-trend";
import { weekKort } from "@/lib/nutrition-trend";

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
 */

export default function PatroonTrend({ trends }: { trends: readonly NutrientTrend[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {trends.map((trend) => (
        <li key={trend.nutrient} className="vd-tabel" style={{ padding: "0.875rem" }}>
          <div className="flex items-baseline justify-between gap-2">
            <Link
              href={nutrientReferences[trend.nutrient].comparisonPath}
              className="vd-naam"
              style={{ textDecoration: "none" }}
            >
              <b style={{ color: "var(--vd-ink)" }}>{trend.label}</b>
            </Link>
            <span className="vd-getal" data-toon="stil">
              {trend.referentie === null
                ? "eigen doel"
                : `referentie ${trend.referentie} ${trend.unit}`}
            </span>
          </div>

          {!trend.bewijsbaar ? (
            <p className="vd-note" data-toon="amber" style={{ marginTop: "0.5rem" }}>
              Met een dagboek niet aan te tonen — geen trend, alleen je bronnen.
            </p>
          ) : (
            <TrendStaafjes trend={trend} />
          )}
        </li>
      ))}
    </ul>
  );
}

function TrendStaafjes({ trend }: { trend: NutrientTrend }) {
  const waarden = trend.punten.map((p) => p.waarde ?? 0);
  const hoogsteWaarde = Math.max(...waarden, trend.referentie ?? 0, 1);

  // De referentielijn staat als percentage van de hoogte van de grafiek —
  // dat werkt ook als een piekweek er ver bovenuit steekt.
  const referentiePct =
    trend.referentie !== null
      ? Math.min((trend.referentie / hoogsteWaarde) * 100, 100)
      : null;

  return (
    <div
      className="vd-trendgrafiek vd-trendlijn-doel"
      style={
        referentiePct !== null
          ? ({ ["--vd-trend-doel-top" as string]: `${100 - referentiePct}%` } as React.CSSProperties)
          : undefined
      }
    >
      {referentiePct !== null ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${100 - referentiePct}%`,
            borderTop: "1px dashed var(--vd-line-2)",
          }}
        />
      ) : null}

      {trend.punten.map((punt) => {
        const hoogte =
          punt.waarde === null ? 0 : Math.max(3, (punt.waarde / hoogsteWaarde) * 100);
        const gedekt = punt.aandeel !== null && punt.aandeel >= 1;

        return (
          <div key={punt.weekStart} className="vd-trendpunt">
            <span
              aria-hidden
              className="vd-trendpunt-staaf"
              title={
                punt.waarde === null
                  ? "Niet geregistreerd"
                  : `${hoeveelheid(punt.waarde)} ${trend.unit}`
              }
              style={{
                height: `${hoogte}%`,
                background:
                  punt.waarde === null
                    ? "var(--vd-track)"
                    : gedekt
                      ? "var(--vd-sage)"
                      : "var(--vd-terra)",
              }}
            />
            <span className="vd-trendpunt-label">{weekKort(punt.weekStart)}</span>
          </div>
        );
      })}
    </div>
  );
}
