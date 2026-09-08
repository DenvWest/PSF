import { describe, expect, it } from "vitest";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  bouwDagboekSamenvatting,
  patroonVoorStof,
  samenvattingRegel,
} from "@/lib/nutrition-dagboek-samenvatting";
import { bouwDagstrip, dagTitel } from "@/lib/nutrition-dagstrip";

function dag(date: string, keys: string[]): DagboekDag {
  return {
    date,
    soort: "doordeweeks",
    porties: {},
    items: { avondeten: keys.map((key) => ({ key, porties: 1 })) },
  };
}

describe("bouwDagboekSamenvatting", () => {
  it("telt alleen dagen met inhoud", () => {
    const samenvatting = bouwDagboekSamenvatting([
      dag("2026-09-06", ["zalm"]),
      dag("2026-09-05", []),
      dag("2026-09-04", ["spinazie", "havermout"]),
    ]);
    expect(samenvatting.ingevuldeDagen).toBe(2);
    expect(samenvatting.producten).toBe(3);
    expect(samenvatting.laatsteDag).toBe("2026-09-06");
  });

  it("zegt op hoeveel dagen een stof langskwam, niet hoeveel milligram", () => {
    const samenvatting = bouwDagboekSamenvatting([
      dag("2026-09-06", ["zalm"]),
      dag("2026-09-05", ["zalm"]),
    ]);
    const omega = patroonVoorStof(samenvatting, "omega3");
    expect(omega?.dagen).toBe(2);
    expect(omega?.vanDagen).toBe(2);
  });

  it("houdt het venster aan", () => {
    const dagen = Array.from({ length: 20 }, (_, i) =>
      dag(`2026-09-${String(20 - i).padStart(2, "0")}`, ["spinazie"]),
    );
    expect(bouwDagboekSamenvatting(dagen, 14).ingevuldeDagen).toBe(14);
  });

  it("velt geen oordeel over het aantal dagen", () => {
    expect(samenvattingRegel(bouwDagboekSamenvatting([]))).toBe("Nog geen dagen ingevuld.");
    expect(samenvattingRegel(bouwDagboekSamenvatting([dag("2026-09-06", ["ei"])]))).toBe(
      "1 dag ingevuld in de laatste 14, samen 1 product.",
    );
  });
});

describe("bouwDagstrip", () => {
  it("zet vandaag rechts en loopt zeven dagen terug", () => {
    const strip = bouwDagstrip("2026-09-08");
    expect(strip).toHaveLength(7);
    expect(strip[0].date).toBe("2026-09-02");
    expect(strip[6].date).toBe("2026-09-08");
    expect(strip[6].isVandaag).toBe(true);
  });

  it("merkt weekenddagen", () => {
    const strip = bouwDagstrip("2026-09-08");
    const zaterdag = strip.find((rij) => rij.date === "2026-09-05")!;
    const maandag = strip.find((rij) => rij.date === "2026-09-07")!;
    expect(zaterdag.isWeekend).toBe(true);
    expect(maandag.isWeekend).toBe(false);
  });

  it("laat de punt uit het korte weekdaglabel", () => {
    for (const dagRij of bouwDagstrip("2026-09-08")) {
      expect(dagRij.kortLabel).not.toContain(".");
    }
  });
});

describe("dagTitel", () => {
  it("noemt vandaag en gisteren bij naam", () => {
    expect(dagTitel("2026-09-08", "2026-09-08")).toBe("Vandaag");
    expect(dagTitel("2026-09-07", "2026-09-08")).toBe("Gisteren");
    expect(dagTitel("2026-09-05", "2026-09-08")).toMatch(/zaterdag/);
  });
});
