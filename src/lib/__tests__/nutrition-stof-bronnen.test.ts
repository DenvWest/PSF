import { describe, expect, it } from "vitest";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { bronnenVanStof, stofPerMoment } from "@/lib/nutrition-stof-bronnen";

const dag = (date: string, capsules: number): DagboekDag => ({
  date,
  soort: "doordeweeks",
  porties: {},
  items: [
    { moment: "ontbijt", bron: "supplement", key: "magnesiumcitraat-capsule", grams: capsules },
    { moment: "ontbijt", bron: "supplement", key: "zinkcitraat-tablet", grams: 1 },
  ] as unknown as DagboekDag["items"],
});

describe("bronnenVanStof", () => {
  it("telt per product op over de periode, alleen voor deze stof en binnen de datums", () => {
    const bronnen = bronnenVanStof(
      [dag("2026-10-01", 1), dag("2026-10-02", 2), dag("2026-09-01", 9)],
      ["2026-10-01", "2026-10-02"],
      "magnesium",
    );
    expect(bronnen).toEqual([
      {
        naam: "Magnesiumcitraat, capsule",
        totaal: 600,
        unit: "mg",
        dagen: 2,
        momenten: [
          { datum: "2026-10-01", moment: "ontbijt" },
          { datum: "2026-10-02", moment: "ontbijt" },
        ],
        supplement: true,
      },
    ]);
  });
});

describe("stofPerMoment", () => {
  it("telt per maaltijd en onderscheidt 'niets van deze stof' van 'niet geregistreerd'", () => {
    const metLunch: DagboekDag = {
      ...dag("2026-10-01", 1),
      items: [
        ...(dag("2026-10-01", 1).items ?? []),
        { moment: "lunch", bron: "supplement", key: "zinkcitraat-tablet", grams: 1 },
      ] as unknown as DagboekDag["items"],
    };
    const perMoment = stofPerMoment([metLunch, dag("2026-10-02", 2)], ["2026-10-01", "2026-10-02"], "magnesium");
    expect(perMoment.map(({ moment, totaal, keer }) => ({ moment, totaal, keer }))).toEqual([
      { moment: "ontbijt", totaal: 600, keer: 2 },
      { moment: "lunch", totaal: 0, keer: 1 },
      { moment: "avondeten", totaal: 0, keer: 0 },
      { moment: "tussendoor", totaal: 0, keer: 0 },
    ]);
  });
});
