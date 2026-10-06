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
 * Met ‹ en › spring je een week terug of vooruit (nooit voorbij vandaag),
 * "Vandaag" brengt je terug, en "Kies" opent dezelfde maandkalender als Je
 * patroon om meteen naar een dag te gaan.
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

function kortDatum(datum: string): string {
  return new Date(`${datum}T00:00:00Z`).toLocaleDateString("nl-NL", { timeZone: "UTC", day: "numeric", month: "short" });
}

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
  const eerste = dagen[0]?.datum ?? geselecteerd;
  const laatste = dagen[dagen.length - 1]?.datum ?? geselecteerd;
  const dezeWeek = vandaag >= eerste && vandaag <= laatste;

  function blader(weken: number) {
    const doel = verschuifDag(geselecteerd, weken * 7);
    onSelecteer(doel > vandaag ? vandaag : doel, "pijl");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="vd-blader"
          onClick={() => blader(-1)}
          disabled={busy}
          aria-label="Vorige week"
        >
          ‹
        </button>
        <b className="min-w-0 flex-1 text-center text-[12px] font-semibold text-[var(--vd-ink-2)]" aria-live="polite">
          {dezeWeek ? "Deze week" : `${kortDatum(eerste)} – ${kortDatum(laatste)}`}
        </b>
        <button
          type="button"
          className="vd-blader"
          onClick={() => blader(1)}
          disabled={busy || dezeWeek}
          aria-label="Volgende week"
        >
          ›
        </button>
        {geselecteerd !== vandaag ? (
          <button
            type="button"
            onClick={() => onSelecteer(vandaag, "vandaag")}
            disabled={busy}
            className="cursor-pointer rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-semibold text-[var(--vd-ink-2)] hover:border-white/25"
          >
            Vandaag
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setMaand(maandVan(geselecteerd));
            setKalender(!kalender);
          }}
          aria-expanded={kalender}
          disabled={busy}
          className="cursor-pointer rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-semibold text-[var(--vd-ink-2)] hover:border-white/25"
        >
          Kies
        </button>
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
                onClick={() => onSelecteer(dag.datum, "strip")}
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
