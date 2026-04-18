import type { ComparisonPageData } from "@/types/supplement";

export const omega3Data: ComparisonPageData = {
  category: "omega-3",
  h1: "Welke omega-3 visolie past bij jou?",
  intro:
    "Vier visoliën vergeleken op EPA/DHA-gehalte, vorm, prijs per dag en zuiverheid — zodat je in één oogopslag ziet welke het beste bij jouw situatie past.",
  seoTitle: "Beste omega-3 supplement 2026 — 4 visoliën onafhankelijk vergeleken",
  seoDescription:
    "Vergelijk Vitals, Arctic Blue, Möller's en Minami MorEPA op EPA/DHA, prijs per dag en zuiverheid. Onafhankelijke analyse voor de beste omega-3 keuze in 2026.",
  lastUpdated: "2026-04-18",
  choiceRoutes: [
    {
      badgeLabel: "Topkeuze",
      productName: "Vitals Liquid EPA/DHA",
      teaser:
        "Hoogste EPA+DHA per portie (1200 mg). Vloeibaar, citroensmaak, natuurlijke triglyceridevorm.",
      affiliateSlug: "vitals-liquid-epadha",
      slug: "vitals-liquid-epadha",
    },
    {
      badgeLabel: "Beste prijs",
      productName: "Arctic Blue Visolie",
      teaser:
        "Solide EPA+DHA dosering tegen de scherpste prijs. Vloeibaar en makkelijk te doseren.",
      affiliateSlug: "arctic-blue-visolie",
      slug: "arctic-blue-visolie",
    },
    {
      badgeLabel: "Bekendste merk",
      productName: "Möller's Omega-3 Citroen",
      teaser:
        "Noors traditioneel merk, DHA-focus, zachte citroensmaak. Inclusief vitamine A, D en E.",
      affiliateSlug: "mollers-omega-3-citroen",
      slug: "mollers-omega-3-citroen",
    },
    {
      badgeLabel: "Hoogste concentratie",
      productName: "Minami MorEPA Original",
      teaser:
        "590 mg EPA in één softgel. Ideaal voor wie capsules prefereert boven vloeibaar.",
      affiliateSlug: "minami-morepa-original",
      slug: "minami-morepa-original",
    },
  ],
  products: [
    {
      slug: "vitals-liquid-epadha",
      name: "Vitals Liquid EPA/DHA 1200mg",
      brand: "Vitals",
      affiliateSlug: "vitals-liquid-epadha",
      score: 9.0,
      bestFor: "Topkeuze",
      variantTag: "Vloeibare visolie",
      summary:
        "De hoogste EPA+DHA concentratie in deze vergelijking: 740 mg EPA en 460 mg DHA per theelepel. Vloeibaar in natuurlijke triglyceridevorm met citroensmaak. Zuivere, verse visolie zonder kunstmatige toevoegingen.",
      specs: [
        { label: "EPA", value: "740 mg" },
        { label: "DHA", value: "460 mg" },
        { label: "Totaal omega-3", value: "1200 mg" },
        { label: "Vorm", value: "Vloeibaar (5 ml/dag)" },
        { label: "Prijs / dag", value: "€ 0,60" },
        { label: "Inhoud", value: "200 ml (40 dagen)" },
      ],
      pros: [
        "Hoogste EPA+DHA per dagdosering",
        "Natuurlijke triglyceridevorm — betere opname",
        "Citroensmaak, geen vissmaak",
        "Geen kunstmatige toevoegingen",
      ],
      cons: [
        "Minder handig onderweg",
        "Hogere prijs per dag dan Arctic Blue",
        "Beperkte houdbaarheid na openen",
      ],
      breakdown: [
        { criterium: "EPA/DHA per portie", score: 10 },
        { criterium: "Transparantie", score: 9 },
        { criterium: "Gebruiksgemak", score: 8 },
        { criterium: "Prijs/kwaliteit", score: 8 },
      ],
      imageSrc: "/images/producten/Vitalis-Visolie.jpg",
      imageAlt: "Vitals Liquid EPA/DHA 1200mg verpakking",
    },
    {
      slug: "arctic-blue-visolie",
      name: "Arctic Blue Visolie",
      brand: "Arctic Blue",
      affiliateSlug: "arctic-blue-visolie",
      score: 8.8,
      bestFor: "Beste prijs",
      variantTag: "Vloeibare visolie",
      summary:
        "Sterke allround keuze met een goede EPA+DHA concentratie tegen de scherpste prijs in deze vergelijking. Vloeibare vorm maakt precies doseren eenvoudig.",
      specs: [
        { label: "EPA", value: "400 mg" },
        { label: "DHA", value: "250 mg" },
        { label: "Totaal omega-3", value: "650 mg" },
        { label: "Vorm", value: "Vloeibaar" },
        { label: "Prijs / dag", value: "€ 0,58" },
        { label: "Inhoud", value: "250 ml" },
      ],
      pros: [
        "Scherpste prijs per dag",
        "Vloeibaar — makkelijk te doseren",
        "Duidelijke merktraceerbaarheid",
      ],
      cons: [
        "Lagere EPA+DHA dan Vitals en Minami",
        "Vissmaak is niet voor iedereen",
        "Minder handig onderweg",
      ],
      breakdown: [
        { criterium: "EPA/DHA per portie", score: 8 },
        { criterium: "Transparantie", score: 9 },
        { criterium: "Gebruiksgemak", score: 8 },
        { criterium: "Prijs/kwaliteit", score: 9 },
      ],
      imageSrc: "/Arctic-Blue-Vis-Olie.png",
      imageAlt: "Arctic Blue Visolie verpakking",
    },
    {
      slug: "mollers-omega-3-citroen",
      name: "Möller's Omega-3 Citroen",
      brand: "Möller's",
      affiliateSlug: "mollers-omega-3-citroen",
      score: 8.3,
      bestFor: "Bekendste merk",
      variantTag: "Vloeibare visolie",
      summary:
        "Noors traditioneel merk met meer dan 160 jaar ervaring. DHA-focus (510 mg) met zachte citroensmaak. Inclusief vitamine A, D en E. Kabeljauw uit de Lofoten.",
      specs: [
        { label: "EPA", value: "370 mg" },
        { label: "DHA", value: "510 mg" },
        { label: "Totaal omega-3", value: "880 mg" },
        { label: "Vorm", value: "Vloeibaar (5 ml/dag)" },
        { label: "Prijs / dag", value: "€ 0,47" },
        { label: "Inhoud", value: "250 ml (50 dagen)" },
      ],
      pros: [
        "Hoogste DHA per portie — goed voor hersenfunctie",
        "Zachte citroensmaak, geen oprispingen",
        "Inclusief vitamine A, D en E",
        "Gevestigd Noors merk, 160+ jaar",
      ],
      cons: [
        "Lagere EPA dan Vitals en Minami",
        "Minder handig onderweg",
        "Bevat levertraan — niet voor iedereen gewenst",
      ],
      breakdown: [
        { criterium: "EPA/DHA per portie", score: 9 },
        { criterium: "Transparantie", score: 8 },
        { criterium: "Gebruiksgemak", score: 8 },
        { criterium: "Prijs/kwaliteit", score: 9 },
      ],
      imageSrc: "/images/producten/Mollers-Omega-3-Citroen.jpg",
      imageAlt: "Möller's Omega-3 Citroen verpakking",
    },
    {
      slug: "minami-morepa-original",
      name: "Minami MorEPA Original",
      brand: "Minami",
      affiliateSlug: "minami-morepa-original",
      score: 8.5,
      bestFor: "Hoogste concentratie",
      variantTag: "Softgels",
      summary:
        "De hoogste EPA-concentratie per capsule op de markt: 590 mg EPA in één softgel. Gepatenteerd CO2-extractieproces voor maximale zuiverheid. Ideaal voor wie geen vloeibare olie wil.",
      specs: [
        { label: "EPA", value: "590 mg" },
        { label: "DHA", value: "130 mg" },
        { label: "Totaal omega-3", value: "850 mg" },
        { label: "Vorm", value: "Softgels (1/dag)" },
        { label: "Prijs / dag", value: "€ 0,65" },
        { label: "Inhoud", value: "60 softgels (60 dagen)" },
      ],
      pros: [
        "Hoogste EPA per capsule",
        "Eén softgel per dag — maximaal gemak",
        "Gepatenteerd CO2-zuiveringsproces",
        "Geen vissmaak, sinaasappelsmaak",
      ],
      cons: [
        "Hoogste prijs per dag",
        "Lagere DHA dan Vitals en Möller's",
        "Softgels bevatten rundergelatine",
      ],
      breakdown: [
        { criterium: "EPA/DHA per portie", score: 9 },
        { criterium: "Transparantie", score: 9 },
        { criterium: "Gebruiksgemak", score: 10 },
        { criterium: "Prijs/kwaliteit", score: 7 },
      ],
      imageSrc: "/images/producten/More-EPA-Original.jpg",
      imageAlt: "Minami MorEPA Original verpakking",
    },
  ],
  tableRows: [
    {
      slug: "vitals-liquid-epadha",
      name: "Vitals EPA/DHA",
      type: "Vloeibaar",
      dosering: "740 / 460 mg",
      transparantie: "Hoog",
      gebruiksgemak: "Goed",
      prijs: "€ 0,60/dag",
      badge: "Topkeuze",
    },
    {
      slug: "arctic-blue-visolie",
      name: "Arctic Blue",
      type: "Vloeibaar",
      dosering: "400 / 250 mg",
      transparantie: "Hoog",
      gebruiksgemak: "Goed",
      prijs: "€ 0,58/dag",
      badge: "Beste prijs",
    },
    {
      slug: "mollers-omega-3-citroen",
      name: "Möller's Citroen",
      type: "Vloeibaar",
      dosering: "370 / 510 mg",
      transparantie: "Goed",
      gebruiksgemak: "Goed",
      prijs: "€ 0,47/dag",
      badge: "Bekendste merk",
    },
    {
      slug: "minami-morepa-original",
      name: "Minami MorEPA",
      type: "Softgels",
      dosering: "590 / 130 mg",
      transparantie: "Hoog",
      gebruiksgemak: "Uitstekend",
      prijs: "€ 0,65/dag",
      badge: "Hoogste concentratie",
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
        "Voor algemene ondersteuning wordt 250–500 mg EPA+DHA per dag aanbevolen. Bij specifieke doelen (hart, gewrichten, hersenen) kan een hogere dosering tot 1000-2000 mg zinvol zijn. Kijk altijd naar de daadwerkelijke EPA- en DHA-inhoud, niet naar het totale visoliegehalte.",
    },
    {
      question: "Wat is het verschil tussen EPA en DHA?",
      answer:
        "EPA werkt primair ontstekingsremmend en ondersteunt hart en immuunsysteem. DHA is vooral belangrijk voor hersenfunctie en het netvlies. Voor de meeste mensen is een combinatie van beide het beste.",
    },
    {
      question: "Vloeibaar of capsules — wat is beter?",
      answer:
        "Vloeibare visolie levert vaak meer EPA+DHA per portie en is makkelijker te doseren. Capsules zijn handiger onderweg en hebben minder smaak. De opname is vergelijkbaar — kies wat je het langst volhoudt.",
    },
    {
      question: "Wat is het verschil tussen levertraan en visolie?",
      answer:
        "Levertraan (zoals Möller's) komt uit de lever van kabeljauw en bevat naast omega-3 ook vitamine A en D. Reguliere visolie komt uit het spierweefsel en bevat alleen omega-3. Beide zijn effectief, maar bij levertraan moet je letten op vitamine A-inname als je al supplementen gebruikt.",
    },
    {
      question: "Wat betekent triglyceridevorm?",
      answer:
        "Omega-3 in triglyceridevorm (TG) is de natuurlijke vorm zoals het in vis voorkomt. Dit wordt beter opgenomen dan de synthetische ethylestervorm (EE) die in goedkopere supplementen zit. Vitals en Möller's gebruiken de triglyceridevorm.",
    },
  ],
};
