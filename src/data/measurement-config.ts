import { PILLARS } from "@/data/dashboard";
import type { DomainScoreKey } from "@/lib/intake-engine";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type { MeasurementConfig } from "@/types/delta-report";
import type { PillarId } from "@/types/dashboard";

const PILLAR_TO_DOMAIN_KEY: Record<PillarId, DomainScoreKey> = {
  slaap: "sleep_score",
  energie: "energy_score",
  stress: "stress_score",
  voeding: "nutrition_score",
  beweging: "movement_score",
  herstel: "recovery_score",
  verbinding: "connection_score",
};

export const perfectSupplementMeasurementConfig: MeasurementConfig = {
  domains: PILLARS.map((pillar) => ({
    id: PILLAR_TO_DOMAIN_KEY[pillar.id],
    label: pillar.label,
    color: pillar.color,
  })),
  indexFormula: (scores) =>
    computeVitaliteit(resolveVitaliteitFacets(scores)),
  locale: "nl",
};

export const DOMAIN_KEY_TO_PILLAR: Record<DomainScoreKey, PillarId> =
  Object.fromEntries(
    Object.entries(PILLAR_TO_DOMAIN_KEY).map(([pillarId, domainKey]) => [
      domainKey,
      pillarId,
    ]),
  ) as Record<DomainScoreKey, PillarId>;
