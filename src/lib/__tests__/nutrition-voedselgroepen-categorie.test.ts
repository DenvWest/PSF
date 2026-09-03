import { describe, expect, it } from "vitest";
import { buildNutritionFactRows } from "@/lib/nutrition-ladder";
import { categorieKaarten } from "@/lib/nutrition-voedselgroepen";

function report(sliders: Record<string, number>) {
  return { sliders, preference: "none" as const, allergies: [] as string[] };
}

describe("categorieKaarten", () => {
  it("splitst groente en fruit op plantbasis", () => {
    const sliders = {
      vegetables: 2,
      fruit: 3,
      berries: 1,
      wholegrain: 2,
      meatLegumes: 2,
      dairy: 2,
      nutsSeedsLegumes: 2,
      oilyFish: 0,
      proteinMeals: 2,
      sugaryDrinks: 1,
      ultraProcessed: 1,
    };
    const factRows = buildNutritionFactRows(report(sliders));
    const kaarten = categorieKaarten(factRows, report(sliders));
    const groente = kaarten.find((kaart) => kaart.id === "groente");
    const fruit = kaarten.find((kaart) => kaart.id === "fruit");
    expect(groente?.jij).toMatch(/dag/i);
    expect(fruit?.jij).toMatch(/week|maand/i);
    expect(groente?.aanbevolen).toMatch(/400 g/i);
    expect(fruit?.aanbevolen).toMatch(/400 g/i);
  });

  it("toont granen via vezelbasis ook al meet die op P2", () => {
    const factRows = buildNutritionFactRows(report({ wholegrain: 1 }));
    const kaarten = categorieKaarten(factRows, report({ wholegrain: 1 }));
    expect(kaarten.some((kaart) => kaart.id === "granen")).toBe(true);
  });
});

describe("exemption op de categoriekaart", () => {
  const volledig = {
    vegetables: 2,
    fruit: 3,
    berries: 1,
    wholegrain: 2,
    meatLegumes: 2,
    dairy: 2,
    nutsSeedsLegumes: 2,
    oilyFish: 1,
    proteinMeals: 2,
    sugaryDrinks: 1,
    ultraProcessed: 1,
  };

  it("laat exemption leeg zodra er een richtlijn is", () => {
    const factRows = buildNutritionFactRows(report(volledig));
    const kaarten = categorieKaarten(factRows, report(volledig));
    const groente = kaarten.find((kaart) => kaart.id === "groente");
    expect(groente?.aanbevolen).toBeTruthy();
    // De richtlijn wint: nooit een norm én "geen norm" op dezelfde rij.
    expect(groente?.exemption).toBeNull();
  });

  it("markeert een normloze categorie als eigen ijkpunt", () => {
    const factRows = buildNutritionFactRows(report(volledig));
    const kaarten = categorieKaarten(factRows, report(volledig));
    // Zuivel hangt aan `eiwitbronnen`, en die rij heeft geen richtlijn.
    const zuivel = kaarten.find((kaart) => kaart.id === "zuivel");
    expect(zuivel?.aanbevolen).toBeNull();
    expect(zuivel?.exemption).toBe("geen-norm");
  });

  it("houdt de richtlijn zodra één rij in de groep er nog een heeft", () => {
    // Bij een veganist vallen vis en vlees weg, maar "Vlees & vis" bundelt ook
    // `eiwitritme` — en die rij heeft wél een vuistregel. De cel toont die dan,
    // niet "niet jouw meetlat": een concrete norm zegt meer dan een opt-out
    // over twee van de drie rijen.
    const vega = {
      sliders: volledig,
      preference: "vegan" as const,
      allergies: [] as string[],
    };
    const factRows = buildNutritionFactRows(vega);
    const kaarten = categorieKaarten(factRows, vega);
    const vleesVis = kaarten.find((kaart) => kaart.id === "vlees-vis");
    if (vleesVis) {
      expect(vleesVis.aanbevolen).toBeTruthy();
      expect(vleesVis.exemption).toBeNull();
    }
  });

  it("markeert een groep zonder enige gemeten rij als niet-gevraagd", () => {
    // Lege check: er is niets om tegen te leggen, en dat is een derde geval
    // naast "geen norm" en "opt-out".
    const leeg = report({});
    const kaarten = categorieKaarten(buildNutritionFactRows(leeg), leeg);
    for (const kaart of kaarten) {
      expect(Boolean(kaart.aanbevolen) || kaart.exemption !== null).toBe(true);
    }
  });

  it("geeft elke kaart een richtlijn of een reden waarom die er niet is", () => {
    const factRows = buildNutritionFactRows(report(volledig));
    const kaarten = categorieKaarten(factRows, report(volledig));
    expect(kaarten.length).toBeGreaterThan(0);
    // Dit is de hele fix: geen enkele lege cel zonder betekenis meer.
    for (const kaart of kaarten) {
      expect(Boolean(kaart.aanbevolen) || kaart.exemption !== null).toBe(true);
    }
  });
});
