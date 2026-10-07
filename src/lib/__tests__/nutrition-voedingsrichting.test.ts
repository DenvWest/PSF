import { describe, expect, it } from "vitest";
import {
  isVoedingsrichting,
  KLACHTEN_DOORVERWIJZING,
  ordenVoorRichting,
  richtingZin,
} from "@/lib/nutrition-voedingsrichting";

const rijen = ["magnesium", "protein", "omega3", "zinc", "vitamin_d"].map((nutrient) => ({ nutrient }));
const volgorde = (richting: Parameters<typeof ordenVoorRichting>[2]) =>
  ordenVoorRichting(rijen, (rij) => rij.nutrient, richting).map((rij) => rij.nutrient);

describe("voedingsrichting", () => {
  it("zet de stoffen van de richting bovenaan en laat de rest in de bestaande volgorde", () => {
    expect(volgorde("spier")).toEqual(["protein", "vitamin_d", "magnesium", "omega3", "zinc"]);
    expect(volgorde("gewicht")).toEqual(["protein", "magnesium", "omega3", "zinc", "vitamin_d"]);
    expect(volgorde("energie")).toEqual(["magnesium", "protein", "omega3", "zinc", "vitamin_d"]);
  });

  it("houdt de volgorde neutraal zonder richting, bij 'weet ik nog niet' en bij klachten", () => {
    const neutraal = ["magnesium", "protein", "omega3", "zinc", "vitamin_d"];
    expect(volgorde(null)).toEqual(neutraal);
    expect(volgorde("weet_niet")).toEqual(neutraal);
    expect(volgorde("klachten")).toEqual(neutraal);
  });

  it("verandert de rijen zelf niet", () => {
    const geordend = ordenVoorRichting(rijen, (rij) => rij.nutrient, "spier");
    expect(geordend).toHaveLength(rijen.length);
    expect(new Set(geordend)).toEqual(new Set(rijen));
  });

  it("legt de volgorde uit, en verwijst bij klachten door", () => {
    expect(richtingZin("spier")).toMatch(/Eiwit en vitamine D staan bovenaan/);
    expect(richtingZin("klachten")).toBe(KLACHTEN_DOORVERWIJZING);
    expect(richtingZin("structuur")).toMatch(/Per maaltijd/);
    expect(richtingZin("weet_niet")).toBeNull();
    expect(richtingZin(null)).toBeNull();
  });

  it("accepteert alleen de vaste richtingen", () => {
    expect(isVoedingsrichting("spier")).toBe(true);
    expect(isVoedingsrichting("afvallen")).toBe(false);
    expect(isVoedingsrichting(null)).toBe(false);
  });
});
