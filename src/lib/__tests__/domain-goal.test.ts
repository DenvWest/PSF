import { describe, expect, it } from "vitest";
import {
  CUSTOM_SITUATION_ID,
  DOMAIN_GOAL_SITUATIONS,
  deriveGoalMode,
  getSituationLabel,
  isCustomSituation,
  isDomainGoalDomain,
  isSituationId,
  isValidGoalScore,
  isValidOwnWords,
  orderSituationsForAnchor,
  OWN_WORDS_MAX_LENGTH,
  type DomainGoalDomain,
} from "@/lib/domain-goal";

const DOMAINS: DomainGoalDomain[] = [
  "slaap",
  "beweging",
  "voeding",
  "stress",
  "verbinding",
];

describe("domain-goal catalog", () => {
  it("has exactly five domains, each with seven situations", () => {
    expect(Object.keys(DOMAIN_GOAL_SITUATIONS).sort()).toEqual([...DOMAINS].sort());
    for (const domain of DOMAINS) {
      expect(DOMAIN_GOAL_SITUATIONS[domain]).toHaveLength(7);
    }
  });

  it("has unique preset situation ids across all domains", () => {
    const presetIds = DOMAINS.flatMap((domain) =>
      DOMAIN_GOAL_SITUATIONS[domain]
        .filter((option) => option.id !== CUSTOM_SITUATION_ID)
        .map((option) => option.id),
    );
    expect(new Set(presetIds).size).toBe(presetIds.length);
  });

  it("includes one custom anders option per domain", () => {
    for (const domain of DOMAINS) {
      const andersOptions = DOMAIN_GOAL_SITUATIONS[domain].filter(
        (option) => option.id === CUSTOM_SITUATION_ID,
      );
      expect(andersOptions).toHaveLength(1);
      expect(andersOptions[0]?.label).toBe("Anders — zelf invullen");
    }
  });
});

describe("isDomainGoalDomain", () => {
  it("accepts the five intervention domains", () => {
    for (const domain of DOMAINS) {
      expect(isDomainGoalDomain(domain)).toBe(true);
    }
  });

  it("rejects readout domains and unknown values", () => {
    expect(isDomainGoalDomain("energie")).toBe(false);
    expect(isDomainGoalDomain("herstel")).toBe(false);
    expect(isDomainGoalDomain("onzin")).toBe(false);
  });
});

describe("isSituationId", () => {
  it("accepts a situation that belongs to the domain", () => {
    expect(isSituationId("slaap", "doorslapen")).toBe(true);
    expect(isSituationId("beweging", "trap_lopen")).toBe(true);
    expect(isSituationId("slaap", "anders")).toBe(true);
  });

  it("rejects a situation from a different domain", () => {
    expect(isSituationId("slaap", "trap_lopen")).toBe(false);
    expect(isSituationId("beweging", "doorslapen")).toBe(false);
  });
});

describe("isCustomSituation", () => {
  it("recognises the anders sentinel", () => {
    expect(isCustomSituation("anders")).toBe(true);
    expect(isCustomSituation("doorslapen")).toBe(false);
  });
});

describe("getSituationLabel", () => {
  it("resolves the Dutch label for a known situation", () => {
    expect(getSituationLabel("slaap", "inslapen")).toBe(
      "Binnen een half uur in slaap vallen",
    );
  });
});

describe("isValidOwnWords", () => {
  it("accepts strings within the 80-character limit", () => {
    expect(isValidOwnWords("Twee trappen op zonder buiten adem")).toBe(true);
    expect(isValidOwnWords("")).toBe(true);
    expect(isValidOwnWords("a".repeat(OWN_WORDS_MAX_LENGTH))).toBe(true);
  });

  it("rejects strings over the limit", () => {
    expect(isValidOwnWords("a".repeat(OWN_WORDS_MAX_LENGTH + 1))).toBe(false);
  });
});

describe("isValidGoalScore", () => {
  it("accepts integers from 0 to 10", () => {
    expect(isValidGoalScore(0)).toBe(true);
    expect(isValidGoalScore(10)).toBe(true);
    expect(isValidGoalScore(6)).toBe(true);
  });

  it("rejects out-of-range, non-integer or non-number values", () => {
    expect(isValidGoalScore(-1)).toBe(false);
    expect(isValidGoalScore(11)).toBe(false);
    expect(isValidGoalScore(5.5)).toBe(false);
    expect(isValidGoalScore("6")).toBe(false);
    expect(isValidGoalScore(null)).toBe(false);
  });
});

describe("orderSituationsForAnchor", () => {
  it("returns the default order for non-movement domains, anchor or not", () => {
    const situations = DOMAIN_GOAL_SITUATIONS.slaap;
    expect(orderSituationsForAnchor("slaap", "kracht")).toEqual(situations);
    expect(orderSituationsForAnchor("slaap", null)).toEqual(situations);
    expect(orderSituationsForAnchor("slaap", null).at(-1)?.id).toBe(CUSTOM_SITUATION_ID);
  });

  it("returns the default order for beweging without a known anchor", () => {
    expect(orderSituationsForAnchor("beweging", null)).toEqual(
      DOMAIN_GOAL_SITUATIONS.beweging,
    );
    expect(orderSituationsForAnchor("beweging", null).at(-1)?.id).toBe(
      CUSTOM_SITUATION_ID,
    );
  });

  it("puts anchor-matching situations first for beweging, keeping all presets plus anders", () => {
    const ordered = orderSituationsForAnchor("beweging", "kracht");
    expect(ordered.map((option) => option.id)).toEqual([
      "tillen_dragen",
      "opstaan_bukken",
      "trap_lopen",
      "lang_volhouden",
      "sport_meedoen",
      "weer_beginnen",
      "anders",
    ]);
    expect(ordered).toHaveLength(7);
  });

  it("orders differently per anchor", () => {
    const kracht = orderSituationsForAnchor("beweging", "kracht").map((o) => o.id);
    const meedoen = orderSituationsForAnchor("beweging", "meedoen").map((o) => o.id);
    expect(kracht[0]).toBe("tillen_dragen");
    expect(meedoen[0]).toBe("sport_meedoen");
  });
});

describe("deriveGoalMode", () => {
  it("is verwerven when there is no previous score (baseline)", () => {
    expect(deriveGoalMode(4, null)).toBe("verwerven");
  });

  it("is herpakken when the score drops", () => {
    expect(deriveGoalMode(3, 6)).toBe("herpakken");
  });

  it("is behouden when stable and high", () => {
    expect(deriveGoalMode(9, 9)).toBe("behouden");
    expect(deriveGoalMode(8, 6)).toBe("behouden");
  });

  it("is verwerven when rising but not yet high", () => {
    expect(deriveGoalMode(6, 4)).toBe("verwerven");
  });

  it("is verwerven when flat at a low score (no blame language)", () => {
    expect(deriveGoalMode(4, 4)).toBe("verwerven");
  });
});
