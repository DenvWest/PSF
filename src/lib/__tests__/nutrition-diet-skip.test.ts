import { describe, it, expect } from "vitest";
import {
  applyDietDefaults,
  firstAfterDietIndex,
  getSkipReason,
  getSkippedSliderLabels,
  getSliderCopy,
  getVisiblePreferenceOptions,
  isPreferenceDisabled,
  shouldSkipBreadthSlider,
  shouldSkipSlider,
  syncDietContext,
} from "@/lib/nutrition-diet-skip";
import { nutritionSliderQuestion } from "@/data/nutrition/lifescore-questions";

describe("shouldSkipSlider — oilyFish", () => {
  it("vegan → geen skip (plantaardige omega-3-vraag)", () => {
    expect(shouldSkipSlider("oilyFish", { preference: "vegan", allergies: [] })).toBe(false);
    expect(getSkipReason("oilyFish", { preference: "vegan", allergies: [] })).toBeNull();
  });

  it("vegetarian → geen skip (plantaardige omega-3-vraag)", () => {
    expect(shouldSkipSlider("oilyFish", { preference: "vegetarian", allergies: [] })).toBe(false);
    expect(getSkipReason("oilyFish", { preference: "vegetarian", allergies: [] })).toBeNull();
  });

  it("vis-allergie → skip", () => {
    expect(shouldSkipSlider("oilyFish", { preference: "none", allergies: ["vis"] })).toBe(true);
    expect(getSkipReason("oilyFish", { preference: "none", allergies: ["vis"] })).toBe("allergy");
  });

  it("pescotariër zonder allergie → geen skip", () => {
    expect(shouldSkipSlider("oilyFish", { preference: "pescatarian", allergies: [] })).toBe(false);
  });
});

describe("shouldSkipSlider — nutsSeedsLegumes", () => {
  it("noten-allergie → skip", () => {
    expect(shouldSkipSlider("nutsSeedsLegumes", { preference: "none", allergies: ["noten"] })).toBe(true);
  });
});

describe("shouldSkipSlider — dairy", () => {
  it("vegan → skip", () => {
    expect(shouldSkipSlider("dairy", { preference: "vegan", allergies: [] })).toBe(true);
  });

  it("melk-allergie → skip", () => {
    expect(shouldSkipSlider("dairy", { preference: "none", allergies: ["melk"] })).toBe(true);
    expect(getSkipReason("dairy", { preference: "none", allergies: ["lactose"] })).toBe("allergy");
  });

  it("vegetariër → geen skip", () => {
    expect(shouldSkipSlider("dairy", { preference: "vegetarian", allergies: [] })).toBe(false);
  });
});

describe("shouldSkipBreadthSlider — tarwe", () => {
  it("tarwe-allergie → skip wholegrain", () => {
    expect(shouldSkipBreadthSlider("wholegrain", { preference: "none", allergies: ["tarwe"] })).toBe(true);
  });
});

describe("shouldSkipSlider — meatLegumes en protein", () => {
  it("vegan → meatLegumes niet overslaan", () => {
    expect(shouldSkipSlider("meatLegumes", { preference: "vegan", allergies: [] })).toBe(false);
  });

  it("vegan → proteinMeals niet overslaan", () => {
    expect(shouldSkipSlider("proteinMeals", { preference: "vegan", allergies: [] })).toBe(false);
  });
});

describe("applyDietDefaults / syncDietContext", () => {
  it("vegan zet alleen zuivel op 0", () => {
    const result = applyDietDefaults(
      { oilyFish: 3, dairy: 2, proteinMeals: 1 },
      { preference: "vegan", allergies: [] },
    );
    expect(result.oilyFish).toBe(3);
    expect(result.dairy).toBe(0);
    expect(result.proteinMeals).toBe(1);
  });

  it("vis-allergie zet oilyFish op 0", () => {
    const result = applyDietDefaults(
      { oilyFish: 3 },
      { preference: "none", allergies: ["vis"] },
    );
    expect(result.oilyFish).toBe(0);
  });

  it("sync reset bij deselect allergie", () => {
    const withAllergy = syncDietContext(
      { oilyFish: 0 },
      { oilyFish: false },
      { preference: "none", allergies: ["vis"] },
    );
    expect(withAllergy.sliders.oilyFish).toBe(0);

    const without = syncDietContext(
      withAllergy.sliders,
      withAllergy.optOutChecked,
      { preference: "none", allergies: [] },
    );
    expect(without.sliders.oilyFish).toBe(nutritionSliderQuestion("oilyFish")?.defaultIndex);
  });

  it("eieren-allergie → proteinMeals opt-out", () => {
    const synced = syncDietContext(
      { proteinMeals: 2 },
      {},
      { preference: "none", allergies: ["eieren"] },
    );
    expect(synced.sliders.proteinMeals).toBe(0);
    expect(synced.optOutChecked.proteinMeals).toBe(true);
  });
});

describe("firstAfterDietIndex", () => {
  it("vegan start bij noten (zuivel overgeslagen, vis-vraag plantaardig)", () => {
    const index = firstAfterDietIndex({ preference: "vegan", allergies: [] });
    expect(index).toBe(0);
    expect(NUTRITION_CORE_AFTER_DIET_ID(index)).toBe("nutsSeedsLegumes");
  });

  it("vis-allergie start niet bij oilyFish", () => {
    const index = firstAfterDietIndex({ preference: "none", allergies: ["vis"] });
    expect(index).not.toBe(1);
    expect(NUTRITION_CORE_AFTER_DIET_ID(index)).not.toBe("oilyFish");
  });

  it("none zonder allergie start bij nutsSeedsLegumes", () => {
    const index = firstAfterDietIndex({ preference: "none", allergies: [] });
    expect(index).toBe(0);
  });
});

function NUTRITION_CORE_AFTER_DIET_ID(index: number): string {
  const ids = [
    "nutsSeedsLegumes",
    "oilyFish",
    "proteinMeals",
    "meatLegumes",
    "dairy",
    "daylight",
  ];
  return ids[index] ?? "";
}

describe("getSkippedSliderLabels", () => {
  it("vis-allergie bevat visserijvragen", () => {
    const labels = getSkippedSliderLabels({ preference: "none", allergies: ["vis"] });
    expect(labels).toContain("visserijvragen");
  });
});

describe("getSliderCopy", () => {
  it("vis-allergie → meatLegumes zonder vis in prompt", () => {
    const copy = getSliderCopy("meatLegumes", { preference: "none", allergies: ["vis"] });
    expect(copy.prompt?.toLowerCase()).not.toContain("vis");
  });

  it("eieren-allergie → protein helper zonder ei", () => {
    const copy = getSliderCopy("proteinMeals", { preference: "none", allergies: ["eieren"] });
    expect(copy.helper?.toLowerCase()).not.toMatch(/\bei\b/);
  });

  it("vegan → plantaardige omega-3 copy", () => {
    const copy = getSliderCopy("oilyFish", { preference: "vegan", allergies: [] });
    expect(copy.prompt?.toLowerCase()).toContain("plantaardige omega-3");
    expect(copy.helper?.toLowerCase()).toMatch(/algenolie|chia/);
    expect(copy.optOutLabel).toBe("Ik gebruik dit niet");
  });
});

describe("isPreferenceDisabled", () => {
  it("pescotariër + vis-allergie → disabled", () => {
    expect(isPreferenceDisabled("pescatarian", ["vis"])).toBe(true);
  });

  it("geen voorkeur + vis-allergie → disabled", () => {
    expect(isPreferenceDisabled("none", ["vis"])).toBe(true);
    expect(isPreferenceDisabled("none", ["zeevruchten"])).toBe(true);
  });

  it("pescotariër zonder allergie → enabled", () => {
    expect(isPreferenceDisabled("pescatarian", [])).toBe(false);
  });

  it("geen voorkeur zonder vis-allergie → enabled", () => {
    expect(isPreferenceDisabled("none", [])).toBe(false);
  });

  it("andere allergieën beperken voorkeur niet", () => {
    for (const preference of ["none", "pescatarian", "vegetarian", "vegan"] as const) {
      expect(isPreferenceDisabled(preference, ["melk"])).toBe(false);
      expect(isPreferenceDisabled(preference, ["noten"])).toBe(false);
      expect(isPreferenceDisabled(preference, ["eieren"])).toBe(false);
      expect(isPreferenceDisabled(preference, ["tarwe"])).toBe(false);
    }
  });
});

describe("getVisiblePreferenceOptions", () => {
  it("vis-allergie → alleen vegetariër en veganist", () => {
    const options = getVisiblePreferenceOptions(["vis"]);
    expect(options.map((opt) => opt.value)).toEqual(["vegetarian", "vegan"]);
  });

  it("zonder vis-allergie → alle vier opties", () => {
    expect(getVisiblePreferenceOptions([])).toHaveLength(4);
  });
});
