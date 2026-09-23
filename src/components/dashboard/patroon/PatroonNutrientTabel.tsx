"use client";

import Link from "next/link";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import type { WeekRij } from "@/lib/nutrition-weekoverzicht";
import type { NutrientTrend } from "@/lib/nutrition-trend";

/**
 * De premium nutriëntentabel bovenaan Samenvatting: alle stoffen op één rij,
 * met hun weekgemiddelde, aandeel van de ADH en trendrichting — en een
 * chip-rij erboven om stoffen die niet relevant zijn (bijv. een stof zonder
 * interventiedoel voor jou) te verbergen.
 *
 * ## Waarom een aparte tabel naast de samenvattingskaarten
 *
 * De kaarten eronder (`PatroonSamenvattingKaart`) tonen per stof de zeven
 * losse dagen — dat is de "hoe liep mijn week"-vraag. Deze tabel beantwoordt
 * een andere vraag: "waar sta ik nu, in één oogopslag, over alle stoffen". Een
 * tabelrij leent zich daarvoor beter dan zeven kaarten die je moet aftellen.
 *
 * ## Waarom de trendrichting hier een pijl is en geen staafjesreeks
 *
 * `PatroonTrend` toont de volledige zes-weken-reeks al met staafjes — die
 * herhalen zou ruis toevoegen. Hier is genoeg: gaat de laatste volle week
 * omhoog, omlaag of vlak t.o.v. de week ervoor. Twee vergelijkbare punten,
 * geen twaalf.
 *
 * ## "Uit" is een weergavefilter, geen datawijziging
 *
 * Verbergen raakt alleen wat hier en in de trend-sectie te zien is. Het
 * dagboek en het tekortsysteem blijven de stof gewoon meerekenen — een
 * verborgen stof is niet "genegeerd", alleen "niet getoond".
 */

type Props = {
  rijen: readonly WeekRij[];
  trends: readonly NutrientTrend[];
  verborgen: ReadonlySet<NutrientId>;
  onToggle: (nutrient: NutrientId) => void;
};

function trendRichting(trend: NutrientTrend | undefined): "op" | "neer" | "vlak" | null {
  if (!trend) return null;
  const bekend = trend.punten.filter((p) => p.waarde !== null);
  if (bekend.length < 2) return null;
  const laatste = bekend[bekend.length - 1]!;
  const vorige = bekend[bekend.length - 2]!;
  const verschil = (laatste.waarde ?? 0) - (vorige.waarde ?? 0);
  const drempel = (vorige.waarde ?? 0) * 0.05;
  if (Math.abs(verschil) <= Math.max(drempel, 0.01)) return "vlak";
  return verschil > 0 ? "op" : "neer";
}

const TREND_PIJL: Record<"op" | "neer" | "vlak", string> = {
  op: "↑",
  neer: "↓",
  vlak: "→",
};

export default function PatroonNutrientTabel({ rijen, trends, verborgen, onToggle }: Props) {
  const zichtbareRijen = rijen.filter((rij) => !verborgen.has(rij.nutrient));

  return (
    <div className="vd-nutrienttabel-blok">
      <div className="vd-kop" style={{ marginBottom: "0.5rem" }}>
        <p className="vd-eyebrow" style={{ margin: 0 }}>
          Deze week — al je stoffen
        </p>
      </div>

      <div
        className="vd-chiprij"
        role="group"
        aria-label="Voedingsstoffen tonen of verbergen"
      >
        {rijen.map((rij) => {
          const aan = !verborgen.has(rij.nutrient);
          return (
            <button
              key={rij.nutrient}
              type="button"
              className="vd-chip"
              aria-pressed={aan}
              onClick={() => onToggle(rij.nutrient)}
            >
              {rij.label}
            </button>
          );
        })}
      </div>

      {zichtbareRijen.length === 0 ? (
        <p className="vd-note" style={{ marginTop: "0.625rem" }}>
          Alle stoffen staan uit. Zet er hierboven minstens één aan om de
          tabel te zien.
        </p>
      ) : (
        <div className="vd-tabel vd-tabel--los vd-tabel--premium">
          <div className="vd-tabel-kop vd-nutrienttabel-kop">
            <span>Stof</span>
            <span>Gem.</span>
            <span>ADH</span>
            <span>Trend</span>
          </div>

          {zichtbareRijen.map((rij) => {
            const richting = trendRichting(trends.find((t) => t.nutrient === rij.nutrient));
            const vulling =
              rij.aandeel === null ? 0 : Math.min(Math.round(rij.aandeel * 100), 100);
            const heeftBalk = rij.dagenMetBron > 0 && rij.referentie !== null;

            return (
              <Link
                key={rij.nutrient}
                href={rij.comparisonPath}
                className="vd-tabel-rij vd-nutrienttabel-rij"
              >
                <span className="vd-naam">
                  <span className="vd-naam-kop">
                    {rij.label}
                    {rij.gedekt ? (
                      <span className="vd-pil" data-toon="sage">
                        gedekt
                      </span>
                    ) : !rij.bewijsbaar ? (
                      <span className="vd-pil" data-toon="amber">
                        n.t.b.
                      </span>
                    ) : null}
                  </span>
                </span>

                <span className="vd-getal">
                  {rij.dagenMetBron === 0 ? "n.o." : hoeveelheid(rij.gemiddeld)}
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

                <span className="vd-trend" data-richting={richting ?? "vlak"}>
                  {richting ? TREND_PIJL[richting] : "–"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
