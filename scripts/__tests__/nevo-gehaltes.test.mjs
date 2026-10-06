import { describe, expect, it } from "vitest";
import { bouwBestand, gehaltesVoor } from "../nevo-gehaltes.mjs";

const stoffen = (lijst) => Object.fromEntries(lijst.map(([code, w, spoor]) => [code, { w, ...(spoor ? { spoor: true } : {}) }]));

describe("gehaltesVoor", () => {
  it("schrijft positieve waarden als getal en een kernstof met 0 of spoor apart", () => {
    const gehaltes = gehaltesVoor(
      { per: "100g", stoffen: stoffen([["MG", 35], ["VITD", 0], ["ZN", 0, true], ["K", 0]]) },
      "groenten",
    );
    expect(gehaltes).toEqual({ magnesium_mg: 35, nul: ["vitamin_d_ug"], spoor: ["zinc_mg"] });
  });

  it("laat een stof die NEVO niet kent overal weg", () => {
    expect(gehaltesVoor({ per: "100g", stoffen: stoffen([["MG", 12]]) }, "groenten")).toEqual({ magnesium_mg: 12 });
  });

  it("schrijft EPA en DHA buiten vis niet als getal, maar een gemeten 0 wel als nul", () => {
    const gehaltes = gehaltesVoor(
      { per: "100g", stoffen: stoffen([["F20:5CN3", 0], ["F22:6CN3", 0.01]]) },
      "graan",
    );
    expect(gehaltes).toEqual({ nul: ["epa_g"] });
  });

  it("slaat alles per 100 ml over", () => {
    expect(gehaltesVoor({ per: "100ml", stoffen: stoffen([["MG", 5]]) }, "dranken")).toBeNull();
  });
});

describe("bouwBestand", () => {
  it("schrijft nul/spoor als lijst en benaderingen met naam in een eigen blok", () => {
    const tekst = bouwBestand(
      [["spinazie", "1146", { magnesium_mg: 35, nul: ["vitamin_d_ug"] }]],
      [["broccoli-diepvries", "920", "Broccoli gekookt", { magnesium_mg: 19 }]],
    );
    expect(tekst).toContain('"spinazie": { code: "1146", magnesium_mg: 35, nul: ["vitamin_d_ug"] },');
    expect(tekst).toContain('"broccoli-diepvries": { code: "920", naam: "Broccoli gekookt", magnesium_mg: 19 },');
  });
});
