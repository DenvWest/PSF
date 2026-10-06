"use client";

import { isStreefStof } from "@/lib/account-kernstof-profiel";
import type { GevolgdeWeekReeks } from "@/lib/nutrition-gevolgde-weken";
import { normLabel, normVoorVeld } from "@/lib/nutrition-normen";
import type { PatroonStof } from "@/lib/nutrition-stof-meting";
import { percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { rondVoedingswaarde } from "@/lib/nutrition-voedingswaarde";
import { useGevolgdeNormen, useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * De gevolgde stoffen over de gekozen periode, onder de kernstoffentabel in
 * Per stof. Zelfde vorm als de kernstoffen: stof · norm · bron, gemiddelde,
 * deel van de norm. Een tik opent hetzelfde stof-detail (jouw bronnen, per
 * maaltijd, rijkste bronnen), zodat een gevolgde stof dezelfde route naar
 * voeding krijgt (`BESLUIT_PATROON_STOF_EN_TREND_2026-10.md` §3).
 *
 * Informatief: de balk blijft neutraal, geen "gehaald"-pil. Een eigen
 * streefwaarde (Je doelen) staat als tweede regel.
 */

function hoofdletter(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function PatroonGevolgdWeek({
  reeksen,
  onOpen,
}: {
  reeksen: readonly GevolgdeWeekReeks[];
  onOpen?: (stof: PatroonStof) => void;
}) {
  const { streefwaarden } = useKernstofProfiel();
  const normen = useGevolgdeNormen();
  if (reeksen.length === 0) return null;

  return (
    <div className="vd-tabel vd-tabel--los">
      <div className="vd-tabel-kop grid-cols-[1fr_64px_72px_20px]">
        <span>Ook gevolgd · norm · bron</span>
        <span>Gem./dag</span>
        <span>Van norm</span>
        <span aria-hidden />
      </div>
      {reeksen.map((reeks) => {
        const punt = reeks.punten[0];
        const vulling = punt?.aandeel == null ? 0 : Math.min(Math.round(punt.aandeel * 100), 100);
        const streef = isStreefStof(reeks.veld) ? (streefwaarden[reeks.veld] ?? null) : null;
        const norm = normen ? normVoorVeld(normen, reeks.veld) : null;
        return (
          <button
            key={reeks.veld}
            type="button"
            onClick={() => onOpen?.(reeks.veld)}
            className="vd-tabel-rij w-full cursor-pointer grid-cols-[1fr_64px_72px_20px] border-x-0 border-t-0 bg-transparent text-left font-[inherit] text-inherit hover:bg-[var(--vd-surface-2)]"
          >
            <span className="vd-naam">
              <span className="vd-naam-kop">{hoofdletter(reeks.label)}</span>
              <i>
                {punt === undefined || punt.dagen === 0
                  ? "nog niets geregistreerd"
                  : norm
                    ? `${normLabel(norm)} · ${norm.geldtVoor} · ${norm.bron}`
                    : reeks.norm !== null
                      ? `norm ${rondVoedingswaarde(reeks.norm)} ${reeks.unit}`
                      : "geen norm · gem. per geregistreerde dag"}
              </i>
              {streef !== null ? (
                <i>
                  eigen streefwaarde {rondVoedingswaarde(streef)} {reeks.unit}/dag
                  {punt?.gemiddeld != null && punt.dagen > 0 ? ` · ${percentageADH(punt.gemiddeld / streef)}` : ""}
                </i>
              ) : null}
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
            <span className="vd-trend" data-richting="vlak" aria-hidden>
              ›
            </span>
          </button>
        );
      })}
    </div>
  );
}
