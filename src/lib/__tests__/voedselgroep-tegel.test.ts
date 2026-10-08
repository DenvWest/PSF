import { describe, expect, it } from "vitest";
import { FOOD_CATALOG } from "@/data/nutrition/food-catalog";
import { CATEGORIE_MOTIEF, tegelVoorNevoGroep, VOEDSELGROEP_TEGEL } from "@/lib/voedselgroep-tegel";

describe("voedselgroep-tegel", () => {
  it("heeft een tegel voor elke voedselgroep die de catalogus gebruikt", () => {
    for (const entry of FOOD_CATALOG) {
      expect(VOEDSELGROEP_TEGEL[entry.groep], `${entry.key} (${entry.groep})`).toBeDefined();
    }
  });

  it("geeft elke tegel een motief en een label", () => {
    for (const tegel of Object.values(VOEDSELGROEP_TEGEL)) {
      expect(tegel.motief.length).toBeGreaterThan(0);
      expect(tegel.label.length).toBeGreaterThan(0);
    }
  });

  it("vertaalt een NEVO-groep naar onze tegel", () => {
    expect(tegelVoorNevoGroep("Vis, schaal- en schelpdieren")).toBe(VOEDSELGROEP_TEGEL.vis);
    expect(tegelVoorNevoGroep("Kaas")).toEqual({ motief: "kaas", label: VOEDSELGROEP_TEGEL.zuivel.label });
    expect(tegelVoorNevoGroep("Brood").motief).toBe("brood");
  });

  it("heeft een motief voor elke categorie die de catalogus gebruikt", () => {
    for (const entry of FOOD_CATALOG) {
      expect(CATEGORIE_MOTIEF[entry.category], `${entry.key} (${entry.category})`).toBeDefined();
    }
  });

  it("valt terug op een neutrale tegel voor een groep zonder eigen icoon", () => {
    expect(tegelVoorNevoGroep("Kruiden en specerijen").label).toBe("Voedingsmiddel");
    expect(tegelVoorNevoGroep("bestaat niet").label).toBe("Voedingsmiddel");
  });
});
