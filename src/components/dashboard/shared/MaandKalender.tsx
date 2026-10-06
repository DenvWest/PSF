"use client";

import { verschuifDag } from "@/lib/nutrition-periode";

/**
 * Eén maandkalender voor Je patroon (een periode kiezen) en het dagboek (een
 * dag kiezen). Wat "gekozen" is, bepaalt de aanroeper; de kalender tekent
 * alleen. Een stipje onder een dag betekent dat er iets geregistreerd is.
 */

const WEEKDAG = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;

export function maandVan(datum: string): string {
  return datum.slice(0, 7);
}

export function verschuifMaand(maand: string, n: number): string {
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

export default function MaandKalender({
  maand,
  onMaand,
  vroegste,
  vandaag,
  geregistreerd,
  isRand,
  isGekozen,
  onTik,
  voetnoot,
}: {
  maand: string;
  onMaand: (maand: string) => void;
  /** Vroegste kiesbare datum, of null voor geen grens. */
  vroegste: string | null;
  vandaag: string;
  geregistreerd: ReadonlySet<string>;
  isRand: (datum: string) => boolean;
  isGekozen: (datum: string) => boolean;
  onTik: (datum: string) => void;
  voetnoot: string;
}) {
  const kanTerug = vroegste === null || maand > maandVan(vroegste);
  const kanVooruit = maand < maandVan(vandaag);

  return (
    <div className="mt-2 rounded-xl border border-[var(--vd-line)] bg-[var(--vd-surface)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="vd-blader"
          onClick={() => onMaand(verschuifMaand(maand, -1))}
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
          onClick={() => onMaand(verschuifMaand(maand, 1))}
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
          const kiesbaar = (vroegste === null || datum >= vroegste) && datum <= vandaag;
          const gekozen = isGekozen(datum);
          const rand = isRand(datum);
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
              onClick={() => onTik(datum)}
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
      <p className="vd-tag mt-2 mb-0">{voetnoot}</p>
    </div>
  );
}
