import { derivePriority } from "@/lib/dashboard-model";
import { getProfileLabel } from "@/lib/intake-engine";
import type { DomainScores } from "@/lib/intake-engine";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type { CheckScores, Pillar } from "@/types/dashboard";

export function mapDomainScoresToCheckScores(domainScores: DomainScores): CheckScores {
  return {
    slaap: Math.round(domainScores.sleep_score),
    energie: Math.round(domainScores.energy_score),
    stress: Math.round(domainScores.stress_score),
    voeding: Math.round(domainScores.nutrition_score),
    beweging: Math.round(domainScores.movement_score),
    herstel: Math.round(domainScores.recovery_score),
  };
}

export type RevealLifestyleItem = {
  pillar: Pillar;
  win: Pillar["quickWin"];
  role: "prioriteit" | "kracht";
};

export type RevealModel = {
  vitality: number;
  profileName: string;
  scores: CheckScores;
  ladder: Pillar[];
  topLadder: Pillar[];
  priority: Pillar;
  strongest: Pillar;
  lifestyle: RevealLifestyleItem[];
};

export function buildRevealModel(
  scores: DomainScores,
  isOvertrainer: boolean,
): RevealModel {
  const profile = getProfileLabel(scores);
  const checkScores = mapDomainScoresToCheckScores(scores);
  const ladder = derivePriority(checkScores);
  const priority = ladder[0];
  const strongest = [...ladder]
    .sort((a, b) => checkScores[b.id] - checkScores[a.id])
    .filter((pillar) => pillar.id !== priority.id)[0];

  return {
    vitality: computeVitaliteit(resolveVitaliteitFacets(scores)),
    profileName: isOvertrainer ? "Overtrainer" : profile.name,
    scores: checkScores,
    ladder,
    topLadder: ladder.slice(0, 3),
    priority,
    strongest,
    lifestyle: [
      { pillar: priority, win: priority.quickWin, role: "prioriteit" },
      { pillar: strongest, win: strongest.quickWin, role: "kracht" },
    ],
  };
}
