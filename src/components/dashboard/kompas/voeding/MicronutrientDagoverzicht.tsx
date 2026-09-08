"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import {
  MICRONUTRIENT_GROEP_LABEL,
  type Micronutrient,
  type MicronutrientGroep,
} from "@/data/nutrition/micronutrients";
import { bronnenTelling } from "@/lib/micronutrient-index";
import { dekkingPerGroep, type Dagdekking } from "@/lib/nutrition-dagdekking";
import MicronutrientMeter from "@/components/dashboard/kompas/voeding/MicronutrientMeter";

/**
 * Alle stoffen van deze dag, per groep.
 *
 * Staat onder de dag en niet erboven: de vier meters bovenaan beantwoorden
 * "waar zit mijn ruimte", en dat is de vraag waarmee je binnenkomt. Dit blok
 * beantwoordt "en de rest dan" — een vraag die pas ontstaat als je de eerste
 * hebt gelezen. Daarom staat het dicht, met de telling erbij zodat je weet wat
 * eronder zit voordat je het opent.
 *
 * Elke stof is een deur naar zijn bronnenlijst. Dat is de plek waar de
 * volledigheid zit: niet vijf voorbeelden, maar elk voedingsmiddel in de tabel
 * dat de stof levert.
 */

const GROEPEN: readonly MicronutrientGroep[] = ["mineraal", "vitamine", "overig"];

export default function MicronutrientDagoverzicht({
  dekking,
  onOpenStof,
}: {
  dekking: Dagdekking;
  onOpenStof: (stof: Micronutrient) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-label="Alle micronutriënten van deze dag"
      className="rounded-2xl border border-white/[0.07] bg-white/[0.02]"
    >
      <button
        type="button"
        onClick={() => setOpen((vorige) => !vorige)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent px-3 py-2.5 text-left"
      >
        <span>
          <span className="block text-[12.5px] font-semibold text-[#E7EDE8]">
            Alle {dekking.totaal} stoffen, met hun bronnen
          </span>
          <span className="block text-[11px] text-[#7E8C82]">
            {dekking.gedekt} kwamen vandaag langs · tik een stof aan voor de volledige
            bronnenlijst
          </span>
        </span>
        <span
          aria-hidden
          className="shrink-0 text-[#7E8C82] transition-transform"
          style={{ transform: open ? "rotate(90deg)" : undefined }}
        >
          <Icons.ChevronRight s={14} />
        </span>
      </button>

      {open ? (
        <div className="flex flex-col gap-3 border-t border-white/[0.06] px-3 py-3">
          {GROEPEN.map((groep) => {
            const rijen = dekkingPerGroep(dekking, groep);
            if (rijen.length === 0) return null;
            return (
              <div key={groep}>
                <p className="m-0 mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                  {MICRONUTRIENT_GROEP_LABEL[groep]}
                </p>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 @[560px]:grid-cols-2 @[1080px]:grid-cols-3">
                  {rijen.map((rij) => (
                    <div key={rij.stof.id} className="min-w-0">
                      <MicronutrientMeter rij={rij} onOpen={() => onOpenStof(rij.stof)} />
                      <p className="m-0 mt-0.5 text-[10px] text-[#7E8C82]">
                        {bronnenTelling(rij.stof.id)} bronnen in de tabel
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
