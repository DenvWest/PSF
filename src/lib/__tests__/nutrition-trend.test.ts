import { describe, expect, it } from "vitest";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { bouwTrend, weekKort } from "@/lib/nutrition-trend";

function dag(date: string, items: { key: string; grams: number }[]): DagboekDag {
  return {
    date,
    soort: "doordeweeks",
    porties: {},
    items: items.map((item) => ({ moment: "ontbijt", ...item })),
  };
}

describe("bouwTrend", () => {
  it("geeft één punt per week, oudste eerst", () => {
    const trend = bouwTrend([], "2026-09-17", 4);
    const magnesium = trend.find((t) => t.nutrient === "magnesium")!;

    expect(magnesium.punten).toHaveLength(4);
    // Oplopend in de tijd: elk volgend punt hoort een latere of gelijke
    // maandag te zijn dan zijn voorganger.
    for (let i = 1; i < magnesium.punten.length; i += 1) {
      expect(magnesium.punten[i]!.weekStart >= magnesium.punten[i - 1]!.weekStart).toBe(
        true,
      );
    }
    // Het laatste punt is de week van "vandaag" — 2026-09-17 is een
    // donderdag, dus die week begint op maandag 2026-09-14.
    expect(magnesium.punten.at(-1)!.weekStart).toBe("2026-09-14");
  });

  it("geeft null voor een week zonder registratie, geen nul", () => {
    const dagen = [dag("2026-09-14", [{ key: "havermout", grams: 100 }])];
    const trend = bouwTrend(dagen, "2026-09-17", 3);
    const magnesium = trend.find((t) => t.nutrient === "magnesium")!;

    // De twee weken ervoor zijn leeg — dat moet null zijn, geen 0, anders
    // suggereert de grafiek een meting die er niet is.
    expect(magnesium.punten[0]!.waarde).toBeNull();
    expect(magnesium.punten[1]!.waarde).toBeNull();
    expect(magnesium.punten[2]!.waarde).not.toBeNull();
  });

  it("markeert zink en vitamine D als niet bewijsbaar, net als het weekoverzicht", () => {
    const trend = bouwTrend([], "2026-09-17", 2);
    expect(trend.find((t) => t.nutrient === "zinc")!.bewijsbaar).toBe(false);
    expect(trend.find((t) => t.nutrient === "vitamin_d")!.bewijsbaar).toBe(false);
    expect(trend.find((t) => t.nutrient === "magnesium")!.bewijsbaar).toBe(true);
  });

  it("draagt geen referentie voor eiwit — dat doel is persoonlijk", () => {
    const trend = bouwTrend([], "2026-09-17", 2);
    expect(trend.find((t) => t.nutrient === "protein")!.referentie).toBeNull();
  });
});

describe("weekKort", () => {
  it("geeft een weeknummer-label", () => {
    expect(weekKort("2026-09-14")).toMatch(/^wk \d{1,2}$/);
  });
});
