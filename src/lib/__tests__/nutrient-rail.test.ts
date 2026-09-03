import { describe, expect, it } from "vitest";
import {
  bouwNutrientRail,
  NUTRIENT_GROEP,
  railBronregel,
  railGroepen,
} from "@/lib/nutrient-rail";
import type { NutrientSufficiency } from "@/lib/nutrition-sufficiency";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { IntakeBand } from "@/lib/nutrition-intake-estimate";

function stof(
  nutrient: NutrientId,
  band: IntakeBand,
  bronnen: { labelNl: string; share: number }[] = [],
): NutrientSufficiency {
  return {
    nutrient,
    label: nutrient,
    outcome: band === "meets" ? "sufficient" : band === "below" ? "insufficient" : "uncertain",
    band,
    contextLine: null,
    leadingSources: bronnen,
    p6Relevant: band !== "meets",
  };
}

describe("bouwNutrientRail", () => {
  it("geeft per stof een band en een positie op de balk", () => {
    const rail = bouwNutrientRail([stof("protein", "meets"), stof("magnesium", "below")]);
    expect(rail).toHaveLength(2);
    const eiwit = rail.find((r) => r.nutrient === "protein");
    const mg = rail.find((r) => r.nutrient === "magnesium");
    // De positie is het midden van de band — geen percentage van een
    // dagbehoefte, want die kennen we niet.
    expect(eiwit?.dekking).toBeGreaterThan(mg!.dekking);
    expect(mg?.band).toBe("below");
  });

  it("houdt een vaste volgorde aan, los van de binnenkomende array", () => {
    const omgekeerd = bouwNutrientRail([stof("zinc", "meets"), stof("protein", "meets")]);
    // Een kolom die tussen twee checks van volgorde wisselt is niet met je
    // vorige keer te vergelijken.
    expect(omgekeerd[0]?.nutrient).toBe("protein");
  });

  it("slaat stoffen over die de check niet beoordeelde", () => {
    expect(bouwNutrientRail([stof("protein", "meets")])).toHaveLength(1);
  });

  it("neemt de dragende bronnen mee", () => {
    const rail = bouwNutrientRail([
      stof("magnesium", "below", [{ labelNl: "Noten", share: 0.4 }]),
    ]);
    expect(rail[0]?.bronnen[0]?.labelNl).toBe("Noten");
  });
});

describe("NUTRIENT_GROEP", () => {
  it("zet eiwit bij macro en de rest bij micro", () => {
    expect(NUTRIENT_GROEP.protein).toBe("macro");
    expect(NUTRIENT_GROEP.magnesium).toBe("micro");
    // Omega-3 is strikt genomen een vetzuur, maar je stuurt hem als micro:
    // één bron, een paar keer per week.
    expect(NUTRIENT_GROEP.omega3).toBe("micro");
  });
});

describe("railGroepen", () => {
  it("splitst in macro en micro en laat lege groepen weg", () => {
    const alleenMicro = railGroepen(bouwNutrientRail([stof("zinc", "meets")]));
    expect(alleenMicro).toHaveLength(1);
    expect(alleenMicro[0]?.groep).toBe("micro");

    const beide = railGroepen(
      bouwNutrientRail([stof("protein", "meets"), stof("zinc", "meets")]),
    );
    expect(beide.map((b) => b.groep)).toEqual(["macro", "micro"]);
  });
});

describe("railBronregel", () => {
  it("telt hoeveel stoffen ruimte laten zien", () => {
    const regel = railBronregel(
      bouwNutrientRail([stof("protein", "meets"), stof("magnesium", "below")]),
    );
    expect(regel).toContain("1 met ruimte");
  });

  it("zegt het apart als er geen ruimte is", () => {
    expect(railBronregel(bouwNutrientRail([stof("protein", "meets")]))).toContain(
      "geen duidelijke ruimte",
    );
  });

  it("vraagt om de check als er niets is", () => {
    expect(railBronregel([])).toContain("voedingscheck");
  });
});
