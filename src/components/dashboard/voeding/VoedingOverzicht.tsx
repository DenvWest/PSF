"use client";

import { useEffect, useMemo, useState } from "react";
import DagboekMacroRing, {
  MACRO_RING_KLEUREN,
} from "@/components/dashboard/dagboek/DagboekMacroRing";
import DagboekVoedingWeektabel from "@/components/dashboard/dagboek/DagboekVoedingWeektabel";
import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";
import VoedingswaardeTabel from "@/components/dashboard/dagboek/VoedingswaardeTabel";
import { LEGE_MACRO_DOELEN, type MacroDoelen } from "@/lib/account-macro-doelen";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import { fetchMacroDoelen } from "@/lib/macro-doelen-client";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { sanitizeItems } from "@/lib/nutrition-dagboek-items";
import type { SupermarktPortie, SupermarktVeld } from "@/lib/nutrition-supermarkt-items";
import { bouwVoedingWeekoverzicht } from "@/lib/nutrition-voeding-weekoverzicht";
import { berekenVoedingswaarde, nevoCodesVoorItems } from "@/lib/nutrition-voedingswaarde";
import { verschuifDag, weekDatums, weekStart } from "@/lib/nutrition-weekoverzicht";
import { useNevoProducten } from "@/lib/use-nevo-producten";

/**
 * Voedingsstoffen en macro's per dag of week — het analyse-deel dat tot
 * 5 oktober 2026 als tabbladen in het dagboek stond.
 *
 * Het dagboek is de plek waar je invult; hier lees je af. Twee plekken met
 * elk één taak, zodat de tabrij in het dagboek kon verdwijnen. Alle cijfers
 * komen uit dezelfde berekening als het dagboek (`berekenVoedingswaarde`),
 * dus geen scherm toont een ander getal.
 *
 * Zie BESLUIT_VOEDING_EN_DOELEN_IN_MEER_2026-10.md.
 */

type Onderdeel = "voedingsstoffen" | "macros";
type Periode = "dag" | "week";

const ONDERDELEN: { id: Onderdeel; label: string }[] = [
  { id: "voedingsstoffen", label: "Voedingsstoffen" },
  { id: "macros", label: "Macro's" },
];

const PERIODES: { id: Periode; label: string }[] = [
  { id: "dag", label: "Dag" },
  { id: "week", label: "Week" },
];

const MACRO_VELDEN = new Set<SupermarktVeld>(["carbohydrateG", "fatG", "proteinG"]);

export default function VoedingOverzicht() {
  const vandaag = todayInAgendaTimezone();
  const [onderdeel, setOnderdeel] = useState<Onderdeel>("voedingsstoffen");
  const [periode, setPeriode] = useState<Periode>("dag");
  const [datum, setDatum] = useState(vandaag);
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [laden, setLaden] = useState(true);
  const [macroDoelen, setMacroDoelen] = useState<MacroDoelen>(LEGE_MACRO_DOELEN);
  const [weekLogs, setWeekLogs] = useState<Map<string, SupermarktPortie[]>>(new Map());

  const datums = useMemo(() => weekDatums(weekStart(datum)), [datum]);

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/nutrition-daybook", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { days?: DagboekDag[] };
        if (!afgebroken) setDagen(body.days ?? []);
      } catch {
        if (!afgebroken) setDagen([]);
      } finally {
        if (!afgebroken) setLaden(false);
      }
    })();
    return () => {
      afgebroken = true;
    };
  }, []);

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      try {
        const doelen = await fetchMacroDoelen();
        if (!afgebroken) setMacroDoelen(doelen);
      } catch {
        if (!afgebroken) setMacroDoelen(LEGE_MACRO_DOELEN);
      }
    })();
    return () => {
      afgebroken = true;
    };
  }, []);

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      const paren = await Promise.all(
        datums.map(async (dagDatum) => {
          try {
            const response = await fetch(
              `/api/account/supermarkt-portie-logs?date=${encodeURIComponent(dagDatum)}`,
              { credentials: "include" },
            );
            if (!response.ok) throw new Error("laden mislukt");
            const body = (await response.json()) as { items?: SupermarktPortie[] };
            return [dagDatum, body.items ?? []] as [string, SupermarktPortie[]];
          } catch {
            return [dagDatum, []] as [string, SupermarktPortie[]];
          }
        }),
      );
      if (!afgebroken) setWeekLogs(new Map(paren));
    })();
    return () => {
      afgebroken = true;
    };
  }, [datums]);

  const itemsPerDag = useMemo(
    () =>
      new Map(
        datums.map((dagDatum) => [
          dagDatum,
          sanitizeItems(dagen.find((dag) => dag.date === dagDatum)?.items ?? []),
        ]),
      ),
    [datums, dagen],
  );
  const nevoCodes = useMemo(
    () => [...new Set(nevoCodesVoorItems([...itemsPerDag.values()].flat()))].sort(),
    [itemsPerDag],
  );
  const nevoProducten = useNevoProducten(nevoCodes);

  const dagItems = useMemo(() => itemsPerDag.get(datum) ?? [], [itemsPerDag, datum]);
  const dagLogs = useMemo(() => weekLogs.get(datum) ?? [], [weekLogs, datum]);
  const dagVoedingswaarde = useMemo(
    () => berekenVoedingswaarde({ items: dagItems, supermarktLogs: dagLogs, nevoProducten }),
    [dagItems, dagLogs, nevoProducten],
  );
  const weekoverzicht = useMemo(() => {
    const perDag = new Map(
      datums.map((dagDatum) => [
        dagDatum,
        berekenVoedingswaarde({
          items: itemsPerDag.get(dagDatum) ?? [],
          supermarktLogs: weekLogs.get(dagDatum) ?? [],
          nevoProducten,
        }),
      ]),
    );
    return bouwVoedingWeekoverzicht(perDag, datums, macroDoelen);
  }, [datums, itemsPerDag, weekLogs, nevoProducten, macroDoelen]);

  const dagCodes = new Set(nevoCodesVoorItems(dagItems));
  const dagBronProducten = [
    ...[...dagCodes].flatMap((code) => nevoProducten.get(`nevo:${code}`) ?? []),
    ...dagLogs.flatMap((log) => (log.product ? [log.product] : [])),
  ];
  const weekBronProducten = [
    ...nevoCodes.flatMap((code) => nevoProducten.get(`nevo:${code}`) ?? []),
    ...[...weekLogs.values()].flat().flatMap((log) => (log.product ? [log.product] : [])),
  ];

  const dagMacro = (veld: SupermarktVeld) =>
    dagVoedingswaarde.rijen.find((rij) => rij.veld === veld)?.waarde ?? null;

  const dagNaam = new Date(datum).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const dagLabel = dagNaam.charAt(0).toUpperCase() + dagNaam.slice(1);
  const isVandaag = datum >= vandaag;
  const isHuidigeWeek = weekStart(datum) === weekStart(vandaag);

  function blader(dagenVerschuiving: number) {
    const volgende = verschuifDag(datum, dagenVerschuiving);
    setDatum(volgende > vandaag ? vandaag : volgende);
  }

  function kiesOnderdeel(volgende: Onderdeel) {
    setOnderdeel(volgende);
    trackEvent("nutrition_dagboek_subtab_gekozen", {
      sectie: volgende,
      surface: "voeding_pagina",
    });
  }

  function kiesPeriode(volgende: Periode) {
    setPeriode(volgende);
    trackEvent("nutrition_voeding_periode_gekozen", { periode: volgende, onderdeel });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="vd-subtabs" role="tablist" aria-label="Onderdelen van je voeding">
        {ONDERDELEN.map((optie) => (
          <button
            key={optie.id}
            type="button"
            role="tab"
            id={`voeding-tab-${optie.id}`}
            aria-selected={onderdeel === optie.id}
            aria-controls="voeding-paneel"
            onClick={() => kiesOnderdeel(optie.id)}
          >
            {optie.label}
          </button>
        ))}
      </div>

      <div
        role="radiogroup"
        aria-label="Periode"
        className="flex w-full rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
      >
        {PERIODES.map((optie) => (
          <button
            key={optie.id}
            type="button"
            role="radio"
            aria-checked={periode === optie.id}
            onClick={() => kiesPeriode(optie.id)}
            className={`flex-1 cursor-pointer rounded-md px-2 py-1.5 text-[12.5px] font-semibold transition-colors ${
              periode === optie.id
                ? "bg-[var(--vd-sage)] text-[var(--vd-bg)]"
                : "text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)]"
            }`}
          >
            {optie.label}
          </button>
        ))}
      </div>

      <section
        id="voeding-paneel"
        role="tabpanel"
        aria-labelledby={`voeding-tab-${onderdeel}`}
        className="flex flex-col gap-4"
      >
        {periode === "dag" ? (
          <>
            <div className="vd-weekbalk">
              <button
                type="button"
                onClick={() => blader(-1)}
                aria-label="Vorige dag"
                className="vd-blader"
              >
                ‹
              </button>
              <h2 className="vd-weektitel">{dagLabel}</h2>
              <button
                type="button"
                onClick={() => blader(1)}
                disabled={isVandaag}
                aria-label="Volgende dag"
                className="vd-blader"
              >
                ›
              </button>
            </div>

            {onderdeel === "voedingsstoffen" ? (
              <VoedingswaardeTabel
                titel="Alles wat je at"
                toelichting={laden ? "wordt geladen…" : undefined}
                voedingswaarde={dagVoedingswaarde}
                bronProducten={dagBronProducten}
              />
            ) : (
              <>
                <DagboekMacroRing
                  kcal={dagMacro("energyKcal")}
                  segmenten={[
                    {
                      key: "koolhydraten",
                      label: "Koolhydraten",
                      gram: dagMacro("carbohydrateG"),
                      kcalPerGram: 4,
                      kleur: MACRO_RING_KLEUREN.koolhydraten,
                    },
                    {
                      key: "vet",
                      label: "Vet",
                      gram: dagMacro("fatG"),
                      kcalPerGram: 9,
                      kleur: MACRO_RING_KLEUREN.vet,
                    },
                    {
                      key: "eiwit",
                      label: "Eiwit",
                      gram: dagMacro("proteinG"),
                      kcalPerGram: 4,
                      kleur: MACRO_RING_KLEUREN.eiwit,
                    },
                  ]}
                />
                <SupermarktBronRegel producten={dagBronProducten} berekend />
              </>
            )}
          </>
        ) : (
          <>
            <DagboekVoedingWeektabel
              overzicht={weekoverzicht}
              rijen={
                onderdeel === "macros"
                  ? weekoverzicht.rijen.filter((rij) => MACRO_VELDEN.has(rij.veld))
                  : weekoverzicht.rijen
              }
              onVorigeWeek={() => blader(-7)}
              onVolgendeWeek={() => blader(7)}
              isHuidigeWeek={isHuidigeWeek}
            />
            <SupermarktBronRegel producten={weekBronProducten} berekend />
          </>
        )}
      </section>
    </div>
  );
}
