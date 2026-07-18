import { PILLAR } from "@/data/dashboard";
import type { MeasuredPillarId } from "@/lib/primary-theme";
import type { PillarId } from "@/types/dashboard";

const PLAN_DOMAIN_TO_PILLAR: Partial<Record<MeasuredPillarId, PillarId>> = {
  movement: "beweging",
  nutrition: "voeding",
  sleep: "slaap",
  stress: "stress",
};

const CROSS_DOMAIN: Partial<Record<PillarId, PillarId[]>> = {
  voeding: ["energie", "herstel"],
  slaap: ["stress", "energie"],
  stress: ["slaap", "herstel"],
  energie: ["slaap", "voeding"],
  beweging: ["herstel", "energie"],
  herstel: ["slaap", "stress"],
};

export type PlanCrossDomainChip = {
  pillarId: PillarId;
  label: string;
  href: string;
  hint: string;
};

function chipHref(pillarId: PillarId): string {
  switch (pillarId) {
    case "voeding":
      return "/intake/voeding?from=plan&kompas=voeding";
    case "slaap":
      return "/intake/slaap?from=plan&kompas=slaap";
    case "stress":
      return "/intake/stress?from=plan&kompas=stress";
    case "beweging":
      return "/intake/beweging?from=plan&kompas=beweging";
    case "herstel":
      return "/herstel-verbeteren-na-40";
    case "energie":
      return "/dashboard?tab=vandaag&kompas=energie";
    default:
      return "/dashboard?tab=vandaag";
  }
}

function chipHint(pillarId: PillarId): string {
  switch (pillarId) {
    case "voeding":
      return "Macro's en eiwit — basis vóór supplement";
    case "herstel":
      return "Rust en herstel tussen sessies";
    case "energie":
      return "Readout — beweging stuurt mee";
    case "slaap":
      return "Slaap beïnvloedt herstel na training";
    case "stress":
      return "Stress remt herstel — check je balans";
    default:
      return `Meer over ${PILLAR[pillarId].label.toLowerCase()}`;
  }
}

/** Cross-domain chips for a lifestyle plan page — leefstijl wins from adjacent domains. */
export function getPlanCrossDomainChips(
  domain: MeasuredPillarId,
): PlanCrossDomainChip[] {
  const pillarId = PLAN_DOMAIN_TO_PILLAR[domain];
  if (!pillarId) {
    return [];
  }

  const related = CROSS_DOMAIN[pillarId] ?? [];
  return related.map((id) => ({
    pillarId: id,
    label: PILLAR[id].label,
    href: chipHref(id),
    hint: chipHint(id),
  }));
}
