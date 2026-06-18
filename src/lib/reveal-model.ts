import { approvedClaims, getUsableClaims, type IngredientClaimKey } from "@/data/approved-claims";
import { derivePriority } from "@/lib/dashboard-model";
import { getProfileLabel } from "@/lib/intake-engine";
import type { DomainScores } from "@/lib/intake-engine";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type { CheckScores, Pillar, PillarId } from "@/types/dashboard";

const PILLAR_TO_CLAIM_KEY: Partial<Record<PillarId, IngredientClaimKey>> = {
  slaap: "magnesium",
  voeding: "omega3",
  stress: "ashwagandha",
  herstel: "magnesium",
  beweging: "creatine",
};

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

export type RevealSupplementDisclosure = {
  name: string;
  form: string;
  grade: "A" | "B" | string;
  claim: string;
  comparisonPath: string;
  onHold: boolean;
  qualityReason: string;
};

export type RevealModel = {
  vitality: number;
  profileName: string;
  scores: CheckScores;
  ladder: Pillar[];
  priority: Pillar;
  lifestyleTitle: string;
  lifestyleDetail: string;
  supplement: RevealSupplementDisclosure | null;
};

function resolveSupplement(priority: Pillar): RevealSupplementDisclosure | null {
  const staticSupp = priority.supplement;
  if (!staticSupp) {
    return null;
  }

  const claimKey = PILLAR_TO_CLAIM_KEY[priority.id];
  if (!claimKey) {
    return null;
  }

  const entry = approvedClaims[claimKey];
  const onHold = entry.status === "on_hold";
  const gatedPath = resolveGatedComparisonPath(claimKey);
  const comparisonPath = gatedPath ?? entry.comparisonPath ?? "";

  if (!onHold) {
    const claims = getUsableClaims(claimKey);
    if (claims.length === 0 || !comparisonPath) {
      return null;
    }
    return {
      name: staticSupp.name,
      form: staticSupp.form,
      grade: staticSupp.grade,
      claim: claims[0].text,
      comparisonPath,
      onHold: false,
      qualityReason: `We kozen ${staticSupp.name} ${staticSupp.form} op zuiverheid, dosering en onafhankelijke productvergelijking.`,
    };
  }

  if (!comparisonPath) {
    return null;
  }

  return {
    name: staticSupp.name,
    form: staticSupp.form,
    grade: staticSupp.grade,
    claim: staticSupp.claim,
    comparisonPath,
    onHold: true,
    qualityReason: `We kozen ${staticSupp.name} ${staticSupp.form} op zuiverheid en onafhankelijke productvergelijking.`,
  };
}

export function buildRevealModel(
  scores: DomainScores,
  isOvertrainer: boolean,
): RevealModel {
  const profile = getProfileLabel(scores);
  const checkScores = mapDomainScoresToCheckScores(scores);
  const ladder = derivePriority(checkScores);
  const priority = ladder[0];

  return {
    vitality: computeVitaliteit(resolveVitaliteitFacets(scores)),
    profileName: isOvertrainer ? "Overtrainer" : profile.name,
    scores: checkScores,
    ladder,
    priority,
    lifestyleTitle: priority.quickWin.title,
    lifestyleDetail: priority.quickWin.detail,
    supplement: resolveSupplement(priority),
  };
}
