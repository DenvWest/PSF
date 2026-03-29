import type { MagnesiumProduct } from "@/types/product";

export const magnesiumProducts: MagnesiumProduct[] = [
  {
    slug: "magnesium-bisglycinaat",
    category: "Magnesium (bisglycinaat)",
    name: "Magnesium bisglycinaat capsules",
    brand: "Voorbeeldmerk",
    affiliateSlug: "magnesium-bisglycinaat",
    rank: 1,
    score: 8.7,
    badge: "Beste keuze",
    description:
      "Gebonden aan aminozuren (glycine): vaak goed verdragen en praktisch als je een milde, alledaagse magnesiumbron zoekt zonder onnodige maagbelasting.",
    elementMg: 200,
    capsulesPerDay: 2,
    form: "Bisglycinaat (chelaat)",
    pricePerDayEur: 0.45,
    pricePerBottleEur: 26.95,
    amountPerBottle: 120,
    pros: [
      "Vaak gekozen vanwege goede verdragenheid in dagelijks gebruik",
      "Duidelijke focus op elementair magnesium per portie",
      "Past bij wie liever geen zware osmotische laxatieve lading wil",
    ],
    cons: [
      "Meestal iets duurder per mg elementair magnesium dan eenvoudige zouten",
      "Niet elke formule is qua vulstoffen even minimalistisch",
    ],
    transparencyNote:
      "Controleer het elementaire magnesiumgehalte altijd op het actuele etiket; vergelijk mg element, niet alleen mg verbinding.",
  },
  {
    slug: "magnesium-tauraat",
    category: "Magnesium (tauraat)",
    name: "Magnesium tauraat capsules",
    brand: "Voorbeeldmerk",
    affiliateSlug: "magnesium-tauraat",
    rank: 2,
    score: 8.5,
    badge: "Beste voor ontspanning",
    description:
      "Combineert magnesium met taurine. Voor wie bewust kijkt naar een vorm die vaak in de avondroutine past en aansluit bij rust en ontspanning.",
    elementMg: 150,
    capsulesPerDay: 2,
    form: "Tauraat",
    pricePerDayEur: 0.52,
    pricePerBottleEur: 31.2,
    amountPerBottle: 60,
    pros: [
      "Logische optie als je het gebruik rond ontspanning of avond wilt plaatsen",
      "Praktische capsulevorm voor vaste routine",
      "Taurine als context naast magnesium (geen medische claim)",
    ],
    cons: [
      "Minder gangbaar dan citraat; minder aanbod en prijsvariatie",
      "Minder geschikt als je juist een zuiver osmotisch effect verwacht van citraat",
    ],
    transparencyNote:
      "Lees het etiket op taurine- en magnesiumhoeveelheid per portie; merken verschillen sterk.",
  },
  {
    slug: "magnesium-citraat",
    category: "Magnesium (citraat)",
    name: "Magnesium citraat poeder",
    brand: "Voorbeeldmerk",
    affiliateSlug: "magnesium-citraat",
    rank: 3,
    score: 8.4,
    badge: "Beste prijs/kwaliteit",
    description:
      "Een veelgebruikte vorm met goede oplosbaarheid. Praktisch als je flexibel wilt doseren en let op prijs per mg elementair magnesium.",
    elementMg: 200,
    capsulesPerDay: 1,
    form: "Citraat (poeder)",
    pricePerDayEur: 0.38,
    pricePerBottleEur: 22.8,
    amountPerBottle: 60,
    pros: [
      "Vaak gunstige prijs per mg elementair magnesium",
      "Poeder maakt doseren en aanpassen eenvoudig",
      "Bekende vorm met veel aanbod om te vergelijken",
    ],
    cons: [
      "Kan bij sommigen een mild laxatief effect geven bij hogere doses",
      "Smaak en oplossen in water vraagt gewenning",
    ],
    transparencyNote:
      "Citraat trekt vocht aan; bewaar droog en controleer mg element per maatlepel op de verpakking.",
  },
];

export function getMagnesiumProductBySlug(slug: string): MagnesiumProduct | undefined {
  return magnesiumProducts.find((product) => product.slug === slug);
}
