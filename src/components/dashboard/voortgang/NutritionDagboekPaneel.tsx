"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import {
  addAgendaDays,
  todayInAgendaTimezone,
} from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  analyseerDagboek,
  dagSoortVoor,
  dekkingsRegel,
  DAGBOEK_TOTAAL,
  DAGEN_PER_SOORT,
  type DagboekDag,
  type DagSoort,
} from "@/lib/nutrition-dagboek";
import NutritionDagInvoer from "@/components/dashboard/voortgang/NutritionDagInvoer";
import {
  bouwDagboekSlots,
  dagGroepenTelling,
  dagSamenvatting,
} from "@/lib/nutrition-dagboek-slots";
import {
  portiesUitMomenten,
  type DagMomenten,
} from "@/lib/nutrition-eetmomenten";
import {
  kalibratieRegel,
  kalibratieRijen,
  selfReportUitDagboek,
} from "@/lib/nutrition-dagboek-selfreport";
import { nutritionReportFromAnswers } from "@/lib/nutrition-score";

/**
 * Het 2+2-dagboek op P5 (Meten & timing).
 *
 * Twee doordeweekse dagen, twee weekenddagen — de kleinste steekproef die het
 * verschil tussen je week en je weekend zichtbaar maakt. Zie
 * `nutrition-dagboek.ts` voor waarom dat verschil ertoe doet en waarom vier
 * dagen het aantal is.
 *
 * ## De invoervorm
 *
 * Per eetmoment (zie `NutritionDagInvoer`), niet per voedselgroep: mensen
 * halen hun dag terug als "bij het ontbijt yoghurt, 's avonds groente en vis",
 * niet als dertien groepen op nul. Geen zoekveld en geen productendatabase —
 * dit is een steekproef van je patroon, en "hoeveel porties groente" is uit
 * het hoofd te beantwoorden op een manier die "hoeveel gram" nooit is.
 *
 * ## Waarom gisteren de standaarddag is
 *
 * Vandaag is nog niet af, en verder terug dan een paar dagen wordt gokken. Het
 * paneel biedt de laatste zeven dagen aan en zet gisteren voorop.
 *
 * ## De vorm: vier plekken, geen stapel zinnen (5 sep)
 *
 * Dit paneel toonde zijn stand als zes alinea's onder elkaar — een teller, een
 * dekkingsregel, een breedteregel, een variatieregel, een samenvatting en een
 * kalibratieregel. Je moest ze alle zes lezen om te weten wat je had ingevuld,
 * en het eenvoudigste antwoord stond er niet bij: wélke vier dagen dit dagboek
 * zoekt en welke daarvan je al hebt.
 *
 * Nu draagt een tabel van vier plekken dat antwoord (zie
 * `nutrition-dagboek-slots.ts`): twee doordeweekse, twee weekend, elk gevuld
 * met wat er die dag stond of leeg met een knop erin. De bevindingen staan
 * eronder als korte regels — ze zeggen iets over je patroon, niet over je
 * voortgang, en dat verschil was in de oude stapel niet te zien.
 *
 * ## Waarom het laadt zodra het paneel bestaat
 *
 * De fetch startte pas bij de eerste render en het paneel gaf `null` terug
 * zolang hij liep: je klikte op de knop en er gebeurde zichtbaar niets. Nu
 * staat er meteen een skeleton met de vier plekken erin — dezelfde vorm die
 * daarna gevuld wordt, dus het scherm springt niet.
 */

function dagLabel(isoDate: string, today: string): string {
  if (isoDate === addAgendaDays(today, -1)) return "Gisteren";
  const datum = new Date(`${isoDate}T12:00:00.000Z`);
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Amsterdam",
  }).format(datum);
}

const SOORT_LABEL: Record<DagSoort, string> = {
  doordeweeks: "doordeweekse dag",
  weekend: "weekenddag",
};

export default function NutritionDagboekPaneel({
  surface,
  checkSliders = null,
}: {
  surface: string;
  /**
   * De slider-antwoorden uit de voedingscheck, voor de kalibratie. Null zonder
   * check — dan toont het paneel alleen wat het dagboek zelf ziet.
   */
  checkSliders?: Record<string, number> | null;
}) {
  const today = todayInAgendaTimezone();
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [geladen, setGeladen] = useState(false);
  const [open, setOpen] = useState(false);
  const [datum, setDatum] = useState(() =>
    addAgendaDays(todayInAgendaTimezone(), -1),
  );
  const [momenten, setMomenten] = useState<DagMomenten>({});
  const [waterMl, setWaterMl] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/nutrition-daybook", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled) return;
        setDagen(Array.isArray(payload?.days) ? payload.days : []);
        setGeladen(true);
      })
      // Uitgelogd of nog geen dagboek: dan is er niets te tonen, en dat is een
      // geldig antwoord.
      .catch(() => {
        if (!cancelled) setGeladen(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const uitkomst = useMemo(() => analyseerDagboek(dagen), [dagen]);
  const dekking = dekkingsRegel(uitkomst);
  const slots = useMemo(() => bouwDagboekSlots(dagen), [dagen]);

  // Wat je zei tegenover wat je registreerde. Twee schattingen naast elkaar —
  // geen correctie op de check, wel een uitspraak over hoe zeker we van dat
  // patroon mogen zijn.
  const kalibratie = useMemo(() => {
    if (!checkSliders) return null;
    const uitDagboek = selfReportUitDagboek(dagen);
    if (!uitDagboek) return null;
    return kalibratieRegel(
      kalibratieRijen(nutritionReportFromAnswers(checkSliders), uitDagboek),
    );
  }, [checkSliders, dagen]);

  // Eén melding zodra de kalibratie voor het eerst iets te zeggen heeft: dat
  // getal zegt of het dagboek daadwerkelijk iets toevoegt aan de check.
  useEffect(() => {
    if (!kalibratie) return;
    emitAccountClientEvent("nutrition.dagboek_kalibratie_shown", {
      filled_days: dagen.length,
      surface,
    });
  }, [kalibratie, dagen.length, surface]);

  // De zeven dagen waaruit je kunt kiezen: gisteren voorop, vandaag niet mee.
  const keuzedagen = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        addAgendaDays(today, -(index + 1)),
      ),
    [today],
  );

  const alIngevuld = useMemo(
    () => new Set(dagen.map((dag) => dag.date)),
    [dagen],
  );

  function openInvoer() {
    const eerste =
      keuzedagen.find((dag) => !alIngevuld.has(dag)) ?? keuzedagen[0];
    setDatum(eerste);
    setMomenten({});
    setWaterMl(null);
    setError(null);
    setOpen(true);
    trackEvent("nutrition_dagboek_open", { surface, ingevuld: dagen.length });
    emitAccountClientEvent("nutrition.dagboek_opened", {
      filled_days: dagen.length,
      surface,
    });
    clarityTag("nutrition_dagboek", surface);
  }

  async function bewaar() {
    if (busy) return;
    const heeftInhoud = Object.keys(momenten).length > 0 || (waterMl ?? 0) > 0;
    if (!heeftInhoud) {
      setError("Vul minstens één eetmoment in.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/nutrition-daybook", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: datum,
          meals: momenten,
          water_ml: waterMl,
        }),
      });
      if (!response.ok) {
        throw new Error("Kon je dag niet opslaan.");
      }

      const nieuweDag: DagboekDag = {
        date: datum,
        soort: dagSoortVoor(datum),
        // De momenten zijn de invoervorm; `porties` blijft waar alle analyse
        // op rekent. Zelfde afleiding als de server doet, zodat het scherm
        // meteen klopt zonder opnieuw te laden.
        porties: portiesUitMomenten(momenten),
        momenten,
        waterMl,
      };
      const volgende = [
        nieuweDag,
        ...dagen.filter((dag) => dag.date !== datum),
      ];
      setDagen(volgende);
      setOpen(false);

      trackEvent("nutrition_dagboek_day_saved", {
        surface,
        soort: nieuweDag.soort,
      });
      emitAccountClientEvent("nutrition.dagboek_day_saved", {
        day_kind: nieuweDag.soort,
        filled_days: volgende.length,
        surface,
      });

      const na = analyseerDagboek(volgende);
      if (na.voortgang.compleet && !uitkomst.voortgang.compleet) {
        emitAccountClientEvent("nutrition.dagboek_completed", {
          verschillen: na.verschillen.length,
          variatie_band: na.variatie.band,
          dekking: na.variatie.dekking,
          surface,
        });
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Kon je dag niet opslaan.",
      );
    } finally {
      setBusy(false);
    }
  }

  const { voortgang } = uitkomst;

  const ingevuld = voortgang.doordeweeks + voortgang.weekend;

  // De bevindingen als korte regels onder de tabel. Ze zeggen iets over je
  // patroon, niet over je voortgang — en dat verschil was in de oude stapel
  // van zes alinea's niet te zien.
  const bevindingen = [
    uitkomst.breedte.regel,
    uitkomst.variatie.regel,
    uitkomst.samenvatting,
  ].filter((regel): regel is string => Boolean(regel));

  return (
    <section
      aria-label="Je 2+2-dagboek"
      className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-white/10 px-3.5 py-2.5">
        <h4 className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Twee weekdagen, twee weekenddagen
        </h4>
        <span className="text-[11px] tabular-nums text-[#7E8C82]">
          {geladen ? `${ingevuld} / ${DAGBOEK_TOTAAL}` : "—"}
        </span>
      </div>

      {/* De vier plekken. Zolang het dagboek laadt staan ze er als skeleton:
          dezelfde vorm, zodat het paneel niet verspringt zodra de dagen
          binnen zijn. */}
      <ul className="m-0 list-none p-0" role="list">
        {slots.map((slot) => {
          const dag = geladen ? slot.dag : null;
          return (
            <li
              key={slot.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-white/[0.06] px-3.5 py-2.5 last:border-b-0"
            >
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold leading-snug text-[#E7EDE8]">
                  {dag ? dagLabel(dag.date, today) : SOORT_LABEL[slot.soort]}
                </span>
                {!geladen ? (
                  <span
                    aria-hidden
                    className="mt-1 block h-2.5 w-32 animate-pulse rounded-full bg-white/[0.07]"
                  />
                ) : (
                  <span className="mt-0.5 block truncate text-[11.5px] leading-snug text-[#9FB0A6]">
                    {dag ? dagSamenvatting(dag) : "Nog niet ingevuld"}
                  </span>
                )}
              </span>

              {!geladen ? (
                <span
                  aria-hidden
                  className="h-2.5 w-12 animate-pulse rounded-full bg-white/[0.07]"
                />
              ) : dag ? (
                <span className="shrink-0 text-[11px] tabular-nums text-[#7E8C82]">
                  {dagGroepenTelling(dag)} groepen
                </span>
              ) : (
                <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#7E8C82]">
                  open
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="px-3.5 py-2.5">
        <p className="m-0 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          Je check vraagt naar een gemiddelde. Vier losse dagen laten zien wat
          daaronder zit — en of je weekend anders loopt dan je week.
        </p>

        {geladen && dekking ? (
          <p className="m-0 mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
            {dekking}
          </p>
        ) : null}

        {/* Breedte vóór variatie: breedte telt of een groep voorkwam,
            variatie of hij terugkwam. Die tweede vraag is pas te stellen als
            de eerste beantwoord is. */}
        {bevindingen.length > 0 ? (
          <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
            {bevindingen.map((regel) => (
              <li
                key={regel}
                className="max-w-[58ch] text-[12.5px] leading-relaxed text-[#E7EDE8] text-pretty"
              >
                {regel}
              </li>
            ))}
          </ul>
        ) : null}

        {/* De kalibratie staat onderaan: hij gaat niet over je eten maar over
            je meting, en dat is een stap abstracter dan de rest van het blok. */}
        {kalibratie ? (
          <p className="m-0 mt-2 max-w-[58ch] border-t border-white/10 pt-2 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            {kalibratie}
          </p>
        ) : null}

        {uitkomst.verschillen.length > 0 ? (
          <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
            {uitkomst.verschillen.map((rij) => (
              <li
                key={rij.groep}
                className="flex flex-wrap items-baseline justify-between gap-x-3 text-[12px] leading-snug text-[#9FB0A6]"
              >
                <span className="text-[#CDD7D0]">{rij.label}</span>
                <span className="tabular-nums text-[11.5px] text-[#7E8C82]">
                  doordeweeks {rij.doordeweeks.toFixed(1)} · weekend{" "}
                  {rij.weekend.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {!open ? (
          <button
            type="button"
            onClick={openInvoer}
            className="mt-2.5 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#5A8F6A]/40 bg-[#5A8F6A]/[0.14] px-2.5 text-[11.5px] font-semibold text-[#9CC5A9]"
          >
            <Icons.Calendar s={13} />
            {voortgang.compleet
              ? "Nog een dag invullen"
              : voortgang.volgende
                ? `Vul een ${SOORT_LABEL[voortgang.volgende]} in`
                : "Vul een dag in"}
          </button>
        ) : null}

        {open ? (
          <div className="mt-2.5 rounded-[12px] border border-white/10 bg-black/25 p-3">
            <label className="block text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
              Welke dag?
              <select
                value={datum}
                disabled={busy}
                onChange={(event) => setDatum(event.target.value)}
                className="mt-1 block min-h-9 w-full rounded-[10px] border border-white/10 bg-black/25 px-2.5 text-[13px] font-normal normal-case tracking-normal text-[#F1EFE8]"
              >
                {keuzedagen.map((dag) => (
                  <option key={dag} value={dag}>
                    {dagLabel(dag, today)}
                    {alIngevuld.has(dag) ? " · al ingevuld" : ""}
                  </option>
                ))}
              </select>
            </label>

            <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-[#7E8C82]">
              Dit telt als {SOORT_LABEL[dagSoortVoor(datum)]}. Je hebt er{" "}
              {dagSoortVoor(datum) === "weekend"
                ? voortgang.weekend
                : voortgang.doordeweeks}{" "}
              van {DAGEN_PER_SOORT}.
            </p>

            <NutritionDagInvoer
              momenten={momenten}
              onChange={setMomenten}
              waterMl={waterMl}
              onWaterChange={setWaterMl}
              busy={busy}
            />

            {error ? (
              <p
                role="status"
                className="mt-2 text-[11.5px] leading-relaxed text-[#C8956C]"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void bewaar()}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#5A8F6A]/55 bg-[#5A8F6A]/20 px-3.5 text-[12.5px] font-semibold text-[#F1EFE8] disabled:opacity-60"
              >
                <Icons.Check s={13} />
                Bewaar deze dag
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="min-h-9 cursor-pointer border-none bg-transparent px-1 text-[12.5px] text-[#9FB0A6]"
              >
                Annuleer
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
