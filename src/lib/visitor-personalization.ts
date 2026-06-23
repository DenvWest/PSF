import { PILLAR } from "@/data/dashboard";
import { derivePriority } from "@/lib/dashboard-model";
import type { CheckScores, PillarId } from "@/types/dashboard";

export type VisitorPersonalization = {
  priorityPillarId: PillarId;
  priorityLabel: string;
  orderedPillarIds: PillarId[];
  profileLabel: string | null;
};

export function derivePersonalization(
  scores: CheckScores,
  profileLabel: string | null,
): VisitorPersonalization {
  const ordered = derivePriority(scores);
  const priority = ordered[0];

  return {
    priorityPillarId: priority.id,
    priorityLabel: PILLAR[priority.id].label,
    orderedPillarIds: ordered.map((pillar) => pillar.id),
    profileLabel,
  };
}
