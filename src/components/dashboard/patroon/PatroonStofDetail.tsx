"use client";

import Link from "next/link";
import PatroonBronZoek from "@/components/dashboard/patroon/PatroonBronZoek";
import { isInformatieveStof } from "@/lib/nutrition-rijkste-bronnen";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { Voedingsnorm } from "@/data/nutrition/voedingsnormen";
import { normLabel } from "@/lib/nutrition-normen";
import { periodeLabel, type Periode } from "@/lib/nutrition-periode";
import type { EetmomentId } from "@/lib/nutrition-eetmomenten";
import { isKernstof, type PatroonStof } from "@/lib/nutrition-stof-meting";
import { ruimteBij, type StofBron, type StofPerMoment } from "@/lib/nutrition-stof-bronnen";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { useKernstofProfiel } from "@/lib/use-kernstof-normen";

/**
 * Wat het stof-detail over één stof in de gekozen periode weet. Kernstoffen en
 * gevolgde stoffen vullen dezelfde vorm (`PatroonScherm`), zodat calcium of
 * ijzer hetzelfde detail krijgt als magnesium: norm met bron, jouw bronnen,
 * per maaltijd, rijkste bronnen en, waar die bestaat, de supplementvergelijking.
 */
export type StofDetailGegevens = {
  stof: PatroonStof;
  label: string;
  unit: string;
  lezing: "per_dag" | "periodetotaal";
  gemiddeld: number;
  totaal: number;
  aandeel: number | null;
  normPeriode: number | null;
  bewijsbaar: boolean;
  gedekt: boolean | null;
  norm: Voedingsnorm | null;
  streef: number | null;
  /** `/beste/*` van deze stof, of null zolang er geen vergelijking is. */
  vergelijkingPad: string | null;
  /** Uitleg als er geen vaste norm is (eiwit, vezels zonder gewicht). */
  zonderNormUitleg: string;
};

/**
 * Eén stof uitgeklapt in Per stof: de norm met bron en voor wie hij
 * geldt, waar je hem deze periode vandaan haalde, en de rijkste
 * voedingsbronnen. Pas daaronder de supplementvergelijking.
 *
 * ## Voeding eerst, supplement als laatste stap
 *
 * Tot 5 oktober linkte elke rij in de stoffentabel direct naar `/beste/*`.
 * Dat las als "je hebt een supplement nodig", terwijl het tekortsysteem
 * nooit een tekort kan bewijzen. Nu zie je eerst wat voeding levert; de
 * vergelijking blijft bereikbaar en houdt zijn meetpunt
 * (`nutrition_week_nutrient_clicked`).
 *
 * ## Geen diagnose
 *
 * Een norm is gemaakt voor een groep. Onder de norm zitten is geen tekort;
 * dat stelt een arts vast, met klachten en bloedonderzoek. Dat staat
 * letterlijk op het scherm.
 */

const NORM_BRON_VOLUIT: Record<string, string> = {
  "Gezondheidsraad 2018": "Gezondheidsraad (2018), Voedingsnormen vitamines en mineralen voor volwassenen",
  "Gezondheidsraad 2001": "Gezondheidsraad (2001), Voedingsnormen: energie, eiwitten, vetten en verteerbare koolhydraten",
  "Gezondheidsraad 2012": "Gezondheidsraad (2012), Evaluatie van de voedingsnormen voor vitamine D",
  "EFSA 2013": "EFSA (2013), Scientific Opinion on Dietary Reference Values for vitamin C",
  "EFSA 2015": "EFSA (2015), Scientific Opinion on Dietary Reference Values for cobalamin (vitamin B12)",
  "NNR 2023": "Nordic Nutrition Recommendations 2023",
};

const MAX_MOMENTEN = 3;

function dagLabel(datum: string): string {
  return new Date(`${datum}T00:00:00Z`).toLocaleDateString("nl-NL", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "ma 29 sep avondeten · wo 1 okt lunch +2", of alleen de maaltijd bij één dag. */
function wanneerTekst(momenten: StofBron["momenten"], eenDag: boolean, labels: Record<EetmomentId, string>): string {
  const delen = momenten
    .slice(0, MAX_MOMENTEN)
    .map(({ datum, moment }) =>
      eenDag ? labels[moment].toLowerCase() : `${dagLabel(datum)} ${labels[moment].toLowerCase()}`,
    );
  const rest = momenten.length - MAX_MOMENTEN;
  return `${delen.join(" · ")}${rest > 0 ? ` +${rest}` : ""}`;
}

export default function PatroonStofDetail({
  rij,
  periode,
  dagenGeregistreerd,
  bronnen,
  perMoment = [],
  startZoek = "",
  onTerug,
}: {
  rij: StofDetailGegevens;
  periode: Periode;
  dagenGeregistreerd: number;
  bronnen: readonly StofBron[];
  perMoment?: readonly StofPerMoment[];
  startZoek?: string;
  onTerug: () => void;
}) {
  const { norm, streef } = rij;
  const profiel = useKernstofProfiel();
  const nutrient = rij.stof;
  const totaal = bronnen.reduce((som, bron) => som + bron.totaal, 0);
  const eenDag = periode.van === periode.tot;
  const momentLabels = Object.fromEntries(perMoment.map((m) => [m.moment, m.label])) as Record<EetmomentId, string>;
  const momentTotaal = perMoment.reduce((som, m) => som + m.totaal, 0);
  const ruimte = ruimteBij(perMoment, momentTotaal);
  const uitSupplement = bronnen.filter((b) => b.supplement).reduce((som, b) => som + b.totaal, 0);

  return (
    <section aria-labelledby="patroon-stof-titel" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onTerug} className="vd-blader" aria-label="Terug naar alle stoffen">
          ‹
        </button>
        <h3 id="patroon-stof-titel" className="text-[1.0625rem] text-[var(--vd-ink)]">
          {rij.label}
        </h3>
        <span className="vd-tag ml-auto">{periodeLabel(periode)}</span>
      </div>

      <div className="rounded-xl border border-[var(--vd-line)] bg-[var(--vd-surface)] p-3">
        <p className="m-0 text-[0.8125rem] text-[var(--vd-ink)]">
          {dagenGeregistreerd === 0 ? (
            "In deze periode staat niets geregistreerd."
          ) : rij.lezing === "periodetotaal" ? (
            <>
              Minstens <b>{hoeveelheid(rij.totaal)} {rij.unit}</b> in deze periode
              {rij.normPeriode !== null ? (
                <>
                  {" "}
                  — de norm over {periodeLabel(periode)} is {hoeveelheid(rij.normPeriode)} {rij.unit} (
                  {percentageADH(rij.aandeel)}).
                </>
              ) : null}
            </>
          ) : (
            <>
              Gemiddeld minstens <b>{hoeveelheid(rij.gemiddeld)} {rij.unit}</b> per geregistreerde dag
              {norm !== null && rij.bewijsbaar ? <> ({percentageADH(rij.aandeel)} van de norm)</> : null}
              , over {dagenGeregistreerd} {dagenGeregistreerd === 1 ? "dag" : "dagen"}.
            </>
          )}
        </p>

        {norm ? (
          <dl className="m-0 mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.75rem]">
            <dt className="text-[var(--vd-ink-3)]">Norm</dt>
            <dd className="m-0 text-[var(--vd-ink)]">
              {normLabel(norm)} per dag
              {nutrient === "omega3"
                ? profiel.voedingswijze
                  ? " EPA+DHA — zonder vis komt dat vooral uit algen(olie)"
                  : " EPA+DHA — in de richtlijn: 1× per week vis, bij voorkeur vette vis"
                : ""}
            </dd>
            <dt className="text-[var(--vd-ink-3)]">Geldt voor</dt>
            <dd className="m-0 text-[var(--vd-ink)]">{norm.geldtVoor}</dd>
            <dt className="text-[var(--vd-ink-3)]">Bron</dt>
            <dd className="m-0 text-[var(--vd-ink)]">{NORM_BRON_VOLUIT[norm.bron] ?? norm.bron}</dd>
            <dt className="text-[var(--vd-ink-3)]">Jouw streefwaarde</dt>
            <dd className="m-0 text-[var(--vd-ink)]">
              {streef !== null ? `${hoeveelheid(streef)} ${norm.unit} per dag — "gehaald" blijft tegen de norm` : "niet ingesteld"}
              {" · "}
              <Link
                href="/dashboard/doelen"
                onClick={() => trackEvent("nutrition_patroon_norm_aanpassen_click", { nutrient })}
              >
                aanpassen
              </Link>
            </dd>
          </dl>
        ) : (
          <p className="vd-note mb-0">
            {rij.zonderNormUitleg} Zie <Link href="/dashboard/doelen">Je doelen</Link>.
          </p>
        )}

        <p className="vd-note mb-0">
          {!rij.bewijsbaar
            ? "Een dagboek kan deze stof niet aantonen: de belangrijkste bron is niet je bord (zon, verrijking) of het gehalte per portie ligt ver onder de norm. Daarom geen oordeel. "
            : ""}
          Een norm is gemaakt voor een groep. Wat je registreert is een ondergrens, en eronder zitten is geen
          tekort — dat stelt alleen een arts vast, met klachten en bloedonderzoek.
        </p>
      </div>

      {momentTotaal > 0 ? (
        <div className="vd-tabel">
          <div className="vd-tabel-kop grid-cols-[1fr_auto_44px]">
            <span className="!text-left">Per maaltijd</span>
            <span>{eenDag ? "" : "Totaal"}</span>
            <span>Deel</span>
          </div>
          {perMoment.map((m) => (
            <div key={m.moment} className="vd-tabel-rij grid-cols-[1fr_auto_44px]">
              <span className="vd-naam">
                {m.label}
                {!eenDag && m.keer > 0 ? <i>{m.keer} keer geregistreerd</i> : null}
              </span>
              <span className="vd-getal">
                {m.keer === 0 ? (
                  <i className="text-[var(--vd-ink-4)]">niet geregistreerd</i>
                ) : (
                  `${hoeveelheid(m.totaal)} ${rij.unit}`
                )}
              </span>
              <span className="vd-getal">
                {m.keer === 0 ? "—" : `${Math.round((m.totaal / momentTotaal) * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {ruimte ? (
        <p className="vd-tag m-0">
          Je {ruimte.label.toLowerCase()} leverde {Math.round((ruimte.totaal / momentTotaal) * 100)}% van je{" "}
          {rij.label.toLowerCase()} — daar zit de meeste ruimte.
        </p>
      ) : null}

      <div className="vd-tabel">
        <div className="vd-tabel-kop">
          <span className="!text-left">Jouw bronnen in deze periode</span>
        </div>
        {bronnen.length === 0 ? (
          <div className="vd-tabel-rij">
            <span className="vd-naam">
              <i>Geen geregistreerd product leverde {rij.label.toLowerCase()}.</i>
            </span>
          </div>
        ) : (
          bronnen.slice(0, 8).map((bron) => (
            <div key={bron.naam} className="vd-tabel-rij grid-cols-[1fr_auto]">
              <span className="vd-naam">
                {bron.naam}
                <i>
                  {bron.supplement ? "supplement · " : ""}
                  {perMoment.length > 0
                    ? wanneerTekst(bron.momenten, eenDag, momentLabels)
                    : `${bron.dagen} ${bron.dagen === 1 ? "dag" : "dagen"}`}
                </i>
              </span>
              <span className="vd-getal">
                {hoeveelheid(bron.totaal)} {bron.unit}
                {totaal > 0 ? ` · ${Math.round((bron.totaal / totaal) * 100)}%` : ""}
              </span>
            </div>
          ))
        )}
      </div>
      {uitSupplement > 0 && totaal > 0 ? (
        <p className="vd-tag m-0">{Math.round((uitSupplement / totaal) * 100)}% hiervan kwam uit supplementen.</p>
      ) : null}

      {isKernstof(nutrient) || isInformatieveStof(nutrient) ? (
        <PatroonBronZoek
          nutrient={nutrient}
          label={rij.label}
          unit={rij.unit}
          norm={norm?.waarde ?? null}
          voedingswijze={profiel.voedingswijze}
          startZoek={startZoek}
          standaardMoment={ruimte?.moment ?? "ontbijt"}
        />
      ) : null}

      {rij.vergelijkingPad ? (
        <p className="m-0 text-[0.75rem] text-[var(--vd-ink-3)]">
          Lukt het niet via voeding?{" "}
          <Link
            href={rij.vergelijkingPad}
            onClick={() => {
              trackEvent("nutrition_week_nutrient_clicked", {
                nutrient,
                gedekt: rij.gedekt === true,
                destination: rij.vergelijkingPad ?? "",
              });
              emitAccountClientEvent("nutrition.week_nutrient_clicked", {
                nutrient,
                covered: rij.gedekt === true,
                days_logged: dagenGeregistreerd,
              });
              clarityTag("nutrition_weekoverzicht", `stof_${nutrient}`);
            }}
            className="text-[var(--vd-ink-2)] underline"
          >
            Supplementen met {rij.label} vergelijken
          </Link>
        </p>
      ) : (
        <p className="m-0 text-[0.75rem] text-[var(--vd-ink-3)]">
          Voor {rij.label.toLowerCase()} hebben we (nog) geen supplementvergelijking: hier gaat het via voeding.
        </p>
      )}
    </section>
  );
}
