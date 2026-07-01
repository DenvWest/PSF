import { describe, expect, it } from "vitest";
import {
  countSufficientDomains,
  getDisplayStatus,
  getDisplayStatusFraming,
  getDisplayStatusTone,
  LIFESTYLE_DOMAIN_COUNT,
} from "@/lib/score-display";

describe("getDisplayStatus", () => {
  it("maps boundary values", () => {
    expect(getDisplayStatus(80)).toBe("Sterk");
    expect(getDisplayStatus(79)).toBe("Voldoende");
    expect(getDisplayStatus(60)).toBe("Voldoende");
    expect(getDisplayStatus(59)).toBe("Aandacht");
    expect(getDisplayStatus(40)).toBe("Aandacht");
    expect(getDisplayStatus(39)).toBe("Prioriteit");
  });

  it("handles non-finite input", () => {
    expect(getDisplayStatus(Number.NaN)).toBe("Voldoende");
  });
});

describe("getDisplayStatusTone", () => {
  it("returns tone per status", () => {
    expect(getDisplayStatusTone("Sterk")).toBe("sage");
    expect(getDisplayStatusTone("Prioriteit")).toBe("terra-deep");
  });
});

describe("getDisplayStatusFraming", () => {
  it("uses compliance-safe wording", () => {
    const text = getDisplayStatusFraming("Slaap", "Aandacht");
    expect(text).toContain("aandachtspunt");
    expect(text).not.toMatch(/\d/);
  });
});

describe("countSufficientDomains", () => {
  const baseScores = {
    slaap: 50,
    energie: 50,
    stress: 50,
    voeding: 50,
    beweging: 50,
    herstel: 50,
    verbinding: 50,
  };

  it("counts domains with score >= 60", () => {
    expect(
      countSufficientDomains({
        ...baseScores,
        slaap: 80,
        voeding: 65,
        beweging: 59,
      }),
    ).toBe(2);
  });

  it("counts all six when every domain is sufficient", () => {
    expect(
      countSufficientDomains({
        slaap: 80,
        energie: 70,
        stress: 60,
        voeding: 85,
        beweging: 62,
        herstel: 90,
    verbinding: 90,
      }),
    ).toBe(LIFESTYLE_DOMAIN_COUNT);
  });
});
