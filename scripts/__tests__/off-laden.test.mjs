import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afwijzing, leesRijen, naarTabelRij } from "../off-laden.mjs";

const GOED = {
  prod_id: "off:8710400123456",
  bron: "off",
  bron_id: "8710400123456",
  snapshot_datum: "2026-10-04",
  naam: "Halfvolle melk",
  merk: "Campina",
  categorie: "Melk",
  zoek_tekst: "halfvolle melk campina",
  energy_kcal: 47,
  fat_g: 1.5,
  protein_g: 3.4,
  calcium_mg: null,
};

describe("afwijzing", () => {
  it("laat een goede rij door", () => {
    expect(afwijzing(GOED)).toBeNull();
  });

  it("weigert een andere bron dan off (ODbL §4.4.d)", () => {
    expect(afwijzing({ ...GOED, bron: "nevo", prod_id: "nevo:1" })).toBe("bron_niet_off");
  });

  it("weigert een prod_id dat niet bij bron en bron_id past", () => {
    expect(afwijzing({ ...GOED, prod_id: "off:999" })).toBe("prod_id");
  });

  it("weigert onmogelijke waarden, maar niet null", () => {
    expect(afwijzing({ ...GOED, energy_kcal: 1200 })).toBe("waarde_energy_kcal");
    expect(afwijzing({ ...GOED, fat_g: -1 })).toBe("waarde_fat_g");
    expect(afwijzing({ ...GOED, calcium_mg: null })).toBeNull();
  });

  it("weigert een rij zonder geldige snapshotdatum", () => {
    expect(afwijzing({ ...GOED, snapshot_datum: "vandaag" })).toBe("snapshot_datum");
  });
});

describe("naarTabelRij", () => {
  it("neemt alleen tabelkolommen mee en vult ontbrekende stoffen met null, niet 0", () => {
    const rij = naarTabelRij({ ...GOED, ingredienten: "geheim" }, "2026-10-04T00:00:00.000Z");
    expect(rij).not.toHaveProperty("ingredienten");
    expect(rij.iron_mg).toBeNull();
    expect(rij.energy_kcal).toBe(47);
    expect(rij.updated_at).toBe("2026-10-04T00:00:00.000Z");
  });
});

describe("leesRijen", () => {
  it("noemt het regelnummer van een kapotte regel", () => {
    const bestand = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "off-laden-")), "off.ndjson");
    fs.writeFileSync(bestand, `${JSON.stringify(GOED)}\n{"energy_kcal": NaN}\n`);
    expect(() => leesRijen(bestand)).toThrow("regel 2");
  });
});
