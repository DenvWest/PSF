import { describe, expect, it } from "vitest";
import { parseEuroAmountSpec } from "@/lib/supplement-catalog-db/price-parse";

describe("parseEuroAmountSpec", () => {
  it("parset een eenvoudig bedrag", () => {
    expect(parseEuroAmountSpec("€ 0,43")).toBe(43);
    expect(parseEuroAmountSpec("€ 17,95")).toBe(1795);
  });

  it("pakt het eerste (reguliere) bedrag bij een eenmalig/abonnement-paar", () => {
    expect(parseEuroAmountSpec("€ 0,42 (eenm.) / € 0,35 (abo)")).toBe(42);
  });

  it("negeert de toelichting tussen haakjes", () => {
    expect(parseEuroAmountSpec("€ 0,20 (bij 5 g/dag)")).toBe(20);
    expect(parseEuroAmountSpec("€ 13,95 (100 stuks)")).toBe(1395);
  });

  it("geeft null terug zonder €-teken", () => {
    expect(parseEuroAmountSpec("ca. 0,43 per dag")).toBeNull();
    expect(parseEuroAmountSpec("niet gespecificeerd")).toBeNull();
  });

  it("verwerkt duizendtalpunten", () => {
    expect(parseEuroAmountSpec("€ 1.234,56")).toBe(123456);
  });
});
