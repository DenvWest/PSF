"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PatroonSamenvattingKaart from "@/components/dashboard/patroon/PatroonSamenvattingKaart";
import PatroonVensterTabel from "@/components/dashboard/patroon/PatroonVensterTabel";
import WeekoverzichtScherm from "@/components/dashboard/patroon/WeekoverzichtScherm";
import {
  VoedingThemaKnop,
  VoedingThemaProvider,
} from "@/components/dashboard/patroon/VoedingThema";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
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
import {
  bouwWeekoverzicht,
  weekDatums,
  weekStart,
} from "@/lib/nutrition-weekoverzicht";

/**
 * Je patroon: waar zit je gat, en hoe hardnekkig is het.
 *
 * ## Drie lagen, niet één hoop
 *
 * 1. **Deze landing** — hoe ligt het er deze week bij, per stof, in één blik.
 * 2. **Het weekoverzicht** — hoe ging déze week, met de route naar het product.
 * 3. **De vier vensters** — hoe hardnekkig is het, als tabel onderaan.
 *
 * Die derde laag stond eerst bovenaan en permanent open. Hij is het
 * zwaarstwegende bewijs maar niet de eerste vraag: je opent dit scherm om te
 * zien hoe het ervoor staat, niet om vijf reeksen van vier getallen te lezen.
 *
 * ## Licht én donker
 *
 * Alle kleuren komen uit `--vd-*`-tokens in `globals.css`, niet uit hardcoded
 * hex in de JSX. Dat is wat een licht thema überhaupt mogelijk maakt, en het
 * volgt de prebuild "Vier tabs, één voeding".
 */

type Weergave = "landing" | "weekoverzicht";

function PatroonInhoud() {
  const vandaag = todayInAgendaTimezone();
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [laden, setLaden] = useState(true);
  const [weergave, setWeergave] = useState<Weergave>("landing");
  const [vensterOpen, setVensterOpen] = useState(false);
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
  const week = useMemo(
    () => bouwWeekoverzicht(dagen, huidigeWeek),
    [dagen, huidigeWeek],
  );

  /**
   * Per stof de zeven dagen van deze week, als ondergrens of null.
   *
   * Null en nul zijn hier verschillende dingen: null betekent "die dag staat
   * niets geregistreerd", nul betekent "je noemde die dag bronnen en geen
   * ervan droeg deze stof". De staafjes tonen dat onderscheid.
   */
  const weekPerStof = useMemo(() => {
    const datums = weekDatums(huidigeWeek);
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
  }, [dagen, huidigeWeek, week.rijen]);

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

  if (weergave === "weekoverzicht") {
    return (
      <WeekoverzichtScherm
        dagen={dagen}
        vandaag={vandaag}
        onTerug={() => setWeergave("landing")}
      />
    );
  }

  return (
    <div className="vd-paneel">
      <div className="vd-kop">
        <div>
          <p className="vd-eyebrow" style={{ margin: 0 }}>
            Voedingsstoffen
          </p>
          <h2>Je patroon</h2>
        </div>
        <VoedingThemaKnop />
      </div>

      {laden ? (
        <p className="vd-note">Je patroon wordt berekend…</p>
      ) : zin ? (
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

      {!laden ? (
        <>
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
                onOpen={() => {
                  trackEvent("nutrition_weekoverzicht_opened", {
                    nutrient: rij.nutrient,
                    surface: "stof_kaart",
                  });
                  setWeergave("weekoverzicht");
                }}
              />
            ))}
          </ul>

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                trackEvent("nutrition_weekoverzicht_opened", {
                  nutrient: "geen",
                  surface: "rapport_rij",
                });
                setWeergave("weekoverzicht");
              }}
              className="vd-rij-knop"
            >
              <span className="flex flex-col gap-0.5">
                <b className="vd-kaart-naam">Wekelijks overzicht</b>
                <span className="vd-kaart-sub">
                  Je week per stof, met wat elk gat dicht.
                </span>
              </span>
              <span aria-hidden className="vd-chevron">
                ›
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setVensterOpen((open) => !open);
                if (!vensterOpen) {
                  trackEvent("nutrition_vensters_opened", {
                    nutrient: bevinding?.nutrient ?? "geen",
                  });
                }
              }}
              aria-expanded={vensterOpen}
              className="vd-rij-knop"
            >
              <span className="flex flex-col gap-0.5">
                <b className="vd-kaart-naam">Hoe hardnekkig is dit?</b>
                <span className="vd-kaart-sub">
                  Vandaag, 7, 14 en 30 dagen naast elkaar.
                </span>
              </span>
              <span aria-hidden className="vd-chevron">
                {vensterOpen ? "▴" : "▾"}
              </span>
            </button>
          </div>

          {vensterOpen ? (
            <div className="mt-3">
              <PatroonVensterTabel reeksen={reeksen} />

              <p className="vd-note" data-toon="terra">
                <strong>Vier vensters, geen gemiddelde.</strong> Een stof die in
                alle vier laag staat is een patroon; een stof die alleen vandaag
                laag staat is een dag. Daarom staan ze naast elkaar en maken we
                er geen cijfer van.
              </p>

              <p className="vd-note" data-toon="amber">
                <strong>Zink en vitamine D krijgen geen oordeel.</strong> Bronnen
                leveren 1–4 mg zink per portie tegen 10 mg RI; vitamine D komt
                uit zon en verrijking, niet uit voeding. Meer dagen meten maakt
                een onmeetbare stof niet meetbaar.
              </p>
            </div>
          ) : null}
        </>
      ) : null}
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
