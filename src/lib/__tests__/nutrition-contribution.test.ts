import { describe, it, expect } from "vitest";
import {
  contributionFor,
  contributionProfile,
  coverageFor,
} from "@/lib/nutrition-contribution";
import {
  NUTRIENT_SIGNAL_SOURCES,
  type NutritionSelfReport,
} from "@/lib/nutrition-intake-estimate";
import { statementHasForbiddenPhrase } from "@/lib/nutrition-intake-statements";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";

// ─── A. Bronnen-rangorde ────────────────────────────────────────────────────

describe("contributionFor — welke bron draagt de stof", () => {
  it("magnesium: dagelijkse plantporties verslaan wekelijkse noten bij gelijk getal", () => {
    // 3 porties groente/dag = 21/week; 3× noten/week = 3 × 1,4 = 4,2.
    // Precies het verschil dat het oude ongewogen Math.max wegpoetste.
    const result = contributionFor("magnesium", {
      vegFruitPerDay: 3,
      nutsSeedsLegumesPerWeek: 3,
    });
    expect(result.leading?.field).toBe("vegFruitPerDay");
  });

  it("magnesium: dagelijks noten wordt wél de dragende bron", () => {
    const result = contributionFor("magnesium", {
      vegFruitPerDay: 1,
      nutsSeedsLegumesPerWeek: 14,
    });
    expect(result.leading?.field).toBe("nutsSeedsLegumesPerWeek");
  });

  it("zink: vlees weegt zwaarder dan zuivel bij dezelfde frequentie", () => {
    const result = contributionFor("zinc", {
      meatLegumesPerDay: 2,
      dairyServingsPerDay: 2,
    });
    expect(result.leading?.field).toBe("meatLegumesPerDay");
    const dairy = result.sources.find((s) => s.field === "dairyServingsPerDay");
    expect(dairy?.share).toBeLessThan(0.5);
  });

  it("leading is null als geen enkele bron is beantwoord", () => {
    const result = contributionFor("magnesium", {});
    expect(result.leading).toBeNull();
  });

  it("leading is null als elke beantwoorde bron op nul staat", () => {
    const result = contributionFor("omega3", { oilyFishPerWeek: 0 });
    expect(result.leading).toBeNull();
  });

  it("sources staat aflopend op bijdrage", () => {
    const result = contributionFor("magnesium", {
      vegFruitPerDay: 2,
      nutsSeedsLegumesPerWeek: 5,
      meatLegumesPerDay: 1,
    });
    const weights = result.sources.map((s) => s.weighted);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
  });
});

// ─── B. Share is een verhouding, geen fractie van een norm ──────────────────

describe("share — aandeel binnen de eigen antwoorden", () => {
  it("telt op tot 1 wanneer er iets is ingevuld", () => {
    const result = contributionFor("magnesium", {
      vegFruitPerDay: 2,
      nutsSeedsLegumesPerWeek: 4,
      meatLegumesPerDay: 1,
    });
    const sum = result.sources.reduce((acc, s) => acc + s.share, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it("is 0 voor elke bron als er niets is ingevuld — nooit NaN", () => {
    const result = contributionFor("magnesium", {});
    for (const source of result.sources) {
      expect(source.share).toBe(0);
      expect(Number.isNaN(source.share)).toBe(false);
    }
  });

  it("een enkele beantwoorde bron krijgt share 1", () => {
    const result = contributionFor("zinc", { meatLegumesPerDay: 2 });
    const meat = result.sources.find((s) => s.field === "meatLegumesPerDay");
    expect(meat?.share).toBeCloseTo(1, 10);
  });
});

// ─── C. Dekking ─────────────────────────────────────────────────────────────

describe("coverageFor — hoeveel van het bijdragegewicht is gemeten", () => {
  it("1 bij een volledig beantwoord nutriënt", () => {
    expect(
      coverageFor("zinc", { meatLegumesPerDay: 2, dairyServingsPerDay: 1 }),
    ).toBe(1);
  });

  it("0 bij een leeg rapport", () => {
    expect(coverageFor("magnesium", {})).toBe(0);
  });

  it("weegt: de sterkste bron missen kost meer dekking dan de zwakste missen", () => {
    const zonderVlees = coverageFor("zinc", { dairyServingsPerDay: 2 });
    const zonderZuivel = coverageFor("zinc", { meatLegumesPerDay: 2 });
    expect(zonderZuivel).toBeGreaterThan(zonderVlees);
  });

  it("telt een antwoord van 0 als beantwoord — dat is informatie, geen gat", () => {
    expect(coverageFor("omega3", { oilyFishPerWeek: 0 })).toBe(1);
  });
});

// ─── D. Vertrouwen wordt gerekend, niet geschreven ──────────────────────────

describe("confidence — afgeleid uit dekking en dragende bron", () => {
  it("1 als er niets is ingevuld", () => {
    expect(contributionFor("magnesium", {}).confidence).toBe(1);
  });

  it("vitamine D blijft 1, ook bij volledige dekking", () => {
    // Aanmaak hangt af van duur, tijdstip en seizoen — frequentie ziet dat niet.
    const result = contributionFor("vitamin_d", { sunExposurePerWeek: 7 });
    expect(result.coverage).toBe(1);
    expect(result.confidence).toBe(1);
  });

  it("4 als elke bron beantwoord is en de geijkte bron leidt", () => {
    const result = contributionFor("zinc", {
      meatLegumesPerDay: 3,
      dairyServingsPerDay: 1,
    });
    expect(result.leading?.field).toBe("meatLegumesPerDay");
    expect(result.confidence).toBe(4);
  });

  it("2 als een niet-geijkte bron de band draagt", () => {
    // Zuivel draagt zink hier, terwijl de drempel op vlees geijkt is.
    const result = contributionFor("zinc", {
      meatLegumesPerDay: 0,
      dairyServingsPerDay: 4,
    });
    expect(result.leading?.field).toBe("dairyServingsPerDay");
    expect(result.confidence).toBe(2);
  });

  it("magnesium met alleen een zwakke bron scoort lager dan met de geijkte bron", () => {
    const viaProxy = contributionFor("magnesium", { meatLegumesPerDay: 3 });
    const viaGeijkt = contributionFor("magnesium", {
      vegFruitPerDay: 3,
      nutsSeedsLegumesPerWeek: 3,
      meatLegumesPerDay: 3,
    });
    expect(viaProxy.confidence).toBeLessThan(viaGeijkt.confidence);
  });
});

// ─── E. Profiel ─────────────────────────────────────────────────────────────

describe("contributionProfile", () => {
  it("geeft exact één beeld per nutriënt", () => {
    const profile = contributionProfile({});
    expect(profile).toHaveLength(NUTRIENT_IDS.length);
    expect(profile.map((p) => p.nutrient)).toEqual(NUTRIENT_IDS);
  });

  it("deterministisch bij gelijke datum", () => {
    const report: NutritionSelfReport = {
      vegFruitPerDay: 2,
      nutsSeedsLegumesPerWeek: 3,
      meatLegumesPerDay: 1,
      dairyServingsPerDay: 2,
      oilyFishPerWeek: 1,
      sunExposurePerWeek: 3,
      proteinMealsPerDay: 2,
    };
    const date = new Date("2026-07-15");
    expect(contributionProfile(report, date)).toEqual(
      contributionProfile(report, date),
    );
  });

  it("elke bron in de signaaltabel komt terug in het profiel", () => {
    const profile = contributionProfile({});
    for (const beeld of profile) {
      const verwacht = NUTRIENT_SIGNAL_SOURCES[beeld.nutrient].map((s) => s.field);
      expect([...beeld.sources.map((s) => s.field)].sort()).toEqual(
        [...verwacht].sort(),
      );
    }
  });
});

// ─── F. Compliance ──────────────────────────────────────────────────────────

describe("COMPLIANCE: geen statustaal in confidenceWhy", () => {
  const reports: NutritionSelfReport[] = [
    {},
    { vegFruitPerDay: 0 },
    { vegFruitPerDay: 4, nutsSeedsLegumesPerWeek: 7, meatLegumesPerDay: 2 },
    { meatLegumesPerDay: 3 },
    { dairyServingsPerDay: 4, meatLegumesPerDay: 0 },
    { sunExposurePerWeek: 7 },
    { oilyFishPerWeek: 2, proteinMealsPerDay: 3 },
  ];

  for (const [index, report] of reports.entries()) {
    it(`rapport ${index} → geen verboden frase in enige confidenceWhy`, () => {
      for (const beeld of contributionProfile(report)) {
        expect(statementHasForbiddenPhrase(beeld.confidenceWhy)).toBe(false);
      }
    });
  }
});

describe("COMPLIANCE: geen mg, geen dagtotaal, geen ADH-percentage", () => {
  it("de uitvoer bevat geen enkele eenheid-aanduiding", () => {
    const profile = contributionProfile({
      vegFruitPerDay: 3,
      nutsSeedsLegumesPerWeek: 4,
      meatLegumesPerDay: 2,
      dairyServingsPerDay: 1,
      oilyFishPerWeek: 2,
      sunExposurePerWeek: 4,
      proteinMealsPerDay: 3,
    });
    const tekst = JSON.stringify(profile).toLowerCase();
    for (const verboden of ["mg", "microgram", "µg", "adh", "dagtotaal"]) {
      expect(tekst).not.toContain(verboden);
    }
  });
});
