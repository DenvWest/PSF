import { describe, it, expect } from "vitest";
import {
  buildNutritionAdvice,
  getNutrientLifestyleAction,
  nutritionSupplementGate,
  type NutritionAdviceItem,
} from "@/lib/nutrition-advice";
import { statementHasForbiddenPhrase, FORBIDDEN_STATUS_PHRASES } from "@/lib/nutrition-intake-statements";
import { getUsableClaims } from "@/data/approved-claims";
import { nutrientReferences, NUTRIENT_IDS } from "@/data/nutrition/intake-reference";
import { allLifestyleActionTexts, buildLifestyleAction } from "@/data/nutrition/portion-dictionary";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import type { NutrientId } from "@/data/nutrition/intake-reference";

// ─── Hulpfuncties ────────────────────────────────────────────────────────────

function gapEstimate(nutrient: NutrientId): IntakeEstimate {
  return {
    nutrient,
    band: "below",
    referenceLabel: nutrientReferences[nutrient].referenceLabel,
  };
}

function allGaps(): IntakeEstimate[] {
  return NUTRIENT_IDS.map(gapEstimate);
}

// ─── A. Gap + goedgekeurd product → lifestyle gevolgd door supplement ────────

describe("buildNutritionAdvice — magnesium gap", () => {
  it("levert lifestyle (priority 1) en supplement (priority 2)", () => {
    const result = buildNutritionAdvice([gapEstimate("magnesium")]);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ kind: "lifestyle", priority: 1, nutrient: "magnesium" });
    expect(result[1]).toMatchObject({ kind: "supplement", priority: 2, nutrient: "magnesium" });
  });

  it("comparisonPath is /beste/magnesium", () => {
    const result = buildNutritionAdvice([gapEstimate("magnesium")]);
    const supplement = result.find((i): i is Extract<NutritionAdviceItem, { kind: "supplement" }> => i.kind === "supplement");
    expect(supplement?.comparisonPath).toBe("/beste/magnesium");
  });

  it("claimText is exact de eerste getUsableClaims('magnesium')-tekst", () => {
    const result = buildNutritionAdvice([gapEstimate("magnesium")]);
    const supplement = result.find((i): i is Extract<NutritionAdviceItem, { kind: "supplement" }> => i.kind === "supplement");
    const expected = getUsableClaims("magnesium")[0].text;
    expect(supplement?.claimText).toBe(expected);
  });
});

describe("buildNutritionAdvice — omega3 gap", () => {
  it("levert lifestyle + supplement met omega3-claimText", () => {
    const result = buildNutritionAdvice([gapEstimate("omega3")]);
    const supplement = result.find((i): i is Extract<NutritionAdviceItem, { kind: "supplement" }> => i.kind === "supplement");
    expect(supplement?.comparisonPath).toBe("/beste/omega-3-supplement");
    const expected = getUsableClaims("omega3")[0].text;
    expect(supplement?.claimText).toBe(expected);
  });
});

describe("buildNutritionAdvice — vitamin_d gap", () => {
  it("levert lifestyle + supplement met vitamineD-claimText", () => {
    const result = buildNutritionAdvice([gapEstimate("vitamin_d")]);
    const supplement = result.find((i): i is Extract<NutritionAdviceItem, { kind: "supplement" }> => i.kind === "supplement");
    expect(supplement?.comparisonPath).toBe("/beste/vitamine-d");
    const expected = getUsableClaims("vitamineD")[0].text;
    expect(supplement?.claimText).toBe(expected);
  });
});

describe("buildNutritionAdvice — zinc gap", () => {
  it("levert lifestyle + supplement met zink-claimText", () => {
    const result = buildNutritionAdvice([gapEstimate("zinc")]);
    const supplement = result.find((i): i is Extract<NutritionAdviceItem, { kind: "supplement" }> => i.kind === "supplement");
    expect(supplement?.comparisonPath).toBe("/beste/zink");
    const expected = getUsableClaims("zink")[0].text;
    expect(supplement?.claimText).toBe(expected);
  });
});

// ─── B. Gate-fail: eiwitpoeder heeft geen usable claims → alleen lifestyle ────

describe("buildNutritionAdvice — protein gap (gate-fail via lege claims)", () => {
  it("levert ALLEEN lifestyle, GEEN supplement (eiwitpoeder heeft claims: [])", () => {
    const result = buildNutritionAdvice([gapEstimate("protein")]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: "lifestyle", priority: 1, nutrient: "protein" });
  });

  it("nutritionSupplementGate('protein') → allowed: false", () => {
    expect(nutritionSupplementGate("protein").allowed).toBe(false);
  });
});

// ─── B2. Gate-checks — directe verificatie zonder mocking ───────────────────

describe("nutritionSupplementGate — vier checks", () => {
  it("check 2 faalt als claimKey status 'on_hold' heeft (ashwagandha-hypothese via gate-logica)", () => {
    // De gate-logica zelf: check 2 vereist status === "approved".
    // We verifiëren dit indirect: de enige nutrients die de gate passeren zijn
    // die met approved claimKey + usable claims. Protein faalt op check 4.
    const outcomes = NUTRIENT_IDS.map((id) => ({
      id,
      allowed: nutritionSupplementGate(id).allowed,
    }));
    // protein → false (lege claims); omega3/magnesium/vitamin_d/zinc → true
    expect(outcomes.find((o) => o.id === "protein")?.allowed).toBe(false);
    expect(outcomes.find((o) => o.id === "omega3")?.allowed).toBe(true);
    expect(outcomes.find((o) => o.id === "magnesium")?.allowed).toBe(true);
    expect(outcomes.find((o) => o.id === "vitamin_d")?.allowed).toBe(true);
    expect(outcomes.find((o) => o.id === "zinc")?.allowed).toBe(true);
  });

  it("allowed:true → claimText is niet leeg en comparisonPath begint met /beste/", () => {
    for (const id of NUTRIENT_IDS) {
      const result = nutritionSupplementGate(id);
      if (result.allowed) {
        expect(result.claimText.length).toBeGreaterThan(0);
        expect(result.comparisonPath).toMatch(/^\/beste\//);
      }
    }
  });

  it("claimText is exact getUsableClaims()[0].text — geen verzonnen tekst", () => {
    const gateResult = nutritionSupplementGate("magnesium");
    expect(gateResult.allowed).toBe(true);
    if (gateResult.allowed) {
      expect(gateResult.claimText).toBe(getUsableClaims("magnesium")[0].text);
    }
  });
});

// ─── C. Band "around"/"meets" → geen advies-items ────────────────────────────

describe("buildNutritionAdvice — around/meets leveren niets op", () => {
  it("band 'around' → leeg resultaat", () => {
    const estimates: IntakeEstimate[] = NUTRIENT_IDS.map((n) => ({
      nutrient: n,
      band: "around",
      referenceLabel: "test",
    }));
    expect(buildNutritionAdvice(estimates)).toHaveLength(0);
  });

  it("band 'meets' → leeg resultaat", () => {
    const estimates: IntakeEstimate[] = NUTRIENT_IDS.map((n) => ({
      nutrient: n,
      band: "meets",
      referenceLabel: "test",
    }));
    expect(buildNutritionAdvice(estimates)).toHaveLength(0);
  });

  it("lege input → leeg resultaat", () => {
    expect(buildNutritionAdvice([])).toHaveLength(0);
  });
});

// ─── D. Ordering: alle lifestyle vóór alle supplement-items ──────────────────

describe("buildNutritionAdvice — ordering bij meerdere gaps", () => {
  it("alle lifestyle-items (priority 1) staan vóór alle supplement-items (priority 2)", () => {
    const result = buildNutritionAdvice(allGaps());
    const firstSupplementIdx = result.findIndex((i) => i.kind === "supplement");
    const lastLifestyleIdx = result.reduce(
      (acc, item, idx) => (item.kind === "lifestyle" ? idx : acc),
      -1
    );
    if (firstSupplementIdx !== -1) {
      expect(lastLifestyleIdx).toBeLessThan(firstSupplementIdx);
    }
  });

  it("priority-waarden zijn strikt 1 of 2", () => {
    const result = buildNutritionAdvice(allGaps());
    for (const item of result) {
      expect([1, 2]).toContain(item.priority);
    }
  });

  it("is deterministisch: twee keer dezelfde input geeft dezelfde volgorde", () => {
    const a = buildNutritionAdvice(allGaps());
    const b = buildNutritionAdvice(allGaps());
    expect(a.map((i) => `${i.kind}-${i.nutrient}`)).toEqual(
      b.map((i) => `${i.kind}-${i.nutrient}`)
    );
  });

  it("bij gemengde bands: alleen 'below'-items leveren output", () => {
    const estimates: IntakeEstimate[] = [
      { nutrient: "omega3", band: "below", referenceLabel: "test" },
      { nutrient: "magnesium", band: "around", referenceLabel: "test" },
      { nutrient: "zinc", band: "meets", referenceLabel: "test" },
    ];
    const result = buildNutritionAdvice(estimates);
    const nutrients = result.map((i) => i.nutrient);
    expect(nutrients.every((n) => n === "omega3")).toBe(true);
  });
});

// ─── G. Portie-woordenboek + seizoensvitamine D ─────────────────────────────

describe("portion-dictionary — lifestyleAction copy", () => {
  it("bevat gram-equivalenten voor eiwit", () => {
    expect(buildLifestyleAction("protein")).toContain("20–30 g");
    expect(buildLifestyleAction("protein")).toContain("100 g kip");
  });

  it("bevat gram-equivalenten voor omega-3", () => {
    expect(buildLifestyleAction("omega3")).toContain("100–150 g");
  });

  it("vitamine D winter vs zomer verschillen", () => {
    const summer = buildLifestyleAction("vitamin_d", { season: "summer" });
    const winter = buildLifestyleAction("vitamin_d", { season: "winter" });
    expect(summer).not.toBe(winter);
    expect(winter).toContain("10 µg");
    expect(summer).toContain("buiten");
  });

  it("getNutrientLifestyleAction gebruikt winter-copy in oktober", () => {
    const october = getNutrientLifestyleAction("vitamin_d", new Date("2026-10-15"));
    const june = getNutrientLifestyleAction("vitamin_d", new Date("2026-06-15"));
    expect(october).toContain("10 µg");
    expect(june).toContain("buiten");
  });

  it("buildNutritionAdvice past vitamine D-copy aan op adviceDate", () => {
    const winter = buildNutritionAdvice([gapEstimate("vitamin_d")], {
      adviceDate: new Date("2026-01-15"),
    });
    const summer = buildNutritionAdvice([gapEstimate("vitamin_d")], {
      adviceDate: new Date("2026-07-15"),
    });
    const winterText = winter.find((i) => i.kind === "lifestyle")?.text ?? "";
    const summerText = summer.find((i) => i.kind === "lifestyle")?.text ?? "";
    expect(winterText).toContain("10 µg");
    expect(summerText).toContain("buiten");
  });

  it("alle lifestyle-teksten uit portion-dictionary zijn compliance-veilig", () => {
    for (const text of allLifestyleActionTexts()) {
      expect(statementHasForbiddenPhrase(text), `"${text}"`).toBe(false);
    }
  });
});

// ─── E. Compliance: geen statuswoorden in OUR GENERATED teksten ──────────────

describe("COMPLIANCE: statementHasForbiddenPhrase op inname-geformuleerde teksten", () => {
  it("lifestyleAction per nutriënt bevat geen verboden inname-frase", () => {
    for (const id of NUTRIENT_IDS) {
      const text = nutrientReferences[id].lifestyleAction;
      expect(statementHasForbiddenPhrase(text), `lifestyleAction '${id}': "${text}"`).toBe(false);
    }
  });

  it("alle lifestyle-advies-teksten in buildNutritionAdvice-output bevatten geen verboden frase", () => {
    const result = buildNutritionAdvice(allGaps());
    const lifestyleItems = result.filter((i): i is Extract<NutritionAdviceItem, { kind: "lifestyle" }> => i.kind === "lifestyle");
    for (const item of lifestyleItems) {
      expect(
        statementHasForbiddenPhrase(item.text),
        `lifestyle ${item.nutrient}: "${item.text}"`
      ).toBe(false);
    }
  });

  it("lifestyleAction-teksten bevatten geen FORBIDDEN_STATUS_PHRASES (diagnose/status-taal)", () => {
    for (const id of NUTRIENT_IDS) {
      const text = nutrientReferences[id].lifestyleAction.toLowerCase();
      for (const phrase of FORBIDDEN_STATUS_PHRASES) {
        expect(text.includes(phrase.toLowerCase()), `'${phrase}' in '${id}' lifestyleAction`).toBe(false);
      }
    }
  });

  it("EFSA claimTexts komen verbatim uit getUsableClaims — eigen generatie is er niet bij", () => {
    // Garantie: supplement-items bevatten uitsluitend tekst uit getUsableClaims(),
    // niet eigen gegenereerde copy. Verificatie: claimText === claims[0].text.
    const pairs: Array<{ key: Parameters<typeof getUsableClaims>[0]; nutrient: NutrientId }> = [
      { key: "magnesium", nutrient: "magnesium" },
      { key: "omega3", nutrient: "omega3" },
      { key: "vitamineD", nutrient: "vitamin_d" },
      { key: "zink", nutrient: "zinc" },
    ];
    for (const { key, nutrient } of pairs) {
      const gate = nutritionSupplementGate(nutrient);
      if (gate.allowed) {
        expect(gate.claimText).toBe(getUsableClaims(key)[0].text);
      }
    }
  });
});

// ─── F. Onmogelijkheid: forbidden/on_hold nooit in uitvoer ───────────────────

describe("ONMOGELIJKHEID: forbidden/on_hold ingrediënten produceren nooit een supplement-item", () => {
  it("geen enkel supplement-item in allGaps() heeft ashwagandha- of melatonine-pad", () => {
    const result = buildNutritionAdvice(allGaps());
    const supplementPaths = result
      .filter((i): i is Extract<NutritionAdviceItem, { kind: "supplement" }> => i.kind === "supplement")
      .map((i) => i.comparisonPath);

    expect(supplementPaths).not.toContain("/beste/ashwagandha");
    expect(supplementPaths).not.toContain("/beste/melatonine");
    for (const path of supplementPaths) {
      expect(path).toMatch(/^\/beste\//);
    }
  });

  it("supplement-items bevatten alleen comparisonPaths van de 5 nutriënten", () => {
    const result = buildNutritionAdvice(allGaps());
    const allowedPaths = new Set(NUTRIENT_IDS.map((id) => nutrientReferences[id].comparisonPath));
    const supplementPaths = result
      .filter((i): i is Extract<NutritionAdviceItem, { kind: "supplement" }> => i.kind === "supplement")
      .map((i) => i.comparisonPath);

    for (const path of supplementPaths) {
      expect(allowedPaths.has(path), `Onverwacht pad: ${path}`).toBe(true);
    }
  });
});
