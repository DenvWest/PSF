import { describe, expect, it } from "vitest";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { macroPortieVoor } from "@/lib/catalogus-macro-portie";

function entryVoor(key: string) {
  const entry = catalogEntry(key);
  if (!entry) throw new Error(`${key} ontbreekt`);
  return entry;
}

describe("macroPortieVoor", () => {
  it("geeft de NEVO-code, ook voor een regel met kernstofwaarde", () => {
    expect(macroPortieVoor(entryVoor("tonijn-vers"))).toEqual({ nevoCode: "2297", benadering: false });
    expect(macroPortieVoor(entryVoor("tonijn-blik"))).toEqual({ nevoCode: "1590", benadering: false });
  });

  it("markeert een benaderingskoppeling", () => {
    expect(macroPortieVoor(entryVoor("broccoli-diepvries"))?.benadering).toBe(true);
  });
});
