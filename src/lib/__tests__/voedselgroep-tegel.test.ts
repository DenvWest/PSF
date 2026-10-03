import { describe, expect, it } from "vitest";
import { FOOD_CATALOG } from "@/data/nutrition/food-catalog";
import { tegelVoorNevoGroep, VOEDSELGROEP_TEGEL } from "@/lib/voedselgroep-tegel";

describe("voedselgroep-tegel", () => {
  it("heeft een tegel voor elke voedselgroep die de catalogus gebruikt", () => {
    for (const entry of FOOD_CATALOG) {
      expect(VOEDSELGROEP_TEGEL[entry.groep], `${entry.key} (${entry.groep})`).toBeDefined();
    }
  });

  it("geeft elke tegel een icoon en een label", () => {
    for (const tegel of Object.values(VOEDSELGROEP_TEGEL)) {
      expect(tegel.icoon.length).toBeGreaterThan(0);
      expect(tegel.label.length).toBeGreaterThan(0);
    }
  });

  it("vertaalt een NEVO-groep naar onze tegel", () => {
    expect(tegelVoorNevoGroep("Vis, schaal- en schelpdieren")).toBe(VOEDSELGROEP_TEGEL.vis);
    expect(tegelVoorNevoGroep("Kaas")).toBe(VOEDSELGROEP_TEGEL.zuivel);
  });

  it("valt terug op een neutrale tegel voor een groep zonder eigen icoon", () => {
    expect(tegelVoorNevoGroep("Kruiden en specerijen").label).toBe("Voedingsmiddel");
    expect(tegelVoorNevoGroep("bestaat niet").label).toBe("Voedingsmiddel");
  });
});
