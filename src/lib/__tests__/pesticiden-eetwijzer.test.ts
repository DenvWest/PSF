import { describe, expect, it } from "vitest";
import {
  EETWIJZER_BRON,
  EETWIJZER_FRUIT,
  EETWIJZER_FRUIT_GEMIDDELDE,
  EETWIJZER_GROENTE,
  EETWIJZER_GROENTE_GEMIDDELDE,
  EETWIJZER_OVERIG,
  eetwijzerZone,
} from "@/data/nutrition/pesticiden-eetwijzer";

/**
 * Deze tests bewaken dat de overgenomen PAN-cijfers intern kloppen. Ze kunnen
 * niet controleren of de getallen mét de bron overeenkomen — dat blijft
 * handwerk bij een nieuwe editie — maar ze vangen wel de fouten die bij
 * overtypen ontstaan: een omgekeerde rij, een dubbele soort, een komma
 * verschoven.
 */
describe("PesticidenEetwijzer-data", () => {
  it("noemt de omvang die de methodepagina claimt", () => {
    expect(EETWIJZER_FRUIT).toHaveLength(17);
    expect(EETWIJZER_GROENTE).toHaveLength(27);
    expect(EETWIJZER_OVERIG).toHaveLength(1);
    expect(EETWIJZER_BRON.aantalTests).toBe(3333);
    expect(EETWIJZER_BRON.onderzoeksjaren).toBe("2023–2025");
  });

  it("staat gesorteerd van veel naar weinig residuen", () => {
    for (const lijst of [EETWIJZER_FRUIT, EETWIJZER_GROENTE]) {
      for (let i = 1; i < lijst.length; i += 1) {
        expect(lijst[i].residuen).toBeLessThanOrEqual(lijst[i - 1].residuen);
      }
    }
  });

  it("heeft geen dubbele productnamen", () => {
    const namen = [...EETWIJZER_FRUIT, ...EETWIJZER_GROENTE, ...EETWIJZER_OVERIG].map(
      (item) => item.naam,
    );
    expect(new Set(namen).size).toBe(namen.length);
  });

  it("houdt elke waarde binnen een plausibel bereik", () => {
    for (const item of [...EETWIJZER_FRUIT, ...EETWIJZER_GROENTE, ...EETWIJZER_OVERIG]) {
      expect(item.residuen).toBeGreaterThanOrEqual(0);
      expect(item.residuen).toBeLessThan(10);
    }
  });

  it("laat het gepubliceerde gemiddelde tussen laagste en hoogste liggen", () => {
    // Geen exacte hercontrole: PAN weegt naar aantal tests per soort, en die
    // aantallen publiceert hij niet per rij. Het gemiddelde moet wél binnen
    // het bereik van de lijst vallen, anders is er een cijfer verkeerd over.
    for (const [lijst, gem] of [
      [EETWIJZER_FRUIT, EETWIJZER_FRUIT_GEMIDDELDE],
      [EETWIJZER_GROENTE, EETWIJZER_GROENTE_GEMIDDELDE],
    ] as const) {
      const waarden = lijst.map((i) => i.residuen);
      expect(gem).toBeGreaterThanOrEqual(Math.min(...waarden));
      expect(gem).toBeLessThanOrEqual(Math.max(...waarden));
    }
  });

  it("zet de drie zones om op de gedocumenteerde grenzen", () => {
    expect(eetwijzerZone(4.4)).toBe("veel");
    expect(eetwijzerZone(2.0)).toBe("veel");
    expect(eetwijzerZone(1.9)).toBe("midden");
    expect(eetwijzerZone(1.0)).toBe("midden");
    expect(eetwijzerZone(0.9)).toBe("weinig");
    expect(eetwijzerZone(0)).toBe("weinig");
  });

  it("wijst naar een bron die te controleren is", () => {
    expect(EETWIJZER_BRON.url).toMatch(/^https:\/\/pan-netherlands\.org\//);
    expect(EETWIJZER_BRON.methodeUrl).toMatch(/^https:\/\/pan-netherlands\.org\//);
    expect(EETWIJZER_BRON.teelt).toBe("gangbaar");
  });

  it("draagt residuen per product, niet per 100 g", () => {
    const eerste = EETWIJZER_FRUIT[0];
    expect(eerste).toHaveProperty("residuen");
    expect(eerste).not.toHaveProperty("per100g");
    expect(eerste).not.toHaveProperty("nutrientValue");
  });
});
