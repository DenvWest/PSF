import { describe, expect, it } from "vitest";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";
import {
  nutritionSourceFavoriteContext,
  nutritionSourceFavoriteId,
  nutritionSourceFavoriteStatus,
  parseNutritionSourceFavorite,
} from "@/lib/nutrition-favorite-source";
import { buildNutrientRouteStatuses } from "@/lib/nutrition-route-status";
import { parseLadderFavoriteLayer } from "@/lib/leefstijl-ladder";

describe("bewaarde voedingsbron", () => {
  it("leest elke stof terug, ook die met een underscore", () => {
    for (const nutrient of NUTRIENT_IDS) {
      const id = nutritionSourceFavoriteId(nutrient, "pompoenzaden");
      expect(parseNutritionSourceFavorite(id)).toEqual({
        nutrient,
        foodSourceKey: "pompoenzaden",
      });
    }
  });

  it("houdt een sleutel met koppeltekens heel", () => {
    const id = nutritionSourceFavoriteId("omega3", "zalm-gekweekt");
    expect(parseNutritionSourceFavorite(id)?.foodSourceKey).toBe("zalm-gekweekt");
  });

  it("botst niet met een ladder-favoriet", () => {
    // Beide vormen staan in dezelfde tabel; ze mogen elkaars id nooit lezen.
    expect(parseNutritionSourceFavorite("laag-voeding-p1-zet-groente-erbij")).toBeNull();
    expect(parseLadderFavoriteLayer(nutritionSourceFavoriteId("zinc", "rundvlees"))).toBeNull();
  });

  it("zegt op het schap waar de bron voor staat", () => {
    const context = nutritionSourceFavoriteContext(
      nutritionSourceFavoriteId("magnesium", "pompoenzaden"),
    );
    expect(context).toContain("magnesium-route");
    expect(context).toContain("dagelijks");
  });

  it("laat een gewone favoriet met rust", () => {
    expect(nutritionSourceFavoriteContext("laag-slaap-p2-vast-opstaan")).toBeNull();
  });
});

describe("routestatus op het schap", () => {
  const statuses = buildNutrientRouteStatuses(
    {
      sliders: {
        vegetables: 1,
        fruit: 4,
        berries: 2,
        nutsSeedsLegumes: 2,
        oilyFish: 2,
        proteinMeals: 3,
        meatLegumes: 2,
        dairy: 1,
        daylight: 3,
        wholegrain: 2,
        sugaryDrinks: 2,
      },
      preference: "none",
      allergies: [],
    },
  );

  it("noemt nooit een hoeveelheid", () => {
    // De harde grens uit `nutrient-routes.ts`, hier op de plek waar iemand
    // zijn keuze het langst ziet staan: geen mg, geen percentage.
    for (const nutrient of NUTRIENT_IDS) {
      const readout = nutritionSourceFavoriteStatus(
        nutritionSourceFavoriteId(nutrient, "pompoenzaden"),
        statuses,
      );
      if (!readout) {
        continue;
      }
      const text = `${readout.label} ${readout.answerLabel ?? ""}`;
      expect(text, nutrient).not.toMatch(/\d+\s*(mg|µg|mcg)/i);
      expect(text, nutrient).not.toMatch(/\d+\s*%/);
    }
  });

  it("zwijgt over een stof die niet gemeten is", () => {
    expect(nutritionSourceFavoriteStatus("voeding-bron-magnesium-spinazie", [])).toBeNull();
  });

  it("geeft niets terug voor een niet-bronfavoriet", () => {
    expect(nutritionSourceFavoriteStatus("laag-voeding-p1-groente", statuses)).toBeNull();
  });
});
