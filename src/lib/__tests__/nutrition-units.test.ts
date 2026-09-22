import { describe, expect, it } from "vitest";
import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import { SUPPLEMENT_CATALOG } from "@/data/nutrition/supplement-catalog";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import { BASE_UNIT, toBase, type NutrientUnit } from "@/lib/nutrition-units";

/**
 * De vangrail onder de optelling.
 *
 * `nutrientenUitItems` telt bedragen uit twee catalogi bij elkaar op. Dat mag
 * alleen als die bedragen in dezelfde grootheid staan. De optelling rekent
 * sinds september 2026 elk bedrag eerst naar `BASE_UNIT` om, dus een mismatch
 * kán niet meer stil fout gaan — maar een mismatch is nog steeds een
 * datafout, en die hoort hier te knallen en niet pas in de UI.
 *
 * Deze suite is dus twee dingen tegelijk: een test op de omrekening, en een
 * invariant-test op de dáta. De tweede is de belangrijkste — hij faalt zodra
 * iemand een vitamine-D-supplement in mg of IE toevoegt.
 */

describe("toBase — omrekenen naar de basiseenheid", () => {
  it("laat een bedrag dat al in de basiseenheid staat ongemoeid", () => {
    expect(toBase(200, "mg", "magnesium")).toBe(200);
    expect(toBase(24, "g", "protein")).toBe(24);
    expect(toBase(10, "µg", "vitamin_d")).toBe(10);
  });

  it("rekent tussen eenheden om", () => {
    // 1 g magnesium = 1000 mg; basiseenheid van magnesium is mg.
    expect(toBase(1, "g", "magnesium")).toBe(1_000);
    // 1000 µg magnesium = 1 mg.
    expect(toBase(1_000, "µg", "magnesium")).toBe(1);
    // Vitamine D rekent naar µg: 1 mg = 1000 µg.
    expect(toBase(1, "mg", "vitamin_d")).toBe(1_000);
  });

  /**
   * De fout die deze module bestaansrecht geeft: 25 µg en 10 µg mogen opgeteld
   * worden, 25 mg en 10 µg niet. Vóór de omrekening leverde dat 35 op — een
   * getal dat er precies zo uitziet als een goed getal.
   */
  it("maakt een mg-waarde niet gelijk aan een µg-waarde", () => {
    expect(toBase(25, "mg", "vitamin_d")).not.toBe(toBase(25, "µg", "vitamin_d"));
    expect(toBase(25, "mg", "vitamin_d")).toBe(25_000);
  });

  it("levert null bij een onbruikbaar getal, nooit nul", () => {
    expect(toBase(Number.NaN, "mg", "magnesium")).toBeNull();
    expect(toBase(Number.POSITIVE_INFINITY, "mg", "magnesium")).toBeNull();
  });

  it("dekt elke stof met een basiseenheid", () => {
    for (const nutrient of NUTRIENT_ORDER) {
      expect(BASE_UNIT[nutrient]).toBeDefined();
    }
  });
});

describe("invariant — één eenheid per stof in de data", () => {
  /**
   * Dit is de test die bij een toekomstige datarij moet falen.
   *
   * Zolang elke bron van één stof dezelfde eenheid draagt, is de omrekening
   * een no-op en blijft elk getal in het product exact wat het was. Wijkt één
   * rij af, dan is dat vrijwel altijd een invoerfout (een etiket in IE, een
   * omega-3-waarde in gram) en niet een bewuste keuze — en dan wil je het hier
   * horen, niet in een dagtotaal.
   */
  it("gebruikt in FOOD_SOURCES per stof precies één eenheid, gelijk aan BASE_UNIT", () => {
    for (const nutrient of NUTRIENT_ORDER) {
      const eenheden = new Set<NutrientUnit>();
      for (const source of FOOD_SOURCES[nutrient] ?? []) {
        if (source.nutrientValue) eenheden.add(source.nutrientValue.unit);
      }
      if (eenheden.size === 0) continue;

      expect(
        [...eenheden],
        `FOOD_SOURCES.${nutrient} draagt meer dan één eenheid`,
      ).toEqual([BASE_UNIT[nutrient]]);
    }
  });

  it("gebruikt in SUPPLEMENT_CATALOG per stof de basiseenheid van die stof", () => {
    for (const entry of SUPPLEMENT_CATALOG) {
      for (const portie of entry.porties) {
        expect(
          portie.unit,
          `${entry.key} (${entry.nutrient}) staat in ${portie.unit}, verwacht ${BASE_UNIT[entry.nutrient]}`,
        ).toBe(BASE_UNIT[entry.nutrient]);
      }
    }
  });

  /**
   * Voeding en supplement worden in dezelfde som opgeteld. Dat de twee
   * catalogi onderling dezelfde eenheid per stof aanhouden, is daarmee geen
   * toevalligheid maar een eis.
   */
  it("houdt beide catalogi op dezelfde eenheid per stof", () => {
    for (const entry of SUPPLEMENT_CATALOG) {
      const voedingsEenheden = new Set<NutrientUnit>();
      for (const source of FOOD_SOURCES[entry.nutrient] ?? []) {
        if (source.nutrientValue) voedingsEenheden.add(source.nutrientValue.unit);
      }
      if (voedingsEenheden.size === 0) continue;

      for (const portie of entry.porties) {
        expect(
          voedingsEenheden.has(portie.unit),
          `${entry.key} staat in ${portie.unit}, voeding voor ${entry.nutrient} in ${[...voedingsEenheden].join("|")}`,
        ).toBe(true);
      }
    }
  });
});
