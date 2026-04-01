import type { AffiliateSlug } from "@/data/affiliate-links";

export const comparisonCriteria = [
    "dosering",
    "transparantie",
    "gebruiksgemak",
    "prijs per dag",
    "toepasbaarheid",
];

export const highlights = [
  {
    label: "Topkeuze",
    value: "Arctic Blue Visolie",
    text: "Sterke balans tussen dosering, dagelijks gebruik en algemene productfit.",
  },
  {
    label: "Beste prijs/gebruiksgemak",
    value: "Arctic Blue Gummies",
    text: "Laagdrempelige keuze voor wie vooral eenvoud en routine belangrijk vindt.",
  },
  {
    label: "Beste plantaardige optie",
    value: "Arctic Blue Algenolie",
    text: "Logische keuze als je liever een omega-3 uit algen gebruikt dan uit visolie.",
  },
];

export const products: Array<{
    name: string;
    score: string;
    summary: string;
    specs: string[];
    pros: string[];
    cons: string[];
    bestFor: string;
    breakdown: [string, string][];
    affiliateSlug: AffiliateSlug;
}> = [
  {
    name: "Arctic Blue Visolie",
    score: "8.8",
    summary:
      "Sterke allround keuze voor wie een goede mix zoekt van dosering, gebruiksgemak en een duidelijke productpositionering.",
    specs: ["Type: Visolie", "Dosering: Hoog", "Prijs per dag: €0,58"],
    pros: [
      "Sterke totaalbalans voor dagelijks gebruik",
      "Vloeibare vorm zonder grote capsules",
    ],
    cons: ["Smaak is niet voor iedereen ideaal", "Minder handig als je liever gummies kiest"],
    bestFor: "Topkeuze",
    breakdown: [
      ["Dosering", "9/10"],
      ["Transparantie", "8/10"],
      ["Gebruiksgemak", "8/10"],
      ["Prijs per dag", "8/10"],
    ],
    affiliateSlug: "arctic-blue-visolie",
  },
  {
    name: "Arctic Blue Gummies",
    score: "8.4",
    summary:
      "Praktische keuze voor bezoekers die vooral een eenvoudige, smakelijke en laagdrempelige routine willen opbouwen.",
    specs: ["Type: Gummies", "Dosering: Laag", "Prijs per dag: €0,72"],
    pros: [
      "Toegankelijk en gebruiksvriendelijk",
      "Past goed bij wie geen olie of grote capsules wil",
    ],
    cons: ["Lagere EPA/DHA per portie", "Minder geschikt als je maximale dosering zoekt"],
    bestFor: "Beste prijs/gebruiksgemak",
    breakdown: [
      ["Dosering", "6/10"],
      ["Transparantie", "8/10"],
      ["Gebruiksgemak", "9/10"],
      ["Prijs per dag", "8/10"],
    ],
    affiliateSlug: "arctic-blue-gummies",
  },
  {
    name: "Arctic Blue Algenolie",
    score: "8.2",
    summary:
      "Plantaardige omega-3 optie voor wie bewust liever geen visolie gebruikt, maar wel een vloeibare bron wil overwegen.",
    specs: ["Type: Algenolie", "Dosering: Gemiddeld", "Prijs per dag: €0,62"],
    pros: [
      "Plantaardige bron van omega-3",
      "Logische keuze bij voorkeur voor algen in plaats van visolie",
    ],
    cons: ["Vaak wat duurder dan standaard visolie", "Voor veel bezoekers niet de eerste prijskeuze"],
    bestFor: "Beste plantaardige optie",
    breakdown: [
      ["Dosering", "8/10"],
      ["Transparantie", "8/10"],
      ["Gebruiksgemak", "8/10"],
      ["Prijs per dag", "7/10"],
    ],
    affiliateSlug: "arctic-blue-algenolie",
  },
];

export const tableRows = [
  {
    product: "Arctic Blue Visolie",
    type: "Visolie",
    dosage: "Hoog",
    transparency: "Goed",
    convenience: "Goed",
    price: "€0,58",
    bestFor: "Topkeuze",
  },
  {
    product: "Arctic Blue Gummies",
    type: "Gummies",
    dosage: "Laag",
    transparency: "Goed",
    convenience: "Sterk",
    price: "€0,72",
    bestFor: "Beste prijs/gebruiksgemak",
  },
  {
    product: "Arctic Blue Algenolie",
    type: "Algenolie",
    dosage: "Gemiddeld",
    transparency: "Goed",
    convenience: "Goed",
    price: "€0,62",
    bestFor: "Beste plantaardige optie",
  },
];

export const choiceRoutes: Array<{
    title: string;
    product: string;
    text: string;
    affiliateSlug: AffiliateSlug;
}> = [
  {
    title: "Topkeuze",
    product: "Arctic Blue Visolie",
    text: "Kies deze route als je vooral een uitgebalanceerde combinatie zoekt van dosering, gebruiksgemak en een sterke totaalindruk.",
    affiliateSlug: "arctic-blue-visolie",
  },
  {
    title: "Beste prijs/gebruiksgemak",
    product: "Arctic Blue Gummies",
    text: "Past beter als je vooral eenvoudig wilt beginnen en dagelijkse inname laagdrempelig wilt houden.",
    affiliateSlug: "arctic-blue-gummies",
  },
  {
    title: "Beste plantaardige optie",
    product: "Arctic Blue Algenolie",
    text: "Geschikt voor wie liever een plantaardige bron kiest en algenolie boven visolie verkiest.",
    affiliateSlug: "arctic-blue-algenolie",
  },
];
