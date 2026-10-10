"use client";

import PatroonTrendGrafiek, { gearceerd, getint, stofKleur } from "@/components/dashboard/patroon/PatroonTrendGrafiek";
import PatroonTrendTabel from "@/components/dashboard/patroon/PatroonTrendTabel";
import { trackEvent } from "@/lib/ga4";
import type { PatroonStof } from "@/lib/nutrition-stof-meting";
import type { StofTrend } from "@/lib/nutrition-stof-trend";

/**
 * De trend per stof over de gekozen periode, met per stof de feiten waarom
 * hij (nog) niet aan de norm voldoet.
 *
 * ## Waarom staafjes en geen lijngrafiek
 *
 * Een lijn suggereert een continue meting tussen de punten in: als je een dag
 * niet registreerde, tekent een lijn er dwars doorheen een waarde bij die er
 * niet is. Staafjes met een lege plek zijn eerlijker. Een lijn die breekt bij
 * een lege dag is op 7 okt 2026 geprobeerd en weer weggehaald: niet mooi.
 *
 * ## Alles samen
 *
 * Bovenaan één tabel met alle stoffen per dag en een ✓ waar de lat gehaald is
 * (`PatroonTrendTabel`). Een tik op een rij springt naar de grafiek.
 *
 * ## "Waarom niet" in feiten
 *
 * Naast elke grafiek staat wat het systeem echt weet: op hoeveel volledige dagen
 * je gemiddeld wat haalde, welke dagen een hoofdmaaltijd missen (daar is onder
 * de norm geen antwoord), wat er per maaltijd wél te zeggen is, en welke
 * producten geen gehalte hebben. Geen "je hebt een tekort": een norm geldt
 * voor een groep, en een tekort stelt een arts vast.
 *
 * Een tik op de naam opent het stof-detail in Per stof (bronnen, norm,
 * rijkste bronnen), dezelfde plek voor kernstoffen en gevolgde stoffen.
 */

/** De legenda in de kleur van de eerste kernstof zou één stof voortrekken; neutraal dus. */
const LEGENDA = "var(--vd-ink-2)";

function hoofdletter(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function kaartId(stof: PatroonStof): string {
  return `patroon-trend-${stof}`;
}

function StofKaart({
  trend,
  onOpen,
}: {
  trend: StofTrend;
  onOpen: (stof: PatroonStof) => void;
}) {
  return (
    <li
      id={kaartId(trend.stof)}
      className="scroll-mt-4 rounded-[16px] border border-[var(--vd-line)] bg-gradient-to-br from-[var(--vd-surface-2)] to-[var(--vd-surface)] p-4"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => onOpen(trend.stof)}
          className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left font-[inherit]"
        >
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: stofKleur(trend) }} />
          <b className="font-[family-name:var(--f-serif)] text-[1.25rem] font-normal leading-none text-[var(--vd-ink)]">{hoofdletter(trend.label)}</b>
          <span className="text-[var(--vd-ink-4)]">›</span>
        </button>
        <span className="text-[0.75rem] text-[var(--vd-ink-2)]">{trend.kop}</span>
      </div>

      {trend.bewijsbaar ? (
        <PatroonTrendGrafiek trend={trend} redenen={trend.redenen} />
      ) : trend.redenen.length > 0 ? (
        <ul
          aria-label={`Waarom ${trend.label.toLowerCase()} niet aan de norm voldoet`}
          className="m-0 flex list-none flex-col gap-1 p-0 text-[12px] leading-snug text-[var(--vd-ink-2)]"
        >
          {trend.redenen.map((reden) => (
            <li key={reden}>{reden}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function PatroonTrend({
  kernstoffen,
  gevolgd,
  onOpen,
}: {
  kernstoffen: readonly StofTrend[];
  gevolgd: readonly StofTrend[];
  onOpen: (stof: PatroonStof) => void;
}) {
  const schaal = kernstoffen[0]?.schaal ?? gevolgd[0]?.schaal;
  const springNaar = (stof: PatroonStof) => {
    document.getElementById(kaartId(stof))?.scrollIntoView({ behavior: "smooth", block: "start" });
    trackEvent("nutrition_patroon_trend_tabel_rij", { nutrient: stof });
  };

  return (
    <div className="flex flex-col gap-4">
      <PatroonTrendTabel trends={[...kernstoffen, ...gevolgd]} onKies={springNaar} />


      <section aria-label="Zo lees je de grafieken" className="vd-note flex flex-col gap-2" style={{ margin: 0 }}>
        <p className="m-0">
          {schaal === "maaltijd"
            ? "Elke staaf is één maaltijd en laat zien hoeveel van je dagdoel die maaltijd gaf. Eén maaltijd haalt nooit je hele dagdoel, dus hier geen oordeel."
            : schaal === "dag"
              ? "Elke staaf is één dag en werkt als een glas: tot de rand vol is je doel gehaald. Onder de dag staat hoeveel maaltijden je opschreef (3/3 = alles)."
              : "Elke staaf is één week en laat je gemiddelde per dag zien. Het glas is vol als je gemiddeld je doel haalde. Onder de week staat op hoeveel dagen je iets opschreef."}
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: LEGENDA }} />
            Vol met ✓: doel gehaald
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: getint(LEGENDA, 40) }} />
            Lichter: nog niet gehaald
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-sm border"
              style={{ background: gearceerd(LEGENDA), borderColor: getint(LEGENDA, 60) }}
            />
            Streepjes: niet alles opgeschreven, dus nog onbekend
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-sm border border-dashed"
              style={{ borderColor: getint(LEGENDA, 70) }}
            />
            Stippellijn: een gok op wat je meestal eet in een ontbrekende maaltijd
          </li>
        </ul>
      </section>

      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {kernstoffen.map((trend) => (
          <StofKaart key={trend.stof} trend={trend} onOpen={onOpen} />
        ))}
      </ul>

      {gevolgd.length > 0 ? (
        <section aria-labelledby="patroon-trend-gevolgd" className="flex flex-col gap-3">
          <p id="patroon-trend-gevolgd" className="vd-eyebrow" style={{ margin: "0.5rem 0 0" }}>
            Ook gevolgd · zonder oordeel
          </p>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {gevolgd.map((trend) => (
              <StofKaart key={trend.stof} trend={trend} onOpen={onOpen} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
