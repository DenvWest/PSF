"use client";

import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import {
  percentageADH,
  RICHTING_LABEL,
  RICHTING_TEKEN,
  RICHTING_TOON,
  VENSTER_LABEL,
  vensterDagenLabel,
  vensterKolommen,
} from "@/lib/nutrition-tekortsysteem-copy";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";
import { NIET_BEWIJSBAAR } from "@/lib/nutrition-tekortsysteem";

/**
 * De vier vensters als één tabel: stof, 1 / 7 / 14 / 30 dagen, richting.
 *
 * ## Waarom een tabel en geen kaart per stof
 *
 * Eerst stond elke stof in een eigen kaart met vier doosjes erin. Dat leest
 * verkeerd: het nodigt uit om één stof te lezen en door te scrollen, terwijl
 * de bevinding juist uit de *vergelijking* komt — magnesium laag in alle vier
 * naast omega-3 dat alleen vandaag hoog staat. In een tabel staan die
 * percentages onder elkaar in dezelfde kolom, en dan zie je het patroon zonder
 * het te hoeven onthouden.
 *
 * ## Waarom de cel een staaf is en geen kaal getal
 *
 * Een kolom met "60% 57% 54% 52%" leest als vier losse metingen. Dezelfde
 * cijfers als gevulde staven laten in één blik zien dat ze aflopen. Het getal
 * staat er overheen, want de staaf stopt bij vol en 760 % zou anders gelijk
 * lijken aan 100 %.
 *
 * ## Waarom de kop het aantal dagen noemt
 *
 * Elk venster middelt over de dagen waarop je iets registreerde, niet over
 * kalenderdagen: een dag zonder registratie is geen nul (asymmetrie-regel).
 * Registreerde je deze week alleen vandaag, dan zijn "vandaag" en "7 dagen"
 * hetzelfde getal. De kop noemt daarom per venster het aantal dagen, en een
 * venster zonder nieuwe dagen ten opzichte van het vorige staat gedimd.
 *
 * ## Waarom niet-bewijsbare stoffen amber zijn en geen richting krijgen
 *
 * Zink en vitamine D staan bijna altijd laag omdat een dagboek ze niet kan
 * vangen. Een richtingpijl daarop zou een trend beweren in wat eigenlijk een
 * eigenschap van de meetmethode is; de kolom blijft daar leeg met de reden
 * eronder.
 */

export default function PatroonVensterTabel({
  reeksen,
}: {
  reeksen: readonly Vensterreeks[];
}) {
  const kolommen = vensterKolommen(reeksen);
  const zelfde = new Set(kolommen.filter((k) => k.zelfde).map((k) => k.dagen_terug));
  return (
    <div className="vd-tabel">
      <div className="vd-tabel-kop vd-venster-kop">
        <span>Stof</span>
        {kolommen.map((kolom) => (
          <span key={kolom.dagen_terug} data-zelfde={kolom.zelfde ? "ja" : "nee"}>
            {VENSTER_LABEL[kolom.dagen_terug]}
            <i>{kolom.zelfde ? "zelfde" : vensterDagenLabel(kolom.dagen)}</i>
          </span>
        ))}
        <span>Richting</span>
      </div>

      {reeksen.map((reeks) => {
        const referentie = REFERENCE_INTAKES[reeks.nutrient];
        const eigenDoel = referentie.personalTarget;
        const onbewijsbaar = reeks.nutrient in NIET_BEWIJSBAAR;

        const kleur = onbewijsbaar
          ? "var(--vd-amber)"
          : reeks.vensters.some((v) => v.gedekt === true)
            ? "var(--vd-sage)"
            : "var(--vd-terra)";

        return (
          <div key={reeks.nutrient} className="vd-tabel-rij vd-venster-rij">
            <span className="vd-naam">
              {reeks.label}
              <i>
                {eigenDoel
                  ? "gem. per dag"
                  : `${referentie.value} ${referentie.unit} ADH`}
              </i>
            </span>

            {reeks.vensters.map((venster) => {
              const leeg = venster.dagen === 0;
              const vulling =
                venster.aandeel === null
                  ? 0
                  : Math.min(Math.round(venster.aandeel * 100), 100);
              const gedekt = venster.gedekt === true;

              return (
                <span
                  key={venster.dagen_terug}
                  className="vd-cel"
                  data-zelfde={zelfde.has(venster.dagen_terug) ? "ja" : "nee"}
                >
                  {!leeg && !eigenDoel ? (
                    <span
                      style={{
                        width: `${vulling}%`,
                        background: gedekt ? "var(--vd-sage)" : kleur,
                      }}
                    />
                  ) : null}
                  {/*
                    Het cijfer ligt over de staaf heen, dus zijn kleur hoort
                    bij de vúlling en niet bij het thema. De vulkleuren (sage,
                    terra, amber) zijn in beide thema's licht genoeg om
                    donkere tekst te dragen; de lege baan is dat niet. Vandaar
                    een eigen pil onder het getal in plaats van meekleuren met
                    de inkt — dan klopt het contrast in licht én donker, en
                    hoeft geen van beide een uitzondering te zijn.
                  */}
                  <b data-gevuld={!leeg && !eigenDoel && vulling > 0 ? "ja" : "nee"}>
                    {leeg
                      ? "—"
                      : eigenDoel
                        ? `${Math.round(venster.gemiddeld)} ${reeks.unit}`
                        : percentageADH(venster.aandeel)}
                  </b>
                </span>
              );
            })}

            <span className="vd-trend" data-richting={RICHTING_TOON[reeks.richting]}>
              {onbewijsbaar ? (
                <>— niet bewijsbaar</>
              ) : (
                <>
                  {RICHTING_TEKEN[reeks.richting]}{" "}
                  {RICHTING_LABEL[reeks.richting]}
                </>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
