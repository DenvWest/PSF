"use client";

import { useState } from "react";
import VoortgangHero from "@/components/dashboard/voortgang/VoortgangHero";
import VoortgangMetingenPerDomein from "@/components/dashboard/voortgang/VoortgangMetingenPerDomein";
import { DOMAIN_CHECK_PILLAR_IDS } from "@/lib/kompas-domain-check";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type VoortgangHubScrollProps = {
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoHermeting: () => void;
  onOpenDomain: (domain: PillarId) => void;
};

/**
 * Welk domein de reeks onder de cyclus opent. Je prioriteit als die een eigen
 * check kent, anders het eerste domein dat er wel een heeft — nooit een domein
 * dat hier per definitie leeg zou blijven.
 */
function resolveStartDomain(priority: PillarId): PillarId {
  return DOMAIN_CHECK_PILLAR_IDS.includes(priority)
    ? priority
    : DOMAIN_CHECK_PILLAR_IDS[0];
}

export default function VoortgangHubScroll({
  model,
  data,
  onGoAgenda,
  onGoHermeting,
  onOpenDomain,
}: VoortgangHubScrollProps) {
  const [selectedDomain, setSelectedDomain] = useState<PillarId>(() =>
    resolveStartDomain(model.priority.id),
  );

  return (
    <>
      <VoortgangHero
        model={model}
        data={data}
        onGoAgenda={onGoAgenda}
        onGoHermeting={onGoHermeting}
        onOpenDomain={onOpenDomain}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
      />

      <div className="mt-3.5">
        <VoortgangMetingenPerDomein
          data={data}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
        />
      </div>
    </>
  );
}
