import type { ComparisonPageData } from "@/types/supplement";

export const eiwitpoederData: ComparisonPageData = {
  category: "eiwitpoeder",
  h1: "Beste Eiwitpoeder 2026",
  intro:
    "Whey of plantaardig? We vergeleken de beste eiwitpoeders op eiwitgehalte, biobeschikbaarheid, zuiverheid en prijs.",
  seoTitle:
    "Beste Eiwitpoeder 2026: Whey & Vegan Vergelijking | PerfectSupplement",
  seoDescription:
    "Welk eiwitpoeder past bij jou? Whey of plantaardig? Vergelijking op eiwitgehalte, opname, prijs en zuiverheid.",
  lastUpdated: "2026-05-03",
  choiceRoutes: [
    {
      badgeLabel: "Beste allround",
      productName: "Vital Nutrition Whey Proteïne",
      teaser:
        "Drievoudige blend (isolaat, hydrolysaat, concentraat) met 82% eiwit — maximale opname en compleet aminozurenprofiel.",
      affiliateSlug: "proteine-vital-nutrition-whey",
      slug: "vital-nutrition-whey-proteine",
    },
    {
      badgeLabel: "Beste plantaardig",
      productName: "Orangefit Protein",
      teaser:
        "100% plantaardig erwteneiwit, hypo-allergeen en vrij van zuivel — ideaal bij intoleranties of vegan lifestyle.",
      affiliateSlug: "proteine-orangefit-protein",
      slug: "orangefit-protein",
    },
    {
      badgeLabel: "Hoogste zuiverheid",
      productName: "Royal Green Whey Protein Isolate",
      teaser:
        "100% wei-eiwitisolaat zonder smaak- en zoetstoffen — hoogste eiwitpercentage per serving en minimale fillers.",
      affiliateSlug: "proteine-royal-green-isolate",
      slug: "royal-green-whey-protein-isolate",
    },
  ],
  products: [
    {
      slug: "vital-nutrition-whey-proteine",
      name: "Whey Proteïne",
      brand: "Vital Nutrition",
      affiliateSlug: "proteine-vital-nutrition-whey",
      score: 8.6,
      bestFor: "Beste allround",
      variantTag: "Whey blend (isolaat + hydrolysaat + concentraat)",
      summary:
        "Premium whey-blend met isolaat, hydrolysaat en concentraat voor snelle en volledige opname. 82% eiwit per serving, vier smaken en 15% korting met abonnement — onze primaire aanbeveling voor herstel en spiermassa.",
      specs: [
        { label: "Vorm", value: "Poeder" },
        {
          label: "Portie",
          value:
            "30 g (ca. 25 g eiwit) — whey isolaat, hydrolysaat & concentraat",
        },
        { label: "Per dag", value: "1 serving" },
        { label: "Prijs indicatie", value: "ca. € 39,95 / maand (1 kg)" },
      ],
      pros: [
        "Drievoudige eiwitblend (isolaat + hydrolysaat + concentraat)",
        "Eiwitgehalte van 82%",
        "4 smaken beschikbaar",
        "15% korting bij abonnement",
      ],
      cons: [
        "Bevat zuivel — niet geschikt bij lactose-intolerantie",
        "Alleen beschikbaar via Vital Nutrition webshop",
      ],
      breakdown: [
        { criterium: "Biobeschikbaarheid (25%)", score: 9.0 },
        { criterium: "Dosering & eiwitgehalte (30%)", score: 8.5 },
        { criterium: "Prijs-kwaliteit (25%)", score: 8.5 },
        { criterium: "Transparantie (20%)", score: 8.5 },
      ],
      imageSrc: "/images/producten/vital-nutrition-whey-proteine.jpg",
      imageAlt: "Vital Nutrition Whey Proteïne verpakking",
    },
    {
      slug: "orangefit-protein",
      name: "Protein",
      brand: "Orangefit",
      affiliateSlug: "proteine-orangefit-protein",
      score: 8.0,
      bestFor: "Beste plantaardig",
      variantTag: "Plantaardig (gele erwten)",
      summary:
        "Plantaardig eiwitpoeder op basis van gele erwten met compleet aminozurenprofiel. Vrij van soja, lactose, gluten en GMO; hypo-allergeen gecertificeerd — sterk alternatief als je geen whey wilt.",
      specs: [
        { label: "Vorm", value: "Poeder" },
        {
          label: "Portie",
          value: "30 g plantaardig eiwit (gele erwten)",
        },
        { label: "Per dag", value: "1 serving" },
        { label: "Prijs indicatie", value: "ca. € 33,90 / maand (750 g)" },
      ],
      pros: [
        "100% plantaardig (vegan)",
        "Vrij van soja, lactose, zuivel, tarwe en gluten",
        "Hypo-allergeen — geschikt bij intoleranties",
        "Vrij van GMOs",
      ],
      cons: [
        "Plantaardig eiwit iets minder snel opneembaar dan whey",
        "Chocoladesmaak niet altijd beschikbaar",
      ],
      breakdown: [
        { criterium: "Biobeschikbaarheid (25%)", score: 7.5 },
        { criterium: "Dosering & eiwitgehalte (30%)", score: 8.0 },
        { criterium: "Prijs-kwaliteit (25%)", score: 8.5 },
        { criterium: "Transparantie (20%)", score: 8.0 },
      ],
      imageSrc: "/images/producten/Orangefit-Protein.jpg",
      imageAlt: "Orangefit Protein verpakking",
    },
    {
      slug: "royal-green-whey-protein-isolate",
      name: "100% Whey Protein Isolate",
      brand: "Royal Green",
      affiliateSlug: "proteine-royal-green-isolate",
      score: 8.3,
      bestFor: "Hoogste zuiverheid",
      variantTag: "100% whey isolaat, ongearomatiseerd",
      summary:
        "Puur wei-eiwitisolaat zonder toegevoegde smaak- of zoetstoffen. Maximale biologische beschikbaarheid en het hoogste eiwitpercentage per gram — voor wie zuiverheid boven smaak en prijs per portie zet.",
      specs: [
        { label: "Vorm", value: "Poeder" },
        {
          label: "Portie",
          value: "30 g puur wei-eiwitisolaat — zonder zoet- en smaakstoffen",
        },
        { label: "Per dag", value: "1 serving" },
        { label: "Prijs indicatie", value: "ca. € 44,95 / maand (600 g)" },
      ],
      pros: [
        "100% puur whey isolaat — geen concentraat",
        "Hoogste eiwitpercentage per serving",
        "Zonder toegevoegde zoet- en smaakstoffen",
        "Laagste koolhydraten, suikers en vet",
      ],
      cons: [
        "Duurste optie per gram eiwit",
        "Geen smaakopties — puur en neutraal",
        "Kleinere verpakking (600 g)",
      ],
      breakdown: [
        { criterium: "Biobeschikbaarheid (25%)", score: 9.5 },
        { criterium: "Dosering & eiwitgehalte (30%)", score: 8.5 },
        { criterium: "Prijs-kwaliteit (25%)", score: 7.0 },
        { criterium: "Transparantie (20%)", score: 8.5 },
      ],
      imageSrc: "/images/producten/Royal-Green-Whey-Protein-Isolate.jpg",
      imageAlt: "Royal Green 100% Whey Protein Isolate verpakking",
    },
  ],
  tableRows: [
    {
      slug: "vital-nutrition-whey-proteine",
      name: "Vital Nutrition Whey",
      type: "Whey blend",
      dosering: "ca. 25 g eiwit / 30 g",
      transparantie: "Zeer goed",
      gebruiksgemak: "Goed",
      prijs: "€ 39,95/mnd",
      badge: "Beste allround",
    },
    {
      slug: "orangefit-protein",
      name: "Orangefit Protein",
      type: "Plantaardig",
      dosering: "30 g planteiwit",
      transparantie: "Goed",
      gebruiksgemak: "Goed",
      prijs: "€ 33,90/mnd",
      badge: "Beste plantaardig",
    },
    {
      slug: "royal-green-whey-protein-isolate",
      name: "Royal Green Isolaat",
      type: "Whey isolaat",
      dosering: "30 g isolaat",
      transparantie: "Zeer goed",
      gebruiksgemak: "Goed",
      prijs: "€ 44,95/mnd",
      badge: "Hoogste zuiverheid",
    },
  ],
  comparisonCriteria: [
    "Biobeschikbaarheid (25%)",
    "Dosering & eiwitgehalte (30%)",
    "Prijs-kwaliteit (25%)",
    "Transparantie (20%)",
  ],
  faq: [
    {
      question: "Hoeveel eiwit heb je nodig na 40?",
      answer:
        "Veel richtlijnen noemen 0,8 g/kg lichaamsgewicht, maar onderzoek naar spiermassa en herstel wijst voor mannen 40+ vaak op **1,2–1,6 g/kg per dag**. Train je structureel, dan zit je doorgaans aan de bovenkant van dat bereik. Verdeel je inname over de dag — eiwitpoeder is een praktische aanvulling, geen vervanging van volwaardige maaltijden.",
    },
    {
      question: "Is whey of plantaardig eiwit beter?",
      answer:
        "Whey heeft doorgaans een hogere [biologische beschikbaarheid](/kennisbank/biobeschikbaarheid) en snellere opname na training. Plantaardige blends (zoals erwteneiwit) kunnen ook een compleet aminozurenprofiel leveren en zijn beter passend bij lactose-intolerantie of als je zuivel wilt vermijden. De beste keuze is degene die je volhoudt en goed verdragen wordt.",
    },
    {
      question: "Wanneer neem je eiwitpoeder het best in?",
      answer:
        "Na krachttraining is **binnen 30–60 minuten** een moment waarop je lichaam extra responsief is op aminozuren. Op rustdagen helpt een portie bij ontbijt of als tussendoortje om je dagelijkse eiwitdoel te halen — consistentie is belangrijker dan het perfecte minuut.",
    },
    {
      question: "Is eiwitpoeder veilig voor dagelijks gebruik?",
      answer:
        "Voor gezonde volwassenen is dagelijks eiwit uit poeder over het algemeen vergelijkbaar met eiwit uit voeding: het is geconcentreerd, geen \"kunstmatige stof\" op zich. Heb je **nierklachten** of een dieetvoorschrift van een arts, stem suppletie dan altijd af voordat je structureel verhoogt.",
    },
  ],
};
