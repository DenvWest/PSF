"use client";

import { trackEvent } from "@/lib/ga4";
import type { LeefstijlLadderLayer, LeefstijlLayerState } from "@/lib/leefstijl-ladder";
import type { PillarId } from "@/types/dashboard";

/** Dezelfde vier standen en dezelfde laagvorm als de ladder op Voortgang. */
export type LifestyleLayerState = LeefstijlLayerState;
export type LifestylePriorityLayer = LeefstijlLadderLayer;

const STATE_STYLE: Record<LifestyleLayerState, { bar: string; text: string; row: string }> = {
  winst: {
    bar: "bg-[#C8956C]",
    text: "text-[#C8956C]",
    row: "border-[#C8956C]/34 bg-[#C8956C]/5",
  },
  ok: {
    bar: "bg-[#5A8F6A]",
    text: "text-[#9CC5A9]",
    row: "border-white/[0.06]",
  },
  watch: {
    bar: "bg-[#C99A3C]",
    text: "text-[#C99A3C]",
    row: "border-white/[0.06]",
  },
  wacht: {
    bar: "bg-white/15",
    text: "text-[#7E8C82]",
    row: "border-white/[0.06]",
  },
};

export type DomainLifestyleLadderProps = {
  layers: readonly LifestylePriorityLayer[];
  /**
   * Alleen meegeven waar de check ze écht oplevert. Zonder staten toont de
   * ladder geen enkel badge — hetzelfde tweestandenmodel als
   * PrioriteitenLadder op Voortgang. Een score zónder eigen domeincheck is
   * precies dat geval: de zes lagen kloppen, het oordeel per laag niet.
   */
  layerStates?: Record<number, LifestyleLayerState>;
  stateLabels?: Record<LifestyleLayerState, string>;
  /** Welke laag het scherm nu uitlegt. Stuurt de ladder verderop de pagina. */
  selectedLayer: number | null;
  onSelectLayer: (layerId: number) => void;
  whyWait?: (layerId: number) => string | null;
  domain: PillarId;
  /**
   * Twee kolommen zodra de container het toelevert. Zes lagen onder elkaar
   * kosten een halve schermhoogte; op een Kompas-scherm dat in één beeld moet
   * passen is dat het duurste blok. De leesvolgorde blijft P1→P6 — links naar
   * rechts, dan naar beneden — dus fundament staat nog steeds vóór finetunen.
   */
  columns?: 1 | 2;
  surface: string;
};

/**
 * De ladder bovenaan een domeinscherm: zes lagen, vaste volgorde, één regel
 * per laag met de staat in tekst ernaast.
 *
 * Tot 20 augustus was dit een leesding — drie varianten (mini/rail/full),
 * waarvan er maar één ooit gerenderd werd, en die was niet klikbaar. Je las
 * zes lagen bovenin, scrolde langs de readouts, en kwam pas onderaan bij de
 * ladder waar je iets kón. Nu stuurt een klik hierboven de ladder daaronder:
 * dezelfde laag gaat open en het scherm springt ernaartoe.
 *
 * Wat níét meebeweegt is de aanbeveling. De winst-laag draagt zijn staat
 * ("Grootste winst") ongeacht waar je kijkt, en de volgorde blijft P1→P6 —
 * fundament naar finetunen, geen ranglijst. Kiezen verandert wat je leest,
 * niet wat we aanraden.
 *
 * Kleur is nooit het enige signaal: het statuswoord staat er in tekst naast.
 */
export default function DomainLifestyleLadder({
  layers,
  layerStates,
  stateLabels,
  selectedLayer,
  onSelectLayer,
  whyWait,
  domain,
  columns = 1,
  surface,
}: DomainLifestyleLadderProps) {
  function handleSelect(layerId: number) {
    trackEvent(`${domain}_ladder_layer_open`, { layer: layerId, surface });
    onSelectLayer(layerId);
  }

  return (
    <div
      className={`grid gap-1 ${columns === 2 ? "@[560px]:grid-cols-2" : ""}`}
      role="group"
      aria-label="Je prioriteiten"
    >
      {layers.map((layer) => {
        const state = layerStates?.[layer.id] ?? null;
        const styles = state ? STATE_STYLE[state] : null;
        const isSelected = layer.id === selectedLayer;
        const waitLine = state === "wacht" ? (whyWait?.(layer.id) ?? null) : null;

        return (
          <article
            key={layer.id}
            data-state={state ?? undefined}
            data-layer={layer.id}
            data-sel={isSelected ? "true" : undefined}
            className={`relative overflow-hidden rounded-xl border bg-black/20 transition-colors ${
              isSelected
                ? state === "winst"
                  ? "border-[#C8956C]/50 bg-[#C8956C]/[0.09]"
                  : "border-white/25 bg-white/[0.05]"
                : (styles?.row ?? "border-white/[0.06]")
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute bottom-0 left-0 top-0 w-1 ${styles?.bar ?? "bg-white/15"}`}
            />
            <button
              type="button"
              onClick={() => handleSelect(layer.id)}
              aria-pressed={isSelected}
              className="grid min-h-[40px] w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 border-none bg-transparent px-3 py-2 pl-[18px] text-left font-[inherit] text-inherit"
            >
              <span
                aria-hidden="true"
                className="min-w-[26px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#7E8C82]"
              >
                P{layer.id}
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold leading-snug text-[#F1EFE8]">
                  {layer.name}
                </span>
                {isSelected && layer.subtitle ? (
                  <span className="mt-1 block text-[11.5px] leading-snug text-[#9FB0A6]">
                    {layer.subtitle}
                  </span>
                ) : null}
                {isSelected && waitLine ? (
                  <span className="mt-1 block text-[11px] leading-snug text-[#7E8C82]">
                    {waitLine}
                  </span>
                ) : null}
              </span>
              {state && styles && stateLabels ? (
                <span
                  className={`shrink-0 text-right text-[9px] font-bold uppercase tracking-[0.12em] ${styles.text}`}
                >
                  {stateLabels[state]}
                </span>
              ) : (
                <span aria-hidden="true" />
              )}
            </button>
          </article>
        );
      })}
    </div>
  );
}
