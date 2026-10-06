import { describe, expect, it } from "vitest";
import { getHubProducts } from "@/lib/supplement-hub/product-catalog";
import {
  psScoreAantalVoorStof,
  psScoreCatalogusHref,
  psScoreTopVoorStof,
} from "@/lib/supplement-hub/ps-score-per-stof";

describe("psScoreTopVoorStof", () => {
  it("geeft de hoogst scorende producten van alleen die stof, hoogste eerst", () => {
    const top = psScoreTopVoorStof("magnesium");
    expect(top.length).toBeGreaterThan(0);
    expect(top.length).toBeLessThanOrEqual(3);
    const magnesium = getHubProducts().filter((p) => p.category === "magnesium");
    const slugs = new Set(magnesium.map((p) => p.slug));
    expect(top.every((p) => slugs.has(p.slug))).toBe(true);
    const scores = top.map((p) => Number(p.score.replace(",", ".")));
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    expect(top[0]?.href).toMatch(/^\/product\//);
  });

  it("vertaalt eiwit naar eiwitpoeder en linkt naar de catalogus van die stof", () => {
    expect(psScoreCatalogusHref("protein")).toBe("/supplementen?categorie=eiwitpoeder");
    expect(psScoreAantalVoorStof("protein")).toBe(
      getHubProducts().filter((p) => p.category === "eiwitpoeder").length,
    );
  });
});
