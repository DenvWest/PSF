import { describe, it, expect } from "vitest";
import {
  estimateNutritionIntake,
  ESTIMATE_VERSION,
  type NutritionSelfReport,
  type IntakeBand,
  type IntakeEstimate,
} from "@/lib/nutrition-intake-estimate";
import {
  intakeStatementFor,
  statementHasForbiddenPhrase,
  FORBIDDEN_STATUS_PHRASES,
} from "@/lib/nutrition-intake-statements";
import { NUTRIENT_IDS, type NutrientId } from "@/data/nutrition/intake-reference";

// ─── A. Deterministisch: concrete inputs → verwachte bands ──────────────────

describe("estimateNutritionIntake — omega3", () => {
  it("0× vette vis/week → below", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: 0 });
    expect(bandFor(result, "omega3")).toBe("below");
  });

  it("1× vette vis/week → around (tussen belowMax 1 en meetsMin 2)", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: 1 });
    expect(bandFor(result, "omega3")).toBe("around");
  });

  it("2× vette vis/week → meets", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: 2 });
    expect(bandFor(result, "omega3")).toBe("meets");
  });

  it("5× vette vis/week → meets", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: 5 });
    expect(bandFor(result, "omega3")).toBe("meets");
  });
});

describe("estimateNutritionIntake — protein", () => {
  it("1 eiwitrijke maaltijd/dag → below", () => {
    const result = estimateNutritionIntake({ proteinMealsPerDay: 1 });
    expect(bandFor(result, "protein")).toBe("below");
  });

  it("2 eiwitrijke maaltijden/dag → around", () => {
    const result = estimateNutritionIntake({ proteinMealsPerDay: 2 });
    expect(bandFor(result, "protein")).toBe("around");
  });

  it("3 eiwitrijke maaltijden/dag → meets", () => {
    const result = estimateNutritionIntake({ proteinMealsPerDay: 3 });
    expect(bandFor(result, "protein")).toBe("meets");
  });

  it("meatLegumesPerDay als fallback bij ontbrekend proteinMealsPerDay", () => {
    const result = estimateNutritionIntake({ meatLegumesPerDay: 3 });
    expect(bandFor(result, "protein")).toBe("meets");
  });
});

describe("estimateNutritionIntake — vitamin_d", () => {
  it("0× buiten/week → below", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 0 });
    expect(bandFor(result, "vitamin_d")).toBe("below");
  });

  it("1× buiten/week → around", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 1 });
    expect(bandFor(result, "vitamin_d")).toBe("around");
  });

  it("3× buiten/week → meets", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 3 });
    expect(bandFor(result, "vitamin_d")).toBe("meets");
  });
});

describe("estimateNutritionIntake — magnesium", () => {
  it("1 portie groente/dag → below", () => {
    const result = estimateNutritionIntake({ vegFruitPerDay: 1 });
    expect(bandFor(result, "magnesium")).toBe("below");
  });

  it("3 porties groente/dag → around", () => {
    const result = estimateNutritionIntake({ vegFruitPerDay: 3 });
    expect(bandFor(result, "magnesium")).toBe("around");
  });

  it("4 porties groente/dag → meets", () => {
    const result = estimateNutritionIntake({ vegFruitPerDay: 4 });
    expect(bandFor(result, "magnesium")).toBe("meets");
  });
});

describe("estimateNutritionIntake — zinc", () => {
  it("0 porties vlees/peulvruchten/dag → below", () => {
    const result = estimateNutritionIntake({ meatLegumesPerDay: 0 });
    expect(bandFor(result, "zinc")).toBe("below");
  });

  it("1 portie/dag → around", () => {
    const result = estimateNutritionIntake({ meatLegumesPerDay: 1 });
    expect(bandFor(result, "zinc")).toBe("around");
  });

  it("2 porties/dag → meets", () => {
    const result = estimateNutritionIntake({ meatLegumesPerDay: 2 });
    expect(bandFor(result, "zinc")).toBe("meets");
  });
});

describe("estimateNutritionIntake — volledig rapport", () => {
  it("geeft exact 5 schattingen terug (één per nutriënt)", () => {
    const result = estimateNutritionIntake({});
    expect(result).toHaveLength(5);
  });

  it("elke schatting heeft nutrient, band en referenceLabel", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: 2 });
    for (const estimate of result) {
      expect(NUTRIENT_IDS).toContain(estimate.nutrient);
      expect(["below", "around", "meets"]).toContain(estimate.band);
      expect(typeof estimate.referenceLabel).toBe("string");
      expect(estimate.referenceLabel.length).toBeGreaterThan(0);
    }
  });

  it("deterministisch: dezelfde input geeft altijd dezelfde output", () => {
    const report: NutritionSelfReport = {
      oilyFishPerWeek: 1,
      proteinMealsPerDay: 3,
      vegFruitPerDay: 2,
      sunExposurePerWeek: 0,
      meatLegumesPerDay: 1,
    };
    expect(estimateNutritionIntake(report)).toEqual(estimateNutritionIntake(report));
  });
});

describe("ESTIMATE_VERSION", () => {
  it("is een semver-string", () => {
    expect(ESTIMATE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

// ─── B. Ontbrekende velden → altijd "around", nooit "below" ─────────────────

describe("ontbrekende velden → band 'around'", () => {
  it("leeg rapport → alle banden zijn 'around'", () => {
    const result = estimateNutritionIntake({});
    for (const estimate of result) {
      expect(estimate.band).toBe("around");
    }
  });

  it("omega3 ontbreekt → around", () => {
    const result = estimateNutritionIntake({ proteinMealsPerDay: 3 });
    expect(bandFor(result, "omega3")).toBe("around");
  });

  it("vitamin_d ontbreekt → around", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: 2 });
    expect(bandFor(result, "vitamin_d")).toBe("around");
  });

  it("magnesium ontbreekt (geen vegFruit, geen meatLegumes) → around", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: 2 });
    expect(bandFor(result, "magnesium")).toBe("around");
  });

  it("protein ontbreekt (geen proteinMeals, geen meatLegumes) → around", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: 0 });
    expect(bandFor(result, "protein")).toBe("around");
  });

  it("NaN-input → around (nooit below)", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: NaN });
    expect(bandFor(result, "omega3")).toBe("around");
  });

  it("negatieve input → around (nooit below)", () => {
    const result = estimateNutritionIntake({ oilyFishPerWeek: -1 });
    expect(bandFor(result, "omega3")).toBe("around");
  });
});

// ─── C. Compliance-property-test: ELKE nutriënt × band → geen verboden frase ─

describe("COMPLIANCE: intakeStatementFor × elke nutriënt × elke band", () => {
  const bands: IntakeBand[] = ["below", "around", "meets"];

  for (const nutrient of NUTRIENT_IDS) {
    for (const band of bands) {
      it(`${nutrient} × ${band} → geen verboden frase`, () => {
        const estimate: IntakeEstimate = {
          nutrient,
          band,
          referenceLabel: "testreferentie",
        };
        const statement = intakeStatementFor(estimate);
        expect(statementHasForbiddenPhrase(statement)).toBe(false);
      });
    }
  }
});

describe("COMPLIANCE: statementHasForbiddenPhrase detecteert verboden taal", () => {
  it("detecteert 'tekort'", () => {
    expect(statementHasForbiddenPhrase("Je hebt een tekort aan magnesium.")).toBe(true);
  });

  it("detecteert 'deficiëntie'", () => {
    expect(statementHasForbiddenPhrase("Er is sprake van een deficiëntie.")).toBe(true);
  });

  it("detecteert 'diagnose'", () => {
    expect(statementHasForbiddenPhrase("Dit is geen diagnose.")).toBe(true);
  });

  it("detecteert 'bloedwaarde'", () => {
    expect(statementHasForbiddenPhrase("Je bloedwaarde is laag.")).toBe(true);
  });

  it("detecteert 'te weinig in je bloed'", () => {
    expect(statementHasForbiddenPhrase("Je hebt te weinig in je bloed.")).toBe(true);
  });

  it("detecteert 'je waarden'", () => {
    expect(statementHasForbiddenPhrase("Je waarden zijn afwijkend.")).toBe(true);
  });

  it("detecteert case-insensitief (TEKORT)", () => {
    expect(statementHasForbiddenPhrase("Je hebt een TEKORT.")).toBe(true);
  });

  it("detecteert 'geneest' (uit FORBIDDEN_PHRASES_GLOBAL)", () => {
    expect(statementHasForbiddenPhrase("Dit geneest je klachten.")).toBe(true);
  });

  it("schone inname-zin → false", () => {
    expect(
      statementHasForbiddenPhrase(
        "Je Omega-3-inname lijkt aan de lage kant t.o.v. een veelgebruikte richtlijn."
      )
    ).toBe(false);
  });
});

describe("FORBIDDEN_STATUS_PHRASES volledigheid", () => {
  it("bevat alle kern-statuswoorden", () => {
    const kernwoorden = ["tekort", "deficiëntie", "diagnose", "bloedwaarde", "gemeten"];
    for (const woord of kernwoorden) {
      expect(FORBIDDEN_STATUS_PHRASES).toContain(woord);
    }
  });
});

// ─── Hulpfunctie ────────────────────────────────────────────────────────────

function bandFor(estimates: IntakeEstimate[], nutrient: NutrientId): IntakeBand {
  const found = estimates.find((e) => e.nutrient === nutrient);
  if (!found) throw new Error(`Nutriënt '${nutrient}' niet gevonden in resultaat`);
  return found.band;
}
