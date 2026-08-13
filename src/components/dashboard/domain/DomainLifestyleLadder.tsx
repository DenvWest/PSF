"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/ga4";

export type LifestyleLayerState = "winst" | "ok" | "watch" | "wacht";

export type LifestylePriorityLayer = {
  id: number;
  name: string;
  subtitle: string;
  summary: string;
  actions: string[];
};

const STATE_STYLE: Record<LifestyleLayerState, { bar: string; text: string; row: string }> = {
  winst: {
    bar: "bg-[#C8956C]",
    text: "text-[#C8956C]",
    row: "border-[#C8956C]/34 bg-[#C8956C]/5",
  },
  ok: {
    bar: "bg-[#5A8F6A]",
    text: "text-[#9CC5A9]",
    row: "",
  },
  watch: {
    bar: "bg-[#C99A3C]",
    text: "text-[#C99A3C]",
    row: "",
  },
  wacht: {
    bar: "bg-white/15",
    text: "text-[#7E8C82]",
    row: "",
  },
};

export type DomainLifestyleLadderProps = {
  layers: readonly LifestylePriorityLayer[];
  layerStates: Record<number, LifestyleLayerState>;
  focusLayer: number;
  stateLabels: Record<LifestyleLayerState, string>;
  variant: "mini" | "rail" | "full";
  whyWait?: (layerId: number) => string | null;
  domain: "slaap" | "stress";
  surface: string;
};

export default function DomainLifestyleLadder({
  layers,
  layerStates,
  focusLayer,
  stateLabels,
  variant,
  whyWait,
  domain,
  surface,
}: DomainLifestyleLadderProps) {
  const [openLayer, setOpenLayer] = useState<number | null>(
    variant === "full" ? focusLayer : null,
  );

  const visibleLayers =
    variant === "mini"
      ? layers.filter((layer) => {
          const state = layerStates[layer.id];
          return state === "winst" || state === "watch" || layer.id === focusLayer;
        }).slice(0, 3)
      : layers;

  function handleToggle(layerId: number) {
    if (variant !== "full") return;
    setOpenLayer((current) => {
      const next = current === layerId ? null : layerId;
      if (next != null) {
        trackEvent(`${domain}_ladder_layer_open`, {
          layer: layerId,
          surface,
        });
      }
      return next;
    });
  }

  const gapClass = variant === "rail" ? "gap-[3px]" : "gap-1.5";
  const isMini = variant === "mini";

  return (
    <div className={`flex flex-col ${gapClass}`} data-variant={variant}>
      {visibleLayers.map((layer) => {
        const state = layerStates[layer.id] ?? "wacht";
        const styles = STATE_STYLE[state];
        const isFocus = layer.id === focusLayer;
        const isOpen = openLayer === layer.id;
        const waitLine = whyWait?.(layer.id) ?? null;
        const canExpand = variant === "full";

        return (
          <article
            key={layer.id}
            data-state={state}
            data-layer={layer.id}
            data-focus={isFocus ? "true" : undefined}
            data-open={isOpen ? "true" : undefined}
            className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/20 ${styles.row} ${
              isMini && isFocus ? "bg-[#C8956C]/7" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute bottom-0 left-0 top-0 w-1 ${styles.bar}`}
            />
            {canExpand ? (
              <button
                type="button"
                onClick={() => handleToggle(layer.id)}
                aria-expanded={isOpen}
                className="grid w-full min-h-[56px] cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-none bg-transparent px-3.5 py-3.5 pl-5 text-left font-[inherit] text-inherit"
              >
                <LayerHead
                  layer={layer}
                  state={state}
                  stateLabel={stateLabels[state]}
                  styles={styles}
                  variant={variant}
                  waitLine={state === "wacht" && !isFocus ? waitLine : null}
                  showChevron
                  chevronOpen={isOpen}
                />
              </button>
            ) : (
              <div
                className={`grid w-full items-start gap-3 border-none bg-transparent text-left ${
                  isMini ? "min-h-[48px] grid-cols-[auto_minmax(0,1fr)] px-3 py-2.5 pl-[18px]" : "min-h-[44px] grid-cols-[auto_minmax(0,1fr)] px-2.5 py-2 pl-[18px]"
                }`}
              >
                <LayerHead
                  layer={layer}
                  state={state}
                  stateLabel={stateLabels[state]}
                  styles={styles}
                  variant={variant}
                  waitLine={state === "wacht" && !isFocus ? waitLine : null}
                  showChevron={false}
                  chevronOpen={false}
                />
              </div>
            )}

            {canExpand && isOpen ? (
              <div className="border-t border-white/[0.06] px-3.5 pb-4 pl-5">
                <p className="mt-3 max-w-[60ch] text-[12.5px] leading-relaxed text-[#CDD7D0]">
                  {layer.summary}
                </p>
                {waitLine && state === "wacht" ? (
                  <p className="mt-3 max-w-[58ch] border-l border-white/10 pl-2.5 text-[11.5px] leading-relaxed text-[#7E8C82]">
                    {waitLine}
                  </p>
                ) : null}
                <p className="mb-2 mt-4 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
                  Wat je kunt doen
                </p>
                <ol className="m-0 list-decimal pl-4">
                  {layer.actions.slice(0, 3).map((action) => (
                    <li
                      key={action}
                      className="mb-1.5 max-w-[58ch] text-[12.5px] leading-relaxed text-[#9FB0A6]"
                    >
                      {action}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function LayerHead({
  layer,
  state,
  stateLabel,
  styles,
  variant,
  waitLine,
  showChevron,
  chevronOpen,
}: {
  layer: LifestylePriorityLayer;
  state: LifestyleLayerState;
  stateLabel: string;
  styles: (typeof STATE_STYLE)[LifestyleLayerState];
  variant: "mini" | "rail" | "full";
  waitLine: string | null;
  showChevron: boolean;
  chevronOpen: boolean;
}) {
  return (
    <>
      <span className="min-w-[44px] pt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#7E8C82]">
        P{layer.id}
      </span>
      <span className="min-w-0">
        <span
          className={`block leading-snug text-[#F1EFE8] ${
            variant === "rail" ? "text-[12.5px] font-semibold" : "text-[13px] font-semibold"
          }`}
        >
          {layer.name}
        </span>
        <span className={`mt-1 block text-[9.5px] font-bold uppercase tracking-[0.14em] ${styles.text}`}>
          {stateLabel}
        </span>
        {variant !== "rail" && layer.subtitle ? (
          <span className="mt-1 block text-[11.5px] leading-snug text-[#9FB0A6]">{layer.subtitle}</span>
        ) : null}
        {waitLine ? (
          <span className="mt-1 block text-[11px] leading-snug text-[#7E8C82]">{waitLine}</span>
        ) : null}
      </span>
      {showChevron ? (
        <span
          aria-hidden="true"
          className={`pt-1 text-[13px] text-[#7E8C82] transition-transform ${
            chevronOpen ? "rotate-90" : ""
          }`}
        >
          ›
        </span>
      ) : null}
    </>
  );
}
