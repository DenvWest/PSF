"use client";

import type { WeekRij } from "@/lib/nutrition-weekoverzicht";

/**
 * "Deze week logde je" — een cirkel per stof met dagen-met-bron als getal.
 *
 * Vorm komt uit het MyFitnessPal-weekoverzicht: een gekleurde cirkel met een
 * getal erin, naam en toelichting ernaast. Daar telt de cirkel *producten*
 * per voedselgroep; hier telt hij *dagen met een bron* voor een nutriënt — dat
 * is de as die dit dashboard al draagt (zie `nutrition-tekortsysteem.ts`,
 * `dagenMetBron`), dus geen nieuwe telling ernaast.
 *
 * Kleur volgt dezelfde drie-staat als de rest van het scherm: sage (gedekt),
 * terra (bron aanwezig, dekking niet bewezen), amber (niet bewijsbaar).
 */

const KLEUR: Record<"sage" | "terra" | "amber", string> = {
  sage: "var(--vd-sage-fill)",
  terra: "var(--vd-terra-fill)",
  amber: "var(--vd-amber-fill)",
};

const INKT: Record<"sage" | "terra" | "amber", string> = {
  sage: "var(--vd-sage)",
  terra: "var(--vd-terra)",
  amber: "var(--vd-amber)",
};

function kleurVoor(rij: WeekRij): "sage" | "terra" | "amber" {
  if (!rij.bewijsbaar) return "amber";
  if (rij.gedekt) return "sage";
  return "terra";
}

export default function PatroonTelcirkels({
  rijen,
  dagenGeregistreerd,
}: {
  rijen: readonly WeekRij[];
  dagenGeregistreerd: number;
}) {
  return (
    <div>
      {rijen.map((rij) => {
        const toon = kleurVoor(rij);
        return (
          <div key={rij.nutrient} className="vd-telcirkel-rij">
            <span
              aria-hidden
              className="vd-telcirkel"
              style={{ background: KLEUR[toon], color: INKT[toon] }}
            >
              {rij.dagenMetBron}
            </span>
            <div className="vd-telcirkel-txt">
              <span className="vd-telcirkel-label" style={{ color: INKT[toon] }}>
                {rij.bewijsbaar
                  ? rij.gedekt
                    ? "Gedekt"
                    : "Bron aanwezig"
                  : "Niet aan te tonen"}
              </span>
              <span className="vd-telcirkel-naam">{rij.label}</span>
              <p className="vd-telcirkel-sub">
                Bron op {rij.dagenMetBron} van {dagenGeregistreerd}{" "}
                {dagenGeregistreerd === 1 ? "geregistreerde dag" : "geregistreerde dagen"}.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
