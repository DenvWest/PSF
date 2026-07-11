import { describe, it, expect } from "vitest";
import {
  allPersonalizedLifestyleTexts,
  personalizeLifestyleText,
} from "@/lib/nutrition-advice-personalization";
import {
  buildNutritionAdvice,
  nutritionSupplementGate,
} from "@/lib/nutrition-advice";
import { buildLifestyleAction } from "@/data/nutrition/portion-dictionary";
import { statementHasForbiddenPhrase } from "@/lib/nutrition-intake-statements";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";

describe("personalizeLifestyleText — omega3", () => {
  it("vegan → geen 'vette vis'", () => {
    const text = personalizeLifestyleText(
      "omega3",
      buildLifestyleAction("omega3"),
      { preference: "vegan", allergies: [] },
    );
    expect(text.toLowerCase()).not.toContain("vette vis");
    expect(text).toContain("algenolie");
  });

  it("vis-allergie → plantaardige copy", () => {
    const text = personalizeLifestyleText(
      "omega3",
      buildLifestyleAction("omega3"),
      { preference: "none", allergies: ["vis"] },
    );
    expect(text.toLowerCase()).not.toContain("vette vis");
  });

  it("pescotariër zonder allergie → basisvis-copy", () => {
    const base = buildLifestyleAction("omega3");
    const text = personalizeLifestyleText("omega3", base, {
      preference: "pescatarian",
      allergies: [],
    });
    expect(text).toBe(base);
  });
});

describe("personalizeLifestyleText — magnesium noten-allergie", () => {
  it("noten-allergie → geen boomnoten/handvol noten", () => {
    const text = personalizeLifestyleText(
      "magnesium",
      buildLifestyleAction("magnesium"),
      { preference: "none", allergies: ["noten"] },
    );
    expect(text.toLowerCase()).not.toContain("handvol noten");
    expect(text.toLowerCase()).not.toMatch(/\bnoten\b/);
  });
});

describe("personalizeLifestyleText — zinc melk-allergie", () => {
  it("melk-allergie → geen zuivel", () => {
    const text = personalizeLifestyleText(
      "zinc",
      buildLifestyleAction("zinc"),
      { preference: "none", allergies: ["melk"] },
    );
    expect(text.toLowerCase()).not.toContain("zuivel");
  });
});

describe("personalizeLifestyleText — protein", () => {
  it("vegan → plantvoorbeelden", () => {
    const text = personalizeLifestyleText(
      "protein",
      buildLifestyleAction("protein"),
      { preference: "vegan", allergies: [] },
    );
    expect(text).toContain("tofu");
    expect(text.toLowerCase()).not.toContain("kwark");
  });

  it("eieren-allergie → geen eieren in voorbeelden", () => {
    const text = personalizeLifestyleText(
      "protein",
      buildLifestyleAction("protein"),
      { preference: "none", allergies: ["eieren"] },
    );
    expect(text.toLowerCase()).not.toContain("ei ");
    expect(text.toLowerCase()).not.toContain("eieren");
  });
});

describe("buildNutritionAdvice — personalisatie", () => {
  it("vegan omega3 gap: supplement-gate ongewijzigd", () => {
    const estimate: IntakeEstimate[] = [
      { nutrient: "omega3", band: "below", referenceLabel: "test" },
    ];
    const advice = buildNutritionAdvice(estimate, { preference: "vegan", allergies: [] });
    const lifestyle = advice.find((item) => item.kind === "lifestyle");
    expect(lifestyle?.text.toLowerCase()).not.toContain("vette vis");
    const gate = nutritionSupplementGate("omega3");
    expect(gate.allowed).toBe(true);
    if (gate.allowed) {
      expect(gate.comparisonPath).toBe("/beste/omega-3-supplement");
    }
  });
});

describe("COMPLIANCE: gepersonaliseerde lifestyle-teksten", () => {
  it("geen verboden frase in alle varianten", () => {
    for (const text of allPersonalizedLifestyleTexts()) {
      expect(statementHasForbiddenPhrase(text), `"${text}"`).toBe(false);
    }
  });
});
