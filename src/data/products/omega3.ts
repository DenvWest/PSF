import type { AffiliateSlug } from "@/data/affiliate-links";
import type { Omega3Product } from "@/types/product";

export const omega3Products: Omega3Product[] = [
  {
    slug: "arctic-blue-visolie",
    category: "Omega-3 (vis)",
    name: "Arctic Blue Visolie",
    brand: "Arctic Blue",
    affiliateSlug: "arctic-blue-visolie",
    rank: 1,
    score: 8.8,
    badge: "Topkeuze",
    description:
      "Vloeibare visolie voor wie een sterke allround keuze zoekt met een goede balans tussen dosering, kwaliteit en dagelijks gebruiksgemak.",
    epaMg: 400,
    dhaMg: 250,
    capsulesPerDay: 1,
    form: "Vloeibaar",
    pricePerDayEur: 0.58,
    pricePerBottleEur: 22.95,
    amountPerBottle: 250,
    pros: [
      "Sterke allround keuze voor dagelijks gebruik",
      "Vloeibare vorm zonder grote capsules",
      "Duidelijke merkpositionering en traceerbaarheid",
    ],
    cons: [
      "Smaak van visolie is niet voor iedereen prettig",
      "Minder handig als je liever een kant-en-klare capsule neemt",
    ],
    transparencyNote:
      "Controleer EPA/DHA per portie altijd nog even op het actuele etiket van de productpagina.",
    imageSrc: "/Arctic-Blue-Vis-Olie.png",
    imageAlt: "Arctic Blue Visolie verpakking",
  },
  {
    slug: "arctic-blue-gummies",
    category: "Omega-3 (gummies)",
    name: "Arctic Blue Gummies",
    brand: "Arctic Blue",
    affiliateSlug: "arctic-blue-gummies",
    rank: 2,
    score: 8.4,
    badge: "Beste prijs/gebruiksgemak",
    description:
      "Toegankelijke omega-3 gummies voor wie vooral eenvoud, smaak en een laagdrempelige dagelijkse routine belangrijk vindt.",
    epaMg: 60,
    dhaMg: 60,
    capsulesPerDay: 2,
    form: "Gummies",
    pricePerDayEur: 0.72,
    pricePerBottleEur: 21.95,
    amountPerBottle: 60,
    pros: [
      "Gebruiksvriendelijk alternatief voor olie of capsules",
      "Makkelijk dagelijks in te nemen",
      "Handig voor wie vooral op routine en smaak let",
    ],
    cons: [
      "Lagere EPA/DHA per portie dan geconcentreerde olie",
      "Niet de beste keuze als je vooral maximale dosering zoekt",
    ],
    transparencyNote:
      "Controleer EPA/DHA per aanbevolen portie altijd nog even op de actuele productpagina.",
    imageSrc: "/Arctic-Blue-Visolie-Gummie.png",
    imageAlt: "Arctic Blue Gummies verpakking",
  },
  {
    slug: "arctic-blue-algenolie",
    category: "Omega-3 (algen)",
    name: "Arctic Blue Algenolie",
    brand: "Arctic Blue",
    affiliateSlug: "arctic-blue-algenolie",
    rank: 3,
    score: 8.2,
    badge: "Plantaardige optie",
    description:
      "Vloeibare algenolie voor wie liever een plantaardige omega-3 bron gebruikt zonder naar visolie te grijpen.",
    epaMg: 150,
    dhaMg: 350,
    capsulesPerDay: 1,
    form: "Vloeibaar",
    pricePerDayEur: 0.62,
    pricePerBottleEur: 24.95,
    amountPerBottle: 150,
    pros: [
      "Plantaardige bron van omega-3",
      "Vloeibare vorm is makkelijk te doseren",
      "Logische optie als je geen visolie wilt gebruiken",
    ],
    cons: [
      "Vaak duurder dan reguliere visolie",
      "Minder relevant als plantaardig voor jou geen prioriteit is",
    ],
    transparencyNote:
      "Controleer EPA/DHA per portie altijd nog even op het actuele etiket van de productpagina.",
    imageSrc: "/Arctic-Blue-Algen-Olie.png",
    imageAlt: "Arctic Blue Algenolie verpakking",
  },
];

export function getProductBySlug(slug: string): Omega3Product | undefined {
  return omega3Products.find((product) => product.slug === slug);
}

export function getProductByAffiliateSlug(
  affiliateSlug: AffiliateSlug,
): Omega3Product | undefined {
  return omega3Products.find((product) => product.affiliateSlug === affiliateSlug);
}
