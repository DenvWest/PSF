import { approvedClaims } from "@/data/approved-claims";

/** Maps supplement route / comparison slug to `approvedClaims` record key. */
const SLUG_TO_CLAIM_KEY: Record<string, string> = {
  magnesium: "magnesium",
  "magnesium-glycinaat": "magnesium",
  "omega-3": "omega3",
  "omega-3-supplement": "omega3",
  "vitamine-d": "vitamineD",
  creatine: "creatine",
  zink: "zink",
  ashwagandha: "ashwagandha",
  melatonine: "melatonine",
  eiwitpoeder: "eiwitpoeder",
};

function claimKeyForSlug(slug: string): string | undefined {
  return SLUG_TO_CLAIM_KEY[slug];
}

export function isComparisonAllowed(slug: string): boolean {
  const key = claimKeyForSlug(slug);
  if (!key) {
    return false;
  }
  const entry = approvedClaims[key];
  if (!entry || entry.status === "forbidden") {
    return false;
  }
  return entry.comparisonPath !== null;
}

export function getAllowedComparisonPath(slug: string): string | null {
  const key = claimKeyForSlug(slug);
  if (!key) {
    return null;
  }
  const entry = approvedClaims[key];
  if (!entry || !isComparisonAllowed(slug)) {
    return null;
  }
  return entry.comparisonPath;
}
