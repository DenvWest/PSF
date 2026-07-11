import { describe, it, expect } from "vitest";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";
import {
  NUTRITION_EVIDENCE_BY_ID,
  NUTRITION_EVIDENCE_DISPLAY_ORDER,
  NUTRITION_QUESTION_EVIDENCE,
} from "@/data/nutrition/nutrition-question-evidence";
import {
  evidenceForExtra,
  evidenceForGap,
} from "@/data/nutrition/nutrient-evidence-map";
import {
  FORBIDDEN_STATUS_PHRASES,
  statementHasForbiddenPhrase,
} from "@/lib/nutrition-intake-statements";

function allEvidenceStrings(): string[] {
  const strings: string[] = [];
  for (const entry of NUTRITION_QUESTION_EVIDENCE) {
    strings.push(entry.title);
    strings.push(entry.whyThisQuestion);
    strings.push(...entry.scientificRationale);
    strings.push(entry.answerMeaning.higherAlignment);
    strings.push(entry.answerMeaning.lowerAlignment);
    strings.push(entry.strength.label);
    strings.push(entry.strength.rationale);
    for (const ref of entry.references) {
      strings.push(ref.apa);
    }
  }
  return strings;
}

describe("nutrition-question-evidence — coverage", () => {
  it("heeft 10 MVP entries", () => {
    expect(NUTRITION_QUESTION_EVIDENCE).toHaveLength(10);
    expect(NUTRITION_EVIDENCE_DISPLAY_ORDER).toHaveLength(10);
  });

  it("evidenceForGap(protein) gebruikt proteinMeals als primair", () => {
    const bundle = evidenceForGap("protein");
    expect(bundle.primary.questionId).toBe("proteinMeals");
    expect(bundle.secondaryIds).toContain("meatLegumes");
  });

  it("dekt alle 5 nutriënten", () => {
    for (const nutrient of NUTRIENT_IDS) {
      expect(evidenceForGap(nutrient).primary.questionId).toBeTruthy();
    }
  });

  it("dekt alle lifestyle-extras", () => {
    expect(evidenceForExtra("fiber_low_wholegrain").questionId).toBe("wholegrain");
    expect(evidenceForExtra("b12_vegan").questionId).toBe("b12_vegan");
    expect(evidenceForExtra("sugar_high_signal").questionId).toBe("sugaryDrinks");
  });

  it("magnesium secondary bevat nutsSeedsLegumes", () => {
    const bundle = evidenceForGap("magnesium");
    expect(bundle.secondaryIds).toContain("nutsSeedsLegumes");
  });

  it("elke display-order id heeft evidence", () => {
    for (const id of NUTRITION_EVIDENCE_DISPLAY_ORDER) {
      expect(NUTRITION_EVIDENCE_BY_ID[id]).toBeDefined();
    }
  });
});

describe("COMPLIANCE: nutrition question evidence copy", () => {
  it("geen verboden inname-frase in evidence-teksten", () => {
    for (const text of allEvidenceStrings()) {
      expect(statementHasForbiddenPhrase(text), `"${text}"`).toBe(false);
    }
  });

  it("geen FORBIDDEN_STATUS_PHRASES in evidence-teksten", () => {
    for (const text of allEvidenceStrings()) {
      const lower = text.toLowerCase();
      for (const phrase of FORBIDDEN_STATUS_PHRASES) {
        expect(lower.includes(phrase.toLowerCase()), `'${phrase}' in "${text}"`).toBe(false);
      }
    }
  });
});
