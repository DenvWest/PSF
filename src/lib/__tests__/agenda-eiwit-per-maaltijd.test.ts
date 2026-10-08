import { describe, expect, it } from "vitest";
import { eiwitPerMaaltijd } from "@/lib/agenda-eiwit-per-maaltijd";
import type { DagboekDag } from "@/lib/nutrition-dagboek";

describe("eiwitPerMaaltijd", () => {
  it("geeft drie lege maaltijden zonder dag", () => {
    const result = eiwitPerMaaltijd(null);
    expect(result.map((m) => m.stand)).toEqual(["leeg", "leeg", "leeg"]);
    expect(result.map((m) => m.id)).toEqual(["ontbijt", "lunch", "avondeten"]);
  });

  it("negeert tussendoor en onbekende items", () => {
    const dag: DagboekDag = {
      date: "2026-10-08",
      soort: "doordeweeks",
      porties: {},
      items: [{ moment: "tussendoor", key: "bestaat-niet", grams: 100 }],
    };
    expect(eiwitPerMaaltijd(dag).every((m) => m.stand === "leeg")).toBe(true);
  });

  it("telt alleen de maaltijd zelf: gehaald, open of leeg", () => {
    const dag: DagboekDag = {
      date: "2026-10-08",
      soort: "doordeweeks",
      porties: {},
      items: [
        { moment: "ontbijt", key: "havermout", grams: 250 },
        { moment: "lunch", key: "havermout", grams: 30 },
      ],
    };
    const [ontbijt, lunch, avondeten] = eiwitPerMaaltijd(dag);
    expect(ontbijt.stand).toBe("gehaald");
    expect(ontbijt.gram).toBeGreaterThanOrEqual(20);
    expect(lunch.stand).toBe("open");
    expect(lunch.gram).toBeLessThan(20);
    expect(avondeten).toMatchObject({ stand: "leeg", gram: null });
  });
});
