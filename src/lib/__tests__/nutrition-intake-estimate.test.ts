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

describe("estimateNutritionIntake — vitamin_d (zomer, default referenceDate)", () => {
  const SUMMER = new Date("2026-07-15");

  it("0× buiten/week → below", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 0 }, SUMMER);
    expect(bandFor(result, "vitamin_d")).toBe("below");
  });

  it("1× buiten/week → around", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 1 }, SUMMER);
    expect(bandFor(result, "vitamin_d")).toBe("around");
  });

  it("3× buiten/week → meets", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 3 }, SUMMER);
    expect(bandFor(result, "vitamin_d")).toBe("meets");
  });
});

describe("estimateNutritionIntake — vitamin_d (winter: zon telt niet meer als 'meets')", () => {
  const WINTER = new Date("2026-01-15");

  it("0× buiten/week → below (zelfde als zomer)", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 0 }, WINTER);
    expect(bandFor(result, "vitamin_d")).toBe("below");
  });

  it("3× buiten/week → around in winter, niet meets zoals in zomer", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 3 }, WINTER);
    expect(bandFor(result, "vitamin_d")).toBe("around");
  });

  it("7× (dagelijks) buiten/week → nog steeds geen 'meets' via zon alleen", () => {
    const result = estimateNutritionIntake({ sunExposurePerWeek: 7 }, WINTER);
    expect(bandFor(result, "vitamin_d")).not.toBe("meets");
  });

  it("seizoensgrens: september (maand 8) = zomer, oktober (maand 9) = winter", () => {
    const sep = estimateNutritionIntake(
      { sunExposurePerWeek: 3 },
      new Date("2026-09-30"),
    );
    const oct = estimateNutritionIntake(
      { sunExposurePerWeek: 3 },
      new Date("2026-10-01"),
    );
    expect(bandFor(sep, "vitamin_d")).toBe("meets");
    expect(bandFor(oct, "vitamin_d")).toBe("around");
  });
});

describe("estimateNutritionIntake — magnesium", () => {
  it("1 portie magnesium-rijke voeding/dag → below", () => {
    const result = estimateNutritionIntake({ vegFruitPerDay: 1 });
    expect(bandFor(result, "magnesium")).toBe("below");
  });

  it("3 porties magnesium-rijke voeding/dag → around", () => {
    const result = estimateNutritionIntake({ vegFruitPerDay: 3 });
    expect(bandFor(result, "magnesium")).toBe("around");
  });

  it("4 porties magnesium-rijke voeding/dag → meets", () => {
    const result = estimateNutritionIntake({ vegFruitPerDay: 4 });
    expect(bandFor(result, "magnesium")).toBe("meets");
  });

  it("noten/zaden per week worden als week gelezen, niet als dag", () => {
    // Regressietest op de eenheidsfout: de oude engine nam Math.max over
    // vegFruitPerDay (porties/dag) en nutsSeedsLegumesPerWeek (porties/week)
    // en legde het resultaat tegen een drempel in porties/dag. "4× noten per
    // week" leverde daardoor hetzelfde getal als "4 porties groente per dag",
    // terwijl er een factor 7 tussen zit.
    //
    // 4× noten per week is ~0,6 portie per dag. Naast een drempel van 2 tot 4
    // plantporties per dag is dat weinig, ook al is een portie noten
    // magnesiumdichter dan een portie groente (factor 1,4 in de engine).
    const withNuts = estimateNutritionIntake({ vegFruitPerDay: 1, nutsSeedsLegumesPerWeek: 4 });
    expect(bandFor(withNuts, "magnesium")).toBe("below");
  });

  it("dagelijks noten tilt het magnesium-signaal wél omhoog", () => {
    // Dezelfde bron, een realistische frequentie: 7× per week haalt de
    // notenlat (14 ÷ 1,4 = 10 porties/week) wél. Dat is het bewijs dat de
    // correctie geen bronnen wegdrukt maar ze op hun eigen schaal legt.
    const lowVeg = estimateNutritionIntake({ vegFruitPerDay: 1, nutsSeedsLegumesPerWeek: 0 });
    const daily = estimateNutritionIntake({ vegFruitPerDay: 1, nutsSeedsLegumesPerWeek: 14 });
    expect(bandFor(lowVeg, "magnesium")).toBe("below");
    expect(bandFor(daily, "magnesium")).not.toBe("below");
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

describe("eenheden: per dag en per week zijn niet uitwisselbaar", () => {
  it("zink: 3 porties zuivel/dag geeft niet dezelfde band als 3 porties vlees/dag", () => {
    // Zuivel is een zwakkere zinkbron dan vlees (factor 0,5). Voorheen
    // maximeerde de engine beide velden ongewogen, waardoor een zuivelrijk
    // patroon dezelfde band kreeg als een vleesrijk patroon.
    const meat = estimateNutritionIntake({ meatLegumesPerDay: 2 });
    const dairy = estimateNutritionIntake({ dairyServingsPerDay: 2 });
    expect(bandFor(meat, "zinc")).toBe("meets");
    expect(bandFor(dairy, "zinc")).not.toBe("meets");
  });

  it("zink: genoeg zuivel haalt de band alsnog", () => {
    // De zwakkere bron wordt niet weggedrukt, hij heeft meer porties nodig:
    // lat 2/dag ÷ 0,5 = 4 porties/dag.
    const result = estimateNutritionIntake({ dairyServingsPerDay: 4 });
    expect(bandFor(result, "zinc")).toBe("meets");
  });

  it("een weekveld haalt nooit een dagdrempel op zijn ruwe getal", () => {
    // De kern van de eenheidsfout, generiek: het hoogste weekantwoord dat de
    // vragenlijst kent (5×/week) mag nooit een band opleveren alsof het een
    // dagfrequentie was.
    const weekly = estimateNutritionIntake({ nutsSeedsLegumesPerWeek: 5 });
    const daily = estimateNutritionIntake({ vegFruitPerDay: 5 });
    expect(bandFor(daily, "magnesium")).toBe("meets");
    expect(bandFor(weekly, "magnesium")).not.toBe("meets");
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
        "Je Omega-3-inname lijkt aan de lage kant — op basis van hoe vaak je het eet, naast een algemene vuistregel (2× vette vis per week)."
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
