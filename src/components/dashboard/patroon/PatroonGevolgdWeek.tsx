"use client";

import type { GevolgdeWeekReeks } from "@/lib/nutrition-gevolgde-weken";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";

/**
 * De gevolgde stoffen in de bekeken week, op twee plekken in Je patroon:
 *
 * - `variant="kaarten"` op Samenvatting: dezelfde kaartvorm als
 *   `PatroonSamenvattingKaart` (gemiddelde links, zeven dagen als staafjes
 *   rechts), in één neutrale tint en zonder "gedekt".
 * - `variant="tabel"` op Deze week: dezelfde kolommen als de kernstoffentabel
 *   erboven (stof, gemiddelde, % RI), zonder link naar `/beste/*`.
 *
 * Informatief, zoals "Ook gevolgd" in het dagboek en onder de venstertabel.
 */

const DAGLETTER = ["m", "d", "w", "d", "v", "z", "z"] as const;

function hoofdletter(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function PatroonGevolgdWeek({
  reeksen,
  perDag,
  variant,
  onOpen,
}: {
  reeksen: readonly GevolgdeWeekReeks[];
  /** Per stof de zeven dagen; alleen nodig voor de kaarten. */
  perDag?: ReadonlyMap<string, readonly (number | null)[]>;
  variant: "kaarten" | "tabel";
  onOpen?: () => void;
}) {
  if (reeksen.length === 0) return null;

  if (variant === "kaarten") {
    return (
      <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label="Ook gevolgd deze week">
        {reeksen.map((reeks) => {
          const punt = reeks.punten[0];
          const dagen = perDag?.get(reeks.veld) ?? [];
          const hoogste = Math.max(reeks.ri ?? 0, ...dagen.map((d) => d ?? 0), 0.0001);
          return (
            <li key={reeks.veld}>
              <button type="button" onClick={onOpen} className="vd-kaart">
                <span className="vd-kaart-txt">
                  <b className="vd-kaart-naam">{hoofdletter(reeks.label)}</b>
                  <span className="vd-kaart-sub">Gem. deze week</span>
                  <span className="vd-kaart-waarde">
                    {punt?.gemiddeld === null || punt === undefined
                      ? "n.o."
                      : `${rondVoedingswaarde(punt.gemiddeld)} ${reeks.unit}`}
                  </span>
                  <span className="vd-kaart-ri">
                    {reeks.ri === null
                      ? "geen referentie"
                      : punt?.aandeel != null
                        ? `${Math.round(punt.aandeel * 100)}% van ${rondVoedingswaarde(reeks.ri)} ${reeks.unit} RI`
                        : `RI ${rondVoedingswaarde(reeks.ri)} ${reeks.unit}`}
                  </span>
                </span>

                <span aria-hidden className="vd-staafjes">
                  {dagen.map((waarde, index) => {
                    const hoogte = waarde === null ? 3 : Math.max(4, Math.round((waarde / hoogste) * 44));
                    return (
                      <span key={index} className="vd-staaf">
                        <span
                          style={{
                            height: `${hoogte}px`,
                            background: waarde === null ? "var(--vd-track)" : "var(--vd-ink-3)",
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
        })}
      </ul>
    );
  }

  return (
    <div className="vd-tabel vd-tabel--los">
      <div className="vd-tabel-kop vd-week-kop">
        <span>Ook gevolgd</span>
        <span>Gem.</span>
        <span>RI</span>
      </div>
      {reeksen.map((reeks) => {
        const punt = reeks.punten[0];
        const vulling = punt?.aandeel == null ? 0 : Math.min(Math.round(punt.aandeel * 100), 100);
        return (
          <div key={reeks.veld} className="vd-tabel-rij vd-week-rij">
            <span className="vd-naam">
              <span className="vd-naam-kop">{hoofdletter(reeks.label)}</span>
              <i>
                {punt === undefined || punt.dagen === 0
                  ? "nog niets geregistreerd"
                  : reeks.ri !== null
                    ? `RI ${rondVoedingswaarde(reeks.ri)} ${reeks.unit} — zonder oordeel`
                    : "gem. per geregistreerde dag"}
              </i>
            </span>
            <span className="vd-getal">
              {punt?.gemiddeld == null ? "n.o." : `${rondVoedingswaarde(punt.gemiddeld)} ${reeks.unit}`}
            </span>
            <span className="vd-cel">
              {vulling > 0 ? <span style={{ width: `${vulling}%`, background: "var(--vd-ink-3)" }} /> : null}
              <b data-gevuld={vulling > 0 ? "ja" : "nee"}>
                {punt?.aandeel == null ? "—" : percentageADH(punt.aandeel)}
              </b>
            </span>
          </div>
        );
      })}
    </div>
  );
}
