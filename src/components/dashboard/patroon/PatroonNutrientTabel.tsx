"use client";

import { useState } from "react";
import Link from "next/link";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { trackEvent } from "@/lib/ga4";
import {
  hoeveelheid,
  percentageADH,
  RICHTING_TEKEN,
  RICHTING_TOON,
} from "@/lib/nutrition-tekortsysteem-copy";
import type { Vensterreeks, VensterLengte } from "@/lib/nutrition-tekortsysteem";

/**
 * De premium nutriëntentabel bovenaan Samenvatting: alle stoffen op één rij,
 * met hun gemiddelde over de gekozen periode, hun ADH-balk en trendrichting —
 * een chip-rij erboven om stoffen te verbergen, en een periode-schakelaar
 * (dag/week/maand) die zowel de cijfers als de volgorde herberekent.
 *
 * ## Waarom dit op `Vensterreeks` bouwt en niet op `WeekRij`
 *
 * Het tekortsysteem (`nutrition-tekortsysteem.ts`) berekent al drie vensters
 * die precies op dag/week/maand passen (1, 7, 30 dagen) — dezelfde cijfers
 * die de Voedingsstoffen-sectie al toont. Een periode-schakelaar hier is dus
 * geen nieuwe rekenkern, alleen een nieuwe blik op wat al bestaat.
 *
 * ## Waarom de sortering per periode opnieuw gebeurt
 *
 * "Laagste ADH eerst" betekent iets anders per venster: een stof kan vandaag
 * laag staan en over de maand juist gedekt zijn (of andersom). De volgorde
 * herberekenen bij elke periodewissel is dus geen optimalisatie maar de
 * kern van het idee — de stof die nú de meeste aandacht verdient staat boven.
 *
 * ## "Uit" is een weergavefilter, geen datawijziging
 *
 * Verbergen raakt alleen wat hier te zien is. Het dagboek en het
 * tekortsysteem blijven de stof gewoon meerekenen — een verborgen stof is
 * niet "genegeerd", alleen "niet getoond".
 */

type Periode = "dag" | "week" | "maand";

const VENSTER_VOOR_PERIODE: Record<Periode, VensterLengte> = {
  dag: 1,
  week: 7,
  maand: 30,
};

const PERIODE_LABEL: Record<Periode, string> = {
  dag: "Vandaag",
  week: "Deze week",
  maand: "Deze maand",
};

type Props = {
  reeksen: readonly Vensterreeks[];
  verborgen: ReadonlySet<NutrientId>;
  onToggle: (nutrient: NutrientId) => void;
};

export default function PatroonNutrientTabel({ reeksen, verborgen, onToggle }: Props) {
  const [periode, setPeriode] = useState<Periode>("week");
  const vensterLengte = VENSTER_VOOR_PERIODE[periode];

  const zichtbaar = reeksen.filter((reeks) => !verborgen.has(reeks.nutrient));

  // Laagste ADH eerst: wat geen aandeel heeft (nog niets geregistreerd, of een
  // eigen doel) komt onderaan — dat is geen "laag", dat is "onbekend", en dat
  // hoort niet boven een stof die aantoonbaar achterblijft.
  const gesorteerd = [...zichtbaar].sort((a, b) => {
    const va = a.vensters.find((v) => v.dagen_terug === vensterLengte);
    const vb = b.vensters.find((v) => v.dagen_terug === vensterLengte);
    const aa = va?.aandeel;
    const ab = vb?.aandeel;
    if (aa == null && ab == null) return 0;
    if (aa == null) return 1;
    if (ab == null) return -1;
    return aa - ab;
  });

  return (
    <div className="vd-nutrienttabel-blok">
      <div className="vd-kop" style={{ marginBottom: "0.5rem" }}>
        <p className="vd-eyebrow" style={{ margin: 0 }}>
          {PERIODE_LABEL[periode]} — al je stoffen, laagste ADH eerst
        </p>
        <div className="vd-segment" role="group" aria-label="Periode">
          {(Object.keys(VENSTER_VOOR_PERIODE) as Periode[]).map((optie) => (
            <button
              key={optie}
              type="button"
              aria-pressed={periode === optie}
              onClick={() => {
                setPeriode(optie);
                trackEvent("nutrition_patroon_periode_gekozen", { periode: optie });
              }}
            >
              {optie === "dag" ? "Dag" : optie === "week" ? "Week" : "Maand"}
            </button>
          ))}
        </div>
      </div>

      <div
        className="vd-chiprij"
        role="group"
        aria-label="Voedingsstoffen tonen of verbergen"
      >
        {reeksen.map((reeks) => {
          const aan = !verborgen.has(reeks.nutrient);
          return (
            <button
              key={reeks.nutrient}
              type="button"
              className="vd-chip"
              aria-pressed={aan}
              onClick={() => onToggle(reeks.nutrient)}
            >
              {reeks.label}
            </button>
          );
        })}
      </div>

      {gesorteerd.length === 0 ? (
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

          {gesorteerd.map((reeks) => {
            const venster = reeks.vensters.find((v) => v.dagen_terug === vensterLengte);
            const vulling =
              !venster || venster.aandeel === null
                ? 0
                : Math.min(Math.round(venster.aandeel * 100), 100);
            const heeftBalk = Boolean(venster && venster.dagen > 0 && venster.aandeel !== null);

            return (
              <Link
                key={reeks.nutrient}
                href={nutrientReferences[reeks.nutrient].comparisonPath}
                className="vd-tabel-rij vd-nutrienttabel-rij"
              >
                <span className="vd-naam">
                  <span className="vd-naam-kop">
                    {reeks.label}
                    {venster?.gedekt ? (
                      <span className="vd-pil" data-toon="sage">
                        gedekt
                      </span>
                    ) : !reeks.bewijsbaar ? (
                      <span className="vd-pil" data-toon="amber">
                        n.t.b.
                      </span>
                    ) : null}
                  </span>
                </span>

                <span className="vd-getal">
                  {!venster || venster.dagen === 0 ? "n.o." : hoeveelheid(venster.gemiddeld)}
                </span>

                <span className="vd-cel">
                  {heeftBalk ? (
                    <span
                      style={{
                        width: `${vulling}%`,
                        background: venster?.gedekt ? "var(--vd-sage)" : "var(--vd-terra)",
                      }}
                    />
                  ) : null}
                  <b data-gevuld={heeftBalk && vulling > 0 ? "ja" : "nee"}>
                    {heeftBalk ? percentageADH(venster!.aandeel) : "—"}
                  </b>
                </span>

                <span className="vd-trend" data-richting={RICHTING_TOON[reeks.richting]}>
                  {RICHTING_TEKEN[reeks.richting]}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
