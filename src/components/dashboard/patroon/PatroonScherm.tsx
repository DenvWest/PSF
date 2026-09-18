"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PatroonSamenvattingKaart from "@/components/dashboard/patroon/PatroonSamenvattingKaart";
import PatroonVensterrij from "@/components/dashboard/patroon/PatroonVensterrij";
import WeekoverzichtScherm from "@/components/dashboard/patroon/WeekoverzichtScherm";
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
 * Dit scherm was één lange lijst: bevinding, dan vijf stoffen × vier vensters
 * onder elkaar. Dat is alles tegelijk tonen en de lezer laten uitzoeken wat
 * belangrijk is.
 *
 * Nu zijn het drie lagen, elk met een eigen vraag:
 *
 * 1. **Deze landing** — hoe ligt het er deze week bij, per stof, in één blik.
 * 2. **Het weekoverzicht** (`screen=weekoverzicht`) — hoe ging déze week, met
 *    de tabel en de route naar het product.
 * 3. **De vier vensters** — hoe hardnekkig is het, uitklapbaar onderaan.
 *
 * Die derde laag stond eerst bovenaan en permanent open. Hij is het
 * zwaarstwegende bewijs maar niet de eerste vraag: je opent dit scherm om te
 * zien hoe het ervoor staat, niet om vijf reeksen van vier getallen te lezen.
 * Hij is dus ingeklapt, niet weg — wie de bevinding wil natrekken, kan dat.
 */

type Weergave = "landing" | "weekoverzicht";

export default function PatroonScherm() {
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
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-serif text-[19px] font-normal text-[#F1EFE8]">
          Je patroon
        </h2>
        <span className="text-[11px] text-[#7E8C82]">
          {gevuldeDagen === 0
            ? "nog geen dagen"
            : `${gevuldeDagen} ${gevuldeDagen === 1 ? "dag" : "dagen"} geregistreerd`}
        </span>
      </header>

      {laden ? (
        <p className="m-0 rounded-2xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-[12px] leading-relaxed text-[#7E8C82]">
          Je patroon wordt berekend…
        </p>
      ) : zin ? (
        <p className="m-0 rounded-2xl border-l-2 border-[#C8956C] bg-white/[0.03] px-3.5 py-3 text-[13px] leading-relaxed text-[#F1EFE8]">
          {zin.tekst}
        </p>
      ) : (
        <p className="m-0 rounded-2xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-[12px] leading-relaxed text-[#9FB0A6]">
          {geenBevindingZin(reeksen)}
        </p>
      )}

      {!laden ? (
        <>
          <section aria-label="Voedingsstoffen deze week">
            <h3 className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
              Voedingsstoffen
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
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
          </section>

          <button
            type="button"
            onClick={() => {
              trackEvent("nutrition_weekoverzicht_opened", {
                nutrient: "geen",
                surface: "rapport_rij",
              });
              setWeergave("weekoverzicht");
            }}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:border-white/20"
          >
            <span className="flex flex-col gap-0.5">
              <b className="font-serif text-[15px] font-normal text-[#F1EFE8]">
                Wekelijks overzicht
              </b>
              <span className="text-[11px] text-[#7E8C82]">
                Je week per stof, met wat elk gat dicht.
              </span>
            </span>
            <span aria-hidden className="text-[16px] text-[#6F8177]">
              ›
            </span>
          </button>

          <section aria-label="Hoe hardnekkig">
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
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:border-white/20"
            >
              <span className="flex flex-col gap-0.5">
                <b className="font-serif text-[15px] font-normal text-[#F1EFE8]">
                  Hoe hardnekkig is dit?
                </b>
                <span className="text-[11px] text-[#7E8C82]">
                  Vandaag, 7, 14 en 30 dagen naast elkaar.
                </span>
              </span>
              <span aria-hidden className="text-[13px] text-[#6F8177]">
                {vensterOpen ? "▲" : "▼"}
              </span>
            </button>

            {vensterOpen ? (
              <>
                <ul className="m-0 mt-2.5 flex list-none flex-col gap-2.5 p-0">
                  {reeksen.map((reeks) => (
                    <PatroonVensterrij key={reeks.nutrient} reeks={reeks} />
                  ))}
                </ul>

                <p className="m-0 mt-2.5 rounded-xl border-l-2 border-[#5A8F6A] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#9FB0A6]">
                  <strong className="font-bold text-[#F1EFE8]">
                    Vier vensters, geen gemiddelde.
                  </strong>{" "}
                  Een stof die in alle vier laag staat is een patroon; een stof
                  die alleen vandaag laag staat is een dag. Daarom staan ze
                  naast elkaar en maken we er geen cijfer van. Alles blijft een
                  ondergrens: een ✓ bewijst dat je het haalde, en het ontbreken
                  ervan bewijst niets.
                </p>
              </>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
