"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TEKORT_VOORSTELLEN } from "@/data/agenda/tekort-voorstellen";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import GevolgdeStoffenKiezer from "@/components/dashboard/doelen/GevolgdeStoffenKiezer";
import PatroonDoelenKaart, {
  type SupplementWeek,
} from "@/components/dashboard/patroon/PatroonDoelenKaart";
import PatroonGevolgdWeek from "@/components/dashboard/patroon/PatroonGevolgdWeek";
import PatroonMaaltijden from "@/components/dashboard/patroon/PatroonMaaltijden";
import PatroonPeriodeKiezer from "@/components/dashboard/patroon/PatroonPeriodeKiezer";
import PatroonStofDetail from "@/components/dashboard/patroon/PatroonStofDetail";
import PatroonStofTabel from "@/components/dashboard/patroon/PatroonStofTabel";
import PatroonSubtabs, {
  type PatroonSectie,
} from "@/components/dashboard/patroon/PatroonSubtabs";
import PatroonTrend from "@/components/dashboard/patroon/PatroonTrend";
import { VoedingThemaProvider } from "@/components/dashboard/patroon/VoedingThema";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { LEGE_MACRO_DOELEN, type MacroDoelen } from "@/lib/account-macro-doelen";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import { fetchMacroDoelen } from "@/lib/macro-doelen-client";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { nutrientenGesplitstUitItems, sanitizeItems } from "@/lib/nutrition-dagboek-items";
import { bouwGevolgdePeriode, bouwGevolgdeWeken } from "@/lib/nutrition-gevolgde-weken";
import { bouwMaaltijdPatroon } from "@/lib/nutrition-maaltijd-patroon";
import {
  datumsTussen,
  MAX_PERIODE_DAGEN,
  periodeLabel,
  periodeVoorKeuze,
  verschuifDag,
  type Periode,
  type PeriodeKeuze,
} from "@/lib/nutrition-periode";
import { bronnenVanStof, stofPerMoment } from "@/lib/nutrition-stof-bronnen";
import { bepaalBevinding, bouwTekortsysteem } from "@/lib/nutrition-tekortsysteem";
import { bouwTrend } from "@/lib/nutrition-trend";
import { bouwVoedingWeekoverzicht } from "@/lib/nutrition-voeding-weekoverzicht";
import { bouwPeriodeOverzicht, verschuifWeek, weekStart } from "@/lib/nutrition-weekoverzicht";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { useGevolgdeNormen, useKernstofNormen } from "@/lib/use-kernstof-normen";
import { useVoedingsdataPeriode } from "@/lib/use-voedingsdata-periode";
import { bewaarPatroonStand, leesPatroonUrl } from "@/lib/patroon-url";
import { gaNaarDashboard } from "@/lib/dagboek-deeplink";

/**
 * Je patroon: waar zit je gat, en hoe hardnekkig is het.
 *
 * ## Eén scherm, vier secties via een sub-tab-balk
 *
 * Vorm komt uit de MyFitnessPal Voortgang-header: een titelbalk met een
 * horizontaal scrollbare rij secties eronder. Bij ons: **Per maaltijd · Per
 * stof · Trend** (`BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`). Per maaltijd
 * staat voorop omdat mensen hun dag per moment terughalen. Samenvatting,
 * Deze week en Voedingsstoffen zijn opgegaan in Per stof: ze zetten dezelfde
 * stoffen drie keer naast een ander tijdvenster.
 *
 * ## Eén periode voor twee tabs
 *
 * Per maaltijd en Per stof rekenen over dezelfde periode (vandaag, 7 dagen,
 * 30 dagen of zelf gekozen op de kalender). Wissel je van tab, dan blijft
 * die staan.
 *
 * ## Eén gedeeld thema
 *
 * Alle kleuren komen uit `--vd-*`-tokens in `globals.css`, niet uit hardcoded
 * hex in de JSX. Sinds 23 september 2026 zijn dat dezelfde tokens als
 * Dagboek/Mijn Dag en CockpitShell gebruiken — één donker voedingsdashboard,
 * geen licht/donker-keuze meer.
 */


function PatroonInhoud() {
  const vandaag = todayInAgendaTimezone();
  const normen = useKernstofNormen();
  const gevolgdeNormen = useGevolgdeNormen();
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [laden, setLaden] = useState(true);
  // Terugkomen via de terugknop: begin in de stand die in de URL staat
  // (`src/lib/patroon-url.ts`). Patroon rendert alleen in de browser
  // (`VoortgangHub` is `ssr: false`), dus lezen in de initiële state is veilig.
  const [startStand] = useState(() =>
    typeof window === "undefined" ? null : leesPatroonUrl(window.location.search),
  );
  const [startZoek, setStartZoek] = useState(startStand?.zoek ?? "");
  const [sectie, setSectie] = useState<PatroonSectie>(startStand?.sectie ?? "maaltijden");
  const [macroDoelen, setMacroDoelen] = useState<MacroDoelen>(LEGE_MACRO_DOELEN);
  const [periodeKeuze, setPeriodeKeuze] = useState<PeriodeKeuze>(startStand?.periode ?? "7");
  const [periode, setPeriode] = useState<Periode>(() => periodeVoorKeuze(startStand?.periode ?? "7", vandaag));
  const [openStof, setOpenStof] = useState<NutrientId | null>(
    startStand?.sectie === "stof" ? startStand.stof : null,
  );
  const [kiezerOpen, setKiezerOpen] = useState(false);
  const [verborgenNutrients, setVerborgenNutrients] = useState<Set<NutrientId>>(
    () => new Set(),
  );
  const gemeld = useRef(false);



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
        const response = await fetch("/api/account/nutrient-zichtbaarheid", {
          credentials: "include",
        });
        if (!response.ok) return;
        const body = (await response.json()) as { verborgen?: NutrientId[] };
        if (!afgebroken) setVerborgenNutrients(new Set(body.verborgen ?? []));
      } catch {
        /* stoffen blijven gewoon allemaal aan */
      }
    })();
    return () => {
      afgebroken = true;
    };
  }, []);

  useEffect(() => {
    let afgebroken = false;
    fetchMacroDoelen()
      .then((doelen) => {
        if (!afgebroken) setMacroDoelen(doelen);
      })
      .catch(() => {
        /* zonder doel toont de samenvatting "geen doel" */
      });
    return () => {
      afgebroken = true;
    };
  }, []);

  const toggleNutrient = (nutrient: NutrientId) => {
    setVerborgenNutrients((huidig) => {
      const volgende = new Set(huidig);
      const wordtZichtbaar = volgende.has(nutrient);
      if (wordtZichtbaar) {
        volgende.delete(nutrient);
      } else {
        volgende.add(nutrient);
      }

      trackEvent("nutrition_patroon_nutrient_toggle", {
        nutrient,
        zichtbaar: wordtZichtbaar,
      });
      emitAccountClientEvent("nutrition.patroon_nutrient_toggle", {
        nutrient,
        zichtbaar: wordtZichtbaar,
      });

      void fetch("/api/account/nutrient-zichtbaarheid", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutrient, zichtbaar: wordtZichtbaar }),
      }).catch(() => {
        /* voorkeur blijft lokaal staan; volgende poging probeert opnieuw */
      });

      return volgende;
    });
  };

  const reeksen = useMemo(
    () => bouwTekortsysteem(dagen, vandaag, normen),
    [dagen, vandaag, normen],
  );
  const bevinding = useMemo(
    () => bepaalBevinding(reeksen, dagen, vandaag, normen),
    [reeksen, dagen, vandaag, normen],
  );

  const datums = useMemo(() => datumsTussen(periode), [periode]);
  const periodeTekst = periodeLabel(periode);

  const huidigeWeek = useMemo(() => weekStart(vandaag), [vandaag]);
  const trends = useMemo(() => bouwTrend(dagen, vandaag, normen), [dagen, vandaag, normen]);
  const trendWeken = useMemo(
    () => Array.from({ length: 6 }, (_, i) => verschuifWeek(huidigeWeek, i - 5)),
    [huidigeWeek],
  );

  // Eén ophaalronde voor alles: de kalender gaat maximaal 42 dagen terug, en
  // de zes trendweken vallen daar binnen.
  const dataVan = verschuifDag(vandaag, -(MAX_PERIODE_DAGEN - 1));
  const { stoffen: gevolgdeStoffen } = useGevolgdeStoffen();
  const { itemsPerDag, etiketPerDag, nevoProducten, perDag } = useVoedingsdataPeriode(
    dagen,
    trendWeken[0]! < dataVan ? trendWeken[0]! : dataVan,
    vandaag,
  );

  const geregistreerd = useMemo(
    () => new Set([...perDag.entries()].filter(([, w]) => w.metWaarde + w.zonderWaarde > 0).map(([d]) => d)),
    [perDag],
  );

  const maaltijdPatroon = useMemo(
    () =>
      bouwMaaltijdPatroon({
        itemsPerDag,
        etiketPerDag,
        nevoProducten,
        van: periode.van,
        tot: periode.tot,
        normen: gevolgdeNormen,
      }),
    [itemsPerDag, etiketPerDag, nevoProducten, periode, gevolgdeNormen],
  );

  const stoffen = useMemo(
    () => bouwPeriodeOverzicht(dagen, datums, normen, { omega3AlsPeriodetotaal: true }),
    [dagen, datums, normen],
  );
  const richting = useMemo(() => new Map(reeksen.map((r) => [r.nutrient, r.richting])), [reeksen]);
  const macro = useMemo(
    () => bouwVoedingWeekoverzicht(perDag, datums, macroDoelen),
    [perDag, datums, macroDoelen],
  );
  const gevolgdPeriode = useMemo(
    () => bouwGevolgdePeriode(perDag, gevolgdeStoffen, datums, gevolgdeNormen),
    [perDag, gevolgdeStoffen, datums, gevolgdeNormen],
  );
  const gevolgdTrend = useMemo(
    () => bouwGevolgdeWeken(perDag, gevolgdeStoffen, trendWeken, gevolgdeNormen),
    [perDag, gevolgdeStoffen, trendWeken, gevolgdeNormen],
  );

  const supplementen = useMemo((): SupplementWeek => {
    const binnen = new Set(datums);
    const periodeDagen = dagen
      .filter((dag) => binnen.has(dag.date))
      .map((dag) => sanitizeItems(dag.items ?? []))
      .filter((items) => items.length > 0);
    const totaal = new Map<string, { label: string; minstens: number; uitSupplement: number }>();
    for (const items of periodeDagen) {
      for (const stof of nutrientenGesplitstUitItems(items)) {
        const huidig = totaal.get(stof.nutrient) ?? {
          label: stoffen.rijen.find((rij) => rij.nutrient === stof.nutrient)?.label ?? stof.nutrient,
          minstens: 0,
          uitSupplement: 0,
        };
        huidig.minstens += stof.minstens;
        huidig.uitSupplement += stof.uitSupplement;
        totaal.set(stof.nutrient, huidig);
      }
    }
    return {
      dagenMetSupplement: periodeDagen.filter((items) => items.some((item) => item.bron === "supplement")).length,
      dagenGeregistreerd: periodeDagen.length,
      aandeelPerStof: [...totaal.entries()]
        .filter(([, stof]) => stof.uitSupplement > 0 && stof.minstens > 0)
        .map(([nutrient, stof]) => ({ nutrient, label: stof.label, aandeel: stof.uitSupplement / stof.minstens })),
    };
  }, [dagen, datums, stoffen]);

  const openRij = openStof ? stoffen.rijen.find((rij) => rij.nutrient === openStof) : undefined;
  const openBronnen = useMemo(
    () => (openStof ? bronnenVanStof(dagen, datums, openStof) : []),
    [dagen, datums, openStof],
  );
  const openPerMoment = useMemo(
    () => (openStof ? stofPerMoment(dagen, datums, openStof) : []),
    [dagen, datums, openStof],
  );

  const gevuldeDagen = useMemo(
    () => dagen.filter((dag) => (dag.items?.length ?? 0) > 0).length,
    [dagen],
  );

  useEffect(() => {
    if (laden || gemeld.current) return;
    gemeld.current = true;

    trackEvent("nutrition_tekortsysteem_viewed", {
      nutrient: bevinding?.nutrient ?? "geen",
      dagen: gevuldeDagen,
    });
    emitAccountClientEvent("nutrition.tekortsysteem_viewed", {
      nutrient: bevinding?.nutrient ?? null,
      days_logged: gevuldeDagen,
      days_under: bevinding?.dagenOnder ?? null,
      direction: bevinding?.richting ?? null,
    });
  }, [laden, bevinding, gevuldeDagen]);

  const kiesSectie = (volgende: PatroonSectie) => {
    setSectie(volgende);
    setOpenStof(null);
    bewaarPatroonStand({ sectie: volgende, stof: null, zoek: "" });
    trackEvent("nutrition_patroon_sectie_gekozen", { sectie: volgende });
  };

  const kiesPeriode = (keuze: PeriodeKeuze, volgende: Periode) => {
    setPeriodeKeuze(keuze);
    setPeriode(volgende);
    bewaarPatroonStand({ periode: keuze === "eigen" ? null : keuze });
    trackEvent("nutrition_patroon_periode_gekozen", {
      periode: keuze,
      dagen: datumsTussen(volgende).length,
      sectie,
    });
  };

  const openStofDetail = (nutrient: NutrientId) => {
    setOpenStof(nutrient);
    bewaarPatroonStand({ sectie, stof: nutrient });
    trackEvent("nutrition_patroon_stof_geopend", { nutrient });
    clarityTag("nutrition_patroon_stof", nutrient);
  };

  const periodeKiezer = (
    <PatroonPeriodeKiezer
      keuze={periodeKeuze}
      periode={periode}
      vandaag={vandaag}
      geregistreerd={geregistreerd}
      onKies={kiesPeriode}
    />
  );

  return (
    <div className="vd-paneel">
      <div className="vd-scherm-kop">
        <h2>Je patroon</h2>
      </div>

      <PatroonSubtabs actief={sectie} onKies={kiesSectie} />

      {laden ? (
        <p className="vd-note">Je patroon wordt berekend…</p>
      ) : sectie === "maaltijden" ? (
        <>
          {periodeKiezer}
          <PatroonMaaltijden patroon={maaltijdPatroon} periode={periode} />
        </>
      ) : sectie === "stof" ? (
        <>
          {periodeKiezer}
          {openRij ? (
            <PatroonStofDetail
              rij={openRij}
              periode={periode}
              dagenGeregistreerd={stoffen.dagenGeregistreerd}
              bronnen={openBronnen}
              perMoment={openPerMoment}
              startZoek={startZoek}
              onTerug={() => {
                setOpenStof(null);
                setStartZoek("");
                bewaarPatroonStand({ stof: null, zoek: "" });
              }}
            />
          ) : (
            <>
              <PatroonDoelenKaart
                periodeTekst={periodeTekst}
                macro={macro}
                kernstoffen={stoffen.rijen}
                supplementen={supplementen}
              />

              <p className="vd-eyebrow" style={{ margin: "0 0 0.375rem" }}>
                Kernstoffen · tik voor bronnen en norm
              </p>
              <PatroonStofTabel
                rijen={stoffen.rijen}
                richting={richting}
                dagenInPeriode={datums.length}
                onOpen={openStofDetail}
              />

              <div className="mt-3">
                <PatroonGevolgdWeek reeksen={gevolgdPeriode} />
                <button
                  type="button"
                  aria-expanded={kiezerOpen}
                  onClick={() => {
                    if (!kiezerOpen) {
                      trackEvent("nutrition_patroon_gevolgd_toevoegen_open", { gevolgd: gevolgdeStoffen.length });
                    }
                    setKiezerOpen(!kiezerOpen);
                  }}
                  className="mt-2 w-fit cursor-pointer border-0 bg-transparent p-0 text-left text-[12.5px] font-semibold text-[var(--vd-sage-2)] hover:underline"
                >
                  {kiezerOpen
                    ? "Klaar"
                    : gevolgdeStoffen.length > 0
                      ? "+ Stof toevoegen of weghalen"
                      : "+ Volg ook vezels, calcium, ijzer…"}
                </button>
                {kiezerOpen ? (
                  <div className="mt-2 text-[var(--vd-ink-2)]">
                    <GevolgdeStoffenKiezer surface="patroon" />
                  </div>
                ) : null}
              </div>

              {bevinding && TEKORT_VOORSTELLEN[bevinding.nutrient] ? (
                <p className="vd-note">
                  <strong>{bevinding.label} staat de laatste 30 dagen het vaakst onder je norm.</strong>{" "}
                  Zet er een moment voor in je dag.{" "}
                  <Link
                    href={`/dashboard?tab=agenda&plan=${bevinding.nutrient}`}
                    onClick={(event) => {
                      trackEvent("patroon_plan_in_mijn_dag_click", {
                        nutrient: bevinding.nutrient,
                      });
                      clarityTag("nutrition_patroon", `plan_${bevinding.nutrient}`);
                      event.preventDefault();
                      gaNaarDashboard(`/dashboard?tab=agenda&plan=${bevinding.nutrient}`);
                    }}
                  >
                    Plan in Mijn Dag →
                  </Link>
                </p>
              ) : null}

              <p className="vd-note">
                Alles is een ondergrens: wat je niet registreerde kan er alleen bij komen. Een norm geldt voor
                een groep; eronder zitten is geen tekort. Omega-3 telt over de hele periode, omdat de norm
                neerkomt op één keer per week vette vis.
              </p>
            </>
          )}
        </>
      ) : (
        <>
          <div className="vd-chiprij" role="group" aria-label="Voedingsstoffen tonen of verbergen">
            {reeksen.map((reeks) => (
              <button
                key={reeks.nutrient}
                type="button"
                className="vd-chip"
                aria-pressed={!verborgenNutrients.has(reeks.nutrient)}
                onClick={() => toggleNutrient(reeks.nutrient)}
              >
                {reeks.label}
              </button>
            ))}
          </div>
          <p className="vd-note">
            Je weekgemiddelde per stof, de laatste zes weken. Tik op een week
            voor het getal. Een streepje betekent dat je die week niets
            registreerde — geen nul, want dat zou een meting beweren die er
            niet is.
          </p>
          <PatroonTrend
            trends={trends.filter((trend) => !verborgenNutrients.has(trend.nutrient))}
            gevolgd={gevolgdTrend}
            huidigeWeek={huidigeWeek}
          />
          {trends.length > 0 &&
          trends.every((trend) => verborgenNutrients.has(trend.nutrient)) ? (
            <p className="vd-note">
              Alle stoffen staan uit. Zet er hierboven minstens één aan om een trend te zien.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function PatroonScherm() {
  return (
    <VoedingThemaProvider>
      <PatroonInhoud />
    </VoedingThemaProvider>
  );
}
