export interface ScoringConfig {
  sleepMax: number;
  energyMax: number;
  stressMax: number;
  nutritionMax: number;
  movementMax: number;
  recoveryMax: number;
}

export interface OrgConfig {
  id: string;
  name: string;
  slug: string;
  scoring: ScoringConfig;
  supplements: string[];
  affiliatePrefix: string;
  emailFromName: string;
  emailFromAddress: string;
}

const DEFAULT_SCORING: ScoringConfig = {
  sleepMax: 7,
  energyMax: 8,
  stressMax: 8,
  nutritionMax: 11,
  movementMax: 7,
  recoveryMax: 6,
};

export const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export const DEFAULT_ORG: OrgConfig = {
  id: DEFAULT_ORG_ID,
  name: "PerfectSupplement",
  slug: "perfectsupplement",
  scoring: DEFAULT_SCORING,
  supplements: [
    "magnesium",
    "omega-3-supplement",
    "ashwagandha",
    "vitamine-d",
    "creatine",
    "zink",
    "eiwitpoeder",
  ],
  affiliatePrefix: "",
  emailFromName: "PerfectSupplement",
  emailFromAddress: "herinnering@mail.perfectsupplement.nl",
};

export function getOrgConfig(_orgId?: string): OrgConfig {
  return DEFAULT_ORG;
}
