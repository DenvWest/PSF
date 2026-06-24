import { INTAKE_CTA } from "@/lib/intake-product-copy";
import type { DomainKey, NurtureProfileKey } from "@/data/nurture-content";
import type { IngredientClaimKey } from "@/data/approved-claims";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";
import { isComparisonAllowed } from "@/lib/comparison-availability";
import { getRecommendations, getCatalogEntry } from "@/lib/recommendation-engine";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import type { RecommendationInput } from "@/types/recommendation";

export type NurtureSequenceDay = 0 | 3 | 7 | 14 | 21 | 30;

export type ResolvedNurtureCta = {
  text: string;
  url: string;
  kind: "lifestyle" | "pillar" | "supplement" | "remeasure";
  /** Index in candidates[] die de gate doorliet; null bij niet-supplement CTAs. */
  candidateRank: number | null;
};

const PILLAR_BY_DOMAIN: Record<DomainKey, { text: string; url: string }> = {
  sleep_score: {
    text: "Lees de slaapgids voor mannen 40+",
    url: "/slaap-verbeteren-na-40",
  },
  stress_score: {
    text: "Lees de praktische stressgids",
    url: "/stress-verminderen-na-40",
  },
  energy_score: {
    text: "Lees over energie na 40",
    url: "/energie-na-40",
  },
  nutrition_score: {
    text: "Ontvang je voedings-stappenplan",
    url: "/gids/voeding",
  },
  movement_score: {
    text: "Ontvang je beweging-stappenplan",
    url: "/gids/beweging",
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
    url: "/stress-verminderen-na-40",
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
    text: INTAKE_CTA.nurtureOverview,
    url: "/intake",
  },
  "In Balans": {
    text: "Bekijk je leefstijl-overzicht",
    url: "/intake",
  },
};

// Allow-list: alleen deze claims mogen in nurture. on_hold/forbidden/route-only
// (ashwagandha/melatonine/zink/creatine/eiwitpoeder/whey) kunnen per constructie niet verschijnen.
const NURTURE_CLAIM_PREFERENCE: Record<NurtureProfileKey, IngredientClaimKey[]> = {
  "Onrustige Slaper": ["magnesium", "omega3"],
  "Lage Batterij": ["omega3", "magnesium"],
  Overtrainer: ["magnesium", "omega3"],
  "In Balans": ["omega3", "magnesium"],
  Stressdrager: ["magnesium", "omega3"],
};
const CTA_TEXT_BY_CLAIM: Partial<Record<IngredientClaimKey, string>> = {
  magnesium: "Vergelijk magnesium supplementen",
  omega3: "Vergelijk omega-3 supplementen",
};

function claimOrderForProfile(
  profileKey: NurtureProfileKey,
  input?: RecommendationInput | null,
): IngredientClaimKey[] {
  const preference = NURTURE_CLAIM_PREFERENCE[profileKey];
  if (!input) {
    return preference;
  }

  const preferenceSet = new Set<IngredientClaimKey>(preference);
  const engineClaims = getRecommendations(input, { source: "route" })
    .map((rec) => getCatalogEntry(rec.supplementId)?.claimKey)
    .filter(
      (claimKey): claimKey is IngredientClaimKey =>
        claimKey != null && preferenceSet.has(claimKey),
    );

  const seen = new Set<IngredientClaimKey>();
  const ordered: IngredientClaimKey[] = [];
  for (const claimKey of engineClaims) {
    if (!seen.has(claimKey)) {
      seen.add(claimKey);
      ordered.push(claimKey);
    }
  }
  for (const claimKey of preference) {
    if (!seen.has(claimKey)) {
      ordered.push(claimKey);
    }
  }
  return ordered;
}

export function slugFromComparisonPath(path: string): string | null {
  const match = path.match(/^\/beste\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export function supplementCtaForProfile(
  profileKey: NurtureProfileKey,
  input?: RecommendationInput | null,
): ResolvedNurtureCta | null {
  const preference = NURTURE_CLAIM_PREFERENCE[profileKey];
  if (!preference) {
    return null;
  }

  const claimOrder = claimOrderForProfile(profileKey, input);
  for (let i = 0; i < claimOrder.length; i++) {
    const claimKey = claimOrder[i];
    const path = resolveGatedComparisonPath(claimKey);
    if (path) {
      const slug = slugFromComparisonPath(path);
      if (slug && isComparisonAllowed(slug)) {
        return {
          text: CTA_TEXT_BY_CLAIM[claimKey] ?? "Vergelijk supplementen",
          url: path,
          kind: "supplement",
          candidateRank: i,
        };
      }
    }
  }
  return null;
}

export function lifestyleCtaForProfile(
  profileKey: NurtureProfileKey,
): ResolvedNurtureCta {
  const entry = LIFESTYLE_BY_PROFILE[profileKey];
  return { ...entry, kind: "lifestyle", candidateRank: null };
}

export function pillarCtaForProfile(
  profileKey: NurtureProfileKey,
  weakestDomain: DomainKey,
): ResolvedNurtureCta {
  void profileKey;
  const pillar = PILLAR_BY_DOMAIN[weakestDomain];
  return { ...pillar, kind: "pillar", candidateRank: null };
}

export function hasSupplementComparePath(
  profileKey: NurtureProfileKey,
  input?: RecommendationInput | null,
): boolean {
  return supplementCtaForProfile(profileKey, input) !== null;
}

// Personalisatie raakt framing/timing/volgorde; SELECTIE (welk middel, welke claim)
// loopt via allow-list + engine-gate + tier-gate.
export function resolveNurtureCta(
  profileKey: NurtureProfileKey,
  sequenceDay: NurtureSequenceDay,
  planGate: NurturePlanGate | null,
  hasComparePath: boolean,
  weakestDomain: DomainKey,
  input?: RecommendationInput | null,
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
      candidateRank: null,
    };
  }

  const tierAllowsSupplement =
    planGate != null && planGate.visibleTiers.includes(3) && hasComparePath;

  if ((sequenceDay === 14 || sequenceDay === 21) && tierAllowsSupplement) {
    const supplement = supplementCtaForProfile(profileKey, input);
    if (supplement) {
      const slug = slugFromComparisonPath(supplement.url);
      if (slug && isComparisonAllowed(slug)) {
        return supplement;
      }
    }
  }

  return lifestyleCtaForProfile(profileKey);
}
