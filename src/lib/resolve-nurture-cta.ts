import type { DomainKey, NurtureProfileKey } from "@/data/nurture-content";
import { approvedClaims } from "@/data/approved-claims";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";
import { isComparisonAllowed } from "@/lib/comparison-availability";

export type NurtureSequenceDay = 0 | 3 | 7 | 14 | 21 | 30;

export type ResolvedNurtureCta = {
  text: string;
  url: string;
  kind: "lifestyle" | "pillar" | "supplement" | "remeasure";
};

const PILLAR_BY_DOMAIN: Record<DomainKey, { text: string; url: string }> = {
  sleep_score: {
    text: "Lees de slaapgids voor mannen 40+",
    url: "/slaap-verbeteren-na-40",
  },
  stress_score: {
    text: "Lees de praktische stressgids",
    url: "/stress-verminderen-man",
  },
  energy_score: {
    text: "Lees over energie na 40",
    url: "/energie-na-40",
  },
  nutrition_score: {
    text: "Lees over voeding na 40",
    url: "/voeding-na-40",
  },
  movement_score: {
    text: "Lees over beweging na 40",
    url: "/beweging-na-40",
  },
  recovery_score: {
    text: "Lees het herstelthema",
    url: "/gids/herstel",
  },
};

const LIFESTYLE_BY_PROFILE: Record<
  NurtureProfileKey,
  { text: string; url: string }
> = {
  Stressdrager: {
    text: "Lees de praktische stressgids",
    url: "/stress-verminderen-man",
  },
  "Onrustige Slaper": {
    text: "Bekijk je slaap-overzicht",
    url: "/intake",
  },
  "Lage Batterij": {
    text: "Bekijk je leefstijl-overzicht",
    url: "/intake",
  },
  Overtrainer: {
    text: "Bekijk je herstel-overzicht",
    url: "/intake",
  },
  "In Balans": {
    text: "Bekijk je leefstijl-overzicht",
    url: "/intake",
  },
};

const SUPPLEMENT_BY_PROFILE: Partial<
  Record<NurtureProfileKey, { text: string; claimKey: string }>
> = {
  "Onrustige Slaper": {
    text: "Vergelijk magnesium supplementen",
    claimKey: "magnesium",
  },
  "Lage Batterij": {
    text: "Vergelijk omega-3 supplementen",
    claimKey: "omega3",
  },
  Overtrainer: {
    text: "Vergelijk magnesium supplementen",
    claimKey: "magnesium",
  },
  "In Balans": {
    text: "Vergelijk omega-3 supplementen",
    claimKey: "omega3",
  },
  Stressdrager: {
    text: "Vergelijk magnesium supplementen",
    claimKey: "magnesium",
  },
};

function slugFromComparisonPath(path: string): string | null {
  const match = path.match(/^\/beste\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export function supplementCtaForProfile(
  profileKey: NurtureProfileKey,
): ResolvedNurtureCta | null {
  const entry = SUPPLEMENT_BY_PROFILE[profileKey];
  if (!entry) {
    return null;
  }
  const claim = approvedClaims[entry.claimKey];
  if (!claim || claim.status !== "approved" || !claim.comparisonPath) {
    return null;
  }
  const slug = slugFromComparisonPath(claim.comparisonPath);
  if (!slug || !isComparisonAllowed(slug)) {
    return null;
  }
  return {
    text: entry.text,
    url: claim.comparisonPath,
    kind: "supplement",
  };
}

export function lifestyleCtaForProfile(
  profileKey: NurtureProfileKey,
): ResolvedNurtureCta {
  const entry = LIFESTYLE_BY_PROFILE[profileKey];
  return { ...entry, kind: "lifestyle" };
}

export function pillarCtaForProfile(
  profileKey: NurtureProfileKey,
  weakestDomain: DomainKey,
): ResolvedNurtureCta {
  void profileKey;
  const pillar = PILLAR_BY_DOMAIN[weakestDomain];
  return { ...pillar, kind: "pillar" };
}

export function hasSupplementComparePath(
  profileKey: NurtureProfileKey,
): boolean {
  return supplementCtaForProfile(profileKey) !== null;
}

export function resolveNurtureCta(
  profileKey: NurtureProfileKey,
  sequenceDay: NurtureSequenceDay,
  planGate: NurturePlanGate | null,
  hasComparePath: boolean,
  weakestDomain: DomainKey,
): ResolvedNurtureCta {
  if (sequenceDay <= 3) {
    return lifestyleCtaForProfile(profileKey);
  }

  if (sequenceDay === 7) {
    const pillar = pillarCtaForProfile(profileKey, weakestDomain);
    if (pillar.url) {
      return pillar;
    }
    return lifestyleCtaForProfile(profileKey);
  }

  if (sequenceDay === 30) {
    return {
      text: "Doe de herhaalmeting",
      url: "/intake",
      kind: "remeasure",
    };
  }

  const tierAllowsSupplement =
    planGate != null && planGate.visibleTiers.includes(3) && hasComparePath;

  if ((sequenceDay === 14 || sequenceDay === 21) && tierAllowsSupplement) {
    const supplement = supplementCtaForProfile(profileKey);
    if (supplement) {
      const slug = slugFromComparisonPath(supplement.url);
      if (slug && isComparisonAllowed(slug)) {
        return supplement;
      }
    }
  }

  return lifestyleCtaForProfile(profileKey);
}
