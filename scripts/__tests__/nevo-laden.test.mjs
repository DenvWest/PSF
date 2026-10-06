import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { KOLOM_NAAR_NEVO, controleerEenheden, naarNevoFood } from "../nevo-laden.mjs";

const voedingsmiddel = {
  code: "1590",
  naam: "Tonijn blik in water",
  engelseNaam: "Tuna",
  groep: "Vis",
  per: "100g",
  stoffen: {
    PROT: { w: 24.9 },
    FE: { w: 0, spoor: true },
    CA: { w: 12, verrijkt: true },
  },
};

describe("naarNevoFood", () => {
  it("neemt een waarde ongewijzigd over, met code en versie", () => {
    const food = naarNevoFood(voedingsmiddel);
    expect(food.waarden.protein_g).toBe(24.9);
    expect(food.nevoCode).toBe("1590");
    expect(food.prodId).toBe("nevo:1590");
    expect(food.nevoVersie).toBe("2025/9.0");
  });

  it("maakt van een spoor (TR) een null, niet een 0, en noteert de kolom", () => {
    const food = naarNevoFood(voedingsmiddel);
    expect(food.waarden.iron_mg).toBeNull();
    expect(food.spoor).toEqual(["iron_mg"]);
  });

  it("laat een niet gemeten stof null, en noteert verrijking", () => {
    const food = naarNevoFood(voedingsmiddel);
    expect(food.waarden.zinc_mg).toBeNull();
    expect(food.waarden.calcium_mg).toBe(12);
    expect(food.verrijkt).toEqual(["calcium_mg"]);
  });
});

describe("controleerEenheden", () => {
  const goed = Object.fromEntries(Object.values(KOLOM_NAAR_NEVO).map(({ code, eenheid }) => [code, { eenheid }]));

  it("accepteert de verwachte eenheden", () => {
    expect(controleerEenheden(goed)).toEqual([]);
  });

  it("weigert een afwijkende eenheid in plaats van stil om te rekenen", () => {
    const fouten = controleerEenheden({ ...goed, MG: { eenheid: "g" } });
    expect(fouten).toHaveLength(1);
    expect(fouten[0]).toContain("magnesium_mg");
  });

  it("meldt een ontbrekende stof", () => {
    const { PROT, ...zonder } = goed;
    void PROT;
    expect(controleerEenheden(zonder)[0]).toContain("PROT");
  });
});

describe("kolommen", () => {
  it("dekt precies dezelfde kolommen als het TS-type en de migratie", () => {
    const kolommen = Object.keys(KOLOM_NAAR_NEVO).sort();
    const ts = fs.readFileSync("src/types/nevo-food.ts", "utf8");
    const uitTs = [...ts.slice(ts.indexOf("NEVO_WAARDE_KOLOMMEN"), ts.indexOf("] as const")).matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1]).sort();
    expect(uitTs).toEqual(kolommen);
    const sql = [
      "supabase/migrations/20261003120000_nevo_foods.sql",
      "supabase/migrations/20261006180000_nevo_foods_transvet.sql",
    ]
      .map((pad) => fs.readFileSync(pad, "utf8"))
      .join("\n");
    for (const kolom of kolommen) {
      expect(sql, kolom).toMatch(new RegExp(`^\\s+(add column if not exists )?${kolom} numeric`, "m"));
    }
  });

  it("neemt geen omega-3 mee", () => {
    const codes = Object.values(KOLOM_NAAR_NEVO).map((k) => k.code);
    expect(codes.some((c) => /^F20:5|^F22:6/.test(c))).toBe(false);
  });
});
