import { PILLARS, PILLAR } from "@/data/dashboard";
import type { SymptomId } from "@/data/intake-questions";
import { derivePriority } from "@/lib/dashboard-model";
import type { DomainScores } from "@/lib/intake-engine";
import { MEASURED_DOMAIN_TO_PILLAR } from "@/lib/measured-pillar-map";
import { getPrimaryTheme, type MeasuredPillarId } from "@/lib/primary-theme";
import { getRecognitionLine, getVitalityFraming } from "@/lib/results-framing";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type { CheckScores, Pillar, PillarId } from "@/types/dashboard";

export function mapDomainScoresToCheckScores(domainScores: DomainScores): CheckScores {
  return {
    slaap: Math.round(domainScores.sleep_score),
    energie: Math.round(domainScores.energy_score),
    stress: Math.round(domainScores.stress_score),
    voeding: Math.round(domainScores.nutrition_score),
    beweging: Math.round(domainScores.movement_score),
    herstel: Math.round(domainScores.recovery_score),
    verbinding: Math.round(domainScores.connection_score),
  };
}

export function mapCheckScoresToDomainScores(scores: CheckScores): DomainScores {
  return {
    sleep_score: scores.slaap,
    energy_score: scores.energie,
    stress_score: scores.stress,
    nutrition_score: scores.voeding,
    movement_score: scores.beweging,
    recovery_score: scores.herstel,
    connection_score: scores.verbinding,
  };
}

export type RevealLifestyleItem = {
  pillar: Pillar;
  win: Pillar["quickWin"];
  role: "prioriteit" | "kracht";
};

export type RevealModel = {
  vitality: number;
  primaryTheme: MeasuredPillarId;
  primaryPillarId: PillarId;
  primaryPillarLabel: string;
  primaryPillarHref: string;
  recognitionLine: string | null;
  driverLine: string | null;
  strengthLine: string | null;
  scores: CheckScores;
  ladder: Pillar[];
  topLadder: Pillar[];
  priority: Pillar;
  strongest: Pillar;
  lifestyle: RevealLifestyleItem[];
};

function resolvePrimaryPillar(primaryTheme: MeasuredPillarId): {
  primaryPillarId: PillarId;
  primaryPillarLabel: string;
  primaryPillarHref: string;
} {
  const primaryPillarId = MEASURED_DOMAIN_TO_PILLAR[primaryTheme];
  const pillar = PILLARS.find((entry) => entry.id === primaryPillarId);
  return {
    primaryPillarId,
    primaryPillarLabel: pillar?.label ?? primaryPillarId,
    primaryPillarHref: pillar?.hubRoute ?? "/intake",
  };
}

export function buildRevealModel(
  scores: DomainScores,
  answers: Record<string, number>,
  symptoms: SymptomId[] = [],
  primaryThemeInput?: MeasuredPillarId,
): RevealModel {
  const primaryTheme = primaryThemeInput ?? getPrimaryTheme(scores, answers);
  const primaryPillar = resolvePrimaryPillar(primaryTheme);
  const checkScores = mapDomainScoresToCheckScores(scores);
  const ladder = derivePriority(checkScores);
  const priority = PILLAR[primaryPillar.primaryPillarId];
  const strongest = [...ladder]
    .sort((a, b) => checkScores[b.id] - checkScores[a.id])
    .filter((pillar) => pillar.id !== priority.id)[0];
  const framing = getVitalityFraming(scores);

  return {
    vitality: computeVitaliteit(resolveVitaliteitFacets(scores)),
    primaryTheme,
    ...primaryPillar,
    recognitionLine: getRecognitionLine(symptoms),
    driverLine: framing.driverLine,
    strengthLine: framing.strengthLine,
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
