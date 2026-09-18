"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import Container from "@/components/layout/Container";
import NutritionVoedingsmiddelZoeken from "@/components/dashboard/voortgang/NutritionVoedingsmiddelZoeken";
import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { addAgendaDays, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  DAGBOEK_GROEPEN,
  DAGBOEK_LABELS,
  dagSoortVoor,
  type DagboekDag,
} from "@/lib/nutrition-dagboek";
import {
  EETMOMENTEN,
  groepenVoorMoment,
  portieHint,
  portiesUitMomenten,
  WATER_GLAS_ML,
  waterRegel,
  type DagMomenten,
  type EetmomentId,
} from "@/lib/nutrition-eetmomenten";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Het voedingsdagboek als eigen scherm.
 *
 * ## Waarom dit naast het paneel op laag 5 bestaat
 *
 * `NutritionDagboekPaneel` is een *leesbaar overzicht* binnen de ladder: vier
 * plekken, de weekendvergelijking, de kalibratie tegen de check. Prima om te
 * zien wát je meting zegt, maar om te registreren zat het acht klikken diep.
 *
 * Dit scherm draait die verhouding om: één dag, één eetmoment tegelijk, en
 * zoeken als eerste actie. Dezelfde opslag (`account_nutrition_daybook`),
 * dezelfde dertien groepen, dezelfde analyse — alleen de invoerkant staat nu
 * vooraan in plaats van onderin.
 *
 * ## Wat het bewust niet doet
 *
 * **Geen calorieën, geen macro's.** De teller bovenin telt voedselgroepen, niet
 * kilocalorieën. Zie `nutrition-dagboek.ts` voor waarom laag 5 dicht blijft
 * voor tellen; een scherm dat eruitziet als een calorieteller maar groepen telt
 * zou over zichzelf liegen.
 *
 * **Geen autosave.** De POST deelt de `intake_session`-emmer (20 per kwartier),
 * dus opslaan bij elke plus-klik loopt op een rate limit stuk. Eén knop die de
 * hele dag wegschrijft past bij wat de API toch al doet: een upsert per dag.
 * Concepten blijven per dag in het geheugen staan, zodat wisselen van dag geen
 * invoer weggooit.
 */

const WATER_ID = "water" as const;
type SchermMoment = EetmomentId | typeof WATER_ID;

type Concept = {
  momenten: DagMomenten;
  waterMl: number | null;
};

const MOMENT_KEUZES: readonly { id: SchermMoment; label: string }[] = [
  ...EETMOMENTEN.map((moment) => ({ id: moment.id as SchermMoment, label: moment.label })),
  { id: WATER_ID, label: "Water" },
];

const DAGEN_IN_KEUZE = 7;

function dagLabel(isoDate: string, today: string): string {
  if (isoDate === today) return "Vandaag";
  if (isoDate === addAgendaDays(today, -1)) return "Gisteren";
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(`${isoDate}T12:00:00.000Z`));
}

function conceptVanDag(dag: DagboekDag | undefined): Concept {
  return {
    momenten: (dag?.momenten as DagMomenten | undefined) ?? {},
    waterMl: dag?.waterMl ?? null,
  };
}

const TEL_KNOP =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#E7EDE8] disabled:opacity-40";

export default function VoedingsdagboekScherm() {
  const today = todayInAgendaTimezone();

  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [geladen, setGeladen] = useState(false);
  const [datum, setDatum] = useState(today);
  const [concepten, setConcepten] = useState<Record<string, Concept>>({});
  const [vuil, setVuil] = useState<Record<string, boolean>>({});
  const [actiefMoment, setActiefMoment] = useState<SchermMoment>("ontbijt");
  const [menuOpen, setMenuOpen] = useState(false);
  const [zoekOpen, setZoekOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bewaardOp, setBewaardOp] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/nutrition-daybook", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled) return;
        setDagen(Array.isArray(payload?.days) ? payload.days : []);
        setGeladen(true);
      })
      .catch(() => {
        if (!cancelled) setGeladen(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    trackEvent("nutrition_dagboek_scherm_geopend", { surface: "dagboek_scherm" });
    emitAccountClientEvent("nutrition.dagboek_scherm_geopend", {
      surface: "dagboek_scherm",
    });
    clarityTag("nutrition_dagboek", "dagboek_scherm");
  }, []);

  const keuzedagen = useMemo(
    () => Array.from({ length: DAGEN_IN_KEUZE }, (_, index) => addAgendaDays(today, -index)),
    [today],
  );

  const dagOpDatum = useMemo(
    () => dagen.find((dag) => dag.date === datum),
    [dagen, datum],
  );

  const concept = concepten[datum] ?? conceptVanDag(dagOpDatum);
  const momenten = concept.momenten;
  const waterMl = concept.waterMl;
  const isVuil = Boolean(vuil[datum]);

  function pasConceptAan(volgende: Concept) {
    setConcepten((vorige) => ({ ...vorige, [datum]: volgende }));
    setVuil((vorige) => ({ ...vorige, [datum]: true }));
    setBewaardOp(null);
  }

  function zetGroep(moment: EetmomentId, groep: VoedselgroepId, aantal: number) {
    const inhoud = { ...(momenten[moment] ?? {}) };
    if (aantal <= 0) {
      delete inhoud[groep];
    } else {
      inhoud[groep] = Math.min(aantal, 20);
    }
    const volgendeMomenten: DagMomenten = { ...momenten };
    if (Object.keys(inhoud).length === 0) {
      delete volgendeMomenten[moment];
    } else {
      volgendeMomenten[moment] = inhoud;
    }
    pasConceptAan({ momenten: volgendeMomenten, waterMl });
  }

  function zetWater(ml: number | null) {
    pasConceptAan({ momenten, waterMl: ml });
  }

  function voegToeUitZoeken(moment: EetmomentId, entry: CatalogEntry) {
    const huidig = momenten[moment]?.[entry.groep] ?? 0;
    zetGroep(moment, entry.groep, huidig + 1);
    trackEvent("nutrition_dagboek_zoeken_toegevoegd", {
      surface: "dagboek_scherm",
      moment,
      groep: entry.groep,
      food_key: entry.key,
    });
    emitAccountClientEvent("nutrition.dagboek_zoeken_toegevoegd", {
      surface: "dagboek_scherm",
      moment,
      groep: entry.groep,
      food_key: entry.key,
    });
  }

  function kopieerVanDag(bronDatum: string) {
    const bron = dagen.find((dag) => dag.date === bronDatum);
    if (!bron) return;
    const bronConcept = conceptVanDag(bron);
    pasConceptAan(bronConcept);
    trackEvent("nutrition_dagboek_dag_gekopieerd", {
      surface: "dagboek_scherm",
      van_soort: bron.soort,
      naar_soort: dagSoortVoor(datum),
    });
    emitAccountClientEvent("nutrition.dagboek_dag_gekopieerd", {
      surface: "dagboek_scherm",
      van_soort: bron.soort,
      naar_soort: dagSoortVoor(datum),
    });
  }

  async function bewaar() {
    if (busy) return;
    const heeftInhoud =
      Object.keys(momenten).length > 0 || (waterMl ?? 0) > 0;
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
        body: JSON.stringify({ date: datum, meals: momenten, water_ml: waterMl }),
      });
      if (!response.ok) {
        throw new Error("Kon je dag niet opslaan.");
      }

      const nieuweDag: DagboekDag = {
        date: datum,
        soort: dagSoortVoor(datum),
        porties: portiesUitMomenten(momenten),
        momenten,
        waterMl,
      };
      setDagen((vorige) => [nieuweDag, ...vorige.filter((dag) => dag.date !== datum)]);
      setVuil((vorige) => ({ ...vorige, [datum]: false }));
      setBewaardOp(datum);

      trackEvent("nutrition_dagboek_day_saved", {
        surface: "dagboek_scherm",
        soort: nieuweDag.soort,
      });
      emitAccountClientEvent("nutrition.dagboek_day_saved", {
        day_kind: nieuweDag.soort,
        filled_days: dagen.filter((dag) => dag.date !== datum).length + 1,
        surface: "dagboek_scherm",
      });
    } catch (oorzaak) {
      setError(
        oorzaak instanceof Error ? oorzaak.message : "Kon je dag niet opslaan.",
      );
    } finally {
      setBusy(false);
    }
  }

  const dagPorties = useMemo(() => portiesUitMomenten(momenten), [momenten]);
  const groepenVandaag = DAGBOEK_GROEPEN.filter(
    (groep) => (dagPorties[groep] ?? 0) > 0,
  );

  const actiefLabel =
    MOMENT_KEUZES.find((keuze) => keuze.id === actiefMoment)?.label ?? "Ontbijt";

  const inhoudVanMoment =
    actiefMoment === WATER_ID ? {} : (momenten[actiefMoment] ?? {});
  const gekozenInMoment = Object.entries(inhoudVanMoment).filter(
    ([, aantal]) => (aantal ?? 0) > 0,
  );

  const kopieerBronnen = dagen
    .filter((dag) => dag.date !== datum)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="min-h-screen bg-[#0F1511] pb-24 pt-4">
      <Container>
        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard?tab=voortgang"
              className="inline-flex min-h-9 items-center gap-1 text-[12.5px] text-[#9FB0A6] no-underline hover:text-[#E7EDE8]"
            >
              <Icons.ChevronLeft s={15} />
              Dashboard
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3.5 text-[14px] font-semibold text-[#9CC5A9]"
              >
                {actiefLabel}
                <Icons.ChevronDown s={14} />
              </button>

              {menuOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Menu sluiten"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-10 cursor-default border-none bg-transparent p-0"
                  />
                  <ul
                    role="menu"
                    className="absolute right-0 z-20 mt-1 m-0 flex w-48 list-none flex-col gap-0 rounded-[12px] border border-white/10 bg-[#161D18] p-1 shadow-lg"
                  >
                    {MOMENT_KEUZES.map((keuze) => (
                      <li key={keuze.id} role="none">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiefMoment(keuze.id);
                            setMenuOpen(false);
                            setZoekOpen(false);
                          }}
                          className={`w-full cursor-pointer rounded-[8px] border-none px-3 py-2 text-left text-[13.5px] transition-colors hover:bg-white/[0.06] ${
                            keuze.id === actiefMoment
                              ? "bg-white/[0.04] text-[#9CC5A9]"
                              : "bg-transparent text-[#E7EDE8]"
                          }`}
                        >
                          {keuze.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>

          <section
            aria-label="Dagtotaal"
            className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-[26px] font-semibold leading-none tabular-nums text-[#F1EFE8]">
                  {groepenVandaag.length}
                  <span className="text-[13px] font-normal text-[#7E8C82]">
                    {" "}
                    / {DAGBOEK_GROEPEN.length}
                  </span>
                </span>
                <span className="mt-1 block text-[11.5px] text-[#9FB0A6]">
                  voedselgroepen op {dagLabel(datum, today).toLowerCase()}
                </span>
              </span>

              <label className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                <span className="sr-only">Welke dag</span>
                <select
                  value={datum}
                  disabled={busy}
                  onChange={(event) => {
                    setDatum(event.target.value);
                    setZoekOpen(false);
                    setError(null);
                  }}
                  className="block min-h-9 rounded-[10px] border border-white/10 bg-black/30 px-2.5 text-[13px] font-normal normal-case tracking-normal text-[#F1EFE8]"
                >
                  {keuzedagen.map((dag) => (
                    <option key={dag} value={dag}>
                      {dagLabel(dag, today)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {groepenVandaag.length > 0 ? (
              <p className="m-0 mt-2 text-[11.5px] leading-relaxed text-[#7E8C82]">
                {groepenVandaag.map((groep) => DAGBOEK_LABELS[groep]).join(" · ")}
              </p>
            ) : null}

            {waterRegel(waterMl) ? (
              <p className="m-0 mt-1.5 text-[11.5px] leading-relaxed text-[#7E8C82]">
                {waterRegel(waterMl)}
              </p>
            ) : null}
          </section>

          {kopieerBronnen.length > 0 && actiefMoment !== WATER_ID ? (
            <label className="mt-3 block text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
              Kopiëren van
              <select
                value=""
                disabled={busy}
                onChange={(event) => {
                  if (event.target.value) kopieerVanDag(event.target.value);
                }}
                className="mt-1 block min-h-9 w-full rounded-[10px] border border-white/10 bg-black/25 px-2.5 text-[13px] font-normal normal-case tracking-normal text-[#F1EFE8]"
              >
                <option value="">Begin leeg, of neem een eerdere dag over…</option>
                {kopieerBronnen.map((dag) => (
                  <option key={dag.date} value={dag.date}>
                    {dagLabel(dag.date, today)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {actiefMoment === WATER_ID ? (
            <section
              aria-label="Water"
              className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              <h2 className="m-0 text-[13px] font-semibold text-[#E7EDE8]">Water</h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy || (waterMl ?? 0) <= 0}
                  onClick={() => zetWater(Math.max(0, (waterMl ?? 0) - WATER_GLAS_ML))}
                  aria-label="Eén glas water minder"
                  className={TEL_KNOP}
                >
                  −
                </button>
                <label className="flex items-center gap-1">
                  <span className="sr-only">Water in milliliters</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={50}
                    value={waterMl ?? 0}
                    disabled={busy}
                    onChange={(event) => zetWater(Number(event.target.value) || 0)}
                    className="w-[5rem] rounded-[8px] border border-white/10 bg-black/30 px-2 py-1.5 text-right text-[13px] tabular-nums text-[#F1EFE8]"
                  />
                  <span className="text-[11.5px] text-[#7E8C82]">ml</span>
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => zetWater((waterMl ?? 0) + WATER_GLAS_ML)}
                  aria-label="Eén glas water meer"
                  className={TEL_KNOP}
                >
                  +
                </button>
                <span className="text-[11.5px] text-[#7E8C82]">
                  1 glas ≈ {WATER_GLAS_ML} ml
                </span>
              </div>
            </section>
          ) : (
            <section
              aria-label={actiefLabel}
              className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              {/* Wat er al staat blijft in beeld terwijl je zoekt: anders voeg
                  je toe zonder te zien dat het aankwam. */}
              {gekozenInMoment.length > 0 ? (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {gekozenInMoment.map(([groepRaw, aantal]) => {
                    const groep = groepRaw as VoedselgroepId;
                    const hint = portieHint(groep);
                    return (
                      <li
                        key={groep}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] leading-snug text-[#E7EDE8]">
                            {DAGBOEK_LABELS[groep]}
                          </span>
                          {hint ? (
                            <span
                              className="block text-[10.5px] leading-snug text-[#7E8C82]"
                              title={hint.bron}
                            >
                              {hint.label}
                            </span>
                          ) : null}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              zetGroep(actiefMoment, groep, (aantal ?? 0) - 1)
                            }
                            aria-label={`Eén ${DAGBOEK_LABELS[groep].toLowerCase()} minder bij ${actiefLabel.toLowerCase()}`}
                            className={TEL_KNOP}
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-[14px] tabular-nums text-[#F1EFE8]">
                            {aantal}
                          </span>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              zetGroep(actiefMoment, groep, (aantal ?? 0) + 1)
                            }
                            aria-label={`Eén ${DAGBOEK_LABELS[groep].toLowerCase()} meer bij ${actiefLabel.toLowerCase()}`}
                            className={TEL_KNOP}
                          >
                            +
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : zoekOpen ? null : (
                <div className="py-2 text-center">
                  <h2 className="m-0 text-[17px] font-semibold text-[#F1EFE8]">
                    Heb je {actiefLabel.toLowerCase()} al gegeten?
                  </h2>
                  <p className="m-0 mx-auto mt-1.5 max-w-[42ch] text-[12.5px] leading-relaxed text-[#9FB0A6]">
                    Registreer wat er op tafel stond. Porties, geen grammen — een
                    schatting uit je hoofd is precies genoeg.
                  </p>
                </div>
              )}

              {zoekOpen ? (
                <NutritionVoedingsmiddelZoeken
                  momentLabel={actiefLabel}
                  busy={busy}
                  onClose={() => setZoekOpen(false)}
                  onAdd={(entry) => voegToeUitZoeken(actiefMoment, entry)}
                />
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setZoekOpen(true)}
                  className="mt-3 flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#5A8F6A]/55 bg-[#5A8F6A]/20 px-4 text-[13.5px] font-semibold text-[#F1EFE8] disabled:opacity-60"
                >
                  <Icons.Search s={14} />
                  Voedingsmiddel zoeken
                </button>
              )}

              {/* De catalogus dekt nooit alles; direct een groep kiezen blijft
                  daarom bereikbaar, ook op dit scherm. */}
              {!zoekOpen ? (
                <details className="mt-3">
                  <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7E8C82]">
                    Of kies direct een groep
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {groepenVoorMoment(actiefMoment)
                      .filter((groep) => !(inhoudVanMoment[groep] ?? 0))
                      .map((groep) => (
                        <button
                          key={groep}
                          type="button"
                          disabled={busy}
                          onClick={() => zetGroep(actiefMoment, groep, 1)}
                          className="inline-flex min-h-8 cursor-pointer items-center rounded-full border border-white/10 bg-transparent px-2.5 text-[11.5px] font-medium text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#E7EDE8] disabled:opacity-50"
                        >
                          + {DAGBOEK_LABELS[groep]}
                        </button>
                      ))}
                  </div>
                </details>
              ) : null}
            </section>
          )}

          {error ? (
            <p
              role="status"
              className="mt-3 text-[12px] leading-relaxed text-[#C8956C]"
            >
              {error}
            </p>
          ) : null}

          {!geladen ? (
            <p className="mt-3 text-[11.5px] text-[#7E8C82]">Je dagboek laden…</p>
          ) : null}
        </div>
      </Container>

      {/* Opslaan blijft in beeld: op een telefoon staat de lijst zo lang dat een
          knop onderaan de pagina buiten bereik valt. */}
      <div className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-[#0F1511]/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
          <span className="text-[11.5px] text-[#7E8C82]">
            {isVuil
              ? "Niet opgeslagen"
              : bewaardOp === datum
                ? "Opgeslagen"
                : dagOpDatum
                  ? "Eerder opgeslagen"
                  : "Nog niets ingevuld"}
          </span>
          <button
            type="button"
            disabled={busy || !isVuil}
            onClick={() => void bewaar()}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-[#5A8F6A]/55 bg-[#5A8F6A]/25 px-4 text-[13px] font-semibold text-[#F1EFE8] disabled:opacity-40"
          >
            <Icons.Check s={14} />
            {busy ? "Opslaan…" : "Dag opslaan"}
          </button>
        </div>
      </div>
    </main>
  );
}
