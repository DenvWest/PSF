import { describe, expect, it } from "vitest";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { bronnenVanStof } from "@/lib/nutrition-stof-bronnen";

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
      { naam: "Magnesiumcitraat, capsule", totaal: 600, unit: "mg", dagen: 2, supplement: true },
    ]);
  });
});
