"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { addAgendaDays, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  analyseerDagboek,
  dagSoortVoor,
  dekkingsRegel,
  DAGBOEK_GROEPEN,
  DAGBOEK_LABELS,
  DAGBOEK_TOTAAL,
  DAGEN_PER_SOORT,
  type DagboekDag,
  type DagSoort,
} from "@/lib/nutrition-dagboek";
import {
  kalibratieRegel,
  kalibratieRijen,
  selfReportUitDagboek,
} from "@/lib/nutrition-dagboek-selfreport";
import { nutritionReportFromAnswers } from "@/lib/nutrition-score";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

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
 * Per voedselgroep een aantal porties, met plus en min. Geen grammen, geen
 * zoekveld, geen productendatabase: dit is een steekproef van je patroon, en
 * de vraag "hoeveel porties groente at je gisteren" is uit het hoofd te
 * beantwoorden op een manier die "hoeveel gram" nooit is.
 *
 * ## Waarom gisteren de standaarddag is
 *
 * Vandaag is nog niet af, en verder terug dan een paar dagen wordt gokken. Het
 * paneel biedt de laatste zeven dagen aan en zet gisteren voorop.
 */

const KNOP =
  "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#E7EDE8] disabled:opacity-40";

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
  const [datum, setDatum] = useState(() => addAgendaDays(todayInAgendaTimezone(), -1));
  const [porties, setPorties] = useState<Partial<Record<VoedselgroepId, number>>>({});
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

  // Wat je zei tegenover wat je registreerde. Twee schattingen naast elkaar —
  // geen correctie op de check, wel een uitspraak over hoe zeker we van dat
  // patroon mogen zijn.
  const kalibratie = useMemo(() => {
    if (!checkSliders) return null;
    const uitDagboek = selfReportUitDagboek(dagen);
    if (!uitDagboek) return null;
    return kalibratieRegel(kalibratieRijen(nutritionReportFromAnswers(checkSliders), uitDagboek));
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
    () => Array.from({ length: 7 }, (_, index) => addAgendaDays(today, -(index + 1))),
    [today],
  );

  const alIngevuld = useMemo(
    () => new Set(dagen.map((dag) => dag.date)),
    [dagen],
  );

  function openInvoer() {
    const eerste = keuzedagen.find((dag) => !alIngevuld.has(dag)) ?? keuzedagen[0];
    setDatum(eerste);
    setPorties({});
    setError(null);
    setOpen(true);
    trackEvent("nutrition_dagboek_open", { surface, ingevuld: dagen.length });
    emitAccountClientEvent("nutrition.dagboek_opened", {
      filled_days: dagen.length,
      surface,
    });
    clarityTag("nutrition_dagboek", surface);
  }

  function stel(groep: VoedselgroepId, delta: number) {
    setPorties((huidig) => {
      const nieuw = Math.max(0, Math.min((huidig[groep] ?? 0) + delta, 20));
      return { ...huidig, [groep]: nieuw };
    });
  }

  async function bewaar() {
    if (busy) return;
    if (Object.keys(porties).length === 0) {
      setError("Vul minstens één voedselgroep in.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/nutrition-daybook", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: datum, portions: porties }),
      });
      if (!response.ok) {
        throw new Error("Kon je dag niet opslaan.");
      }

      const nieuweDag: DagboekDag = {
        date: datum,
        soort: dagSoortVoor(datum),
        porties,
      };
      const volgende = [nieuweDag, ...dagen.filter((dag) => dag.date !== datum)];
      setDagen(volgende);
      setOpen(false);

      trackEvent("nutrition_dagboek_day_saved", { surface, soort: nieuweDag.soort });
      emitAccountClientEvent("nutrition.dagboek_day_saved", {
        day_kind: nieuweDag.soort,
        filled_days: volgende.length,
        surface,
      });

      const na = analyseerDagboek(volgende);
      if (na.voortgang.compleet && !uitkomst.voortgang.compleet) {
        emitAccountClientEvent("nutrition.dagboek_completed", {
          verschillen: na.verschillen.length,
          surface,
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kon je dag niet opslaan.");
    } finally {
      setBusy(false);
    }
  }

  if (!geladen) {
    return null;
  }

  const { voortgang } = uitkomst;

  return (
    <section
      aria-label="Je 2+2-dagboek"
      className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3.5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
          Twee weekdagen, twee weekenddagen
        </h4>
        <span className="text-[11px] tabular-nums text-[#7E8C82]">
          {voortgang.doordeweeks + voortgang.weekend} / {DAGBOEK_TOTAAL}
        </span>
      </div>

      <p className="m-0 mt-2 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
        Je check vraagt naar een gemiddelde. Vier losse dagen laten zien wat daaronder
        zit — en of je weekend anders loopt dan je week.
      </p>

      {dekking ? (
        <p className="m-0 mt-2 max-w-[58ch] text-[11.5px] leading-relaxed text-[#7E8C82] text-pretty">
          {dekking}
        </p>
      ) : null}

      {/* Breedte staat vóór het weekendpatroon en telt al vanaf één dag: dat
          is het eerste dat je terugkrijgt voor je invoer, in plaats van drie
          dagen niets. Nadrukkelijk breedte en geen diversiteit — het dagboek
          kent groepen, geen bronnen. */}
      {uitkomst.breedte.regel ? (
        <p className="m-0 mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-[#E7EDE8] text-pretty">
          {uitkomst.breedte.regel}
        </p>
      ) : null}

      {uitkomst.samenvatting ? (
        <p className="m-0 mt-2 max-w-[58ch] text-[12.5px] leading-relaxed text-[#E7EDE8] text-pretty">
          {uitkomst.samenvatting}
        </p>
      ) : null}

      {/* De kalibratie staat onderaan: hij gaat niet over je eten maar over je
          meting, en dat is een stap abstracter dan de rest van het blok. */}
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
                doordeweeks {rij.doordeweeks.toFixed(1)} · weekend {rij.weekend.toFixed(1)}
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
            {dagSoortVoor(datum) === "weekend" ? voortgang.weekend : voortgang.doordeweeks} van{" "}
            {DAGEN_PER_SOORT}.
          </p>

          <ul className="m-0 mt-2.5 flex list-none flex-col gap-1.5 p-0">
            {DAGBOEK_GROEPEN.map((groep) => {
              const label = DAGBOEK_LABELS[groep];
              const waarde = porties[groep] ?? 0;
              return (
                <li key={groep} className="flex items-center justify-between gap-3">
                  <span className="min-w-[12ch] flex-1 text-[12.5px] leading-snug text-[#CDD7D0]">
                    {label}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={busy || waarde === 0}
                      onClick={() => stel(groep, -1)}
                      aria-label={`Eén ${label.toLowerCase()} minder`}
                      className={KNOP}
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-[13px] tabular-nums text-[#E7EDE8]">
                      {waarde}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => stel(groep, 1)}
                      aria-label={`Eén ${label.toLowerCase()} meer`}
                      className={KNOP}
                    >
                      +
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="m-0 mt-2 text-[11px] leading-relaxed text-[#7E8C82]">
            Porties, geen grammen. Een schatting uit je hoofd is precies genoeg.
          </p>

          {error ? (
            <p role="status" className="mt-2 text-[11.5px] leading-relaxed text-[#C8956C]">
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
    </section>
  );
}
