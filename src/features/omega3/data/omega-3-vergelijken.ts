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
    value: "Minami MorEPA Original",
    text: "Hoogste EPA per portie (590 mg), CO2-extractie en wetenschappelijk gevalideerde kwaliteitsstandaard.",
  },
  {
    label: "Beste prijs-kwaliteit",
    value: "Vitaminstore Super Fish Oil",
    text: "Triglyceride-vorm voor betere opname, bijna dubbele EPA/DHA vs standaard visolie en scherpste prijs per mg.",
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
    name: "Minami MorEPA Original",
    score: "9.0",
    summary:
      "Hoogste EPA-concentratie van alle vergeleken producten, gewonnen via superkritische CO2-extractie en gecertificeerd via de S.M.A.R.T.-kwaliteitsstandaard.",
    specs: ["Type: Visolie softgel", "EPA/DHA: 590 / 130 mg", "Prijs per dag: €0,65"],
    pros: [
      "Hoogste EPA per portie van alle producten (590 mg)",
      "CO2-extractie garandeert maximale zuiverheid",
      "Wetenschappelijk gevalideerde S.M.A.R.T. kwaliteitsstandaard",
    ],
    cons: [
      "Hoogste prijs per dag van het vergelijk",
      "Bevat visgelatine — niet geschikt voor veganisten",
    ],
    bestFor: "Topkeuze",
    breakdown: [
      ["Dosering", "10/10"],
      ["Transparantie", "9/10"],
      ["Gebruiksgemak", "8/10"],
      ["Prijs per dag", "7/10"],
    ],
    affiliateSlug: "minami-morepa-vergelijking",
  },
  {
    name: "Vitaminstore Super Fish Oil",
    score: "8.6",
    summary:
      "Visolie in natuurlijke triglyceride-vorm met 360 mg EPA en 240 mg DHA per softgel — bijna dubbele omega-3 ten opzichte van standaard visolie, voor een scherpe prijs per dag.",
    specs: ["Type: Visolie softgel", "EPA/DHA: 360 / 240 mg", "Prijs per dag: €0,42"],
    pros: [
      "Natuurlijke triglyceride-vorm voor betere opname",
      "Bijna dubbele EPA/DHA vs standaard visolie",
      "Scherpste prijs per mg omega-3 van alle visolieproducten",
    ],
    cons: [
      "Lagere EPA dan Minami MorEPA",
      "Geen CO2-extractie of IFOS-certificering",
    ],
    bestFor: "Beste prijs-kwaliteit",
    breakdown: [
      ["Dosering", "8/10"],
      ["Transparantie", "8/10"],
      ["Gebruiksgemak", "9/10"],
      ["Prijs per dag", "9/10"],
    ],
    affiliateSlug: "vitaminstore-super-fish-oil",
  },
  {
    name: "Arctic Blue Visolie",
    score: "8.4",
    summary:
      "Vloeibare visolie met 400 mg EPA en 250 mg DHA per portie — een sterke keuze voor wie geen capsules wil en consistentie in dagelijks gebruik waardeert.",
    specs: ["Type: Visolie vloeibaar", "EPA/DHA: 400 / 250 mg", "Prijs per dag: €0,58"],
    pros: [
      "Vloeibare vorm zonder grote capsules",
      "Sterke totaalbalans voor dagelijks gebruik",
    ],
    cons: [
      "Smaak is niet voor iedereen ideaal",
      "Minder handig als je liever capsules kiest",
    ],
    bestFor: "Beste vloeibaar",
    breakdown: [
      ["Dosering", "9/10"],
      ["Transparantie", "8/10"],
      ["Gebruiksgemak", "8/10"],
      ["Prijs per dag", "8/10"],
    ],
    affiliateSlug: "arctic-blue-visolie",
  },
];

export const tableRows = [
  {
    product: "Minami MorEPA Original",
    type: "Visolie",
    epa: "590 / 130 mg",
    dosage: "Zeer hoog",
    transparency: "Zeer goed",
    convenience: "Goed",
    price: "€0,65",
    bestFor: "Topkeuze",
  },
  {
    product: "Vitaminstore Super Fish Oil",
    type: "Visolie",
    epa: "360 / 240 mg",
    dosage: "Hoog",
    transparency: "Goed",
    convenience: "Goed",
    price: "€0,42",
    bestFor: "Beste prijs-kwaliteit",
  },
  {
    product: "Arctic Blue Visolie",
    type: "Visolie",
    epa: "400 / 250 mg",
    dosage: "Hoog",
    transparency: "Goed",
    convenience: "Goed",
    price: "€0,58",
    bestFor: "Beste vloeibaar",
  },
  {
    product: "Arctic Blue Algenolie",
    type: "Algenolie",
    epa: "150 / 350 mg",
    dosage: "Gemiddeld",
    transparency: "Goed",
    convenience: "Goed",
    price: "€0,62",
    bestFor: "Beste plantaardig",
  },
  {
    product: "Arctic Blue Gummies",
    type: "Gummies",
    epa: "60 / 60 mg",
    dosage: "Laag",
    transparency: "Goed",
    convenience: "Sterk",
    price: "€0,72",
    bestFor: "Beste gemak",
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
    product: "Minami MorEPA Original",
    text: "Kies deze route als je de hoogste EPA-concentratie zoekt met gevalideerde kwaliteitsstandaarden en maximale zuiverheid.",
    affiliateSlug: "minami-morepa-vergelijking",
  },
  {
    title: "Beste prijs-kwaliteit",
    product: "Vitaminstore Super Fish Oil",
    text: "Past beter als je een kwalitatieve triglyceride-visolie zoekt voor een scherpe prijs per dag.",
    affiliateSlug: "vitaminstore-super-fish-oil",
  },
  {
    title: "Beste vloeibaar",
    product: "Arctic Blue Visolie",
    text: "Kies deze route als je liever vloeibare olie gebruikt dan capsules en een bewezen dagelijkse routine wilt opbouwen.",
    affiliateSlug: "arctic-blue-visolie",
  },
  {
    title: "Beste plantaardige optie",
    product: "Arctic Blue Algenolie",
    text: "Geschikt voor wie liever een plantaardige bron kiest en algenolie boven visolie verkiest.",
    affiliateSlug: "arctic-blue-algenolie",
  },
];
