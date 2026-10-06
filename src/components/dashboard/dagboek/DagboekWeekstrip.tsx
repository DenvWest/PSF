"use client";

import { useState } from "react";
import MaandKalender, { maandVan } from "@/components/dashboard/shared/MaandKalender";
import { dagSoortVoor } from "@/lib/nutrition-dagboek";
import { verschuifDag } from "@/lib/nutrition-periode";

/**
 * De week als zeven knoppen, met de meetdagen gemarkeerd.
 *
 * ## Waarom de hele week en niet alleen de vier meetdagen
 *
 * Het dagboek vraagt om 2+2 — twee doordeweekse dagen en twee weekenddagen,
 * het kleinste aantal dat het verschil tussen je week en je weekend zichtbaar
 * maakt. Maar wie elke dag wil bijhouden moet dat kunnen: extra dagen maken je
 * dekking beter.
 *
 * Wat ze níét beter maken is de vergelijking. Kalibratie en de
 * weekendvergelijking draaien op een vast venster; vijf doordeweekse dagen
 * zeggen niets over je weekend. Daarom staat de hele week er, met een stip op
 * de dagen die het patroon dragen — je ziet wat telt zonder dat de rest
 * verboden is.
 *
 * ## Bladeren en kiezen
 *
 * De datum is de kop. Met ‹ en › ga je een dag terug of vooruit (nooit voorbij
 * vandaag), de zeven rondjes tonen de week van die dag, "Vandaag" brengt je
 * terug, en "Kies" opent dezelfde maandkalender als Je patroon.
 */

export type DagKeuzeVia = "strip" | "pijl" | "vandaag" | "kalender";

const WEEKDAG = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;

export type WeekstripDag = {
  datum: string;
  /** Of er iets geregistreerd is. */
  gevuld: boolean;
  /** Of deze dag een van de vier meetdagen is. */
  meetdag: boolean;
};

function langeDatum(datum: string): string {
  return new Date(`${datum}T00:00:00Z`).toLocaleDateString("nl-NL", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const RANDKNOP =
  "flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3 text-[12px] font-semibold text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)] disabled:cursor-default disabled:opacity-40";

const PIJL =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[15px] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)] disabled:cursor-default disabled:opacity-30";

export default function DagboekWeekstrip({
  dagen,
  geselecteerd,
  onSelecteer,
  vandaag,
  geregistreerd,
  busy = false,
}: {
  dagen: readonly WeekstripDag[];
  geselecteerd: string;
  onSelecteer: (datum: string, via: DagKeuzeVia) => void;
  vandaag: string;
  geregistreerd: ReadonlySet<string>;
  busy?: boolean;
}) {
  const [kalender, setKalender] = useState(false);
  const [maand, setMaand] = useState(() => maandVan(geselecteerd));
  const isVandaag = geselecteerd === vandaag;

  function stap(dagenVerder: number) {
    const doel = verschuifDag(geselecteerd, dagenVerder);
    onSelecteer(doel > vandaag ? vandaag : doel, "pijl");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button type="button" className={PIJL} onClick={() => stap(-1)} disabled={busy} aria-label="Vorige dag">
            ‹
          </button>
          <h2
            className="m-0 min-w-0 truncate font-serif text-[clamp(17px,2.2vw,21px)] font-normal capitalize leading-tight text-[var(--vd-ink)]"
            aria-live="polite"
          >
            {isVandaag ? "Vandaag" : langeDatum(geselecteerd)}
            {isVandaag ? (
              <span className="ml-2 font-sans text-[12px] normal-case text-[var(--vd-ink-3)]">{langeDatum(geselecteerd)}</span>
            ) : null}
          </h2>
          <button
            type="button"
            className={PIJL}
            onClick={() => stap(1)}
            disabled={busy || isVandaag}
            aria-label="Volgende dag"
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {!isVandaag ? (
            <button type="button" className={RANDKNOP} onClick={() => onSelecteer(vandaag, "vandaag")} disabled={busy}>
              Vandaag
            </button>
          ) : null}
          <button
            type="button"
            className={`${RANDKNOP} ${kalender ? "border-white/30 text-[var(--vd-ink)]" : ""}`}
            onClick={() => {
              setMaand(maandVan(geselecteerd));
              setKalender(!kalender);
            }}
            aria-expanded={kalender}
            disabled={busy}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="11" rx="2" />
              <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
            </svg>
            Kies
          </button>
        </div>
      </div>

      {kalender ? (
        <MaandKalender
          maand={maand}
          onMaand={setMaand}
          vroegste={null}
          vandaag={vandaag}
          geregistreerd={geregistreerd}
          isRand={(datum) => datum === geselecteerd}
          isGekozen={(datum) => datum === geselecteerd}
          onTik={(datum) => {
            setKalender(false);
            onSelecteer(datum, "kalender");
          }}
          voetnoot="● = dag met registratie"
        />
      ) : null}

      <ul className="m-0 grid w-full max-w-[460px] list-none grid-cols-7 gap-1 p-0">
        {dagen.map((dag) => {
          const datum = new Date(`${dag.datum}T00:00:00Z`);
          const dagNaam = WEEKDAG[(datum.getUTCDay() + 6) % 7];
          const actief = dag.datum === geselecteerd;
          const toekomst = dag.datum > vandaag;

          return (
            <li key={dag.datum}>
              <button
                type="button"
                disabled={busy || toekomst}
                onClick={() => onSelecteer(dag.datum, "strip")}
                aria-pressed={actief}
                aria-label={`${dagNaam} ${datum.getUTCDate()}${dag.gevuld ? ", ingevuld" : ""}${dag.meetdag ? ", meetdag" : ""}`}
                className="group flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl py-1 disabled:cursor-default disabled:opacity-35"
              >
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--vd-ink-3)]">
                  {dagNaam}
                </span>
                <span
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full text-[13.5px] tabular-nums transition-colors ${
                    actief
                      ? "bg-[var(--vd-sage)] font-bold text-[var(--vd-bg)]"
                      : dag.datum === vandaag
                        ? "border border-white/30 text-[var(--vd-ink)] group-hover:bg-white/[0.06]"
                        : "text-[var(--vd-ink-2)] group-hover:bg-white/[0.06]"
                  }`}
                >
                  {datum.getUTCDate()}
                  {dag.meetdag ? (
                    <span
                      aria-hidden
                      className="absolute -right-0.5 -top-0.5 block h-[7px] w-[7px] rounded-full border border-[var(--vd-bg)] bg-[var(--vd-terra)]"
                    />
                  ) : null}
                </span>
                <span
                  aria-hidden
                  className={`block h-1 w-1 rounded-full ${dag.gevuld ? "bg-[var(--vd-sage)]" : "bg-transparent"}`}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="block h-1 w-1 rounded-full bg-[var(--vd-sage)]" />
          ingevuld
        </span>
        <span className="flex items-center gap-1.5" title="Twee doordeweekse en twee weekenddagen dragen je patroon. Extra dagen invullen mag en verbetert je dekking.">
          <span aria-hidden className="block h-[6px] w-[6px] rounded-full bg-[var(--vd-terra)]" />
          meetdag · telt mee in je patroon
        </span>
      </p>
    </div>
  );
}

/** De zeven dagen van de week waar `datum` in valt, maandag eerst. */
export function weekRond(datum: string): string[] {
  const dag = new Date(datum);
  const maandag = new Date(dag);
  maandag.setDate(dag.getDate() - ((dag.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(maandag);
    d.setDate(maandag.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

/** Welke van de gevulde dagen als meetdag telt: maximaal twee per soort. */
export function meetdagenUit(gevuldeDagen: readonly string[]): Set<string> {
  const perSoort: Record<string, string[]> = { doordeweeks: [], weekend: [] };
  // Oudste eerst: wie meer dan twee dagen van een soort invult, houdt de
  // eerste twee als meetdag. Anders zou de markering verspringen zodra je een
  // extra dag toevoegt, en dan lijkt je patroon te veranderen terwijl er
  // alleen data bij kwam.
  for (const datum of [...gevuldeDagen].sort()) {
    const soort = dagSoortVoor(datum);
    if (perSoort[soort]!.length < 2) perSoort[soort]!.push(datum);
  }
  return new Set([...perSoort.doordeweeks!, ...perSoort.weekend!]);
}
