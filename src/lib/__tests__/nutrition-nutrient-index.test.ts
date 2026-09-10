import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  nutrientBronnen,
  beschrijfBijdrage,
  beschrijfSom,
  opnameOordeelVoorSelectie,
} from "@/lib/nutrition-nutrient-index";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";
import { catalogEntry } from "@/data/nutrition/food-catalog";

describe("randvoorwaarde 1 — rangschikken op bijdrage per portie", () => {
  it("sorteert aflopend op de onderkant van de band, niet op het gehalte per 100 g", () => {
    for (const nutrient of NUTRIENT_IDS) {
      const { regels } = nutrientBronnen(nutrient);
      const onderkanten = regels.map((r) => r.band.lo);
      expect(
        onderkanten,
        `${nutrient} staat niet aflopend op band.lo`,
      ).toEqual([...onderkanten].sort((a, b) => b - a));
    }
  });

  it("rekent met een echte portie — tahin wordt niet op 100 g afgerekend", () => {
    const { regels } = nutrientBronnen("magnesium");
    const tahin = regels.find((r) => r.key === "tahin");
    expect(tahin).toBeDefined();
    // De catalogus noemt een eetlepel van 20 g; niemand eet 100 g tahin.
    expect(tahin?.portieGrams ?? catalogEntry("tahin")?.porties[0].grams).toBeLessThan(100);
  });

  it("gebruikt de eerste catalogusportie waar een gehalte per 100 g bestaat", () => {
    const { regels } = nutrientBronnen("magnesium");
    const amandelen = regels.find((r) => r.key === "hazelnoten");
    expect(amandelen?.portieBron).toBe("catalogus");
    expect(amandelen?.portieGrams).toBe(catalogEntry("hazelnoten")?.porties[0].grams);
  });
});

describe("randvoorwaarde 2 — een band, geen punt", () => {
  it("geeft elke regel een band waarin de puntwaarde valt", () => {
    for (const nutrient of NUTRIENT_IDS) {
      for (const regel of nutrientBronnen(nutrient).regels) {
        expect(regel.band.lo, `${nutrient}/${regel.key}`).toBeLessThanOrEqual(regel.band.hi);
        expect(regel.band.point).toBeGreaterThanOrEqual(regel.band.lo);
        expect(regel.band.point).toBeLessThanOrEqual(regel.band.hi);
      }
    }
  });

  it("noemt een som altijd 'minstens' — een ondergrens bewijst gehaald, nooit niet-gehaald", () => {
    for (const nutrient of NUTRIENT_IDS) {
      const { regels } = nutrientBronnen(nutrient, { limiet: 3 });
      const zin = beschrijfSom(nutrient, regels);
      expect(zin, `${nutrient}`).toContain("Minstens");
      expect(zin).toContain("uit de bronnen die je noemde");
    }
  });

  it("houdt één eenheid per stof aan", () => {
    for (const nutrient of NUTRIENT_IDS) {
      const { regels, unit } = nutrientBronnen(nutrient);
      for (const regel of regels) {
        expect(regel.unit, `${nutrient}/${regel.key}`).toBe(unit);
      }
    }
  });
});

describe("randvoorwaarde 3 — de opname telt mee, maar de ratio is een maaltijdeigenschap", () => {
  it("annoteert magnesium en zink op lijstniveau, en laat de andere stoffen met rust", () => {
    expect(nutrientBronnen("magnesium").opnameAnnotatie).toContain("Fytaat");
    expect(nutrientBronnen("zinc").opnameAnnotatie).toContain("Fytaat");
    expect(nutrientBronnen("protein").opnameAnnotatie).toBeNull();
    expect(nutrientBronnen("vitamin_d").opnameAnnotatie).toBeNull();
  });

  it("markeert fytaatrijke bronnen per regel, zodat ze niet te hoog lezen", () => {
    const { regels } = nutrientBronnen("magnesium");
    const geremd = regels.filter((r) => r.opname.reduced);
    expect(geremd.length).toBeGreaterThan(0);
    for (const regel of geremd) {
      expect(regel.opname.why, `${regel.key} mist een reden`).toBeTruthy();
    }
  });

  it("berekent nergens een fytaat:zink-verhouding per product — die hoort op maaltijdniveau", () => {
    const { regels } = nutrientBronnen("zinc");
    for (const regel of regels) {
      expect(Object.keys(regel)).not.toContain("ratio");
      expect(Object.keys(regel.opname)).toEqual(["reduced", "why"]);
    }
    // Het maaltijdoordeel bestaat wél, en alleen daar.
    const oordeel = opnameOordeelVoorSelectie("zinc", regels.filter((r) => r.opname.reduced));
    expect(oordeel).toContain("hele maaltijd");
    expect(opnameOordeelVoorSelectie("protein", regels)).toBeNull();
  });
});

describe("randvoorwaarde 4 — geen gezondheidsclaim, en de poort blijft onafhankelijk", () => {
  const VERBODEN = [
    "supplement",
    "nodig",
    "voldoende",
    "aanbevolen dagelijkse",
    "%",
    "ADH",
  ];

  it("beschrijft een product zonder claim, zonder ADH en zonder percentage", () => {
    for (const nutrient of NUTRIENT_IDS) {
      for (const regel of nutrientBronnen(nutrient, { limiet: 5 }).regels) {
        const zin = beschrijfBijdrage(regel, nutrient);
        for (const woord of VERBODEN) {
          expect(zin.toLowerCase(), `${nutrient}/${regel.key}: "${zin}"`).not.toContain(
            woord.toLowerCase(),
          );
        }
      }
    }
  });

  it("kent de poort niet — resolveNutritionGate hangt aan de check, niet aan een productlijst", () => {
    const bron = fs.readFileSync(
      path.join(process.cwd(), "src/lib/nutrition-nutrient-index.ts"),
      "utf8",
    );
    // Alleen de moduledoc mag hem noemen; geen import, geen aanroep.
    expect(bron).not.toMatch(/import[^;]*resolveNutritionGate/);
    expect(bron).not.toMatch(/resolveNutritionGate\s*\(/);
  });
});

describe("filteren en samenvoegen", () => {
  it("filtert op zoekcategorie, inclusief wat er via ookIn bij hoort", () => {
    const { regels } = nutrientBronnen("magnesium", { categorieen: ["noten", "zaden"] });
    expect(regels.length).toBeGreaterThan(0);
    for (const regel of regels) {
      const inCategorie =
        regel.category === "noten" ||
        regel.category === "zaden" ||
        regel.ookIn.includes("noten") ||
        regel.ookIn.includes("zaden");
      expect(inCategorie, `${regel.key} hoort niet in noten/zaden`).toBe(true);
    }
  });

  it("toont catalogusregels die één bron delen als één regel, met de varianten erbij", () => {
    const { regels } = nutrientBronnen("zinc");
    const linzen = regels.filter((r) => r.labelNl.toLowerCase().includes("linzen"));
    // Vier catalogusregels (basis + rood/groen/bruin) delen één gehalte.
    expect(linzen).toHaveLength(1);
    expect(linzen[0].ookGeldigVoor.length).toBeGreaterThan(0);
  });

  it("respecteert de limiet", () => {
    expect(nutrientBronnen("magnesium", { limiet: 3 }).regels).toHaveLength(3);
  });

  it("telt hoeveel getoonde regels een geverifieerd gehalte dragen", () => {
    const lijst = nutrientBronnen("magnesium", { limiet: 5 });
    expect(lijst.geverifieerd).toBeLessThanOrEqual(lijst.regels.length);
    expect(lijst.geverifieerd).toBeGreaterThan(0);
  });
});
