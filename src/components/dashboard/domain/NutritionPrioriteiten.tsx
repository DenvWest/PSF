"use client";

import { useEffect } from "react";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  nutritionPriorityLayers,
  type NutritionPriorities,
} from "@/lib/nutrition-prioriteiten";

/**
 * Voeding · Kompas — jouw focus, boven de twee tellingen.
 *
 * De tellingen eronder zeggen hoe ver je bent; dit zegt waarheen. Dat is de
 * eerste vraag, dus staat hij bovenaan — een stand lees je pas met interesse
 * als je weet waar hij over gaat.
 *
 * Drie regels die de vorm bepalen:
 *
 * 1. **Richtingen, geen acties.** "Je plantbasis uitbreiden" is een richting;
 *    "zet een portie groente bij het avondeten" is een actie, en die hoort in
 *    de agenda waar hij een moment kan krijgen.
 * 2. **Klikken gaat naar de laag, niet naar een product.** Elke richting opent
 *    zijn eigen ladderlaag op Voortgang, waar de feitenrij staat die hem
 *    verantwoordt. De weg terug naar het bewijs blijft dus altijd open.
 * 3. **Geen prioriteiten is ook een uitkomst.** Staat alles op zijn richtlijn,
 *    dan zegt het blok dat — het verdwijnt niet. Een leeg scherm leest als een
 *    fout; "hier valt niets te prioriteren" leest als een resultaat.
 */
export default function NutritionPrioriteiten({
  prioriteiten,
  surface,
  onOpenLayer,
}: {
  prioriteiten: NutritionPriorities;
  surface: string;
  /** Opent de ladderlaag die deze richting draagt. */
  onOpenLayer: (layer: number) => void;
}) {
  const { priorities, why, focusLayer } = prioriteiten;
  const signature = priorities.map((priority) => priority.source).join("|");

  useEffect(() => {
    if (!why && priorities.length === 0) {
      return;
    }
    trackEvent("nutrition_kompas_priorities_view", {
      surface,
      count: priorities.length,
      focus_layer: focusLayer ?? 0,
    });
    emitAccountClientEvent("nutrition.kompas_priorities_viewed", {
      count: priorities.length,
      focus_layer: focusLayer,
      layers: nutritionPriorityLayers(priorities),
      surface,
    });
    clarityTag("nutrition_kompas_priorities", surface);
    // `signature` dekt de inhoud: dezelfde rijen betekent hetzelfde blok.
  }, [signature, priorities, why, focusLayer, surface]);

  if (!why && priorities.length === 0) {
    return null;
  }

  const handleClick = (source: string, layer: number) => {
    trackEvent("nutrition_kompas_priority_click", {
      surface,
      priority_source: source,
      layer,
    });
    emitAccountClientEvent("nutrition.kompas_priority_clicked", {
      priority_source: source,
      layer,
      surface,
    });
    onOpenLayer(layer);
  };

  return (
    <section
      aria-label="Jouw focus op voeding"
      className="rounded-2xl border border-white/10 bg-black/20 p-3.5"
    >
      <h3 className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
        Jouw focus
      </h3>

      {priorities.length > 0 ? (
        <ol className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
          {priorities.map((priority, index) => (
            <li key={priority.source}>
              <button
                type="button"
                onClick={() => handleClick(priority.source, priority.layer)}
                className="flex w-full cursor-pointer items-start gap-2 border-none bg-transparent p-0 text-left transition-colors hover:text-white"
              >
                <span
                  aria-hidden
                  className="mt-[3px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/20 text-[9.5px] font-semibold text-[#9FB0A6]"
                >
                  {index + 1}
                </span>
                <span className="text-[13.5px] font-semibold leading-snug text-[#E7EDE8] text-pretty">
                  {priority.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      {why ? (
        <p className="m-0 mt-2.5 max-w-[58ch] text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          {why}
        </p>
      ) : null}
    </section>
  );
}
