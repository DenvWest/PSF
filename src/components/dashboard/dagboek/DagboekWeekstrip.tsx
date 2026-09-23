"use client";

import { dagSoortVoor } from "@/lib/nutrition-dagboek";

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
 */

const WEEKDAG = ["ma", "di", "wo", "do", "vr", "za", "zo"] as const;

export type WeekstripDag = {
  datum: string;
  /** Of er iets geregistreerd is. */
  gevuld: boolean;
  /** Of deze dag een van de vier meetdagen is. */
  meetdag: boolean;
};

export default function DagboekWeekstrip({
  dagen,
  geselecteerd,
  onSelecteer,
  busy = false,
}: {
  dagen: readonly WeekstripDag[];
  geselecteerd: string;
  onSelecteer: (datum: string) => void;
  busy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <ul className="m-0 grid list-none grid-cols-7 gap-1 p-0">
        {dagen.map((dag) => {
          const datum = new Date(dag.datum);
          const dagNaam = WEEKDAG[(datum.getDay() + 6) % 7];
          const actief = dag.datum === geselecteerd;

          return (
            <li key={dag.datum}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onSelecteer(dag.datum)}
                aria-pressed={actief}
                aria-label={`${dagNaam} ${datum.getDate()}${
                  dag.gevuld ? ", ingevuld" : ""
                }${dag.meetdag ? ", meetdag" : ""}`}
                className={`relative w-full cursor-pointer rounded-[10px] border px-0.5 py-1.5 text-center transition-colors disabled:opacity-50 ${
                  actief
                    ? "border-2 border-[var(--vd-ink)] py-[5px]"
                    : dag.gevuld
                      ? "border-[rgb(var(--vd-sage-rgb)/70%)] bg-[rgb(var(--vd-sage-rgb)/15%)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <b
                  className={`block text-[11px] font-bold ${
                    dag.gevuld ? "text-[var(--vd-sage-2)]" : "text-[var(--vd-ink-2)]"
                  }`}
                >
                  {dagNaam}
                </b>
                <i className="block text-[9.5px] not-italic tabular-nums text-[var(--vd-ink-4)]">
                  {datum.getDate()}
                </i>
                {dag.meetdag ? (
                  <span
                    aria-hidden
                    className="absolute right-1 top-1 block h-[5px] w-[5px] rounded-full bg-[var(--vd-terra)]"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="m-0 flex flex-wrap items-center gap-1.5 text-[10.5px] leading-relaxed text-[var(--vd-ink-4)]">
        <span aria-hidden className="block h-[5px] w-[5px] rounded-full bg-[var(--vd-terra)]" />
        Meetdag — deze vier dragen je patroon. Extra dagen invullen mag en
        verbetert je dekking, maar de vergelijking draait op twee doordeweekse
        en twee weekenddagen.
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
