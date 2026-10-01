import { describe, expect, it } from "vitest";
import { parsePricePerDaySpec } from "@/lib/supplement-catalog-db/price-parse";

describe("parsePricePerDaySpec", () => {
  it("parset een eenvoudig bedrag", () => {
    expect(parsePricePerDaySpec("€ 0,43")).toBe(43);
    expect(parsePricePerDaySpec("€ 0,18")).toBe(18);
  });

  it("pakt het eerste (reguliere) bedrag bij een eenmalig/abonnement-paar", () => {
    expect(parsePricePerDaySpec("€ 0,42 (eenm.) / € 0,35 (abo)")).toBe(42);
  });

  it("negeert de toelichting tussen haakjes", () => {
    expect(parsePricePerDaySpec("€ 0,20 (bij 5 g/dag)")).toBe(20);
  });

  it("geeft null terug zonder €-teken", () => {
    expect(parsePricePerDaySpec("ca. 0,43 per dag")).toBeNull();
    expect(parsePricePerDaySpec("niet gespecificeerd")).toBeNull();
  });

  it("verwerkt duizendtalpunten", () => {
    expect(parsePricePerDaySpec("€ 1.234,56")).toBe(123456);
  });
});
