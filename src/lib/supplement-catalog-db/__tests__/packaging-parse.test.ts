import { describe, expect, it } from "vitest";
import { parseContainerSpec, parseServingSpec } from "@/lib/supplement-catalog-db/packaging-parse";

describe("parseContainerSpec", () => {
  it("parset stuksgoed met dagen-toelichting (tabletten)", () => {
    expect(parseContainerSpec("120 tabletten (60 dagen)")).toEqual({
      containerSize: 120,
      containerUnit: "tabletten",
      servingsPerContainer: 120,
    });
  });

  it("parset stuksgoed zonder toelichting (softgels)", () => {
    expect(parseContainerSpec("100 softgels")).toEqual({
      containerSize: 100,
      containerUnit: "softgels",
      servingsPerContainer: 100,
    });
  });

  it("parset vloeistof met expliciete 'doseringen à' annotatie niet als stuksgoed", () => {
    expect(parseContainerSpec("25 ml (~166 dagen bij 3 druppels)")).toEqual({
      containerSize: 25,
      containerUnit: "ml",
      servingsPerContainer: null,
    });
  });

  it("parset poeder met expliciete doseringen-annotatie", () => {
    expect(parseContainerSpec("500 g (100 doseringen à 5 g)")).toEqual({
      containerSize: 500,
      containerUnit: "g",
      servingsPerContainer: 100,
    });
  });

  it("normaliseert vegicaps/capsules naar hun geplurald alias", () => {
    expect(parseContainerSpec("60 vegicaps")).toEqual({
      containerSize: 60,
      containerUnit: "vegicaps",
      servingsPerContainer: 60,
    });
    expect(parseContainerSpec("60 capsules")).toEqual({
      containerSize: 60,
      containerUnit: "capsules",
      servingsPerContainer: 60,
    });
  });

  it("geeft alles null terug als de tekst niet begint met een getal + bekende eenheid", () => {
    expect(parseContainerSpec("250 ml")).toEqual({
      containerSize: 250,
      containerUnit: "ml",
      servingsPerContainer: null,
    });
    expect(parseContainerSpec("onbekend formaat")).toEqual({
      containerSize: null,
      containerUnit: null,
      servingsPerContainer: null,
    });
  });

  it("accepteert komma als decimaalteken", () => {
    expect(parseContainerSpec("2,5 kg")).toEqual({
      containerSize: 2.5,
      containerUnit: "kg",
      servingsPerContainer: null,
    });
  });
});

describe("parseServingSpec", () => {
  it("parset een eenvoudige portie-spec (eiwitpoeder)", () => {
    expect(parseServingSpec("30 g (ca. 25 g eiwit) — whey isolaat, hydrolysaat & concentraat")).toEqual({
      servingSize: 30,
      servingUnit: "g",
    });
  });

  it("geeft null terug bij onherkenbare tekst", () => {
    expect(parseServingSpec("niet gespecificeerd")).toEqual({ servingSize: null, servingUnit: null });
  });
});
