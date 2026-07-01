import { PILLAR } from "@/data/dashboard";
import { derivePriority } from "@/lib/dashboard-model";
import { getPriorityPillarId } from "@/lib/priority-pillar";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
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
  const priorityPillarId = getPriorityPillarId(
    mapCheckScoresToDomainScores(scores),
    {},
  );

  return {
    priorityPillarId,
    priorityLabel: PILLAR[priorityPillarId].label,
    orderedPillarIds: ordered.map((pillar) => pillar.id),
    profileLabel,
  };
}
