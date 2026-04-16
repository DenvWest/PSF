import type { ComparisonPageData } from "@/types/supplement";

export const omega3Data: ComparisonPageData = {
  category: "omega-3",
  h1: "Welke omega-3 past bij jou?",
  intro:
    "Drie Arctic Blue varianten vergeleken op dosering, gebruiksgemak en prijs — zodat je in één oogopslag ziet wat het beste bij jouw routine past.",
  seoTitle: "Beste omega-3 supplement 2026 — Arctic Blue vergeleken",
  seoDescription:
    "Vergelijk Arctic Blue Visolie, Gummies en Algenolie op EPA/DHA, prijs per dag en gebruiksgemak. Onafhankelijke analyse voor de beste keuze in 2026.",
  lastUpdated: "2026-04-16",

  choiceRoutes: [
    {
      badgeLabel: "Topkeuze",
      productName: "Arctic Blue Visolie",
      teaser:
        "Hoogste EPA/DHA per portie, vloeibaar en dagelijks makkelijk in te nemen.",
      affiliateSlug: "arctic-blue-visolie",
      slug: "arctic-blue-visolie",
    },
    {
      badgeLabel: "Beste gemak",
      productName: "Arctic Blue Gummies",
      teaser:
        "Geen smaak, geen capsules — ideaal als je moeite hebt met consistentie.",
      affiliateSlug: "arctic-blue-gummies",
      slug: "arctic-blue-gummies",
    },
    {
      badgeLabel: "Plantaardig",
      productName: "Arctic Blue Algenolie",
      teaser:
        "100% vegan, duurzame bron en geen vissmaak — de logische keuze voor plantaardige eters.",
      affiliateSlug: "arctic-blue-algenolie",
      slug: "arctic-blue-algenolie",
    },
  ],

  products: [
    {
      slug: "arctic-blue-visolie",
      name: "Arctic Blue Visolie",
      brand: "Arctic Blue",
      affiliateSlug: "arctic-blue-visolie",
      score: 8.8,
      bestFor: "Topkeuze",
      variantTag: "Vloeibare visolie",
      summary:
        "Sterke allround keuze met de hoogste EPA+DHA concentratie van de drie varianten. Vloeibare vorm maakt precies doseren eenvoudig.",
      specs: [
        { label: "EPA", value: "400 mg" },
        { label: "DHA", value: "250 mg" },
        { label: "Vorm", value: "Vloeibaar" },
        { label: "Prijs / dag", value: "€ 0,58" },
        { label: "Inhoud", value: "250 ml" },
      ],
      pros: [
        "Hoogste EPA/DHA per portie",
        "Vloeibaar — makkelijk te doseren",
        "Duidelijke merktraceerbaarheid",
      ],
      cons: [
        "Vissmaak is niet voor iedereen",
        "Minder handig onderweg",
      ],
      breakdown: [
        { criterium: "EPA/DHA per portie", score: 9 },
        { criterium: "Transparantie", score: 9 },
        { criterium: "Gebruiksgemak", score: 8 },
        { criterium: "Prijs/kwaliteit", score: 9 },
      ],
      imageSrc: "/Arctic-Blue-Vis-Olie.png",
      imageAlt: "Arctic Blue Visolie verpakking",
    },
    {
      slug: "arctic-blue-gummies",
      name: "Arctic Blue Gummies",
      brand: "Arctic Blue",
      affiliateSlug: "arctic-blue-gummies",
      score: 8.4,
      bestFor: "Beste gemak",
      variantTag: "Omega-3 gummies",
      summary:
        "Laagdrempelig alternatief voor wie consistent wil blijven zonder smaak of capsules. Lagere dosering, maar uitstekende therapietrouw.",
      specs: [
        { label: "EPA", value: "60 mg" },
        { label: "DHA", value: "60 mg" },
        { label: "Vorm", value: "Gummies (2/dag)" },
        { label: "Prijs / dag", value: "€ 0,72" },
        { label: "Inhoud", value: "60 stuks" },
      ],
      pros: [
        "Makkelijkste innamevorm",
        "Geen vissmaak",
        "Hoge therapietrouw",
      ],
      cons: [
        "Lagere EPA/DHA dan olie",
        "Hogere prijs per gram omega-3",
      ],
      breakdown: [
        { criterium: "EPA/DHA per portie", score: 6 },
        { criterium: "Transparantie", score: 8 },
        { criterium: "Gebruiksgemak", score: 10 },
        { criterium: "Prijs/kwaliteit", score: 8 },
      ],
      imageSrc: "/Arctic-Blue-Visolie-Gummie.png",
      imageAlt: "Arctic Blue Gummies verpakking",
    },
    {
      slug: "arctic-blue-algenolie",
      name: "Arctic Blue Algenolie",
      brand: "Arctic Blue",
      affiliateSlug: "arctic-blue-algenolie",
      score: 8.2,
      bestFor: "Plantaardige optie",
      variantTag: "Vloeibare algenolie",
      summary:
        "Plantaardige omega-3 bron zonder vis. Hogere DHA dan EPA — logisch voor vegan of vegetarisch gebruik.",
      specs: [
        { label: "EPA", value: "150 mg" },
        { label: "DHA", value: "350 mg" },
        { label: "Vorm", value: "Vloeibaar" },
        { label: "Prijs / dag", value: "€ 0,62" },
        { label: "Inhoud", value: "150 ml" },
      ],
      pros: [
        "100% plantaardig en vegan",
        "Geen vissmaak",
        "Duurzamere bron",
      ],
      cons: [
        "Meer DHA dan EPA (niet altijd ideaal)",
        "Vaak duurder per gram",
      ],
      breakdown: [
        { criterium: "EPA/DHA per portie", score: 8 },
        { criterium: "Transparantie", score: 9 },
        { criterium: "Gebruiksgemak", score: 8 },
        { criterium: "Prijs/kwaliteit", score: 7 },
      ],
      imageSrc: "/Arctic-Blue-Algen-Olie.png",
      imageAlt: "Arctic Blue Algenolie verpakking",
    },
  ],

  tableRows: [
    {
      slug: "arctic-blue-visolie",
      name: "Arctic Blue Visolie",
      type: "Visolie (vloeibaar)",
      dosering: "400 / 250 mg",
      transparantie: "Hoog",
      gebruiksgemak: "Goed",
      prijs: "€ 0,58/dag",
      badge: "Topkeuze",
    },
    {
      slug: "arctic-blue-gummies",
      name: "Arctic Blue Gummies",
      type: "Gummies",
      dosering: "60 / 60 mg",
      transparantie: "Goed",
      gebruiksgemak: "Uitstekend",
      prijs: "€ 0,72/dag",
      badge: "Beste gemak",
    },
    {
      slug: "arctic-blue-algenolie",
      name: "Arctic Blue Algenolie",
      type: "Algenolie (vloeibaar)",
      dosering: "150 / 350 mg",
      transparantie: "Hoog",
      gebruiksgemak: "Goed",
      prijs: "€ 0,62/dag",
      badge: "Plantaardig",
    },
  ],

  comparisonCriteria: [
    "EPA/DHA per portie",
    "Transparantie",
    "Gebruiksgemak",
    "Prijs/kwaliteit",
  ],

  faq: [
    {
      question: "Hoeveel omega-3 per dag is genoeg?",
      answer:
        "Voor algemene ondersteuning wordt 250–500 mg EPA+DHA per dag aanbevolen. Kijk altijd naar de daadwerkelijke EPA- en DHA-inhoud op het etiket, niet naar het totale visoliegehalte.",
    },
    {
      question: "Wat is het verschil tussen EPA en DHA?",
      answer:
        "EPA (eicosapentaeenzuur) werkt primair ontstekingsremmend en ondersteunt hart en immuunsysteem. DHA (docosahexaeenzuur) is vooral belangrijk voor hersenfunctie en het netvlies. Een goede omega-3 bevat beide.",
    },
    {
      question: "Is visolie veilig om dagelijks te gebruiken?",
      answer:
        "Ja, visolie is bij normale doseringen veilig voor de meeste mensen. Kies een transparant merk dat zuiverheid vermeldt. Bij hoge doseringen of medicijngebruik is overleg met een arts verstandig.",
    },
    {
      question: "Wat is beter: visolie of algenolie?",
      answer:
        "Visolie is de eerste keuze voor de meesten: hogere EPA per portie en goedkoper per gram. Algenolie is logischer als je plantaardig eet — vergelijkbare omega-3 vetzuren, geen vissmaak.",
    },
    {
      question: "Wat betekent transparantie bij omega-3?",
      answer:
        "Een transparant merk publiceert de exacte EPA/DHA per portie, de herkomst van de olie en idealiter onafhankelijke testresultaten (IFOS of vergelijkbaar). Dit maakt het makkelijk om producten eerlijk te vergelijken.",
    },
  ],
};
