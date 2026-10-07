import { describe, expect, it } from "vitest";
import {
  isStofKeuzeFavoriet,
  keuzeTerugHref,
  momentKeuzeId,
  momentVoorStof,
  parseMomentKeuze,
  leesKeuzeHerkomst,
  metKeuzeHerkomst,
  parseProductKeuze,
  productKeuzeContext,
  productKeuzeHref,
  productKeuzeId,
  productKeuzeIdsVoorStof,
  productKeuzeVoorStof,
} from "@/lib/keuze-product-keuze";

describe("productkeuze per stof", () => {
  it("leest stof en slug terug, ook bij een stof met een underscore en een slug met streepjes", () => {
    const id = productKeuzeId("vitamin_d", "vital-nutrition-vitamine-d3-75-mcg");
    expect(parseProductKeuze(id)).toEqual({ nutrient: "vitamin_d", slug: "vital-nutrition-vitamine-d3-75-mcg" });
    expect(productKeuzeHref(id)).toBe("/product/vital-nutrition-vitamine-d3-75-mcg");
    expect(productKeuzeContext(id)).toMatch(/voor vitamine D,/);
  });

  it("negeert andere favorieten en vindt per stof alleen de eigen keuze", () => {
    const items = [
      { id: "voeding-route-magnesium-potje" },
      { id: productKeuzeId("magnesium", "a-b") },
      { id: productKeuzeId("zinc", "c") },
    ];
    expect(parseProductKeuze("voeding-route-magnesium-potje")).toBeNull();
    expect(productKeuzeVoorStof("magnesium", items)).toBe("a-b");
    expect(productKeuzeVoorStof("omega3", items)).toBeNull();
    expect(productKeuzeIdsVoorStof("zinc", items)).toEqual(["voeding-product-zinc-c"]);
  });

  it("draagt de herkomst heen en terug, en negeert andere bezoekers", () => {
    const href = metKeuzeHerkomst("/product/royal-green-whey", "protein");
    expect(href).toBe("/product/royal-green-whey?van=keuze&stof=protein");
    expect(leesKeuzeHerkomst(new URL(href, "https://x.nl").searchParams)).toBe("protein");
    expect(leesKeuzeHerkomst(new URLSearchParams("stof=protein"))).toBeNull();
    expect(leesKeuzeHerkomst(new URLSearchParams("van=keuze&stof=onzin"))).toBeNull();
    expect(keuzeTerugHref("protein")).toBe("/dashboard?tab=keuze&stof=protein");
    expect(metKeuzeHerkomst("/supplementen?categorie=magnesium", "magnesium")).toBe(
      "/supplementen?categorie=magnesium&van=keuze&stof=magnesium",
    );
  });

  it("leest het moment per stof terug en herkent stofkeuzes", () => {
    const id = momentKeuzeId("vitamin_d", "avondeten");
    expect(parseMomentKeuze(id)).toEqual({ nutrient: "vitamin_d", moment: "avondeten", kant: "supplement" });
    const eten = momentKeuzeId("vitamin_d", "lunch", "eten");
    expect(eten).toBe("voeding-eetmoment-vitamin_d-lunch");
    expect(momentVoorStof("vitamin_d", [{ id }, { id: eten }], "eten")).toBe("lunch");
    expect(isStofKeuzeFavoriet(eten)).toBe(true);
    expect(parseMomentKeuze("voeding-moment-omega3-middernacht")).toBeNull();
    expect(momentVoorStof("vitamin_d", [{ id }])).toBe("avondeten");
    expect(isStofKeuzeFavoriet(id)).toBe(true);
    expect(isStofKeuzeFavoriet("voeding-route-zinc-bord")).toBe(true);
    expect(isStofKeuzeFavoriet("dagboek-supplement-visolie-capsule-1000mg")).toBe(false);
  });
});
