"use client";

import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";
import type { PillarId } from "@/types/dashboard";

/**
 * Wissel van laag vanuit de contextkolom — zes knoppen, verder niets.
 *
 * Dit is de N6-oplossing uit het zijbalk-verdict §C: de strip draagt **alleen
 * `id` + staat**. Geen laagnaam, geen samenvatting, geen actie, geen
 * bewijsrij — want dát zou hem een tweede ladder maken, en die hoort in het
 * midden te staan ({@link DomainLifestyleLadder}). Zodra hier een tweede regel
 * tekst per laag verschijnt, is lock N6 gebroken.
 *
 * Prev/volgende is afgewezen: "P3 van 6" is precies de ordinale lezing die
 * `BESLUIT_BEWEGING §A.3 #12` heeft gekilld, en het verbergt welke lagen er
 * zijn. Zes knoppen passen op beide uiteinden van het bereik — ~351px in de
 * bottom sheet op 375px, ~288px in de sidebar bij `xl` — dus één vorm volstaat
 * voor sheet, drawer en sidebar.
 *
 * Kleur is nooit het enige signaal: de winst-laag draagt een stip (een vorm),
 * de actieve laag een gevulde knop, en elke knop noemt zijn staat woordelijk in
 * zijn toegankelijke naam.
 */

const STATE_CHIP: Record<LeefstijlLayerState, string> = {
  winst: "border-[#C8956C]/55 text-[#C8956C]",
  ok: "border-white/12 text-[#9CC5A9]",
  watch: "border-white/12 text-[#C99A3C]",
  wacht: "border-white/10 text-[#7E8C82]",
};

export type LadderLayerStripProps = {
  domain: PillarId;
  layers: readonly { id: number }[];
  activeLayerId: number;
  onSelectLayer: (layerId: number) => void;
  layerStates?: Record<number, LeefstijlLayerState>;
  stateLabels?: Record<LeefstijlLayerState, string>;
  surface: string;
};

export default function LadderLayerStrip({
  domain,
  layers,
  activeLayerId,
  onSelectLayer,
  layerStates,
  stateLabels,
  surface,
}: LadderLayerStripProps) {
  function handleSelect(layerId: number) {
    if (layerId === activeLayerId) {
      return;
    }
    // Dezelfde gebeurtenis als in het midden — een laag ging open — met een
    // andere plek. Dat is hergebruik met een nieuwe waarde, niet een nieuwe
    // betekenis op een bestaande parameter (les G′).
    trackEvent(`${domain}_ladder_layer_open`, { layer: layerId, surface });
    clarityTag(`${domain}_ladder_layer`, `zijbalk_p${layerId}`);
    onSelectLayer(layerId);
  }

  return (
    <div role="group" aria-label="Wissel van prioriteit" className="flex flex-wrap gap-1.5">
      {layers.map((layer) => {
        const state = layerStates?.[layer.id] ?? null;
        const stateLabel = state && stateLabels ? stateLabels[state] : null;
        const isActive = layer.id === activeLayerId;
        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => handleSelect(layer.id)}
            aria-current={isActive ? "true" : undefined}
            aria-label={
              stateLabel
                ? `Prioriteit ${layer.id} — ${stateLabel}`
                : `Prioriteit ${layer.id}`
            }
            className={`inline-flex h-11 min-w-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border bg-transparent px-2 font-mono text-[11.5px] font-semibold tracking-[0.04em] transition ${
              isActive
                ? "border-white/30 bg-white/[0.08] text-[#F1EFE8]"
                : (state ? STATE_CHIP[state] : "border-white/10 text-[#9FB0A6]")
            }`}
          >
            {state === "winst" ? (
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8956C]"
              />
            ) : null}
            P{layer.id}
          </button>
        );
      })}
    </div>
  );
}
