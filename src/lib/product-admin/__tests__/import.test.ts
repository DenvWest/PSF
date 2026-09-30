import { describe, expect, it } from "vitest";
import {
  IMPORT_MAX_ROWS,
  IMPORT_TEMPLATE,
  parseCsv,
  planImport,
  summarizePlan,
  type ImportContext,
} from "@/lib/product-admin/import";

const context: ImportContext = {
  brands: [{ id: "b1", name: "Vital Nutrition", slug: "vital-nutrition" }],
  categories: [
    { id: "c1", name: "Beste magnesium", slug: "magnesium" },
    { id: "c2", name: "Eiwitpoeder", slug: "eiwitpoeder" },
  ],
  retailers: [{ id: "r1", name: "VitalNutrition", slug: "vitalnutrition" }],
  existingSlugs: new Set(["vital-nutrition-zink"]),
  allowNewBrands: false,
};

const header = "merk;naam;categorie;variant;vorm;product_url;retailer;prijs;affiliate_url";

function plan(lines: string[], over: Partial<ImportContext> = {}) {
  const parsed = parseCsv([header, ...lines].join("\n"));
  expect(parsed.error).toBeNull();
  return planImport(parsed.rows, { ...context, ...over });
}

describe("parseCsv", () => {
  it("leest puntkomma en komma, BOM en aanhalingstekens", () => {
    const semi = parseCsv("﻿merk;naam;categorie\nA;B;c");
    expect(semi.rows[0]).toMatchObject({ merk: "A", naam: "B", categorie: "c" });
    const comma = parseCsv('merk,naam,categorie\n"Mer, k","Na ""m""",c');
    expect(comma.rows[0]).toMatchObject({ merk: "Mer, k", naam: 'Na "m"' });
  });

  it("meldt ontbrekende verplichte kolommen, leeg bestand en te veel regels", () => {
    expect(parseCsv("merk;naam\nA;B").error).toContain("categorie");
    expect(parseCsv("   \n").error).not.toBeNull();
    const many = [header, ...Array.from({ length: IMPORT_MAX_ROWS + 1 }, (_, i) => `M;N${i};magnesium;;;;;;`)].join("\n");
    expect(parseCsv(many).error).toContain("Te veel");
  });

  it("nummert regels vanaf de tweede regel (kopregel = 1)", () => {
    expect(parseCsv("merk;naam;categorie\nA;B;c\nD;E;f").rows.map((r) => r.__line)).toEqual(["2", "3"]);
  });

  it("de sjabloonregel is zelf een geldige import", () => {
    const parsed = parseCsv(IMPORT_TEMPLATE);
    expect(parsed.error).toBeNull();
    const [row] = planImport(parsed.rows, context);
    expect(row.status).toBe("ok");
    expect(row.offer?.priceCents).toBe(2495);
  });
});

describe("planImport", () => {
  it("accepteert een geldige regel en bepaalt de slug", () => {
    const [row] = plan(["Vital Nutrition;Magnesium Bisglycinaat;magnesium;;capsule;;;;"]);
    expect(row).toMatchObject({ status: "ok", slug: "vital-nutrition-magnesium-bisglycinaat", categoryId: "c1", brandId: "b1" });
  });

  it("herkent categorie en merk ook op naam en zonder hoofdletters", () => {
    const [row] = plan(["vital nutrition;X;Eiwitpoeder;;;;;;"]);
    expect(row).toMatchObject({ status: "ok", categoryId: "c2", brandId: "b1" });
  });

  it("markeert een bestaand product als dubbel", () => {
    const [row] = plan(["Vital Nutrition;Zink;magnesium;;;;;;"]);
    expect(row.status).toBe("duplicate");
  });

  it("markeert een dubbele regel binnen het bestand", () => {
    const rows = plan(["Vital Nutrition;Nieuw;magnesium;;;;;;", "Vital Nutrition;Nieuw;magnesium;;;;;;"]);
    expect(rows.map((r) => r.status)).toEqual(["ok", "duplicate"]);
  });

  it("wijst onbekend merk af, tenzij nieuwe merken zijn toegestaan", () => {
    expect(plan(["Onbekend;X;magnesium;;;;;;"])[0].status).toBe("error");
    const [row] = plan(["Onbekend;X;magnesium;;;;;;"], { allowNewBrands: true });
    expect(row).toMatchObject({ status: "ok", newBrand: true, brandId: null });
  });

  it("wijst onbekende categorie, lege naam en slechte URL af", () => {
    expect(plan(["Vital Nutrition;X;bestaat-niet;;;;;;"])[0].status).toBe("error");
    expect(plan(["Vital Nutrition;;magnesium;;;;;;"])[0].status).toBe("error");
    expect(plan(["Vital Nutrition;X;magnesium;;;javascript:1;;;"])[0].status).toBe("error");
  });

  it("valideert de aanbieding: retailer en prijs horen bij elkaar", () => {
    expect(plan(["Vital Nutrition;X;magnesium;;;;vitalnutrition;;"])[0].status).toBe("error");
    expect(plan(["Vital Nutrition;X;magnesium;;;;bestaat-niet;10,00;"])[0].status).toBe("error");
    expect(plan(["Vital Nutrition;X;magnesium;;;;vitalnutrition;-5;"])[0].status).toBe("error");
    const [row] = plan(["Vital Nutrition;X;magnesium;;;;vitalnutrition;10,50;https://a.nl/x"]);
    expect(row.offer).toEqual({ retailerId: "r1", priceCents: 1050, affiliateUrl: "https://a.nl/x" });
  });

  it("vat samen, en telt een nieuw merk maar één keer", () => {
    const rows = plan(
      [
        "Vital Nutrition;A;magnesium;;;;;;",
        "Vital Nutrition;Zink;magnesium;;;;;;",
        "Nieuw Merk;B;magnesium;;;;;;",
        "nieuw merk;C;magnesium;;;;;;",
        "Vital Nutrition;;magnesium;;;;;;",
      ],
      { allowNewBrands: true },
    );
    expect(summarizePlan(rows)).toEqual({ total: 5, ok: 3, duplicates: 1, errors: 1, newBrands: 1 });
  });
});
