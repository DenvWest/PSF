import { describe, expect, it } from "vitest";
import {
  isNutritionContextId,
  isNutritionGoalId,
  needsNutritionReferral,
  nutritionReferralLine,
  preferenceFromContext,
  NUTRITION_CONTEXT_OPTIONS,
  NUTRITION_GOAL_OPTIONS,
  type NutritionContextId,
} from "@/data/nutrition/leefstijlcheck-context";

describe("validatie", () => {
  it("herkent alleen bekende context-ids", () => {
    expect(isNutritionContextId("medicatie")).toBe(true);
    expect(isNutritionContextId("paleo")).toBe(false);
    expect(isNutritionContextId("")).toBe(false);
  });

  it("herkent alleen bekende doel-ids", () => {
    expect(isNutritionGoalId("klachten")).toBe(true);
    expect(isNutritionGoalId("onbekend")).toBe(true);
    expect(isNutritionGoalId("spieropbouw")).toBe(false);
  });

  it("biedt 'weet ik nog niet' als volwaardig doel", () => {
    // Geen skip-knop maar een antwoord: wie dit kiest krijgt de neutrale
    // volgorde, en dat is een geldige uitkomst.
    expect(NUTRITION_GOAL_OPTIONS.some((optie) => optie.id === "onbekend")).toBe(true);
  });

  it("biedt 'geen van deze' als context-uitgang", () => {
    expect(NUTRITION_CONTEXT_OPTIONS.some((optie) => optie.id === "geen")).toBe(true);
  });
});

describe("needsNutritionReferral", () => {
  it("stopt het oordeel bij medicatie", () => {
    expect(needsNutritionReferral(["medicatie"], "energie")).toBe(true);
  });

  it("stopt het oordeel bij klachten als doel", () => {
    expect(needsNutritionReferral(["geen"], "klachten")).toBe(true);
  });

  it("laat gewone combinaties door", () => {
    expect(needsNutritionReferral(["vegetarisch"], "energie")).toBe(false);
    expect(needsNutritionReferral(["gewicht"], "gewicht_omlaag")).toBe(false);
    expect(needsNutritionReferral([], null)).toBe(false);
  });

  it("ziet medicatie ook naast andere antwoorden", () => {
    const context: NutritionContextId[] = ["vegetarisch", "medicatie"];
    expect(needsNutritionReferral(context, "algemeen")).toBe(true);
  });
});

describe("nutritionReferralLine", () => {
  it("zwijgt zonder aanleiding", () => {
    expect(nutritionReferralLine(["vegetarisch"], "energie")).toBeNull();
  });

  it("noemt bij medicatie de wisselwerking en waar je terecht kunt", () => {
    const regel = nutritionReferralLine(["medicatie"], "energie") ?? "";
    expect(regel).toMatch(/medicatie/i);
    expect(regel).toMatch(/huisarts|apotheker/i);
  });

  it("verwijst bij klachten door zonder te diagnosticeren", () => {
    const regel = nutritionReferralLine([], "klachten") ?? "";
    expect(regel).toMatch(/huisarts|diëtist/i);
    // Geen diagnose-taal en geen alarm: allebei zouden een uitspraak zijn die
    // we juist niet doen.
    expect(regel).not.toMatch(/aandoening|ziekte|stoornis|direct contact|waarschuw/i);
  });

  it("geeft medicatie voorrang boven het doel", () => {
    const regel = nutritionReferralLine(["medicatie"], "klachten") ?? "";
    expect(regel).toMatch(/medicatie/i);
  });
});

describe("preferenceFromContext", () => {
  it("vertaalt naar de bestaande dieetvoorkeur", () => {
    // Sluit aan op nutrition-ladder.ts, zodat opt-outs meteen werken zonder
    // dezelfde vraag twee keer te stellen.
    expect(preferenceFromContext(["veganistisch"])).toBe("vegan");
    expect(preferenceFromContext(["vegetarisch"])).toBe("vegetarian");
    expect(preferenceFromContext(["gewicht"])).toBe("none");
    expect(preferenceFromContext([])).toBe("none");
  });

  it("laat veganistisch winnen van vegetarisch", () => {
    expect(preferenceFromContext(["vegetarisch", "veganistisch"])).toBe("vegan");
  });
});
