"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import PatroonNutrientTabel from "@/components/dashboard/patroon/PatroonNutrientTabel";
import PatroonSamenvattingKaart from "@/components/dashboard/patroon/PatroonSamenvattingKaart";
import PatroonSubtabs, {
  type PatroonSectie,
} from "@/components/dashboard/patroon/PatroonSubtabs";
import PatroonTelcirkels from "@/components/dashboard/patroon/PatroonTelcirkels";
import PatroonTrend from "@/components/dashboard/patroon/PatroonTrend";
import PatroonVensterTabel from "@/components/dashboard/patroon/PatroonVensterTabel";
import { VoedingThemaProvider } from "@/components/dashboard/patroon/VoedingThema";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { clarityTag } from "@/lib/clarity";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { nutrientenUitItems, sanitizeItems } from "@/lib/nutrition-dagboek-items";
import {
  bepaalBevinding,
  bouwTekortsysteem,
} from "@/lib/nutrition-tekortsysteem";
import {
  bevindingZin,
  geenBevindingZin,
} from "@/lib/nutrition-tekortsysteem-copy";
import { bouwTrend } from "@/lib/nutrition-trend";
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
 * horizontaal scrollbare rij secties eronder (Samenvatting · Calorieën ·
 * Voedingsstoffen · ...). Bij ons: **Samenvatting · Deze week ·
 * Voedingsstoffen · Trend**. Dat verving een eerdere opzet met twee losse
 * uitklap-knoppen ("Wekelijks overzicht", "Hoe hardnekkig is dit?") — die
 * opzet verstopte de vensters en het weekoverzicht achter een label dat je
 * eerst moest lezen en dan nog moest openklappen. Een tab-balk laat in één
 * blik zien wát er allemaal is, en je kiest.
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
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [laden, setLaden] = useState(true);
  const [sectie, setSectie] = useState<PatroonSectie>("samenvatting");
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
    () => bouwTekortsysteem(dagen, vandaag),
    [dagen, vandaag],
  );
  const bevinding = useMemo(
    () => bepaalBevinding(reeksen, dagen, vandaag),
    [reeksen, dagen, vandaag],
  );
  const zin = useMemo(() => bevindingZin(bevinding), [bevinding]);

  const huidigeWeek = useMemo(() => weekStart(vandaag), [vandaag]);
  const bekekenWeekStart = useMemo(
    () => verschuifWeek(huidigeWeek, weekOffset),
    [huidigeWeek, weekOffset],
  );
  const week = useMemo(
    () => bouwWeekoverzicht(dagen, bekekenWeekStart),
    [dagen, bekekenWeekStart],
  );
  const isHuidigeWeek = weekOffset === 0;

  const trends = useMemo(() => bouwTrend(dagen, vandaag), [dagen, vandaag]);

  /**
   * Per stof de zeven dagen van de bekeken week, als ondergrens of null.
   *
   * Null en nul zijn hier verschillende dingen: null betekent "die dag staat
   * niets geregistreerd", nul betekent "je noemde die dag bronnen en geen
   * ervan droeg deze stof". De staafjes tonen dat onderscheid.
   */
  const weekPerStof = useMemo(() => {
    const datums = weekDatums(bekekenWeekStart);
    const perStof = new Map<string, (number | null)[]>();

    for (const rij of week.rijen) {
      perStof.set(
        rij.nutrient,
        datums.map((datum) => {
          const dag = dagen.find((d) => d.date === datum);
          if (!dag || (dag.items?.length ?? 0) === 0) return null;
          const stof = nutrientenUitItems(sanitizeItems(dag.items ?? [])).find(
            (n) => n.nutrient === rij.nutrient,
          );
          return stof?.minstens ?? 0;
        }),
      );
    }
    return perStof;
  }, [dagen, bekekenWeekStart, week.rijen]);

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
      ) : sectie === "samenvatting" ? (
        <>
          <PatroonNutrientTabel
            rijen={week.rijen}
            trends={trends}
            verborgen={verborgenNutrients}
            onToggle={toggleNutrient}
          />

          {zin ? (
            <div className="vd-bevinding">
              <span className="vd-bevinding-ico" aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="var(--vd-terra)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M12 8v5" />
                  <circle cx="12" cy="16.5" r=".6" fill="var(--vd-terra)" />
                  <path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
              </span>
              <div className="vd-bevinding-txt">
                <b>{zin.tekst}</b>
              </div>
            </div>
          ) : (
            <p className="vd-note">{geenBevindingZin(reeksen)}</p>
          )}

          <div className="vd-kop" style={{ marginTop: "1rem" }}>
            <p className="vd-eyebrow" style={{ margin: 0 }}>
              Deze week
            </p>
            <span className="vd-tag">
              {gevuldeDagen === 0
                ? "nog geen dagen"
                : `${gevuldeDagen} ${gevuldeDagen === 1 ? "dag" : "dagen"} geregistreerd`}
            </span>
          </div>

          <ul
            className="m-0 flex list-none flex-col gap-2 p-0"
            aria-label="Voedingsstoffen deze week"
          >
            {week.rijen.map((rij) => (
              <PatroonSamenvattingKaart
                key={rij.nutrient}
                rij={rij}
                dagen={weekPerStof.get(rij.nutrient) ?? []}
                onOpen={() => kiesSectie("week")}
              />
            ))}
          </ul>
        </>
      ) : sectie === "week" ? (
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

          <p className="vd-note" style={{ marginTop: 0 }}>
            {week.dagenGeregistreerd === 0 ? (
              "In deze week staat nog niets geregistreerd. Vul een dag in je dagboek in — dan rekent dit overzicht mee."
            ) : (
              <>
                Je registreerde{" "}
                <strong>
                  {week.dagenGeregistreerd}{" "}
                  {week.dagenGeregistreerd === 1 ? "dag" : "dagen"}
                </strong>{" "}
                in deze week. Alles hieronder is het gemiddelde daarover — en
                een ondergrens, want wat je niet noemde kan er alleen bij komen.
              </>
            )}
          </p>

          <p className="vd-eyebrow" style={{ margin: "1rem 0 0.375rem" }}>
            Deze week logde je
          </p>
          <PatroonTelcirkels
            rijen={week.rijen}
            dagenGeregistreerd={week.dagenGeregistreerd}
          />

          <p className="vd-eyebrow" style={{ margin: "1.25rem 0 0.5rem" }}>
            Per stof
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

          <p className="vd-note">
            <strong>ADH is een ondergrens, geen bewijs van een tekort.</strong>{" "}
            Dat je iets niet registreerde betekent niet dat je het niet
            binnenkreeg — daarom staat er nooit een kruis, en bij een gehaalde
            ADH &ldquo;gedekt&rdquo;.
          </p>
        </>
      ) : sectie === "voedingsstoffen" ? (
        <>
          <PatroonVensterTabel reeksen={reeksen} />

          <p className="vd-note" data-toon="terra">
            <strong>Vier vensters, geen gemiddelde.</strong> Een stof die in
            alle vier laag staat is een patroon; een stof die alleen vandaag
            laag staat is een dag. Daarom staan ze naast elkaar en maken we er
            geen cijfer van.
          </p>

          <p className="vd-note" data-toon="amber">
            <strong>Zink en vitamine D krijgen geen oordeel.</strong> Bronnen
            leveren 1–4 mg zink per portie tegen 10 mg RI; vitamine D komt uit
            zon en verrijking, niet uit voeding. Meer dagen meten maakt een
            onmeetbare stof niet meetbaar.
          </p>
        </>
      ) : (
        <>
          <p className="vd-note" style={{ marginTop: 0 }}>
            Je weekgemiddelde per stof, de laatste zes weken. Een lege plek
            betekent dat je die week niets registreerde — geen nul, want dat
            zou een meting beweren die er niet is.
          </p>
          <PatroonTrend
            trends={trends.filter((trend) => !verborgenNutrients.has(trend.nutrient))}
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
