"use client";

import * as Icons from "@/components/app/icons";
import LadderActionRow from "@/components/dashboard/domain/LadderActionRow";
import LadderLayerStrip from "@/components/dashboard/domain/LadderLayerStrip";
import { useDomainLadderFocus } from "@/lib/domain-ladder-focus-context";
import {
  resolveDomainLadderReadout,
  resolveLadderLayerReason,
} from "@/lib/domain-ladder-readout";
import { ladderKeuzehartSurface } from "@/lib/ladder-keuzehart";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { DashboardData, PillarId } from "@/types/dashboard";

type DomainLadderContextPanelProps = {
  domain: PillarId;
  layerId: number;
  data?: DashboardData;
  /** Compactere maten in de bottom sheet — zelfde schaal als CockpitInspector. */
  compact?: boolean;
};

/**
 * Het keuzehart in de contextkolom: zone 1 t/m 3 uit het zijbalk-verdict §B.
 *
 * 1. **Aanbevolen laag + vanwege** — welke laag, welke staat, en de zin uit je
 *    check die verklaart waaróm. Die zin komt uit `resolveLadderLayerReason`;
 *    is er geen, dan staat er geen redenblok. Nooit een reden verzinnen.
 * 2. **Laag-navigator** — {@link LadderLayerStrip}, alleen id + staat (lock N6).
 * 3. **De actie + save** — de rang-1-optie van deze laag, gerenderd met
 *    dezelfde {@link LadderActionRow} als het midden. Dat is met opzet
 *    hetzelfde component: zo kunnen de favoriet-sleutel en de `source`
 *    ("aanbevolen" vs "mijn keuze") niet uiteenlopen tussen de twee plekken,
 *    en is de spiegel geen tweede bron maar letterlijk dezelfde knop.
 *
 * Wat hier níét staat: afvinken (dat woont op Mijn Dag), een deur naar het
 * schap, en een tweede "Open Mijn Dag"-CTA — die blijft onderaan het
 * domeinscherm staan.
 */
export default function DomainLadderContextPanel({
  domain,
  layerId,
  data,
  compact = false,
}: DomainLadderContextPanelProps) {
  const { selectLayer } = useDomainLadderFocus();
  const ladder = getLeefstijlLadder(domain);
  const layer = ladder?.layers.find((row) => row.id === layerId) ?? null;

  if (!ladder || !layer) {
    return null;
  }

  const readout = resolveDomainLadderReadout(domain, data);
  const state = readout?.layerStates[layer.id] ?? null;
  const stateLabel = state && readout ? readout.stateLabels[state] : null;
  const isFocus = readout != null && layer.id === readout.focusLayer;
  const reason = resolveLadderLayerReason(readout, layer.id);
  const surface = ladderKeuzehartSurface(domain);
  const action = layer.actions[0] ?? null;

  const cardClass = `rounded-[14px] border bg-black/20 ${compact ? "p-3" : "p-4"}`;
  const kickerClass =
    "mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em]";

  return (
    <>
      <section
        aria-label="De laag die je leest"
        className={`${cardClass} ${isFocus ? "border-[rgba(200,149,108,0.4)]" : "border-white/10"}`}
      >
        <span className={`${kickerClass} ${isFocus ? "text-[#C8956C]" : "text-[#9FB0A6]"}`}>
          <Icons.RouteMap s={13} style={{ color: isFocus ? "#C8956C" : "#9FB0A6" }} />
          {stateLabel ? `Prioriteit ${layer.id} · ${stateLabel}` : `Prioriteit ${layer.id}`}
        </span>
        <h3
          className={`mb-2 font-serif leading-tight text-[#F1EFE8] ${
            compact ? "text-[15px]" : "text-[16px]"
          }`}
        >
          {layer.name}
        </h3>
        <p
          className={`leading-relaxed text-[#9FB0A6] text-pretty ${
            compact ? "text-[12px]" : "text-[12.5px]"
          }`}
        >
          {layer.summary}
        </p>

        {reason ? (
          <div className="mt-2.5 border-l border-white/10 pl-2.5">
            {reason.kind === "bewijs" ? (
              <>
                <p className="text-[11px] leading-snug text-[#CDD7D0]">
                  <span className="font-semibold">{reason.label}:</span> {reason.answerLabel}
                  {reason.benchmarkLabel ? (
                    <span className="text-[#7E8C82]"> · {reason.benchmarkLabel}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                  {reason.whyLine}
                </p>
              </>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                {reason.line}
              </p>
            )}
          </div>
        ) : null}

        {readout && !isFocus ? (
          <button
            type="button"
            onClick={() => selectLayer({ domain, layerId: readout.focusLayer })}
            className="mt-2.5 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left text-[12px] font-semibold text-[#9CC5A9]"
          >
            Terug naar prioriteit {readout.focusLayer} <Icons.ChevronRight s={12} />
          </button>
        ) : null}
      </section>

      <section aria-label="Andere prioriteit lezen" className={`${cardClass} border-white/10`}>
        <span className={`${kickerClass} text-[#9FB0A6]`}>
          <Icons.Target s={13} style={{ color: "#9FB0A6" }} /> Andere prioriteit lezen
        </span>
        <LadderLayerStrip
          domain={domain}
          layers={ladder.layers}
          activeLayerId={layer.id}
          onSelectLayer={(next) => selectLayer({ domain, layerId: next })}
          {...(readout ? { layerStates: readout.layerStates, stateLabels: readout.stateLabels } : {})}
          surface={surface}
        />
      </section>

      <section aria-label="Wat je hier kunt kiezen" className={`${cardClass} border-white/10`}>
        <span className={`${kickerClass} text-[#9FB0A6]`}>
          <Icons.Heart s={13} style={{ color: "#9FB0A6" }} />
          {isFocus ? "Aanbevolen op deze laag" : "Op deze laag"}
        </span>
        {action ? (
          <>
            <ul className="m-0 flex list-none flex-col gap-0 p-0">
              <LadderActionRow
                domain={domain}
                layerId={layer.id}
                action={action}
                isRecommended={isFocus}
                surface={surface}
                dense
              />
            </ul>
            <p className="mt-2 text-[11px] leading-relaxed text-[#7E8C82]">
              Hier verdienen we niets aan. Afvinken doe je op Mijn Dag.
            </p>
          </>
        ) : (
          <p className="text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            Op deze laag staat niets klaar om te kiezen — lezen kost je niets en verplicht je
            tot niets.
          </p>
        )}
      </section>
    </>
  );
}
