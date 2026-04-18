import type { MagnesiumProduct } from "@/types/product";

export const magnesiumProducts: MagnesiumProduct[] = [
  {
    slug: "viridian-bisglycinaat",
    category: "Magnesium (bisglycinaat)",
    name: "Viridian Magnesium Bisglycinate",
    brand: "Viridian",
    affiliateSlug: "viridian-bisglycinaat",
    rank: 1,
    score: 8.2,
    badge: "Beste voor slaap",
    description:
      "Puur magnesium bisglycinaat van Viridian — een gerespecteerd Brits supplementmerk. Vegetarische capsules met de best onderzochte vorm voor slaap en ontspanning.",
    elementMg: 200,
    capsulesPerDay: 2,
    form: "Bisglycinaat (chelaat)",
    pricePerDayEur: 0.29,
    pricePerBottleEur: 17.4,
    amountPerBottle: 120,
    pros: [
      "Beste vorm voor slaap en stress",
      "Glycine heeft eigen kalmerend effect",
      "100% vegetarisch",
    ],
    cons: [
      "Enkele vorm — minder breed dan een complex",
      "Prijs hoger per mg dan citraat",
    ],
    transparencyNote:
      "Controleer het elementaire magnesiumgehalte altijd op het actuele etiket; vergelijk mg element, niet alleen mg verbinding.",
  },
  {
    slug: "vital-nutrition-citraat",
    category: "Magnesium (citraat)",
    name: "Vital Nutrition Magnesium Citraat",
    brand: "Vital Nutrition",
    affiliateSlug: "vital-nutrition-citraat",
    rank: 2,
    score: 7.8,
    badge: "Beste prijs",
    description:
      "Goed opneembare magnesiumvorm tegen de scherpste prijs. 200 mg magnesium per tablet in plantaardige vorm — een solide keuze voor wie bewezen kwaliteit zoekt zonder te veel te betalen.",
    elementMg: 200,
    capsulesPerDay: 1,
    form: "Citraat (plantaardig)",
    pricePerDayEur: 0.2,
    pricePerBottleEur: 20.0,
    amountPerBottle: 100,
    pros: [
      "Goed opneembaar",
      "Scherpste prijs per dag (€ 0,20)",
      "Eenvoudige, heldere formule",
    ],
    cons: [
      "Kan laxerend werken bij hoge doses",
      "Enkele vorm — minder breed dan een complex",
    ],
    transparencyNote:
      "Citraat trekt vocht aan; bewaar droog en controleer mg element per maatlepel op de verpakking.",
  },
];

export function getMagnesiumProductBySlug(slug: string): MagnesiumProduct | undefined {
  return magnesiumProducts.find((product) => product.slug === slug);
}
