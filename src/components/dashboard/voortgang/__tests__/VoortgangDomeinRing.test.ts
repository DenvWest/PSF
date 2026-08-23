import { describe, expect, it } from "vitest";
import { buildCoverageLine } from "@/components/dashboard/voortgang/VoortgangDomeinRing";

describe("buildCoverageLine", () => {
  it("returns null without domainCheckDaysAgo", () => {
    expect(buildCoverageLine(undefined)).toBeNull();
  });

  it("counts against the four check-domains, not all seven pillars", () => {
    const line = buildCoverageLine({
      slaap: 3,
      beweging: 1,
      voeding: 6,
      stress: 0,
    });
    expect(line).toBe("Je hebt 4 van de 4 domeinen apart gemeten.");
  });

  it("names the missing check-domains when not all four are measured", () => {
    const line = buildCoverageLine({ slaap: 2 });
    expect(line).toBe(
      "Je hebt 1 van de 4 domeinen apart gemeten. beweging, voeding, stress nog niet.",
    );
  });

  it("ignores verbinding, energie and herstel entirely — they never have a check route", () => {
    const line = buildCoverageLine({
      slaap: 1,
      beweging: 1,
      voeding: 1,
      stress: 1,
      verbinding: 1,
      energie: 1,
      herstel: 1,
    });
    expect(line).toBe("Je hebt 4 van de 4 domeinen apart gemeten.");
  });
});
