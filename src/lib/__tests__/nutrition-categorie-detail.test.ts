import { describe, it, expect } from "vitest";
import {
  categorieDetail,
  heeftDetail,
  nutrientenVoorCategorie,
} from "@/lib/nutrition-categorie-detail";
import { VOEDSELGROEPEN } from "@/lib/nutrition-voedselgroepen";
import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";

// ─── A. De brug categorie → nutriënt ────────────────────────────────────────

describe("nutrientenVoorCategorie", () => {
  it("noten dragen magnesium en zink", () => {
    const nutrienten = nutrientenVoorCategorie("noten");
    expect(nutrienten).toContain("magnesium");
    expect(nutrienten).toContain("zinc");
  });

  it("vlees & vis draagt omega-3 én eiwit", () => {
    const nutrienten = nutrientenVoorCategorie("vlees-vis");
    expect(nutrienten).toContain("omega3");
    expect(nutrienten).toContain("protein");
  });

  it("suiker draagt niets — je kiest daar geen bron, je mindert", () => {
    expect(nutrientenVoorCategorie("suiker")).toEqual([]);
    expect(heeftDetail("suiker")).toBe(false);
  });

  it("elke categorie mét bronnen heeft ook een detail", () => {
    for (const groep of VOEDSELGROEPEN) {
      const nutrienten = nutrientenVoorCategorie(groep.id);
      expect(heeftDetail(groep.id)).toBe(nutrienten.length > 0);
    }
  });

  it("leidt de nutriënten af uit FOOD_SOURCES, niet uit een handmatige lijst", () => {
    // Als de tabel een nutriënt zonder bron in deze portiegroepen zou hebben,
    // mag die hier niet opduiken.
    for (const groep of VOEDSELGROEPEN) {
      for (const nutrient of nutrientenVoorCategorie(groep.id)) {
        expect(FOOD_SOURCES[nutrient].length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── B. Bronnen binnen een categorie ────────────────────────────────────────

describe("categorieDetail — bronnen", () => {
  it("toont alleen bronnen die in de portiegroepen van die categorie vallen", () => {
    const detail = categorieDetail("zuivel", {});
    for (const nutrient of detail.nutrienten) {
      for (const bron of nutrient.bronnen) {
        const source = FOOD_SOURCES[nutrient.nutrient].find((s) => s.key === bron.key);
        expect(source?.portionGroup).toBe("dairy");
      }
    }
  });

  it("houdt de aflopende volgorde van FOOD_SOURCES aan", () => {
    const detail = categorieDetail("noten", {});
    for (const nutrient of detail.nutrienten) {
      const amounts = nutrient.bronnen
        .map((b) => b.amount)
        .filter((a): a is number => a !== null);
      expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
    }
  });

  it("respecteert maxBronnen", () => {
    const detail = categorieDetail("vlees-vis", {}, new Date(), 2);
    for (const nutrient of detail.nutrienten) {
      expect(nutrient.bronnen.length).toBeLessThanOrEqual(2);
    }
  });

  it("geeft een lege categorie terug zonder te klappen", () => {
    const detail = categorieDetail("suiker", {});
    expect(detail.nutrienten).toEqual([]);
    expect(detail.bronCount).toBe(0);
    expect(detail.geverifieerdCount).toBe(0);
  });

  it("telt hoeveel bronnen een geverifieerd brondcijfer dragen", () => {
    const detail = categorieDetail("vlees-vis", {});
    expect(detail.geverifieerdCount).toBeLessThanOrEqual(detail.bronCount);
    expect(detail.geverifieerdCount).toBeGreaterThan(0);
  });

  it("draagt de opname-nuance mee waar die geldt", () => {
    // Noten zijn fytaatrijk; die uitleg hoort bij de bron te staan, niet
    // weggelaten te worden omdat het getal er goed uitziet.
    const detail = categorieDetail("noten", {});
    const magnesium = detail.nutrienten.find((n) => n.nutrient === "magnesium");
    const metNote = magnesium?.bronnen.filter((b) => b.opnameNote !== null) ?? [];
    expect(metNote.length).toBeGreaterThan(0);
  });
});

// ─── C. Banden lopen synchroon met het nutriëntspoor ────────────────────────

describe("categorieDetail — banden", () => {
  const report: NutritionSelfReport = {
    oilyFishPerWeek: 0,
    proteinMealsPerDay: 3,
    meatLegumesPerDay: 2,
    vegFruitPerDay: 4,
    nutsSeedsLegumesPerWeek: 14,
    dairyServingsPerDay: 2,
    sunExposurePerWeek: 3,
  };

  it("neemt de band over uit dezelfde engine als het nutriëntspoor", () => {
    const detail = categorieDetail("vlees-vis", report, new Date("2026-07-15"));
    const omega3 = detail.nutrienten.find((n) => n.nutrient === "omega3");
    // 0× vette vis per week → below, ook hier.
    expect(omega3?.band).toBe("below");
  });

  it("zet aandacht bovenaan: below vóór around vóór meets", () => {
    const detail = categorieDetail("vlees-vis", report, new Date("2026-07-15"));
    const volgorde = { below: 0, around: 1, meets: 2 } as const;
    const banden = detail.nutrienten.map((n) => volgorde[n.band]);
    expect(banden).toEqual([...banden].sort((a, b) => a - b));
  });

  it("zonder rapport is alles 'around' — neutraal, geen oordeel", () => {
    const detail = categorieDetail("noten", null);
    for (const nutrient of detail.nutrienten) {
      expect(nutrient.band).toBe("around");
    }
  });

  it("deterministisch bij gelijke datum", () => {
    const date = new Date("2026-07-15");
    expect(categorieDetail("granen", report, date)).toEqual(
      categorieDetail("granen", report, date),
    );
  });
});

// ─── D. Compliance ──────────────────────────────────────────────────────────

describe("COMPLIANCE: geen optelsom, geen dagtotaal", () => {
  it("draagt per bron een losse portiewaarde, nooit een som over bronnen", () => {
    const detail = categorieDetail("noten", {});
    for (const nutrient of detail.nutrienten) {
      const amounts = nutrient.bronnen
        .map((b) => b.amount)
        .filter((a): a is number => a !== null);
      if (amounts.length < 2) continue;
      // Er mag nergens een veld staan dat de som van de bronnen benadert.
      const som = amounts.reduce((a, b) => a + b, 0);
      const serialized = JSON.stringify(nutrient);
      expect(serialized).not.toContain(String(som));
    }
  });

  it("de uitvoer noemt nergens een ADH of dagtotaal", () => {
    const tekst = JSON.stringify(
      VOEDSELGROEPEN.map((g) => categorieDetail(g.id, { vegFruitPerDay: 2 })),
    ).toLowerCase();
    for (const verboden of ["adh", "dagtotaal", "per dag totaal", "dagelijkse behoefte"]) {
      expect(tekst).not.toContain(verboden);
    }
  });

  it("een onzeker cijfer draagt zijn eigen voorbehoud mee", () => {
    // Magnesium staat op confidence 1 met een expliciete uitleg; die mag niet
    // wegvallen zodra de stof in een categorie-doordruk verschijnt.
    const detail = categorieDetail("noten", {});
    const magnesium = detail.nutrienten.find((n) => n.nutrient === "magnesium");
    expect(magnesium?.confidence).toBeLessThanOrEqual(2);
    expect(magnesium?.confidenceWhy.length).toBeGreaterThan(0);
  });
});
