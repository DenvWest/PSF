import { describe, expect, it } from "vitest";
import {
  bouwAanvulRegels,
  bouwKwaliteitBeeld,
  bouwMomentVerdeling,
  momentenMetEiwit,
} from "@/lib/nutrition-lagen-uit-dagboek";
import type { DagItems } from "@/lib/nutrition-dagboek-items";

const DAG: DagItems = {
  ontbijt: [{ key: "havermout", porties: 1 }],
  lunch: [
    { key: "volkorenbrood", porties: 1 },
    { key: "kaas-48", porties: 1 },
  ],
  avondeten: [
    { key: "spinazie", porties: 2 },
    { key: "zalm", porties: 1 },
  ],
  tussendoor: [{ key: "frisdrank", porties: 2 }],
};

describe("bouwKwaliteitBeeld (P2)", () => {
  it("telt porties en niet producten — de laag gaat over frequentie", () => {
    const beeld = bouwKwaliteitBeeld(DAG);
    // 1 havermout + 1 brood + 1 kaas + 2 spinazie + 1 zalm = 6 basis.
    expect(beeld.basis).toBe(6);
    expect(beeld.bewerkt).toBe(2);
    expect(beeld.totaal).toBe(8);
  });

  it("noemt de producten die als bewerkt telden", () => {
    expect(
      bouwKwaliteitBeeld(DAG).bewerkteProducten.map((rij) => rij.product.key),
    ).toEqual(["frisdrank"]);
  });

  it("rekent gezoete dranken mee, ook al staan ze niet in de suiker-groep", () => {
    const beeld = bouwKwaliteitBeeld({ ontbijt: [{ key: "sinaasappelsap", porties: 1 }] });
    expect(beeld.bewerkt).toBe(1);
    expect(beeld.basis).toBe(0);
  });

  it("geeft een leeg beeld voor een lege dag", () => {
    expect(bouwKwaliteitBeeld({}).totaal).toBe(0);
  });
});

describe("bouwMomentVerdeling (P3)", () => {
  it("laat alleen de ingevulde momenten zien", () => {
    const verdeling = bouwMomentVerdeling({ lunch: [{ key: "ei", porties: 2 }] });
    expect(verdeling.map((rij) => rij.moment)).toEqual(["lunch"]);
  });

  it("telt eiwitbronnen per moment in bronnen, niet in grammen", () => {
    const verdeling = bouwMomentVerdeling(DAG);
    const avond = verdeling.find((rij) => rij.moment === "avondeten")!;
    expect(avond.eiwitbronnen).toBe(1);
    expect(avond.plantbronnen).toBe(1);
  });

  it("telt op hoeveel momenten een eiwitbron stond", () => {
    expect(momentenMetEiwit(bouwMomentVerdeling(DAG))).toBeGreaterThan(0);
    expect(momentenMetEiwit(bouwMomentVerdeling({}))).toBe(0);
  });
});

describe("bouwAanvulRegels (P6)", () => {
  it("noemt precies de vijf stoffen met een vergelijkingspad", () => {
    const regels = bouwAanvulRegels(DAG);
    expect(regels).toHaveLength(5);
    for (const regel of regels) {
      expect(regel.comparisonPath.startsWith("/beste/")).toBe(true);
    }
  });

  it("wijst de beste bron van vandaag aan", () => {
    const omega = bouwAanvulRegels(DAG).find((regel) => regel.stof === "omega3")!;
    expect(omega.besteBron?.key).toBe("zalm");
    expect(omega.bronnen).toBeGreaterThan(0);
  });

  it("laat de bron leeg wanneer de dag er niets voor leverde", () => {
    const regels = bouwAanvulRegels({ tussendoor: [{ key: "frisdrank", porties: 1 }] });
    for (const regel of regels) {
      expect(regel.besteBron).toBeNull();
      expect(regel.bronnen).toBe(0);
    }
  });
});
