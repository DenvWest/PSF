import { describe, it, expect } from "vitest";
import {
  resolveNurtureCta,
  supplementCtaForProfile,
} from "@/lib/resolve-nurture-cta";
import { resolveDomainSupplementTip } from "@/lib/resolve-domain-supplement-tip";
import type { NurtureProfileKey, DomainKey } from "@/data/nurture-content";
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

const DAYS = [7, 14, 21] as const;

const DOMAINS: DomainKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

const FORBIDDEN_SLUGS = [
  "ashwagandha",
  "melatonine",
  "whey",
  "creatine",
  "zink",
  "eiwitpoeder",
] as const;

describe("nurture selection snapshot", () => {
  it("CTA-snapshot", () => {
    const snapshot: Record<string, string> = {};
    for (const profile of PROFILES) {
      for (const day of DAYS) {
        const result = resolveNurtureCta(
          profile,
          day,
          gateFull,
          true,
          "sleep_score",
        );
        snapshot[`${profile}|${day}`] = `${result.kind}:${result.url}`;
      }
    }
    expect(snapshot).toMatchInlineSnapshot(`
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

  it("tip-snapshot", () => {
    const snapshot: Record<string, string> = {};
    for (const domain of DOMAINS) {
      const tip = resolveDomainSupplementTip(domain, gateFull);
      snapshot[domain] = `${tip.supplement.name}|${tip.supplement.url}`;
    }
    expect(snapshot).toMatchInlineSnapshot(`
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

  it("forbidden-baseline", () => {
    for (const profile of PROFILES) {
      const cta = supplementCtaForProfile(profile);
      if (cta) {
        const slug = cta.url.replace(/^\/beste\//, "");
        expect(FORBIDDEN_SLUGS).not.toContain(slug);
      }
    }
  });
});
