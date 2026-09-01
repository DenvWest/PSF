import type { IngredientClaimKey } from "@/data/approved-claims";
import type { SupplementCategory } from "@/types/supplement";

/**
 * Eén productfoto per stof, voor oppervlakken die de catalogus zélf niet
 * kunnen laden.
 *
 * **Waarom een statische lijst en geen import van `getHubProducts()`.** De
 * catalogus trekt alle `src/data/supplements/*`-bestanden mee (~90 kB bron:
 * specs, pros, cons, faq's). Het dashboard is een client-bundle; die hele
 * berg meesturen voor zeven `imageSrc`-strings is een slechte ruil. De prijs
 * van deze keuze is drift, en die is afgedekt: `ingredient-visuals.test.ts`
 * pint elke regel vast op het best scorende product van die categorie in de
 * echte catalogus, plus op het bestaan van het bestand op schijf.
 *
 * **Wat de foto op het dashboard betekent.** Niets over het merk. De
 * oordeelkaart gaat over de stof, niet over een potje — daarom staat er nergens
 * een merknaam in de copy en is de alt-tekst neutraal. De foto is de deur naar
 * de categorie in de gids, meer niet.
 *
 * Melatonine ontbreekt bewust: die heeft geen producten in de catalogus
 * (`comparisonPath: null`, zie `approved-claims.ts`) en krijgt dus ook geen
 * beeld.
 */
export type IngredientVisual = {
  category: SupplementCategory;
  imageSrc: string;
  imageAlt: string;
};

export const INGREDIENT_VISUALS: Partial<
  Record<IngredientClaimKey, IngredientVisual>
> = {
  magnesium: {
    category: "magnesium",
    imageSrc: "/images/producten/Vitalnutrition-Magnesium-Citraat.jpg",
    imageAlt: "Voorbeeld van een magnesiumproduct uit de supplementengids",
  },
  omega3: {
    category: "omega-3",
    imageSrc: "/images/producten/Vitalis-Visolie.jpg",
    imageAlt: "Voorbeeld van een omega-3-product uit de supplementengids",
  },
  vitamineD: {
    category: "vitamine-d",
    imageSrc: "/images/producten/Vital-Nutrition-Vitamin-D3.jpg",
    imageAlt: "Voorbeeld van een vitamine D-product uit de supplementengids",
  },
  zink: {
    category: "zink",
    imageSrc: "/images/producten/vital-nutrition-zink-methionine.jpg",
    imageAlt: "Voorbeeld van een zinkproduct uit de supplementengids",
  },
  creatine: {
    category: "creatine",
    imageSrc: "/images/producten/Mattisson-Creatine-Monohydraat.jpg",
    imageAlt: "Voorbeeld van een creatineproduct uit de supplementengids",
  },
  eiwitpoeder: {
    category: "eiwitpoeder",
    imageSrc: "/images/producten/Royal-Green-Whey-Protein-Isolate.jpg",
    imageAlt: "Voorbeeld van een eiwitpoeder uit de supplementengids",
  },
  ashwagandha: {
    category: "ashwagandha",
    imageSrc: "/images/producten/Vital-Nutrition-Ashwagandha-KSM-66.jpg",
    imageAlt: "Voorbeeld van een ashwagandhaproduct uit de supplementengids",
  },
};

export function getIngredientVisual(
  ingredientKey: string,
): IngredientVisual | null {
  return INGREDIENT_VISUALS[ingredientKey as IngredientClaimKey] ?? null;
}
