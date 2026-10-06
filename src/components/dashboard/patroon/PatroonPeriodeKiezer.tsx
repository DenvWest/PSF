"use client";

import { useState } from "react";
import {
  MAX_PERIODE_DAGEN,
  periodeLabel,
  periodeTussen,
  periodeVoorKeuze,
  verschuifDag,
  type Periode,
  type PeriodeKeuze,
} from "@/lib/nutrition-periode";

/**
 * Eén periodekiezer voor Per maaltijd en Per stof: Vandaag · 7 dagen ·
 * 30 dagen · Kies. "Kies" klapt een maandkalender open. Tik een dag en je
 * kijkt naar die dag; tik een tweede dag en de periode loopt ertussen.
 *
 * Een stipje onder een dag betekent dat er iets geregistreerd is. Dagen
 * verder terug dan {@link MAX_PERIODE_DAGEN} of na vandaag zijn niet te
 * kiezen.
 */

const SNEL: readonly { id: Exclude<PeriodeKeuze, "eigen">; label: string }[] = [
  { id: "vandaag", label: "Vandaag" },
  { id: "7", label: "7 dagen" },
  { id: "30", label: "30 dagen" },
];

const WEEKDAG = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;

function maandVan(datum: string): string {
  return datum.slice(0, 7);
}

function verschuifMaand(maand: string, n: number): string {
  const [jaar, m] = maand.split("-").map(Number) as [number, number];
  const datum = new Date(Date.UTC(jaar, m - 1 + n, 1));
  return datum.toISOString().slice(0, 7);
}

/** De vakjes van een maand, maandag eerst; `null` vult de eerste week aan. */
function maandVakjes(maand: string): (string | null)[] {
  const eerste = `${maand}-01`;
  const weekdag = (new Date(`${eerste}T00:00:00Z`).getUTCDay() + 6) % 7;
  const vakjes: (string | null)[] = Array.from({ length: weekdag }, () => null);
  for (let datum = eerste; maandVan(datum) === maand; datum = verschuifDag(datum, 1)) vakjes.push(datum);
  return vakjes;
}

export default function PatroonPeriodeKiezer({
  keuze,
  periode,
  vandaag,
  geregistreerd,
  onKies,
}: {
  keuze: PeriodeKeuze;
  periode: Periode;
  vandaag: string;
  /** Datums met minstens één product. */
  geregistreerd: ReadonlySet<string>;
  onKies: (keuze: PeriodeKeuze, periode: Periode) => void;
}) {
  const [open, setOpen] = useState(false);
  const [maand, setMaand] = useState(() => maandVan(periode.tot));
  const [eersteTik, setEersteTik] = useState<string | null>(null);

  const vroegste = verschuifDag(vandaag, -(MAX_PERIODE_DAGEN - 1));
  const kanTerug = maand > maandVan(vroegste);
  const kanVooruit = maand < maandVan(vandaag);

  function tik(datum: string) {
    if (eersteTik === null) {
      setEersteTik(datum);
      onKies("eigen", { van: datum, tot: datum });
    } else {
      setEersteTik(null);
      onKies("eigen", periodeTussen(eersteTik, datum));
    }
  }

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <div className="vd-segment !flex flex-1" role="group" aria-label="Periode">
          {SNEL.map((optie) => (
            <button
              key={optie.id}
              type="button"
              aria-pressed={keuze === optie.id}
              onClick={() => {
                setOpen(false);
                setEersteTik(null);
                onKies(optie.id, periodeVoorKeuze(optie.id, vandaag));
              }}
              className="flex-1 !px-1"
            >
              {optie.label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={keuze === "eigen"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex-1 !px-1"
          >
            Kies
          </button>
        </div>
      </div>

      <p className="vd-tag mt-1.5 mb-0" aria-live="polite">
        {periodeLabel(periode)}
        {eersteTik !== null ? " · tik een tweede dag voor een reeks" : ""}
      </p>

      {open ? (
        <div className="mt-2 rounded-xl border border-[var(--vd-line)] bg-[var(--vd-surface)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="vd-blader"
              onClick={() => setMaand(verschuifMaand(maand, -1))}
              disabled={!kanTerug}
              aria-label="Vorige maand"
            >
              ‹
            </button>
            <b className="text-[0.8125rem] capitalize text-[var(--vd-ink)]">
              {new Date(`${maand}-01T00:00:00Z`).toLocaleDateString("nl-NL", {
                timeZone: "UTC",
                month: "long",
                year: "numeric",
              })}
            </b>
            <button
              type="button"
              className="vd-blader"
              onClick={() => setMaand(verschuifMaand(maand, 1))}
              disabled={!kanVooruit}
              aria-label="Volgende maand"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Kalender">
            {WEEKDAG.map((dag) => (
              <span key={dag} className="text-[0.625rem] uppercase text-[var(--vd-ink-3)]">
                {dag}
              </span>
            ))}
            {maandVakjes(maand).map((datum, index) => {
              if (datum === null) return <span key={`leeg-${index}`} />;
              const kiesbaar = datum >= vroegste && datum <= vandaag;
              const gekozen = datum >= periode.van && datum <= periode.tot;
              const rand = datum === periode.van || datum === periode.tot;
              return (
                <button
                  key={datum}
                  type="button"
                  disabled={!kiesbaar}
                  aria-pressed={gekozen}
                  aria-label={new Date(`${datum}T00:00:00Z`).toLocaleDateString("nl-NL", {
                    timeZone: "UTC",
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  onClick={() => tik(datum)}
                  className={`relative flex h-9 cursor-pointer flex-col items-center justify-center rounded-lg border-0 font-[inherit] text-[0.75rem] disabled:cursor-default disabled:opacity-30 ${
                    rand
                      ? "bg-[var(--vd-sage)] font-bold text-[var(--vd-bg)]"
                      : gekozen
                        ? "bg-[var(--vd-sage-fill)] text-[var(--vd-ink)]"
                        : "bg-transparent text-[var(--vd-ink-2)]"
                  } ${datum === vandaag ? "ring-1 ring-[var(--vd-line-2)]" : ""}`}
                >
                  {Number(datum.slice(8))}
                  {geregistreerd.has(datum) ? (
                    <span
                      aria-hidden
                      className={`absolute bottom-1 h-1 w-1 rounded-full ${rand ? "bg-[var(--vd-bg)]" : "bg-[var(--vd-sage)]"}`}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="vd-tag mt-2 mb-0">● = dag met registratie · maximaal {MAX_PERIODE_DAGEN} dagen terug</p>
        </div>
      ) : null}
    </div>
  );
}
