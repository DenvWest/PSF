"use client";

import { useState, type ReactNode } from "react";
import { FactMicroReeks } from "@/components/dashboard/voortgang/MeetreeksChart";
import {
  BALK_ZONES,
  heeftStatusKleur,
  markerPositie,
  STATUS_KLEUR,
  surfaceStyles,
} from "@/lib/dashboard-surface";
import type { LadderEvidenceRow } from "@/lib/domain-ladder-readout";
import type { WerkbankPrioriteit } from "@/lib/domein-werkbank";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";
import type { Meetreeks } from "@/lib/voortgang-meetreeks";

/**
 * Het werkvlak — de prioriteit die je koos, over de volle breedte.
 *
 * De tegenhanger van `PrioriteitKolom`, en de reden dat die kolom bestaat:
 * omdat de inhoud hier staat en niet in een accordeonrij, mag hij zo groot zijn
 * als hij is. `VoedingsbasisOverzicht` was niet te groot — hij stond in een
 * uitklaprij van ~744px waar hij niet in paste.
 *
 * **De kopbalk.** Dezelfde vorm als de catalogus op /supplementen: naam links,
 * telling en keuzes rechts, met een lijn eronder. Die balk is wat een scherm
 * een werkvlak maakt in plaats van een lange pagina — hij zegt waar je bent en
 * wat je hier kunt veranderen, op vaste hoogte.
 */

const STAAT_KLEUR: Record<LeefstijlLayerState, string> = {
  winst: "#C8956C",
  ok: "#5A8F6A",
  watch: "#C99A3C",
  wacht: "rgba(255,255,255,0.16)",
};

/**
 * Waar dit feit staat ten opzichte van de richtlijn, als balk.
 *
 * De drie zones zijn vast en horen bij de richtlijn, niet bij jouw antwoord —
 * daarom verspringen ze niet per rij. De marker staat in het midden van zijn
 * zone omdat de check frequentie meet en geen hoeveelheid: er is geen ratio
 * tussen jouw antwoord en de lat die we kunnen verdedigen. Dat is vastgelegd
 * in `dashboard-surface.ts` en hier alleen getekend.
 *
 * Rijen zonder richtlijn (`own`) krijgen geen balk. Een balk zonder lat zou een
 * positie tonen op een schaal die niet bestaat.
 */
function VerhoudingBalk({ status }: { status: string }) {
  if (!heeftStatusKleur(status)) {
    return null;
  }
  const positie = markerPositie(status);
  return (
    <div className="mt-1.5 flex h-1.5 w-full max-w-[220px] overflow-hidden rounded-full">
      {BALK_ZONES.map((zone) => (
        <span
          key={zone.status}
          aria-hidden
          className="relative h-full"
          style={{
            width: `${zone.breedte}%`,
            backgroundColor:
              zone.status === status ? STATUS_KLEUR[zone.status] : "rgba(255,255,255,0.07)",
          }}
        />
      ))}
      <span className="sr-only">{positie}%</span>
    </div>
  );
}

/**
 * De lat met zijn bron, zonder die bron twee keer te noemen.
 *
 * De meeste `benchmarkLabel`s dragen hun bron al tussen haakjes ("…(WHO
 * 2020)"), en `benchmarkSource` bevat dan exact hetzelfde. Overgenomen uit
 * `PrioriteitenLadder` — dezelfde feiten op hetzelfde scherm mogen niet in twee
 * bewoordingen bestaan.
 */
function latRegel(fact: LadderEvidenceRow): string {
  const label = fact.benchmarkLabel ?? "";
  const source = fact.benchmarkSource;
  if (!source || label.includes(source)) {
    return label;
  }
  return `${label} (${source})`;
}

const STATUS_WOORD: Record<string, { label: string; className: string }> = {
  below: { label: "hier zit je onder", className: "text-[#C8956C]" },
  near: { label: "hier zit je rond", className: "text-[#C99A3C]" },
  meets: { label: "die haal je", className: "text-[#9CC5A9]" },
};

/**
 * De feiten van deze prioriteit: wat jij zei, waar dat ligt, en — waar de reeks
 * het draagt — hoe het bewoog.
 *
 * **Wat hier bewust wél blijft staan.** De lat en de reden waarom dit feit
 * meetelt: dat is het antwoord zelf, niet de verantwoording eromheen. Wat naar
 * de onderbouwing-knop verhuisde zijn de voetnoten en de losse bronvermelding —
 * de regels die je één keer nakijkt en daarna niet meer wilt zien.
 *
 * De balk komt bovenop de latregel in plaats van ervoor in de plaats: de balk
 * toont de positie in één oogopslag, de regel zegt waaraan die positie hangt.
 * Zonder die regel is de balk een kleur zonder betekenis.
 */
function Feitenlijst({
  rijen,
  meetreeks,
  kleur,
}: {
  rijen: readonly LadderEvidenceRow[];
  meetreeks: Meetreeks | null;
  kleur: string;
}) {
  const s = surfaceStyles("dashboard");
  const [openFeit, setOpenFeit] = useState<string | null>(null);

  if (rijen.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className={`m-0 mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] ${s.zacht}`}>
        Jij mat
      </p>
      <ul className="m-0 flex list-none flex-col gap-3.5 p-0" role="list">
        {rijen.map((rij) => {
          const reeksRow = meetreeks?.valueRows.find((row) => row.key === rij.key) ?? null;
          const kanPlotten = reeksRow?.plottable === true;
          const isOpen = openFeit === rij.key;
          // Alleen een lat waar er één ís, en alleen waar de reeks op een
          // richtlijn rust: zonder norm is er niets om onder of boven te staan.
          const toonLat =
            Boolean(rij.benchmarkLabel) &&
            (reeksRow == null || reeksRow.scale === "richtlijn");
          const woord = toonLat ? STATUS_WOORD[rij.status ?? "own"] : undefined;

          return (
            <li key={rij.key} className="min-w-0">
              {kanPlotten ? (
                <button
                  type="button"
                  onClick={() => setOpenFeit((huidig) => (huidig === rij.key ? null : rij.key))}
                  aria-expanded={isOpen}
                  className="w-full cursor-pointer border-none bg-transparent p-0 text-left font-[inherit]"
                >
                  <span className={`block text-[13px] leading-snug ${s.tekst}`}>
                    {rij.label}
                    {" · "}
                    {rij.answerLabel}
                  </span>
                  <span className={`mt-0.5 block text-[11.5px] ${s.knop}`}>
                    {isOpen ? "Verberg de reeks" : "Over tijd"}
                  </span>
                </button>
              ) : (
                <p className={`m-0 text-[13px] leading-snug ${s.tekst}`}>
                  {rij.label}
                  {" · "}
                  {rij.answerLabel}
                </p>
              )}

              <VerhoudingBalk status={toonLat ? (rij.status ?? "own") : "own"} />

              {toonLat ? (
                <p className={`m-0 mt-1 text-[12px] leading-relaxed ${s.zacht} text-pretty`}>
                  <span className="font-semibold uppercase tracking-[0.08em] text-[#7E8C82]">
                    De lat
                  </span>
                  {" · "}
                  {latRegel(rij)}
                  {woord ? (
                    <>
                      {" · "}
                      <span className={woord.className}>{woord.label}</span>
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="m-0 mt-1 text-[12px] leading-relaxed text-[#7E8C82] text-pretty">
                  Geen richtlijn — dit is jouw eigen antwoord.
                </p>
              )}

              {rij.whyLine ? (
                <p className="m-0 mt-1 text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
                  {rij.whyLine}
                </p>
              ) : null}

              {isOpen && reeksRow && meetreeks ? (
                <FactMicroReeks row={reeksRow} moments={meetreeks.moments} color={kleur} />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function PrioriteitWerkvlak({
  prioriteit,
  aantal,
  totaal,
  feiten,
  meetreeks,
  kleur,
  staatLabel,
  waaromWachten,
  onderbouwing,
  kompasHref,
  onKompas,
  children,
}: {
  prioriteit: WerkbankPrioriteit;
  /** De hoeveelste van hoeveel — dezelfde telling als de catalogus toont. */
  aantal: number;
  totaal: number;
  feiten: readonly LadderEvidenceRow[];
  /** De cyclusreeks van dit domein — voedt de micro-reeks per feit. */
  meetreeks: Meetreeks | null;
  /** De domeinkleur, voor de micro-reeks. */
  kleur: string;
  staatLabel: string | null;
  /** Waarom deze prioriteit kan wachten, als de check dat zegt. */
  waaromWachten: string | null;
  /** De onderbouwing-knop op mobiel, waar de kolom hem niet toont. */
  onderbouwing?: ReactNode;
  /**
   * Waar "Kies dit op Kompas" naartoe wijst. Alleen op domeinen met een eigen
   * Kompas-scherm: dit scherm is het dossier, kiezen gebeurt daar.
   */
  kompasHref?: string;
  onKompas?: () => void;
  /** De inhoud van deze prioriteit — bij voeding de bestaande panelen. */
  children?: ReactNode;
}) {
  const s = surfaceStyles("dashboard");

  return (
    <section aria-label={prioriteit.naam} className="min-w-0">
      <div className={`flex items-center justify-between gap-3 border-b pb-3 ${s.rij}`}>
        {/* De teller staat naast de kop en niet erin: als hij binnen de <h2>
            valt, leest een schermlezer "Meten & timing prioriteit 5 van 6" als
            één naam. De kop noemt de prioriteit, de teller zegt waar je bent. */}
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className={`m-0 min-w-0 text-[15px] font-semibold leading-snug ${s.tekst}`}>
            {prioriteit.naam}
          </h2>
          <span className={`shrink-0 text-[12.5px] ${s.zacht}`}>
            prioriteit {aantal} van {totaal}
          </span>
        </div>
        {staatLabel ? (
          <span
            className="flex shrink-0 items-center gap-1.5 text-[11.5px] font-semibold"
            style={{ color: prioriteit.staat ? STAAT_KLEUR[prioriteit.staat] : undefined }}
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: prioriteit.staat
                  ? STAAT_KLEUR[prioriteit.staat]
                  : "transparent",
              }}
            />
            {staatLabel}
          </span>
        ) : null}
      </div>

      <p className={`m-0 mt-3 max-w-[62ch] text-[13px] leading-relaxed ${s.zacht} text-pretty`}>
        {prioriteit.samenvatting}
      </p>

      {waaromWachten ? (
        <p
          className={`m-0 mt-2 max-w-[62ch] rounded-lg bg-white/[0.035] px-3 py-2 text-[12px] leading-relaxed ${s.zacht} text-pretty`}
        >
          {waaromWachten}
        </p>
      ) : null}

      <Feitenlijst rijen={feiten} meetreeks={meetreeks} kleur={kleur} />

      {onderbouwing ? <div className="mt-4 lg:hidden">{onderbouwing}</div> : null}

      {children}

      {kompasHref ? (
        <a
          href={kompasHref}
          onClick={onKompas}
          className={`mt-4 inline-flex cursor-pointer items-center gap-1 text-[13px] font-semibold no-underline ${s.knop}`}
        >
          Kies dit op Kompas ›
        </a>
      ) : null}
    </section>
  );
}
