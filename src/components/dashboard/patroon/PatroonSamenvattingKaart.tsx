"use client";

import type { WeekRij } from "@/lib/nutrition-weekoverzicht";

/**
 * Eén stof als samenvattingskaart: het gemiddelde links, de week als staafjes
 * rechts, en een `>` die naar de detailweek gaat.
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

const DAGLETTER = ["M", "D", "W", "D", "V", "Z", "Z"] as const;

export default function PatroonSamenvattingKaart({ rij, dagen, onOpen }: Props) {
  // De schaal loopt tot de referentie of tot de hoogste dag — wat groter is.
  // Zonder die tweede helft loopt een zalmdag van 760 % buiten beeld en lijkt
  // hij gelijk aan een dag die precies de referentie haalt.
  const hoogste = Math.max(
    rij.referentie ?? 0,
    ...dagen.map((dag) => dag ?? 0),
    1,
  );

  const kleur = !rij.bewijsbaar
    ? "#C99A3C"
    : rij.gedekt
      ? "#5A8F6A"
      : "#C8956C";

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full cursor-pointer items-stretch gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 text-left transition-colors hover:border-white/20"
      >
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <span className="flex items-baseline gap-1.5">
            <b className="font-serif text-[15px] font-normal text-[#F1EFE8]">
              {rij.label}
            </b>
            {rij.gedekt ? <span className="text-[11px] text-[#5A8F6A]">✓</span> : null}
          </span>
          <span className="text-[10.5px] text-[#7E8C82]">Gem. deze week</span>
          <span className="font-serif text-[19px] font-normal leading-tight text-[#F1EFE8]">
            {rij.dagenMetBron === 0 ? "n.o." : `${rij.gemiddeld} ${rij.unit}`}
          </span>
          {rij.referentie !== null ? (
            <span className="font-mono text-[9.5px] tabular-nums text-[#6F8177]">
              referentie {rij.referentie} {rij.unit}
            </span>
          ) : (
            <span className="font-mono text-[9.5px] tabular-nums text-[#6F8177]">
              eigen doel
            </span>
          )}
        </span>

        <span aria-hidden className="flex items-end gap-1 pb-4">
          {dagen.map((waarde, index) => {
            const hoogte =
              waarde === null ? 3 : Math.max(4, Math.round((waarde / hoogste) * 46));
            return (
              <span key={index} className="flex flex-col items-center gap-1">
                <span
                  className="block w-[7px] rounded-full"
                  style={{
                    height: `${hoogte}px`,
                    background: waarde === null ? "rgba(255,255,255,0.10)" : kleur,
                  }}
                />
                <i className="text-[8.5px] not-italic text-[#6F8177]">
                  {DAGLETTER[index]}
                </i>
              </span>
            );
          })}
        </span>

        <span aria-hidden className="flex items-center text-[16px] text-[#6F8177]">
          ›
        </span>
      </button>
    </li>
  );
}
