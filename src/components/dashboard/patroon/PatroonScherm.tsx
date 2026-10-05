"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TEKORT_VOORSTELLEN } from "@/data/agenda/tekort-voorstellen";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import PatroonDoelenKaart, {
  type SupplementWeek,
} from "@/components/dashboard/patroon/PatroonDoelenKaart";
import PatroonMaaltijden from "@/components/dashboard/patroon/PatroonMaaltijden";
import PatroonNutrientTabel from "@/components/dashboard/patroon/PatroonNutrientTabel";
import PatroonSubtabs, {
  type PatroonSectie,
} from "@/components/dashboard/patroon/PatroonSubtabs";
import PatroonTrend from "@/components/dashboard/patroon/PatroonTrend";
import PatroonGevolgdTabel from "@/components/dashboard/patroon/PatroonGevolgdTabel";
import PatroonGevolgdWeek from "@/components/dashboard/patroon/PatroonGevolgdWeek";
import PatroonVensterTabel from "@/components/dashboard/patroon/PatroonVensterTabel";
import { VoedingThemaProvider } from "@/components/dashboard/patroon/VoedingThema";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { LEGE_MACRO_DOELEN, type MacroDoelen } from "@/lib/account-macro-doelen";
import { fetchMacroDoelen } from "@/lib/macro-doelen-client";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import {
  hoeveelheid,
  percentageADH,
  vensterKolommen,
} from "@/lib/nutrition-tekortsysteem-copy";
import { clarityTag } from "@/lib/clarity";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  nutrientenGesplitstUitItems,
  sanitizeItems,
} from "@/lib/nutrition-dagboek-items";
import { bouwMaaltijdPatroon } from "@/lib/nutrition-maaltijd-patroon";
import { bouwVoedingWeekoverzicht } from "@/lib/nutrition-voeding-weekoverzicht";
import {
  bepaalBevinding,
  bouwTekortsysteem,
} from "@/lib/nutrition-tekortsysteem";
import { bouwTrend } from "@/lib/nutrition-trend";
import { useGevolgdeStoffen } from "@/lib/use-gevolgde-stoffen";
import { useVoedingsdataPeriode } from "@/lib/use-voedingsdata-periode";
import { bouwGevolgdeVensters } from "@/lib/nutrition-gevolgde-vensters";
import { bouwGevolgdeWeken, gevolgdPerDag } from "@/lib/nutrition-gevolgde-weken";
import { useKernstofNormen } from "@/lib/use-kernstof-normen";
import {
  bouwWeekoverzicht,
  verschuifWeek,
  weekDatums,
  weekLabel,
  weekStart,
} from "@/lib/nutrition-weekoverzicht";

/**
 * Je patroon: waar zit je gat, en hoe hardnekkig is het.
 *
 * ## Eén scherm, vier secties via een sub-tab-balk
 *
 * Vorm komt uit de MyFitnessPal Voortgang-header: een titelbalk met een
 * horizontaal scrollbare rij secties eronder. Bij ons: **Per maaltijd ·
 * Samenvatting · Per stof · Trend** (`BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`).
 * Per maaltijd staat voorop omdat mensen hun dag per moment terughalen; de
 * oude tabs "Deze week" en "Voedingsstoffen" zijn samen "Per stof" geworden,
 * omdat ze dezelfde stoffen twee keer naast een ander tijdvenster zetten.
 *
 * ## Eén gedeeld thema
 *
 * Alle kleuren komen uit `--vd-*`-tokens in `globals.css`, niet uit hardcoded
 * hex in de JSX. Sinds 23 september 2026 zijn dat dezelfde tokens als
 * Dagboek/Mijn Dag en CockpitShell gebruiken — één donker voedingsdashboard,
 * geen licht/donker-keuze meer.
 */

const MAALTIJD_PERIODE_DAGEN = 30;

function PatroonInhoud() {
  const vandaag = todayInAgendaTimezone();
  const normen = useKernstofNormen();
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [laden, setLaden] = useState(true);
  const [sectie, setSectie] = useState<PatroonSectie>("maaltijden");
  const [macroDoelen, setMacroDoelen] = useState<MacroDoelen>(LEGE_MACRO_DOELEN);
  const [weekOffset, setWeekOffset] = useState(0);
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

  const huidigeWeek = useMemo(() => weekStart(vandaag), [vandaag]);
  const bekekenWeekStart = useMemo(
    () => verschuifWeek(huidigeWeek, weekOffset),
    [huidigeWeek, weekOffset],
  );
  const week = useMemo(
    () => bouwWeekoverzicht(dagen, bekekenWeekStart, normen),
    [dagen, bekekenWeekStart, normen],
  );
  const isHuidigeWeek = weekOffset === 0;

  const trends = useMemo(() => bouwTrend(dagen, vandaag, normen), [dagen, vandaag, normen]);

  // Eén periode voor alle gevolgde stoffen: de zes trendweken, en minstens de
  // 30 dagen van de vensters. Oudere weken in "Deze week" vallen erbuiten.
  const trendWeken = useMemo(
    () => Array.from({ length: 6 }, (_, i) => verschuifWeek(huidigeWeek, i - 5)),
    [huidigeWeek],
  );
  const dertigDagenTerug = useMemo(() => {
    const dertigTerug = new Date(`${vandaag}T00:00:00Z`);
    dertigTerug.setUTCDate(dertigTerug.getUTCDate() - (MAALTIJD_PERIODE_DAGEN - 1));
    return dertigTerug.toISOString().slice(0, 10);
  }, [vandaag]);
  const gevolgdVan = trendWeken[0]! < dertigDagenTerug ? trendWeken[0]! : dertigDagenTerug;
  const { stoffen: gevolgdeStoffen } = useGevolgdeStoffen();
  const {
    itemsPerDag,
    etiketPerDag,
    nevoProducten,
    perDag: gevolgdPerDatum,
  } = useVoedingsdataPeriode(dagen, gevolgdVan, vandaag);

  const maaltijdPatroon = useMemo(
    () =>
      bouwMaaltijdPatroon({
        itemsPerDag,
        etiketPerDag,
        nevoProducten,
        van: dertigDagenTerug,
        tot: vandaag,
      }),
    [itemsPerDag, etiketPerDag, nevoProducten, dertigDagenTerug, vandaag],
  );

  const macroWeek = useMemo(
    () => bouwVoedingWeekoverzicht(gevolgdPerDatum, weekDatums(huidigeWeek), macroDoelen),
    [gevolgdPerDatum, huidigeWeek, macroDoelen],
  );
  const huidigeWeekKernstoffen = useMemo(
    () => bouwWeekoverzicht(dagen, huidigeWeek, normen),
    [dagen, huidigeWeek, normen],
  );

  const supplementWeek = useMemo((): SupplementWeek => {
    const datums = new Set(weekDatums(huidigeWeek));
    const weekDagen = dagen
      .filter((dag) => datums.has(dag.date))
      .map((dag) => sanitizeItems(dag.items ?? []))
      .filter((items) => items.length > 0);
    const totaal = new Map<string, { label: string; minstens: number; uitSupplement: number }>();
    for (const items of weekDagen) {
      for (const stof of nutrientenGesplitstUitItems(items)) {
        const huidig = totaal.get(stof.nutrient) ?? {
          label: huidigeWeekKernstoffen.rijen.find((rij) => rij.nutrient === stof.nutrient)?.label ?? stof.nutrient,
          minstens: 0,
          uitSupplement: 0,
        };
        huidig.minstens += stof.minstens;
        huidig.uitSupplement += stof.uitSupplement;
        totaal.set(stof.nutrient, huidig);
      }
    }
    return {
      dagenMetSupplement: weekDagen.filter((items) => items.some((item) => item.bron === "supplement")).length,
      dagenGeregistreerd: weekDagen.length,
      aandeelPerStof: [...totaal.entries()]
        .filter(([, stof]) => stof.uitSupplement > 0 && stof.minstens > 0)
        .map(([nutrient, stof]) => ({ nutrient, label: stof.label, aandeel: stof.uitSupplement / stof.minstens })),
    };
  }, [dagen, huidigeWeek, huidigeWeekKernstoffen]);
  const gevolgd = useMemo(
    () => bouwGevolgdeVensters(gevolgdPerDatum, gevolgdeStoffen, vandaag),
    [gevolgdPerDatum, gevolgdeStoffen, vandaag],
  );
  const gevolgdTrend = useMemo(
    () => bouwGevolgdeWeken(gevolgdPerDatum, gevolgdeStoffen, trendWeken),
    [gevolgdPerDatum, gevolgdeStoffen, trendWeken],
  );
  const bekekenWeekBinnenPeriode = bekekenWeekStart >= gevolgdVan;
  const gevolgdWeek = useMemo(
    () => (bekekenWeekBinnenPeriode ? bouwGevolgdeWeken(gevolgdPerDatum, gevolgdeStoffen, [bekekenWeekStart]) : []),
    [bekekenWeekBinnenPeriode, gevolgdPerDatum, gevolgdeStoffen, bekekenWeekStart],
  );
  const gevolgdHuidigeWeek = useMemo(
    () => bouwGevolgdeWeken(gevolgdPerDatum, gevolgdeStoffen, [huidigeWeek]),
    [gevolgdPerDatum, gevolgdeStoffen, huidigeWeek],
  );
  const gevolgdDagenHuidigeWeek = useMemo(
    () => new Map(gevolgdeStoffen.map((stof) => [stof as string, gevolgdPerDag(gevolgdPerDatum, stof, huidigeWeek)])),
    [gevolgdeStoffen, gevolgdPerDatum, huidigeWeek],
  );
  const zelfdeVensters = useMemo(
    () => new Set(vensterKolommen(reeksen).filter((k) => k.zelfde).map((k) => k.dagen_terug)),
    [reeksen],
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
    trackEvent("nutrition_patroon_sectie_gekozen", { sectie: volgende });
  };

  const bladerWeek = (weken: number) => {
    const volgendeOffset = weekOffset + weken;
    if (volgendeOffset > 0) return; // nooit de toekomst in
    setWeekOffset(volgendeOffset);
    trackEvent("nutrition_weekoverzicht_blader", {
      richting: weken < 0 ? "terug" : "vooruit",
    });
  };

  return (
    <div className="vd-paneel">
      <div className="vd-scherm-kop">
        <h2>Je patroon</h2>
      </div>

      <PatroonSubtabs actief={sectie} onKies={kiesSectie} />

      {laden ? (
        <p className="vd-note">Je patroon wordt berekend…</p>
      ) : sectie === "maaltijden" ? (
        <PatroonMaaltijden patroon={maaltijdPatroon} periodeDagen={MAALTIJD_PERIODE_DAGEN} />
      ) : sectie === "samenvatting" ? (
        <>
          <PatroonDoelenKaart
            macro={macroWeek}
            kernstoffen={huidigeWeekKernstoffen.rijen}
            supplementen={supplementWeek}
          />

          <PatroonNutrientTabel
            reeksen={reeksen}
            verborgen={verborgenNutrients}
            onToggle={toggleNutrient}
          />

          {gevolgdHuidigeWeek.length > 0 ? (
            <>
              <p className="vd-eyebrow" style={{ margin: "1rem 0 0.375rem" }}>
                Ook gevolgd · zonder oordeel
              </p>
              <PatroonGevolgdWeek
                variant="kaarten"
                reeksen={gevolgdHuidigeWeek}
                perDag={gevolgdDagenHuidigeWeek}
                onOpen={() => kiesSectie("stof")}
              />
            </>
          ) : null}
        </>
      ) : sectie === "stof" ? (
        <>
          <div className="vd-weekbalk">
            <button
              type="button"
              onClick={() => bladerWeek(-1)}
              aria-label="Vorige week"
              className="vd-blader"
            >
              ‹
            </button>
            <h3 className="vd-weektitel">{weekLabel(week.start, week.eind)}</h3>
            <button
              type="button"
              onClick={() => bladerWeek(1)}
              disabled={isHuidigeWeek}
              aria-label="Volgende week"
              className="vd-blader"
            >
              ›
            </button>
          </div>

          <p className="vd-tag" style={{ margin: "0 0 0.5rem" }}>
            {week.dagenGeregistreerd === 0
              ? "In deze week staat nog niets geregistreerd."
              : `Gemiddelde over ${week.dagenGeregistreerd} geregistreerde ${week.dagenGeregistreerd === 1 ? "dag" : "dagen"} — een ondergrens.`}
          </p>

          <div className="vd-tabel vd-tabel--los">
            <div className="vd-tabel-kop vd-week-kop">
              <span>Stof</span>
              <span>Gem.</span>
              <span>ADH</span>
            </div>

            {week.rijen.map((rij) => {
              const vulling =
                rij.aandeel === null ? 0 : Math.min(Math.round(rij.aandeel * 100), 100);

              return (
                <Link
                  key={rij.nutrient}
                  href={rij.comparisonPath}
                  onClick={() => {
                    // De enige uitgang van het dashboard naar de monetisatie.
                    // `nutrient` zegt welke vergelijkingspagina dit scherm
                    // voedt, `covered` of mensen ook klikken als hun dekking al
                    // bewezen is.
                    trackEvent("nutrition_week_nutrient_clicked", {
                      nutrient: rij.nutrient,
                      gedekt: rij.gedekt === true,
                      destination: rij.comparisonPath,
                    });
                    emitAccountClientEvent("nutrition.week_nutrient_clicked", {
                      nutrient: rij.nutrient,
                      covered: rij.gedekt === true,
                      days_logged: week.dagenGeregistreerd,
                    });
                    clarityTag("nutrition_weekoverzicht", `stof_${rij.nutrient}`);
                  }}
                  className="vd-tabel-rij vd-week-rij"
                >
                  <span className="vd-naam">
                    <span className="vd-naam-kop">
                      {rij.label}
                      {rij.gedekt ? (
                        <span className="vd-pil" data-toon="sage">
                          gedekt
                        </span>
                      ) : null}
                    </span>
                    <i>
                      {rij.dagenMetBron === 0
                        ? rij.bewijsbaar
                          ? "nog niets geregistreerd"
                          : "met een dagboek niet aan te tonen"
                        : rij.referentie === null
                          ? "eigen doel"
                          : rij.teGaan === null
                            ? `${rij.referentie} ${rij.unit} ADH — gehaald`
                            : `nog ${hoeveelheid(rij.teGaan)} ${rij.unit} te gaan tot ${rij.referentie} ${rij.unit}`}
                    </i>
                  </span>

                  <span className="vd-getal">
                    {rij.dagenMetBron === 0 ? "n.o." : hoeveelheid(rij.gemiddeld)}
                  </span>

                  <span className="vd-cel">
                    {rij.dagenMetBron > 0 && rij.referentie !== null ? (
                      <span
                        style={{
                          width: `${vulling}%`,
                          background: rij.gedekt ? "var(--vd-sage)" : "var(--vd-terra)",
                        }}
                      />
                    ) : null}
                    <b data-gevuld={rij.dagenMetBron > 0 && vulling > 0 ? "ja" : "nee"}>
                      {rij.dagenMetBron === 0 || rij.referentie === null
                        ? "—"
                        : percentageADH(rij.aandeel)}
                    </b>
                  </span>
                </Link>
              );
            })}
          </div>

          {gevolgdWeek.length > 0 ? (
            <div style={{ marginTop: "0.75rem" }}>
              <PatroonGevolgdWeek variant="tabel" reeksen={gevolgdWeek} />
            </div>
          ) : null}

          <p className="vd-eyebrow" style={{ margin: "1.5rem 0 0.375rem" }}>
            Hoe hardnekkig · vandaag tot 30 dagen
          </p>
          <PatroonVensterTabel reeksen={reeksen} />
          <PatroonGevolgdTabel reeksen={gevolgd} zelfde={zelfdeVensters} />

          {bevinding && TEKORT_VOORSTELLEN[bevinding.nutrient] ? (
            <p className="vd-note">
              <strong>{bevinding.label} is je hardnekkigste patroon.</strong> Zet er een
              moment voor in je dag.{" "}
              <Link
                href={`/dashboard?tab=agenda&plan=${bevinding.nutrient}`}
                onClick={() => {
                  trackEvent("patroon_plan_in_mijn_dag_click", {
                    nutrient: bevinding.nutrient,
                  });
                  clarityTag("nutrition_patroon", `plan_${bevinding.nutrient}`);
                }}
              >
                Plan in Mijn Dag →
              </Link>
            </p>
          ) : null}

          <p className="vd-note">
            Een stof die in alle vensters laag staat is een patroon; alleen vandaag laag is een dag.
            ADH is een ondergrens, geen bewijs van een tekort. Zink en vitamine D krijgen geen
            oordeel: een dagboek kan ze niet aantonen.
          </p>
        </>
      ) : (
        <>
          <p className="vd-note" style={{ marginTop: 0 }}>
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
              Alle stoffen staan uit in de tabel bij Samenvatting. Zet er daar
              minstens één aan om een trend te zien.
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
