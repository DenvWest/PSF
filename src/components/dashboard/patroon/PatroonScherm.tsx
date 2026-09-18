"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PatroonVensterrij from "@/components/dashboard/patroon/PatroonVensterrij";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  bepaalBevinding,
  bouwTekortsysteem,
} from "@/lib/nutrition-tekortsysteem";
import {
  bevindingZin,
  geenBevindingZin,
} from "@/lib/nutrition-tekortsysteem-copy";

/**
 * Je patroon: het tekortsysteem als scherm.
 *
 * ## Wat dit scherm beantwoordt
 *
 * Eén vraag: waar zit je gat, en hoe hardnekkig is het. Niet "hoe goed doe je
 * het" — daar is geen cijfer voor en dat is opzet. Bovenaan staat de ene
 * bevinding in gewone taal, daaronder per stof de vier vensters waaruit hij
 * volgt, zodat de zin navolgbaar is en niet op gezag gelooft moet worden.
 *
 * ## Waarom geen weekscore
 *
 * Een samengesteld cijfer over vijf stoffen en vier vensters is precies de
 * Virtuagym-uitkomst die dit besluit afwijst: het leest als een rapportcijfer,
 * het nodigt uit tot najagen, en het gooit weg waar het om gaat — dat omega-3
 * op een zalmdag iets anders doet dan magnesium op elke dag. Het verschil
 * tussen de vensters *is* de informatie.
 *
 * ## Dezelfde bron als het dagboek
 *
 * Dit scherm haalt dezelfde `/api/account/nutrition-daybook` op als
 * `DagboekScherm`. Geen gedeelde store: de twee tabs staan niet tegelijk in
 * beeld, en een cache die over een tabwissel heen leeft zou na een invoer op
 * tab 1 een verouderd patroon op tab 3 tonen — de ene fout die dit scherm zich
 * niet kan permitteren.
 */

export default function PatroonScherm() {
  const vandaag = todayInAgendaTimezone();
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [laden, setLaden] = useState(true);
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

  const gevuldeDagen = useMemo(
    () => dagen.filter((dag) => (dag.items?.length ?? 0) > 0).length,
    [dagen],
  );

  useEffect(() => {
    if (laden || gemeld.current) return;
    gemeld.current = true;

    // Eén keer per keer dat het scherm met data verschijnt. `nutrient` is de
    // stof waar de bevinding op wijst — dat is de dimensie die zegt welke
    // vergelijkingspagina dit scherm zou moeten voeden.
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
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {reeksen.map((reeks) => (
              <PatroonVensterrij key={reeks.nutrient} reeks={reeks} />
            ))}
          </ul>

          <p className="m-0 rounded-xl border-l-2 border-[#5A8F6A] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#9FB0A6]">
            <strong className="font-bold text-[#F1EFE8]">
              Vier vensters, geen gemiddelde.
            </strong>{" "}
            Een stof die in alle vier laag staat is een patroon; een stof die
            alleen vandaag laag staat is een dag. Daarom staan ze naast elkaar
            en maken we er geen cijfer van. Alles blijft een ondergrens: een ✓
            bewijst dat je het haalde, en het ontbreken ervan bewijst niets.
          </p>
        </>
      ) : null}
    </div>
  );
}
