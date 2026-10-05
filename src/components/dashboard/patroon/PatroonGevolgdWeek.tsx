"use client";

import type { GevolgdeWeekReeks } from "@/lib/nutrition-gevolgde-weken";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";

/**
 * De gevolgde stoffen over de gekozen periode, onder de kernstoffentabel in
 * Per stof: stof, gemiddelde, % RI, zonder link naar `/beste/*`. Informatief,
 * zoals "Ook gevolgd" in het dagboek.
 */

function hoofdletter(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function PatroonGevolgdWeek({
  reeksen,
}: {
  reeksen: readonly GevolgdeWeekReeks[];
}) {
  if (reeksen.length === 0) return null;

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
