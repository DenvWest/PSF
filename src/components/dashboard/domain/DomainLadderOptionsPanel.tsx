"use client";

import DomainFreeActionsTile from "@/components/dashboard/domain/DomainFreeActionsTile";
import { DOMAIN_KOMPAS_COPY, isDomainKompasDomain } from "@/lib/domain-kompas-copy";
import { resolveDomainLadderReadout } from "@/lib/domain-ladder-readout";
import { getLeefstijlLadder, resolveLayerOptions } from "@/lib/leefstijl-ladder";
import type { DashboardData, PillarId } from "@/types/dashboard";

type DomainLadderOptionsPanelProps = {
  domain: PillarId;
  layerId: number;
  data?: DashboardData;
};

/**
 * De optielaag in de cockpit-context: alle gratis acties van de aangeklikte
 * prioriteit, met keuze- en moment-knoppen. Vult later vanuit de
 * vragenlijst-test via {@link resolveLayerOptions}.
 */
export default function DomainLadderOptionsPanel({
  domain,
  layerId,
  data,
}: DomainLadderOptionsPanelProps) {
  const ladder = getLeefstijlLadder(domain);
  const layer = ladder?.layers.find((row) => row.id === layerId) ?? null;
  if (!ladder || !layer) {
    return null;
  }

  const copy = isDomainKompasDomain(domain) ? DOMAIN_KOMPAS_COPY[domain] : null;
  const readout = resolveDomainLadderReadout(domain, data);
  const state = readout?.layerStates[layer.id] ?? null;

  return (
    <DomainFreeActionsTile
      domain={domain}
      layerId={layer.id}
      layerName={layer.name}
      actions={resolveLayerOptions(layer)}
      isRecommended={layer.id === readout?.focusLayer}
      stateLabel={state && readout ? readout.stateLabels[state] : null}
      emptyLine={
        copy?.emptyLine?.(layer.id) ?? readout?.whyWait(layer.id) ?? layer.summary
      }
      surface={copy?.surface ?? ladder.surface}
    />
  );
}
