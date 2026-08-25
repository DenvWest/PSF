import { describe, expect, it } from "vitest";
import { buildLeefstijlprofielBronregel } from "@/lib/leefstijlprofiel-bronregel";

describe("buildLeefstijlprofielBronregel", () => {
  it("dateert de check en noemt de hermeting", () => {
    expect(
      buildLeefstijlprofielBronregel({
        domain: "beweging",
        daysAgo: 4,
        dueDate: "12 sep 2026",
        hasReadout: true,
      }),
    ).toBe(
      "Zoals je beweegcheck van 4 dagen geleden ze achterliet. Je hermeting staat op 12 sep 2026 — dan verandert dit.",
    );
  });

  it("zegt eerlijk wanneer de delen nog niet apart beoordeeld zijn", () => {
    expect(
      buildLeefstijlprofielBronregel({
        domain: "voeding",
        daysAgo: 2,
        dueDate: "12 sep 2026",
        hasReadout: false,
      }),
    ).toContain("Wat hier staat is je keuze en de datum.");
  });

  it("gebruikt vandaag en gisteren in plaats van 0 of 1 dagen", () => {
    expect(
      buildLeefstijlprofielBronregel({
        domain: "slaap",
        daysAgo: 0,
        dueDate: null,
        hasReadout: true,
      }),
    ).toBe("Zoals je slaapcheck van vandaag ze achterliet.");
    expect(
      buildLeefstijlprofielBronregel({
        domain: "slaap",
        daysAgo: 1,
        dueDate: null,
        hasReadout: true,
      }),
    ).toBe("Zoals je slaapcheck van gisteren ze achterliet.");
  });
});
