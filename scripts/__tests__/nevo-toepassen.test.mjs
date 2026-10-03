import { describe, expect, it } from "vitest";
import { gramsVoorPortie, pasToe, portieBedrag, zetRijOm } from "../nevo-toepassen.mjs";

const USDA_RIJ = `    key: "kipfilet",
    labelNl: "Kipfilet",
    portionNl: "100 g",
    amount: 22.5,
    portionGroup: "other",
    source: usda("171477", "SR Legacy"),
    nutrientValue: {
      value: 22.5,
      unit: "g",
      per: "100g",
      source: usda("171477", "SR Legacy"),
      sourceNameNl: "Chicken, breast, raw",
      observed: { min: 21, max: 24, samples: 3 },
    },
    verified: true,
    variability: "low",`;

const LEGE_RIJ = `    key: "seitan",
    labelNl: "Seitan",
    portionNl: "100 g",
    amount: 19,
    portionGroup: "other",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",`;

const NEVO = {
  voedingsmiddelen: [
    { code: "1634", naam: "Kipfilet rauw", per: "100g", stoffen: { PROT: { w: 23.3 } } },
    { code: "1458", naam: "Seitan gekruid", per: "100g", stoffen: { PROT: { w: 28.4 } } },
    { code: "9", naam: "Melk", per: "100ml", stoffen: { PROT: { w: 3.3 } } },
    { code: "8", naam: "Iets met spoor", per: "100g", stoffen: { PROT: { w: 0, spoor: true } } },
  ],
  stoffen: { PROT: { code: "PROT", naam: "Eiwit", eenheid: "g" } },
};

const bestand = (rijen) => `const PROTEIN_SOURCES: readonly FoodSource[] = [
${rijen.map((r) => `  {\n${r}\n  },`).join("\n")}
];

const MAGNESIUM_SOURCES: readonly FoodSource[] = [
];
`;

const beslis = (toepassen) => ({ regel: "r", toepassen, voorleggen: [], blijft: [] });

describe("gramsVoorPortie", () => {
  it("leest de gram uit de portie-omschrijving", () => {
    expect(gramsVoorPortie({ portie: "150 g gekookt" })).toBe(150);
    expect(gramsVoorPortie({ portie: "1 stuk (120 g)" })).toBe(120);
    expect(gramsVoorPortie({ portie: "200 ml (glas)" })).toBe(200);
    expect(gramsVoorPortie({ portie: "½ stuk (100 g)" })).toBe(100);
  });

  it("valt terug op de verhouding tussen oud bedrag en oude waarde, afgerond op 5 g", () => {
    expect(gramsVoorPortie({ portie: "2 stuks", oudeWaarde: 1.29, oudBedrag: 1.3 })).toBe(100);
    expect(gramsVoorPortie({ portie: "2 sneden", oudeWaarde: 75, oudBedrag: 52.5 })).toBe(70);
  });

  it("geeft null als de portie niet te bepalen is, in plaats van te gokken", () => {
    expect(gramsVoorPortie({ portie: "2 stuks", oudeWaarde: null, oudBedrag: null })).toBeNull();
    expect(gramsVoorPortie({ portie: null })).toBeNull();
  });
});

describe("portieBedrag", () => {
  it("rekent hetzelfde om als amountForPortion: recht evenredig en op één decimaal", () => {
    expect(portieBedrag(23.3, 150)).toBe(35);
    expect(portieBedrag(2299, 125)).toBe(2873.8);
  });
});

describe("zetRijOm", () => {
  const nieuw = { code: "1634", naam: "Kipfilet rauw", waarde: 23.3, eenheid: "g" };

  it("zet source, nutrientValue en verified om en haalt de USDA-spreiding weg", () => {
    const { rij, oud } = zetRijOm(USDA_RIJ, nieuw);
    expect(rij).toContain('source: { origin: "nevo", ref: "1634", edition: "2025/9.0" },');
    expect(rij).toContain("value: 23.3,");
    expect(rij).toContain('sourceNameNl: "Kipfilet rauw",');
    expect(rij).toContain('per: "100g",');
    expect(rij).not.toContain("observed");
    expect(rij).not.toContain("usda(");
    expect(rij).toContain("verified: true,");
    expect(oud).toMatchObject({ waarde: 22.5, bron: "usda 171477" });
  });

  it("rekent amount om met de portiegrootte uit portionNl", () => {
    expect(zetRijOm(USDA_RIJ.replace('portionNl: "100 g"', 'portionNl: "150 g"'), nieuw).rij).toContain("amount: 35,");
  });

  it("laat de rest van de rij ongemoeid", () => {
    const { rij } = zetRijOm(USDA_RIJ, nieuw);
    expect(rij).toContain('labelNl: "Kipfilet",');
    expect(rij).toContain('portionGroup: "other",');
    expect(rij).toContain('variability: "low",');
  });

  it("vult een rij zonder brondwaarde in en zet hem op geverifieerd", () => {
    const { rij, oud } = zetRijOm(LEGE_RIJ, { code: "1458", naam: "Seitan gekruid", waarde: 28.4, eenheid: "g" });
    expect(rij).toContain("nutrientValue: {");
    expect(rij).toContain("value: 28.4,");
    expect(rij).toContain("amount: 28.4,");
    expect(rij).toContain("verified: true,");
    expect(rij).not.toContain("UNVERIFIED");
    expect(oud).toMatchObject({ waarde: null, bron: "geen bron", verified: false });
  });

  it("weigert een rij met onbekende opbouw", () => {
    expect(zetRijOm('    key: "x",\n    labelNl: "X",', nieuw).fout).toMatch(/verwachte velden/);
  });
});

describe("pasToe", () => {
  it("zet alleen de genoemde rij om en laat andere rijen byte voor byte staan", () => {
    const tekst = bestand([USDA_RIJ, LEGE_RIJ]);
    const { tekst: uit, wijzigingen, fouten } = pasToe(tekst, beslis([{ stof: "protein", key: "kipfilet", code: "1634" }]), NEVO);
    expect(fouten).toEqual([]);
    expect(wijzigingen).toHaveLength(1);
    expect(uit).toContain('origin: "nevo", ref: "1634"');
    expect(uit).toContain("source: UNVERIFIED,");
    expect(uit.endsWith("const MAGNESIUM_SOURCES: readonly FoodSource[] = [\n];\n")).toBe(true);
  });

  it("is herhaalbaar: een tweede keer toepassen verandert niets meer", () => {
    const beslissingen = beslis([{ stof: "protein", key: "kipfilet", code: "1634" }]);
    const eerste = pasToe(bestand([USDA_RIJ]), beslissingen, NEVO).tekst;
    expect(pasToe(eerste, beslissingen, NEVO).tekst).toBe(eerste);
  });

  it("weigert een NEVO-code die niet bestaat, een spoor en een product per 100 ml", () => {
    const tekst = bestand([USDA_RIJ]);
    const probeer = (code) => pasToe(tekst, beslis([{ stof: "protein", key: "kipfilet", code }]), NEVO);
    expect(probeer("0").fouten[0].reden).toMatch(/niet in het bestand/);
    expect(probeer("8").fouten[0].reden).toMatch(/spoor/);
    expect(probeer("9").fouten[0].reden).toMatch(/100ml/);
    for (const code of ["0", "8", "9"]) expect(probeer(code).tekst).toBe(tekst);
  });

  it("weigert een andere eenheid dan de rij verwacht", () => {
    const nevo = { ...NEVO, stoffen: { PROT: { code: "PROT", naam: "Eiwit", eenheid: "mg" } } };
    const { fouten } = pasToe(bestand([USDA_RIJ]), beslis([{ stof: "protein", key: "kipfilet", code: "1634" }]), nevo);
    expect(fouten[0].reden).toMatch(/eenheid/);
  });

  it("meldt een beslissing voor een rij die niet bestaat", () => {
    const { fouten } = pasToe(bestand([USDA_RIJ]), beslis([{ stof: "protein", key: "bestaat-niet", code: "1634" }]), NEVO);
    expect(fouten[0].reden).toMatch(/niet gevonden/);
  });

  it("raakt omega-3 nooit aan: dat is een som van twee NEVO-waarden", () => {
    const tekst = `const OMEGA3_SOURCES: readonly FoodSource[] = [\n  {\n${USDA_RIJ}\n  },\n];\n`;
    const { tekst: uit, wijzigingen } = pasToe(tekst, beslis([{ stof: "omega3", key: "kipfilet", code: "1634" }]), NEVO);
    expect(wijzigingen).toEqual([]);
    expect(uit).toBe(tekst);
  });
});
