import { describe, expect, it } from "vitest";
import { buildMovementSportLens } from "@/lib/movement-sport-lens";

describe("buildMovementSportLens", () => {
  it("vraagt om sportkeuze bij lege selectie", () => {
    const lens = buildMovementSportLens([]);
    expect(lens.headline).toContain("Kies één of meer sporten");
    expect(lens.missingForms).toHaveLength(5);
  });

  it("bouwt een enkel-sport headline", () => {
    const lens = buildMovementSportLens(["fitness"]);
    expect(lens.headline).toContain("Krachttraining");
  });

  it("rapporteert gaps wanneer de sport niet alles dekt", () => {
    const lens = buildMovementSportLens(["wandelen"]);
    expect(lens.missingForms).toContain("kracht");
    expect(lens.missingForms).toContain("interval");
  });
});
