import type { ComparisonPageData } from "@/types/supplement";

export const melatonineData: ComparisonPageData = {
  category: "melatonine",
  h1: "Beste Melatonine Supplement 2026",
  intro:
    "Beter slapen begint bij de juiste keuze. Wij vergeleken pure melatonine en slaapcomplexen op werking, dosering en prijs.",
  seoTitle: "Beste Melatonine 2026: Vergelijking | PerfectSupplement",
  seoDescription:
    "Welke melatonine werkt het beste voor jouw slaap? Vergelijking van pure melatonine en slaapcomplexen op werking, dosering en prijs.",
  lastUpdated: "2026-05-03",
  choiceRoutes: [
    {
      badgeLabel: "Beste allround",
      productName: "Vital Nutrition Slaap Complex",
      teaser:
        "Breed slaapcomplex met KSM-66 ashwagandha, valeriaan, 5-HTP, L-theanine en GABA — veel slaaproutes in één capsule.",
      affiliateSlug: "melatonine-vital-nutrition-slaap-complex",
      slug: "vital-nutrition-slaap-complex",
    },
    {
      badgeLabel: "Beste prijs",
      productName: "Lucovitaal Melatonine Puur 299 mcg",
      teaser:
        "Fysiologisch lage dosis met time release — extreem voordelig als je vooral timing van je slaap wilt ondersteunen.",
      affiliateSlug: "melatonine-lucovitaal-puur",
      slug: "lucovitaal-melatonine-puur",
    },
    {
      badgeLabel: "Melatonine + kruiden",
      productName: "Vitaminstore Nachtrust Complex",
      teaser:
        "Melatonine gecombineerd met valeriaan, hop, slaapmutsje en meer — handig als je één formule wilt met meerdere kruiden.",
      affiliateSlug: "melatonine-vitaminstore-nachtrust",
      slug: "vitaminstore-nachtrust-complex",
    },
  ],
  products: [
    {
      slug: "vital-nutrition-slaap-complex",
      name: "Slaap Complex",
      brand: "Vital Nutrition",
      affiliateSlug: "melatonine-vital-nutrition-slaap-complex",
      score: 8.5,
      bestFor: "Beste allround",
      variantTag: "Slaapcomplex (8 werkzame stoffen)",
      summary:
        "Dit is geen puur melatonineproduct maar een breed spectrum slaapcomplex: KSM-66 ashwagandha (gestandaardiseerd op withanoliden), valeriaan, 5-HTP, L-theanine en GABA in capsules. Ideaal als je naast timing ook ondersteuning zoekt rond stress en ontspanning — met een scherpe maandprijs voor wat er op het etiket staat.",
      specs: [
        {
          label: "Dosering per portie",
          value:
            "250 mg ashwagandha KSM-66 + 200 mg valeriaan + 50 mg 5-HTP + 25 mg L-theanine + GABA",
        },
        { label: "Vorm", value: "Capsules" },
        { label: "Porties per dag", value: "1" },
        { label: "Prijs per maand", value: "€ 13,98" },
      ],
      pros: [
        "Breed spectrum: 8 werkzame stoffen voor slaap",
        "KSM-66 ashwagandha (gepatenteerd extract)",
        "Bevat L-theanine én 5-HTP voor ontspanning",
        "Scherpe prijs voor wat je krijgt",
      ],
      cons: [
        "Bevat geen pure melatonine",
        "Relatief veel ingrediënten in één capsule",
      ],
      breakdown: [
        { criterium: "Biobeschikbaarheid", score: 8.5 },
        { criterium: "Dosering & werkzame stoffen", score: 8.0 },
        { criterium: "Prijs-kwaliteit", score: 9.0 },
        { criterium: "Transparantie", score: 8.5 },
      ],
      imageSrc: "/images/producten/vital-nutrition-slaap-complex.jpg",
      imageAlt: "Vital Nutrition Slaap Complex verpakking",
    },
    {
      slug: "lucovitaal-melatonine-puur",
      name: "Melatonine Puur 299 mcg",
      brand: "Lucovitaal",
      affiliateSlug: "melatonine-lucovitaal-puur",
      score: 7.7,
      bestFor: "Beste prijs",
      variantTag: "Pure melatonine (time release)",
      summary:
        "Een minimalistische keuze: 299 mcg melatonine per tablet met time-release voor geleidelijke afgifte. De prijs per maand is zodanig laag dat dit de referentie is voor wie puur het slaap-timing-signaal wil ondersteunen zonder extra kruiden of blends.",
      specs: [
        { label: "Dosering per portie", value: "299 mcg melatonine" },
        { label: "Vorm", value: "Tabletten" },
        { label: "Porties per dag", value: "1" },
        { label: "Prijs per maand", value: "€ 1,50" },
      ],
      pros: [
        "Zeer lage prijs per maand",
        "Fysiologische dosering (299 mcg)",
        "Time Released: geleidelijke afgifte",
        "Vegan, gluten- en lactosevrij",
      ],
      cons: [
        "Alleen melatonine, geen ondersteunende stoffen",
        "Tablet-vorm kan iets trager zijn dan capsules",
      ],
      breakdown: [
        { criterium: "Biobeschikbaarheid", score: 7.0 },
        { criterium: "Dosering & werkzame stoffen", score: 7.5 },
        { criterium: "Prijs-kwaliteit", score: 9.5 },
        { criterium: "Transparantie", score: 7.0 },
      ],
      imageSrc: "/images/producten/Lucovitaal-pure-melatonine.jpg",
      imageAlt: "Lucovitaal Melatonine Puur verpakking",
    },
    {
      slug: "vitaminstore-nachtrust-complex",
      name: "Nachtrust Complex met Melatonine",
      brand: "Vitaminstore",
      affiliateSlug: "melatonine-vitaminstore-nachtrust",
      score: 7.2,
      bestFor: "Melatonine + kruiden",
      variantTag: "Melatonine + kruiden (vegicaps)",
      summary:
        "Een klassieke nachtformule: melatonine naast valeriaan, hop, slaapmutsje, passiebloem, citroenmelisse en L-theanine in vegicaps. Praktisch als je één capsule wilt combineren met veel gebruikersreviews — let er wel op dat niet elke exacte mg-waarde per kruid altijd even in detail gepubliceerd is.",
      specs: [
        {
          label: "Dosering per portie",
          value:
            "Melatonine + valeriaan + hop + slaapmutsje + passiebloem + citroenmelisse + L-theanine",
        },
        { label: "Vorm", value: "Vegicaps" },
        { label: "Porties per dag", value: "1" },
        { label: "Prijs per maand", value: "€ 14,98" },
      ],
      pros: [
        "Melatonine én kruiden in één capsule",
        "Sterk beoordeeld door gebruikers",
        "Vegicaps — makkelijk in te nemen",
        "Bundelkorting bij de retailer mogelijk",
      ],
      cons: [
        "Exacte doseringen per ingrediënt niet overal even transparant",
        "Duurder dan puur melatonine als dat je enige doel is",
      ],
      breakdown: [
        { criterium: "Biobeschikbaarheid", score: 7.5 },
        { criterium: "Dosering & werkzame stoffen", score: 7.0 },
        { criterium: "Prijs-kwaliteit", score: 7.5 },
        { criterium: "Transparantie", score: 7.0 },
      ],
      imageSrc: "/images/producten/vitaminstore-melatonine-nacht-complex.jpg",
      imageAlt: "Vitaminstore Nachtrust Complex met melatonine verpakking",
    },
  ],
  tableRows: [
    {
      slug: "vital-nutrition-slaap-complex",
      name: "Vital Nutrition Slaap Complex",
      type: "Slaapcomplex",
      dosering: "Blend (o.a. KSM-66, valeriaan)",
      transparantie: "Hoog",
      gebruiksgemak: "Goed",
      prijs: "€ 13,98/mnd",
      badge: "Beste allround",
    },
    {
      slug: "lucovitaal-melatonine-puur",
      name: "Lucovitaal Puur",
      type: "Melatonine TR",
      dosering: "299 mcg",
      transparantie: "Redelijk",
      gebruiksgemak: "Goed",
      prijs: "€ 1,50/mnd",
      badge: "Beste prijs",
    },
    {
      slug: "vitaminstore-nachtrust-complex",
      name: "Vitaminstore Nachtrust",
      type: "Melatonine + kruiden",
      dosering: "Blend (melatonine + kruiden)",
      transparantie: "Redelijk",
      gebruiksgemak: "Goed",
      prijs: "€ 14,98/mnd",
      badge: "Melatonine + kruiden",
    },
  ],
  comparisonCriteria: [
    "Biobeschikbaarheid",
    "Dosering & werkzame stoffen",
    "Prijs-kwaliteit",
    "Transparantie",
  ],
  faq: [
    {
      question: "Hoeveel melatonine heb ik nodig?",
      answer:
        "Veel mensen benutten het beste een lage, fysiologische dosis — in de buurt van wat je lichaam zelf 's nachts ook maakt (orde grootte 0,3 mg, oftewel 300 mcg). Hogere doses uit de schappen (meerdere mg) zijn zelden nodig en kunnen bij sommigen juist onrust of een zwaar gevoel geven. Begin laag en evalueer: bij supplementen zijn we geen arts — bij twijfel of medicatie, overleg met je huisarts.",
    },
    {
      question: "Is een slaapcomplex beter dan pure melatonine?",
      answer:
        "Dat hangt af van je situatie. Heb je vooral last van een brein dat 's avonds niet loslaat door stress? Dan kan een complex met onder andere ashwagandha (zoals KSM-66) beter passen — zie onze [ashwagandha-vergelijking](/beste-ashwagandha). Is je probleem vooral een duidelijk inslaap- of ritmevraagstuk, dan kan een puur, laag gedoseerd melatonineproduct soms genoeg zijn. Dit artikel zet beide benaderingen naast elkaar.",
    },
    {
      question: "Mag je melatonine elke dag gebruiken?",
      answer:
        "Melatonine is in supplementvorm geen klassiek slaapmiddel op recept; het geeft vooral een tijdssignaal. Langdurig dagelijks gebruik is voor iedereen anders — bij aanhoudende klachten is het verstandig je situatie met een arts te bespreken. Dit is algemene informatie, geen persoonlijk medisch advies.",
    },
    {
      question: "Wat is het verschil tussen Time Released en gewone melatonine?",
      answer:
        "Gewone (directe) melatonine komt relatief snel vrij; time release (retard, TR) geeft de stof geleidelijker af. Sommige mensen merken daardoor minder pieken en dalen door de nacht — handig als je vooral moeite hebt met doorslapen. Het effect is individueel.",
    },
  ],
};
