import { describe, it, expect } from "vitest";
import {
  resolveNurtureCta,
  supplementCtaForProfile,
  type NurtureSequenceDay,
} from "@/lib/resolve-nurture-cta";
import { resolveDomainSupplementTip } from "@/lib/resolve-domain-supplement-tip";
import {
  approvedClaims,
  type IngredientClaimKey,
} from "@/data/approved-claims";
import type { DomainKey, NurtureProfileKey } from "@/data/nurture-content";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";

const gateFull: NurturePlanGate = {
  visibleTiers: [1, 2, 3],
  completedPlanPhases: 2,
  organizationId: "org-1",
};

const PROFILES: NurtureProfileKey[] = [
  "Onrustige Slaper",
  "Lage Batterij",
  "Stressdrager",
  "In Balans",
  "Overtrainer",
];

const DAYS: NurtureSequenceDay[] = [7, 14, 21];

const DOMAINS: DomainKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

const SLUG_TO_CLAIM: Record<string, IngredientClaimKey> = {
  magnesium: "magnesium",
  "omega-3-supplement": "omega3",
  ashwagandha: "ashwagandha",
  melatonine: "melatonine",
  creatine: "creatine",
  zink: "zink",
  eiwitpoeder: "eiwitpoeder",
  "vitamine-d": "vitamineD",
};

describe("nurture selection snapshot", () => {
  it("CTA-snapshot (gedrag)", () => {
    const map: Record<string, string> = {};
    for (const profile of PROFILES) {
      for (const day of DAYS) {
        const cta = resolveNurtureCta(
          profile,
          day,
          gateFull,
          true,
          "sleep_score",
        );
        map[`${profile}|${day}`] = `${cta.kind}:${cta.url}`;
      }
    }
    expect(map).toMatchInlineSnapshot(`
      {
        "In Balans|14": "supplement:/beste/omega-3-supplement",
        "In Balans|21": "supplement:/beste/omega-3-supplement",
        "In Balans|7": "pillar:/slaap-verbeteren-na-40",
        "Lage Batterij|14": "supplement:/beste/omega-3-supplement",
        "Lage Batterij|21": "supplement:/beste/omega-3-supplement",
        "Lage Batterij|7": "pillar:/slaap-verbeteren-na-40",
        "Onrustige Slaper|14": "supplement:/beste/magnesium",
        "Onrustige Slaper|21": "supplement:/beste/magnesium",
        "Onrustige Slaper|7": "pillar:/slaap-verbeteren-na-40",
        "Overtrainer|14": "supplement:/beste/magnesium",
        "Overtrainer|21": "supplement:/beste/magnesium",
        "Overtrainer|7": "pillar:/slaap-verbeteren-na-40",
        "Stressdrager|14": "supplement:/beste/magnesium",
        "Stressdrager|21": "supplement:/beste/magnesium",
        "Stressdrager|7": "pillar:/slaap-verbeteren-na-40",
      }
    `);
  });

  it("tip-snapshot (gedrag)", () => {
    const map: Record<string, string> = {};
    for (const domain of DOMAINS) {
      const tip = resolveDomainSupplementTip(domain, gateFull);
      map[domain] = `${tip.supplement.name}|${tip.supplement.url}`;
    }
    expect(map).toMatchInlineSnapshot(`
      {
        "energy_score": "Leefstijlstappen|/energie-na-40",
        "movement_score": "Magnesium|/beste/magnesium",
        "nutrition_score": "Omega-3|/beste/omega-3-supplement",
        "recovery_score": "Magnesium|/beste/magnesium",
        "sleep_score": "Magnesium|/beste/magnesium",
        "stress_score": "Leefstijlstappen|/stress-verminderen-na-40",
      }
    `);
  });

  it("compliance-invariant (status-based, GEEN slug-blacklist)", () => {
    // De ENIGE harde nurture-invariant is "resolved stof heeft status === 'approved'".
    // Dit sluit alleen on_hold (ashwagandha) en forbidden (melatonine) uit.
    // creatine/zink/eiwitpoeder zijn approved en bewust NIET geblacklist — hun plaatsing
    // in nurture volgt later via de meetlaag (gemeten gap), niet via een verbod.
    for (const profile of PROFILES) {
      const cta = supplementCtaForProfile(profile);
      if (!cta) {
        continue;
      }
      const slug = cta.url.replace(/^\/beste\//, "");
      const claimKey = SLUG_TO_CLAIM[slug];
      expect(claimKey, `onbekende slug: ${slug}`).toBeDefined();
      expect(approvedClaims[claimKey!].status).toBe("approved");
    }
  });
});
