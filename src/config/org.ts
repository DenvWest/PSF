import { DEFAULT_THEME, type ThemeConfig } from "./theme";

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
  theme: ThemeConfig;
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
  theme: DEFAULT_THEME,
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

const orgRegistry: Record<string, OrgConfig> = {
  [DEFAULT_ORG_ID]: DEFAULT_ORG,
};

export function getOrgConfig(orgId?: string): OrgConfig {
  if (!orgId) return DEFAULT_ORG;
  return orgRegistry[orgId] ?? DEFAULT_ORG;
}

export function registerOrg(config: OrgConfig): void {
  orgRegistry[config.id] = config;
}
