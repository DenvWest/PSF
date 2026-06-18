import { PILLAR } from "@/data/dashboard";
import type { PillarId } from "@/types/dashboard";

const CROSS_DOMAIN: Partial<Record<PillarId, PillarId[]>> = {
  voeding: ["energie", "herstel"],
  slaap: ["stress", "energie"],
  stress: ["slaap", "herstel"],
  energie: ["slaap", "voeding"],
  beweging: ["herstel", "energie"],
  herstel: ["slaap", "stress"],
};

export function getPillarCrossDomainLine(pillarId: PillarId): string | null {
  const related = CROSS_DOMAIN[pillarId];
  if (!related || related.length === 0) {
    return null;
  }
  const labels = related.map((id) => PILLAR[id].label.toLowerCase());
  if (labels.length === 1) {
    return `Dit raakt ook je ${labels[0]}.`;
  }
  return `Dit raakt ook je ${labels.slice(0, -1).join(", ")} en ${labels[labels.length - 1]}.`;
}
