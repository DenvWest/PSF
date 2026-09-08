import { describe, expect, it } from "vitest";
import { MICRONUTRIENTEN, getMicronutrient } from "@/data/nutrition/micronutrients";
import { VOEDINGSMIDDELEN, getVoedingsmiddel } from "@/data/nutrition/food-items";
import {
  bijdrageNiveau,
  bijdragenVanProduct,
  bronnenVoorStof,
  deelVanReferentie,
  hoeveelheidPerPortie,
  zoekVoedingsmiddelen,
  BRON_DREMPEL,
  RIJK_DREMPEL,
} from "@/lib/micronutrient-index";

describe("de micronutriënt-tabel zelf", () => {
  it("kent voor elke stof een referentie en een eenheid", () => {
    for (const stof of MICRONUTRIENTEN) {
      expect(stof.referentiePerDag).toBeGreaterThan(0);
      expect(stof.referentieBron.length).toBeGreaterThan(0);
      expect(["g", "mg", "µg"]).toContain(stof.eenheid);
    }
  });

  it("gebruikt alleen bekende stof-sleutels in de voedingsmiddelen", () => {
    const bekend = new Set(MICRONUTRIENTEN.map((stof) => stof.id));
    for (const product of VOEDINGSMIDDELEN) {
      for (const sleutel of Object.keys(product.per100g)) {
        expect(bekend.has(sleutel as never)).toBe(true);
      }
    }
  });

  it("heeft unieke productsleutels", () => {
    const sleutels = VOEDINGSMIDDELEN.map((product) => product.key);
    expect(new Set(sleutels).size).toBe(sleutels.length);
  });

  it("draagt geen enkele geverifieerde rij zolang NEVO niet is nageslagen", () => {
    // De eerlijke startstand: `verified` bestaat om het verschil zichtbaar te
    // houden, niet om het te vergeten. Deze test valt om zodra iemand een rij
    // op true zet — dan hoort er ook een broncode bij te staan.
    for (const product of VOEDINGSMIDDELEN) {
      if (product.verified) {
        expect(product.bron).not.toBe("literatuur");
      }
    }
  });
});

describe("hoeveelheidPerPortie", () => {
  it("rekent van 100 g naar de portie van dit product", () => {
    const paranoot = getVoedingsmiddel("paranoten")!;
    // 1917 µg selenium per 100 g, portie 10 g.
    expect(hoeveelheidPerPortie(paranoot, "selenium")).toBeCloseTo(191.7, 1);
  });

  it("geeft null voor een stof die dit product niet noemenswaard levert", () => {
    expect(hoeveelheidPerPortie(getVoedingsmiddel("komkommer")!, "vitamine_b12")).toBeNull();
  });
});

describe("bijdrageNiveau", () => {
  it("volgt de etiketteringsgrenzen uit Vo. 1169/2011", () => {
    expect(bijdrageNiveau(RIJK_DREMPEL)).toBe("rijk");
    expect(bijdrageNiveau(BRON_DREMPEL)).toBe("bron");
    expect(bijdrageNiveau(0.05)).toBe("spoor");
    expect(bijdrageNiveau(0.04)).toBeNull();
  });
});

describe("bijdragenVanProduct", () => {
  it("sorteert op aandeel van de referentie, niet op de rauwe hoeveelheid", () => {
    // Een banaan levert 430 mg kalium en 0,44 mg B6. Op rauwe getallen zou
    // kalium winnen; op aandeel van de dagreferentie is B6 de zwaarste.
    const banaan = getVoedingsmiddel("banaan")!;
    const rijen = bijdragenVanProduct(banaan);
    expect(rijen[0].stof.id).toBe("vitamine_b6");
    expect(rijen.map((rij) => rij.deel)).toEqual(
      [...rijen.map((rij) => rij.deel)].sort((a, b) => b - a),
    );
  });

  it("respecteert een ondergrens en een maximum", () => {
    const spinazie = getVoedingsmiddel("spinazie")!;
    const rijk = bijdragenVanProduct(spinazie, { minNiveau: "rijk", max: 2 });
    expect(rijk.length).toBeLessThanOrEqual(2);
    for (const rij of rijk) {
      expect(rij.niveau).toBe("rijk");
    }
  });
});

describe("bronnenVoorStof", () => {
  it("levert alle bronnen, niet een top-vijf", () => {
    // De belofte van het overzicht is volledigheid: elk product in de tabel
    // dat de ondergrens haalt, staat erin.
    const bronnen = bronnenVoorStof("magnesium");
    const zelfGeteld = VOEDINGSMIDDELEN.filter((product) => {
      const deel = deelVanReferentie(product, "magnesium");
      return deel != null && deel >= 0.05;
    });
    expect(bronnen.length).toBe(zelfGeteld.length);
    expect(bronnen.length).toBeGreaterThan(20);
  });

  it("sorteert op de bijdrage van één portie, niet per 100 g", () => {
    // Pompoenpitten zijn per 100 g de dichtste magnesiumbron van de tabel,
    // maar de portie is 20 g. Een lijst op 100 g zou zaden altijd bovenaan
    // zetten; deze lijst gaat over borden.
    const bronnen = bronnenVoorStof("magnesium");
    for (let i = 1; i < bronnen.length; i += 1) {
      expect(bronnen[i - 1].deel).toBeGreaterThanOrEqual(bronnen[i].deel);
    }
  });

  it("filtert op voedselgroep zonder de volgorde te breken", () => {
    const groente = bronnenVoorStof("foliumzuur", { groepen: ["groente"] });
    expect(groente.length).toBeGreaterThan(0);
    for (const bron of groente) {
      expect(bron.product.groep).toBe("groente");
    }
  });

  it("noemt de eenheid van de stof in het label", () => {
    const bronnen = bronnenVoorStof("vitamine_d");
    expect(bronnen[0].hoeveelheidLabel).toMatch(/µg$/);
    expect(getMicronutrient("vitamine_d")!.eenheid).toBe("µg");
  });
});

describe("zoekVoedingsmiddelen", () => {
  it("vindt op woord, niet op de hele invoer", () => {
    const treffers = zoekVoedingsmiddelen("kaas 48");
    expect(treffers.map((product) => product.key)).toContain("kaas-48");
  });

  it("negeert diakrieten", () => {
    expect(zoekVoedingsmiddelen("huttenkase").map((p) => p.key)).toContain("huttenkase");
  });

  it("zoekt ook op synoniem", () => {
    expect(zoekVoedingsmiddelen("porridge").map((p) => p.key)).toContain("havermout");
  });

  it("geeft niets terug bij een lege term", () => {
    expect(zoekVoedingsmiddelen("   ")).toEqual([]);
  });
});
