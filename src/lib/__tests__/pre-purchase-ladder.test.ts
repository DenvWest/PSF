import { describe, expect, it } from "vitest";
import {
  PRE_PURCHASE_LADDERS,
  getPrePurchaseLadder,
} from "@/data/supplements/pre-purchase-ladder";
import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import { SUPPLEMENT_SLUGS } from "@/data/supplements";

describe("pre-purchase ladder", () => {
  it("levert een ladder voor magnesium", () => {
    expect(getPrePurchaseLadder("magnesium")).toBeDefined();
  });

  it("geeft undefined voor categorieën zonder afgeronde ladder", () => {
    expect(getPrePurchaseLadder("zink")).toBeUndefined();
  });

  it("vult de stappen uit het leefstijlplan — nooit een lege lijst", () => {
    for (const [category, ladder] of Object.entries(PRE_PURCHASE_LADDERS)) {
      expect(ladder, `${category} mist een ladder`).toBeDefined();
      expect(
        ladder!.steps.length,
        `${category} heeft geen stappen — het leefstijlplan is waarschijnlijk hernoemd`,
      ).toBeGreaterThan(0);
    }
  });

  it("geeft elke stap een titel én een waarom", () => {
    for (const ladder of Object.values(PRE_PURCHASE_LADDERS)) {
      for (const step of ladder!.steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.why.length).toBeGreaterThan(0);
      }
    }
  });

  it("noemt in de claimregel de exacte EFSA-bewoording", () => {
    const magnesium = getPrePurchaseLadder("magnesium");
    expect(magnesium?.claimNote).toContain("normale psychologische functie");
    expect(magnesium?.claimNote).toContain("EFSA");
  });

  it("hangt alleen aan categorieën die een live vergelijkingspagina hebben", () => {
    for (const category of Object.keys(PRE_PURCHASE_LADDERS)) {
      const path = COMPARISON_PATHS[category as keyof typeof COMPARISON_PATHS];
      expect(path, `${category} heeft geen canoniek /beste/-pad`).toBeDefined();
      const slug = path.replace("/beste/", "");
      expect(
        SUPPLEMENT_SLUGS,
        `${category} verwijst naar een niet-bestaande vergelijking`,
      ).toContain(slug);
    }
  });
});
