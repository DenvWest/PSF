"use client";

import { trackEvent } from "@/lib/ga4";
import {
  DOMAIN_KOMPAS_COPY,
  isDomainKompasDomain,
} from "@/lib/domain-kompas-copy";
import { useDomainLadderFocus } from "@/lib/domain-ladder-focus-context";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";

type InspectorLayerChipsProps = {
  compact?: boolean;
};

/**
 * Compacte P1–P6-wisselaar bovenaan de contextkolom. Geen tweede ladder:
 * alleen de letters, zodat je op desktop niet naar de midden-ladder hoeft
 * te scrollen en op mobiel nog kunt wisselen als het sheet open is.
 * Zonder ladder-focus (Kompas-home) rendert dit niets.
 */
export default function InspectorLayerChips({ compact = false }: InspectorLayerChipsProps) {
  const { focus, setFocus } = useDomainLadderFocus();
  if (!focus) {
    return null;
  }

  const ladder = getLeefstijlLadder(focus.domain);
  if (!ladder || ladder.layers.length === 0) {
    return null;
  }

  const surface = isDomainKompasDomain(focus.domain)
    ? DOMAIN_KOMPAS_COPY[focus.domain].surface
    : (ladder.surface ?? `kompas_${focus.domain}`);

  return (
    <div className={compact ? "mb-1" : "mb-0.5"}>
      <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7E8C82]">
        Andere prioriteit lezen
      </p>
      <div
        role="group"
        aria-label="Andere prioriteit lezen"
        className="grid grid-cols-6 gap-1"
      >
        {ladder.layers.map((layer) => {
          const selected = layer.id === focus.layerId;
          return (
            <button
              key={layer.id}
              type="button"
              aria-pressed={selected}
              aria-label={`Prioriteit ${layer.id}: ${layer.name}`}
              onClick={() => {
                trackEvent(`${focus.domain}_ladder_layer_open`, {
                  layer: layer.id,
                  surface,
                });
                setFocus({ domain: focus.domain, layerId: layer.id });
              }}
              className={`min-h-9 cursor-pointer rounded-lg border font-mono text-[11px] font-semibold tracking-[0.04em] transition ${
                selected
                  ? "border-white/35 bg-white/[0.08] text-[#F1EFE8]"
                  : "border-white/10 bg-transparent text-[#9FB0A6] hover:border-white/20 hover:text-[#F1EFE8]"
              }`}
            >
              P{layer.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
