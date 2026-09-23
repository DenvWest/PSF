"use client";

import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";
import type { WeekRij } from "@/lib/nutrition-weekoverzicht";

/**
 * Eén stof als samenvattingskaart: het gemiddelde links, de week als staafjes
 * rechts, en een chevron naar de detailweek.
 *
 * ## Waarom staafjes en geen ring
 *
 * De ring op tab 1 toont één dag — daar is "waar sta je nu" de vraag, en een
 * ring leest als een stand. Hier is de vraag "hoe liep je week", en dan moet
 * je de dagen náást elkaar zien: zeven staafjes laten zien dat maandag en
 * dinsdag leeg waren en dat het gemiddelde uit drie dagen komt. Een ring zou
 * dat wegmiddelen tot één getal dat niets zegt over hoe het is opgebouwd.
 *
 * ## Waarom een lege dag een lijn krijgt en geen staaf van nul
 *
 * Een staaf van nul beweert dat je die dag niets binnenkreeg. Een dag zonder
 * registratie is niet nul maar onbekend, en dat verschil is de kern van de
 * ondergrens-regel. Daarom krijgt een lege dag een dunne grondlijn: zichtbaar
 * dat de dag bestaat, zonder te beweren wat erin zat.
 */

type Props = {
  rij: WeekRij;
  /** Per dag de ondergrens voor deze stof; null waar niets geregistreerd is. */
  dagen: readonly (number | null)[];
  onOpen: () => void;
};

const DAGLETTER = ["m", "d", "w", "d", "v", "z", "z"] as const;

export default function PatroonSamenvattingKaart({ rij, dagen, onOpen }: Props) {
  // De schaal loopt tot de referentie of tot de hoogste dag — wat groter is.
  // Zonder die tweede helft loopt een zalmdag van 760 % buiten beeld en lijkt
  // hij gelijk aan een dag die precies de referentie haalt.
  const hoogste = Math.max(rij.referentie ?? 0, ...dagen.map((d) => d ?? 0), 1);

  const kleur = !rij.bewijsbaar
    ? "var(--vd-amber)"
    : rij.gedekt
      ? "var(--vd-sage)"
      : "var(--vd-terra)";

  return (
    <li>
      <button type="button" onClick={onOpen} className="vd-kaart">
        <span className="vd-kaart-txt">
          <span style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
            <b className="vd-kaart-naam">{rij.label}</b>
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
          <span className="vd-kaart-sub">Gem. deze week</span>
          <span className="vd-kaart-waarde">
            {rij.dagenMetBron === 0
              ? "n.o."
              : `${hoeveelheid(rij.gemiddeld)} ${rij.unit}`}
          </span>
          <span className="vd-kaart-ri">
            {rij.referentie === null
              ? "eigen doel"
              : `van ${rij.referentie} ${rij.unit} ADH`}
          </span>
        </span>

        <span aria-hidden className="vd-staafjes">
          {dagen.map((waarde, index) => {
            const hoogte =
              waarde === null ? 3 : Math.max(4, Math.round((waarde / hoogste) * 44));
            return (
              <span key={index} className="vd-staaf">
                <span
                  style={{
                    height: `${hoogte}px`,
                    background: waarde === null ? "var(--vd-track)" : kleur,
                  }}
                />
                <i>{DAGLETTER[index]}</i>
              </span>
            );
          })}
        </span>

        <span aria-hidden className="vd-chevron">
          ›
        </span>
      </button>
    </li>
  );
}
