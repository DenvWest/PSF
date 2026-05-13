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
    value: "Möller's Omega-3 Citroen",
    text: "Traditioneel Noors merk met hoge DHA per portie, zachte citroensmaak en een sterke prijs per dag.",
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
    name: "Möller's Omega-3 Citroen",
    score: "8.5",
    summary:
      "Traditioneel Noors levertraan met zachte citroensmaak. Sterke DHA-focus met 370 mg EPA en 510 mg DHA per portie tegen een scherpe prijs per dag.",
    specs: ["Type: Vloeibaar levertraan", "EPA/DHA: 370 / 510 mg", "Prijs per dag: €0,47"],
    pros: [
      "Hoogste DHA per portie in dit overzicht",
      "Zachte citroensmaak en minder oprispingen",
      "Zeer scherpe prijs per dag",
    ],
    cons: [
      "Lagere EPA dan Minami MorEPA",
      "Levertraan — let op vitamine A bij andere supplementen",
    ],
    bestFor: "Beste prijs-kwaliteit",
    breakdown: [
      ["Dosering", "8/10"],
      ["Transparantie", "8/10"],
      ["Gebruiksgemak", "8/10"],
      ["Prijs per dag", "9/10"],
    ],
    affiliateSlug: "mollers-omega-3-citroen",
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
    product: "Möller's Omega-3 Citroen",
    type: "Visolie",
    epa: "370 / 510 mg",
    dosage: "Hoog",
    transparency: "Goed",
    convenience: "Goed",
    price: "€0,47",
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
    product: "Möller's Omega-3 Citroen",
    text: "Past beter als je een scherpe prijs per dag wilt met hoge DHA en een vertrouwd Noors merk.",
    affiliateSlug: "mollers-omega-3-citroen",
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
