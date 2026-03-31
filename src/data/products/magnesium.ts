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
    badge: "Beste overall",
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
  {
    slug: "magnesium-malaat",
    category: "Magnesium (malaat)",
    name: "Magnesium malaat capsules",
    brand: "Voorbeeldmerk",
    affiliateSlug: "magnesium-malaat",
    rank: 4,
    score: 8.2,
    badge: "Beste voor sport & overdag",
    description:
      "Magnesium gebonden aan appelzuur (malaat). Vaak gekozen door mensen die magnesium overdag of rond inspanning willen inzetten.",
    elementMg: 150,
    capsulesPerDay: 2,
    form: "Malaat",
    pricePerDayEur: 0.42,
    pricePerBottleEur: 25.2,
    amountPerBottle: 90,
    pros: [
      "Praktische capsulevorm voor vaste routine",
      "Past vaak bij wie magnesium niet alleen ’s avonds wil nemen",
      "Goed te vergelijken met andere vormen op mg element per portie",
    ],
    cons: [
      "Minder gangbaar dan citraat; aanbod verschilt per winkel",
      "Net als andere vormen: start met een verantwoorde portie",
    ],
    transparencyNote:
      "Controleer het elementaire magnesium per portie; malaatproducten verschillen in verhouding tot het zout.",
  },
  {
    slug: "magnesium-oxide",
    category: "Magnesium (oxide)",
    name: "Magnesium oxide tabletten",
    brand: "Voorbeeldmerk",
    affiliateSlug: "magnesium-oxide",
    rank: 5,
    score: 7.0,
    badge: "Budget (let op opname)",
    description:
      "Een veelgebruikte vorm in tabletten met vaak veel mg op het etiket. De biologische beschikbaarheid is doorgaans lager dan bij bisglycinaat of citraat.",
    elementMg: 400,
    capsulesPerDay: 1,
    form: "Oxide (tablet)",
    pricePerDayEur: 0.18,
    pricePerBottleEur: 10.8,
    amountPerBottle: 120,
    pros: [
      "Vaak de laagste prijs per verpakking",
      "Hoge vermelde mg op het etiket (let op: elementair vs verbinding)",
      "Eenvoudige tablet voor wie weinig capsules wil slikken",
    ],
    cons: [
      "Over het algemeen lagere opname dan chelaten of citraat",
      "Kan maag/darm minder prettig voelen bij hogere doses",
    ],
    transparencyNote:
      "Vergelijk altijd mg elementair magnesium, niet alleen het gewicht van magnesiumoxide als geheel.",
  },
];

export function getMagnesiumProductBySlug(slug: string): MagnesiumProduct | undefined {
  return magnesiumProducts.find((product) => product.slug === slug);
}
