import { describe, expect, it } from "vitest";
import {
  HOOFDMAALTIJDEN,
  inEetpatroon,
  isGeldigEetpatroon,
  sanitizeHoofdmaaltijden,
  verwachteMaaltijden,
} from "@/lib/nutrition-eetpatroon";

describe("eetpatroon", () => {
  it("houdt alleen hoofdmaaltijden over, uniek en in vaste volgorde", () => {
    expect(sanitizeHoofdmaaltijden(["avondeten", "tussendoor", "lunch", "lunch", 3])).toEqual(["lunch", "avondeten"]);
    expect(sanitizeHoofdmaaltijden("lunch")).toEqual([]);
  });

  it("leeg of null betekent alle drie", () => {
    expect(verwachteMaaltijden(null)).toEqual(HOOFDMAALTIJDEN);
    expect(verwachteMaaltijden([])).toEqual(HOOFDMAALTIJDEN);
    expect(verwachteMaaltijden(["lunch", "avondeten"])).toEqual(["lunch", "avondeten"]);
  });

  it("accepteert null of minstens één hoofdmaaltijd", () => {
    expect(isGeldigEetpatroon(null)).toBe(true);
    expect(isGeldigEetpatroon(["avondeten"])).toBe(true);
    expect(isGeldigEetpatroon([])).toBe(false);
    expect(isGeldigEetpatroon(["tussendoor"])).toBe(false);
  });
});

describe("inEetpatroon", () => {
  it("tussendoor hoort er altijd bij, null betekent alle drie", () => {
    expect(inEetpatroon("tussendoor", ["avondeten"])).toBe(true);
    expect(inEetpatroon("ontbijt", null)).toBe(true);
  });

  it("een maaltijd buiten je patroon hoort er niet bij", () => {
    expect(inEetpatroon("ontbijt", ["lunch", "avondeten"])).toBe(false);
    expect(inEetpatroon("lunch", ["lunch", "avondeten"])).toBe(true);
  });
});
