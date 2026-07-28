import { describe, expect, it } from "vitest";
import { buildVoortgangBewijsRegel } from "@/lib/voortgang-bewijs-copy";

const CAUSAL_WORDS = /\b(dus|daardoor|dankzij|omdat)\b/i;

function assertNoCausalWords(line: string) {
  expect(line).not.toMatch(CAUSAL_WORDS);
}

describe("buildVoortgangBewijsRegel", () => {
  it("returns beantwoord when focusDelta is non-zero and cycle data exists", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: 8,
      cycleDay: 14,
      daysUntilRemeasure: 6,
      focusLabel: "Slaap",
      focusDelta: 5,
    });

    expect(result.state).toBe("beantwoord");
    expect(result.line).toContain("8 van de 14 dagen actief");
    expect(result.line).toContain("Slaap staat 5 punten hoger");
    expect(result.ctaLabel).toBeNull();
    assertNoCausalWords(result.line);
  });

  it("returns beantwoord with lager when focusDelta is negative", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: 10,
      cycleDay: 20,
      daysUntilRemeasure: 10,
      focusLabel: "Stress",
      focusDelta: -3,
    });

    expect(result.state).toBe("beantwoord");
    expect(result.line).toContain("3 punten lager");
    assertNoCausalWords(result.line);
  });

  it("does not return beantwoord when focusDelta is zero", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: 8,
      cycleDay: 14,
      daysUntilRemeasure: 6,
      focusLabel: "Slaap",
      focusDelta: 0,
    });

    expect(result.state).not.toBe("beantwoord");
  });

  it("returns wachtend when activeDays is null", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: null,
      cycleDay: null,
      daysUntilRemeasure: 12,
      focusLabel: "Voeding",
      focusDelta: null,
    });

    expect(result.state).toBe("wachtend");
    expect(result.line).toContain("Je hermeting staat over 12 dagen");
    expect(result.line).toContain("voeding");
    expect(result.ctaLabel).toBeNull();
    assertNoCausalWords(result.line);
  });

  it("returns wachtend without countdown when daysUntilRemeasure is null", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: null,
      cycleDay: null,
      daysUntilRemeasure: null,
      focusLabel: "Slaap",
      focusDelta: null,
    });

    expect(result.state).toBe("wachtend");
    expect(result.line).toBe(
      "Zodra je tweede meting binnen is, lees je hier of er beweging in zit.",
    );
    assertNoCausalWords(result.line);
  });

  it("returns opbouwend when activeDays meets threshold", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: 5,
      cycleDay: 14,
      daysUntilRemeasure: 9,
      focusLabel: "Beweging",
      focusDelta: 0,
    });

    expect(result.state).toBe("opbouwend");
    expect(result.line).toContain("5 van de 14 dagen actief");
    expect(result.line).toContain("meet je over 9 dagen");
    expect(result.ctaLabel).toBeNull();
    assertNoCausalWords(result.line);
  });

  it("returns opbouwend with hermeting-now copy when daysUntilRemeasure is 0", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: 10,
      cycleDay: 30,
      daysUntilRemeasure: 0,
      focusLabel: "Slaap",
      focusDelta: null,
    });

    expect(result.state).toBe("opbouwend");
    expect(result.line).toContain("meet je nu, met je hermeting.");
    assertNoCausalWords(result.line);
  });

  it("returns opbouwend with hermeting-now copy when daysUntilRemeasure is negative", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: 10,
      cycleDay: 30,
      daysUntilRemeasure: -2,
      focusLabel: "Slaap",
      focusDelta: null,
    });

    expect(result.state).toBe("opbouwend");
    expect(result.line).toContain("meet je nu, met je hermeting.");
  });

  it("returns dun when activeDays is below threshold", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: 1,
      cycleDay: 14,
      daysUntilRemeasure: 13,
      focusLabel: "Stress",
      focusDelta: 0,
    });

    expect(result.state).toBe("dun");
    expect(result.line).toContain("Te weinig om iets te zien");
    expect(result.ctaLabel).toBe("Pak één moment terug");
    assertNoCausalWords(result.line);
  });

  it("handles activeDays 0 and cycleDay 1 as dun", () => {
    const result = buildVoortgangBewijsRegel({
      activeDays: 0,
      cycleDay: 1,
      daysUntilRemeasure: 1,
      focusLabel: "Herstel",
      focusDelta: null,
    });

    expect(result.state).toBe("dun");
    expect(result.line).toContain("0 van de 1 dagen actief");
    expect(result.ctaLabel).toBe("Pak één moment terug");
  });

  it("uses threshold max(2, ceil(cycleDay/3)) for opbouwend boundary", () => {
    const below = buildVoortgangBewijsRegel({
      activeDays: 1,
      cycleDay: 6,
      daysUntilRemeasure: 5,
      focusLabel: "Slaap",
      focusDelta: null,
    });
    expect(below.state).toBe("dun");

    const at = buildVoortgangBewijsRegel({
      activeDays: 2,
      cycleDay: 6,
      daysUntilRemeasure: 4,
      focusLabel: "Slaap",
      focusDelta: null,
    });
    expect(at.state).toBe("opbouwend");
  });
});
