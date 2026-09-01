import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { INGREDIENT_VISUALS } from "@/data/supplement-hub/ingredient-visuals";
import { getHubProducts } from "@/lib/supplement-hub/product-catalog";

/**
 * De prijs van een statische beeldlijst is drift. Dit is de rem: elke regel
 * moet het best scorende product van zijn categorie zijn, en het bestand moet
 * bestaan. Verandert de catalogus van kop, dan valt deze test om — en dat is
 * precies het moment waarop de lijst bijgewerkt hoort te worden.
 */
describe("INGREDIENT_VISUALS", () => {
  const products = getHubProducts();

  function topProductOf(category: string) {
    return products
      .filter((product) => product.category === category)
      .sort((left, right) => right.score.total - left.score.total)[0];
  }

  it("wijst per stof naar het best scorende product van die categorie", () => {
    for (const [claimKey, visual] of Object.entries(INGREDIENT_VISUALS)) {
      const top = topProductOf(visual!.category);
      expect(top, `geen producten in categorie ${visual!.category}`).toBeDefined();
      expect(visual!.imageSrc, `beeld voor ${claimKey} loopt achter`).toBe(
        top.imageSrc,
      );
    }
  });

  it("verwijst alleen naar bestanden die echt in public/ staan", () => {
    for (const [claimKey, visual] of Object.entries(INGREDIENT_VISUALS)) {
      const path = join(process.cwd(), "public", visual!.imageSrc);
      expect(existsSync(path), `${claimKey}: ${visual!.imageSrc} ontbreekt`).toBe(
        true,
      );
    }
  });

  // De kaart gaat over de stof, niet over een potje. Een merknaam in de
  // alt-tekst zou de foto alsnog tot aanbeveling maken.
  it("houdt de alt-tekst merkloos", () => {
    const merken = products.map((product) => product.brand);
    for (const visual of Object.values(INGREDIENT_VISUALS)) {
      for (const merk of merken) {
        expect(visual!.imageAlt.toLowerCase()).not.toContain(merk.toLowerCase());
      }
    }
  });
});
