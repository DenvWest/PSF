import type { ComparisonPageData, EfsaClaimId } from "@/types/supplement";
import { withClaimFields } from "@/lib/product-claim-fields";

const VITAMINE_D_CLAIMS: EfsaClaimId[] = [
  "vitamineD.immune",
  "vitamineD.bones",
  "vitamineD.muscle",
  "vitamineD.calcium-phosphorus",
];

export const vitamineDData: ComparisonPageData = {
  category: "vitamine-d",
  slug: "vitamine-d",
  guideHref: "/supplementen/vitamine-d",
  h1: "Beste vitamine D supplement 2026 — onafhankelijk vergeleken",
  intro:
    "Moe en futloos terwijl de zon maandenlang te weinig schijnt? Vitamine D3 is in Nederland vaak een aandachtspunt na je 40e. Drie D3-producten vergeleken op dosering, kwaliteit, opneembaarheid en prijs per dag — plus D3+K2-combinaties als je die variant overweegt.",
  seoTitle:
    "Vitamine D3 Vergelijken: 3 Merken Getest (2026) | PerfectSupplement",
  seoDescription:
    "3 vitamine D3-producten eerlijk vergeleken op dosering, kwaliteit en prijs per dag (v.a. €0,14). Ook D3+K2 — zonder de hartclaim die EFSA afwees.",
  lastUpdated: "2026-09-01",
  tableDoseringColumnLabel: "µg (IU) / dag",
  ogImage: "https://perfectsupplement.nl/images/producten/Vitaminstore-Super-D3.jpg",
  ogImageAlt: "Vitaminstore Super D3 — topkeuze in de vergelijking",
  topProductLabel: "Topkeuze",
  showEducationalLead: true,
  showIntakeFallbackCta: true,
  breadcrumbs: [
    { name: "Home", url: "https://perfectsupplement.nl" },
    { name: "Supplementen", url: "https://perfectsupplement.nl/supplementen/vitamine-d" },
    { name: "Beste vitamine D", url: "https://perfectsupplement.nl/beste/vitamine-d" },
  ],
  moreAboutTitle: "Meer over vitamine D",
  moreAboutDescription: "Vitamine D draagt o.a. bij tot normale botten, spieren en een normaal immuunsysteem — thema\u2019s die na je 40e vaker bespreekbaar worden met je zorgverlener.",
  moreAboutLinks: [
    { href: "/supplementen/vitamine-d", label: "Meer weten over vitamine D? Lees de uitgebreide gids →" },
    { href: "/kennisbank/vitamine-k2", label: "Wat K2 wél mag beloven — en de hartclaim die EFSA afwees →" },
    { href: "/gids/energie", label: "Energieverlies na je 40e — oorzaken en oplossingen →" },
  ],
  readAlsoCards: [
    {
      href: "/energie-na-40",
      text: "Energie is breder dan één capsule: slaap, beweging en stress spelen mee.",
      cta: "Naar energie-pillar →",
    },
    {
      href: "/blog/vitamine-d-en-energie",
      text: "Wat vitamine D wél belooft op het etiket — en wat niet.",
      cta: "Lees het cluster-artikel →",
    },
    {
      href: "/blog/vitamine-d-tekort-herkennen",
      text: "Signalen en vervolgstappen zonder zelf-diagnose.",
      cta: "Lees het artikel →",
    },
  ],
  choiceRoutes: [
    {
      badgeLabel: "Topkeuze",
      productName: "Vitaminstore Super D3 25 mcg",
      teaser:
        "Scherpste prijs per dag (€0,14) met Quali-D keurmerk. 150 reviews met perfecte score — de dagelijkse basis voor iedereen.",
      affiliateSlug: "vitaminstore-super-d3",
      slug: "vitaminstore-super-d3",
    },
    {
      badgeLabel: "Hoogste dosering",
      productName: "Vital Nutrition Vitamine D3 75 mcg",
      teaser:
        "75 mcg (3000 IU) met olijfolie als drager voor optimale opname. Ideaal bij bewezen tekort of de donkere wintermaanden.",
      affiliateSlug: "vitalnutrition-vitamin-d3",
      slug: "vitalnutrition-vitamin-d3",
    },
    {
      badgeLabel: "Vertrouwd merk",
      productName: "Solgar Vitamin D-3 25 µg",
      teaser:
        "Solgar — internationaal vertrouwd merk met 75+ jaar ervaring. Natuurlijke levertraanbron, vrij van vitamine A.",
      affiliateSlug: "solgar-vitamin-d3",
      slug: "solgar-vitamin-d3",
    },
  ],
  products: [
    withClaimFields({
      slug: "vitaminstore-super-d3",
      name: "Vitaminstore Super D3 25 mcg",
      brand: "Vitaminstore",
      affiliateSlug: "vitaminstore-super-d3",
      score: 9.0,
      bestFor: "Topkeuze",
      variantTag: "25 mcg (1000 IU) — Quali-D gecertificeerd",
      summary:
        "De scherpste prijs per dag (€0,14) gecombineerd met het Quali-D keurmerk — de hoogste kwaliteitsstandaard voor cholecalciferol. 150 reviews met een perfecte 5-sterrenscore maken dit de meest vertrouwde dagelijkse onderhoudsdosering in deze vergelijking.",
      specs: [
        { label: "Vorm", value: "D3 (cholecalciferol)" },
        { label: "Keurmerk", value: "Quali-D®" },
        { label: "Dosering", value: "25 mcg (1000 IU) per softgel" },
        { label: "Inhoud", value: "100 softgels" },
        { label: "Prijs / dag", value: "€ 0,14" },
        { label: "Prijs", value: "€ 13,95 (100 stuks)" },
        { label: "Vegan", value: "Nee (gelatine)" },
        { label: "Reviews", value: "150 (5★)" },
      ],
      pros: [
        "Scherpste prijs per dag van alle producten (€0,14)",
        "Quali-D gecertificeerd — hoogste kwaliteitsstandaard",
        "150 reviews met perfecte score",
      ],
      cons: [
        "Bevat gelatine — niet vegan",
        "25 mcg kan te laag zijn bij ernstig tekort (50–75 mcg gangbaar)",
      ],
      breakdown: [
        { criterium: "Kwaliteit/vorm", score: 9 },
        { criterium: "Dosering", score: 7 },
        { criterium: "Prijs/kwaliteit", score: 10 },
        { criterium: "Transparantie", score: 9 },
      ],
      imageSrc: "/images/producten/Vitaminstore-Super-D3.jpg",
      imageAlt: "Vitaminstore Super D3 25 mcg softgels verpakking",
      werkzameStof: "vitamineD",
      vorm: "D3 (cholecalciferol)",
      doseringPerDagdosis: {
        hoeveelheid: 25,
        eenheid: "ug",
        elementair: true,
        perServing: 1,
      },
      efsaClaimIds: VITAMINE_D_CLAIMS,
      thirdPartyTested: false,
    }),
    withClaimFields({
      slug: "vitalnutrition-vitamin-d3",
      name: "Vital Nutrition Vitamine D3 75 mcg",
      brand: "Vital Nutrition",
      affiliateSlug: "vitalnutrition-vitamin-d3",
      score: 8.8,
      bestFor: "Hoogste dosering",
      variantTag: "75 mcg (3000 IU) — met olijfolie",
      summary:
        "De hoogst gedoseerde optie in deze vergelijking: 75 mcg (3000 IU) per softgel met olijfolie als drager voor optimale vetoplosbare opname. Nederlands geproduceerd en lab getest — de beste keuze bij bewezen vitamine D-tekort of tijdens de wintermaanden.",
      specs: [
        { label: "Vorm", value: "D3 (cholecalciferol)" },
        { label: "Drager", value: "Olijfolie" },
        { label: "Dosering", value: "75 mcg (3000 IU) per softgel" },
        { label: "Inhoud", value: "100 softgels" },
        { label: "Prijs / dag", value: "€ 0,20" },
        { label: "Prijs", value: "€ 19,95" },
        { label: "Vegan", value: "Nee (check)" },
        { label: "Reviews", value: "10 (5★)" },
      ],
      pros: [
        "Hoogste dosering (75 mcg / 3000 IU) — ideaal bij tekort",
        "Met olijfolie als drager voor betere vetoplosbare opname",
        "Nederlands geproduceerd, lab getest",
      ],
      cons: [
        "Hogere prijs per dag dan Vitaminstore Super D3",
        "3000 IU kan te hoog zijn voor langdurig onderhoud zonder bloedtest",
      ],
      breakdown: [
        { criterium: "Kwaliteit/vorm", score: 9 },
        { criterium: "Dosering", score: 10 },
        { criterium: "Prijs/kwaliteit", score: 8 },
        { criterium: "Transparantie", score: 9 },
      ],
      imageSrc: "/images/producten/Vital-Nutrition-Vitamin-D3.jpg",
      imageAlt: "Vital Nutrition Vitamine D3 75 mcg softgels verpakking",
      werkzameStof: "vitamineD",
      vorm: "D3 (cholecalciferol)",
      doseringPerDagdosis: {
        hoeveelheid: 75,
        eenheid: "ug",
        elementair: true,
        perServing: 1,
      },
      efsaClaimIds: VITAMINE_D_CLAIMS,
      thirdPartyTested: true,
    }),
    withClaimFields({
      slug: "solgar-vitamin-d3",
      name: "Solgar Vitamin D-3 25 µg",
      brand: "Solgar Vitamins",
      affiliateSlug: "solgar-vitamin-d3",
      score: 8.4,
      bestFor: "Vertrouwd merk",
      variantTag: "25 mcg (1000 IU) — uit levertraan",
      summary:
        "Solgar — internationaal vertrouwd merk met meer dan 75 jaar ervaring. Vitamine D3 uit levertraan als natuurlijke bron, vrij van vitamine A. Met 163 reviews en een perfecte score de meest beoordeelde optie in deze vergelijking.",
      specs: [
        { label: "Vorm", value: "D3 (cholecalciferol)" },
        { label: "Bron", value: "Levertraan (natuurlijk)" },
        { label: "Dosering", value: "25 mcg (1000 IU) per softgel" },
        { label: "Inhoud", value: "100 softgels" },
        { label: "Prijs / dag", value: "€ 0,16" },
        { label: "Prijs", value: "€ 15,95 (100 stuks)" },
        { label: "Vegan", value: "Nee" },
        { label: "Reviews", value: "163 (5★)" },
      ],
      pros: [
        "Solgar — internationaal vertrouwd merk met 75+ jaar ervaring",
        "Natuurlijke bron (levertraan) zonder toegevoegde vitamine A",
        "Meeste reviews (163) met perfecte score",
      ],
      cons: [
        "Duurder per dag dan Vitaminstore Super D3 bij gelijke dosering",
        "Levertraan-bron niet geschikt voor veganisten of pescetariërs",
      ],
      breakdown: [
        { criterium: "Kwaliteit/vorm", score: 8 },
        { criterium: "Dosering", score: 7 },
        { criterium: "Prijs/kwaliteit", score: 8 },
        { criterium: "Transparantie", score: 9 },
      ],
      imageSrc: "/images/producten/Solgar-VitaminD-3.jpg",
      imageAlt: "Solgar Vitamin D-3 25 µg softgels verpakking",
      werkzameStof: "vitamineD",
      vorm: "D3 (cholecalciferol, levertraan)",
      doseringPerDagdosis: {
        hoeveelheid: 25,
        eenheid: "ug",
        elementair: true,
        perServing: 1,
      },
      efsaClaimIds: VITAMINE_D_CLAIMS,
      thirdPartyTested: false,
    }),
    withClaimFields({
      slug: "vitaminstore-d3-k2-softgels",
      name: "Vitaminstore Vitamine D3 & K2",
      brand: "Vitaminstore",
      affiliateSlug: "vitaminstore-d3-k2-softgels",
      score: 8.6,
      bestFor: "Dagelijks combo",
      variantTag: "D3 + K2 MK-7 — softgels",
      summary:
        "Onderhoudsdosering in één softgel: 25 mcg D3 plus 45 mcg K2 als menaquinon-7, opgelost in olijfolie. Vitamine D draagt bij tot de normale opname van calcium en fosfor; vitamine K draagt bij tot de instandhouding van normale botten en tot de normale bloedstolling. Geen erkende hart- of bloedvatenclaim.",
      specs: [
        { label: "Vorm", value: "D3 + K2 (MK-7) in olijfolie" },
        { label: "Dosering", value: "25 mcg D3 + 45 mcg K2 per softgel" },
        { label: "Inhoud", value: "60 softgels" },
        { label: "Prijs / dag", value: "€ 0,27" },
        { label: "Prijs", value: "€ 15,95 (60 stuks)" },
        { label: "Vegan", value: "Nee (gelatine)" },
        { label: "Reviews", value: "23" },
      ],
      pros: [
        "MK-7 plus olijfolie in één dagelijkse softgel",
        "Beide stoffen boven de EU-drempel voor erkende claims",
        "Eigen merk, scherp geprijsd voor een combo",
      ],
      cons: [
        "Bevat gelatine — niet vegan",
        "25 mcg D3 is onderhoud, geen hoge winterdosis",
      ],
      breakdown: [
        { criterium: "Kwaliteit/vorm", score: 9 },
        { criterium: "Dosering", score: 7 },
        { criterium: "Prijs/kwaliteit", score: 8 },
        { criterium: "Transparantie", score: 8 },
      ],
      imageSrc: "/images/producten/Vitaminstore-Vitamine-D3-K2.jpg",
      imageAlt: "Vitaminstore Vitamine D3 & K2 softgels verpakking",
      werkzameStof: "vitamineD",
      vorm: "D3 (cholecalciferol) + K2 (MK-7) in olijfolie",
      doseringPerDagdosis: {
        hoeveelheid: 25,
        eenheid: "ug",
        elementair: true,
        perServing: 1,
      },
      efsaClaimIds: VITAMINE_D_CLAIMS,
      thirdPartyTested: false,
    }),
    withClaimFields({
      slug: "vitaminstore-d3-k2-drops",
      name: "Vitaminstore Vitamine D3 & K2 Druppels",
      brand: "Vitaminstore",
      affiliateSlug: "vitaminstore-d3-k2-drops",
      score: 8.5,
      bestFor: "Druppels",
      variantTag: "D3 + K2 MK-7 — druppels",
      summary:
        "Zelfde formule als de softgels — 25 mcg D3 en 45 mcg K2 als MK-7 per 3 druppels, in olijfolie — maar vloeibaar. Handig als je geen capsules wilt, of de dosis wilt bijstellen (etiket: 3–6 druppels bij de maaltijd).",
      specs: [
        { label: "Vorm", value: "D3 + K2 (MK-7) druppels in olijfolie" },
        { label: "Dosering", value: "25 mcg D3 + 45 mcg K2 per 3 druppels" },
        { label: "Inhoud", value: "25 ml (~166 dagen bij 3 druppels)" },
        { label: "Prijs / dag", value: "€ 0,21" },
        { label: "Prijs", value: "€ 34,95 (25 ml)" },
        { label: "Vegan", value: "Ja (geen gelatine)" },
      ],
      pros: [
        "MK-7 in olijfolie, zonder capsule",
        "Dosis per druppel aanpasbaar",
        "Laagste prijs per dag van de combo’s bij 3 druppels",
      ],
      cons: [
        "Fles is duurder in één keer (€34,95)",
        "Tellen van druppels vraagt meer routine dan één softgel",
      ],
      breakdown: [
        { criterium: "Kwaliteit/vorm", score: 9 },
        { criterium: "Dosering", score: 8 },
        { criterium: "Prijs/kwaliteit", score: 8 },
        { criterium: "Transparantie", score: 8 },
      ],
      imageSrc: "/images/producten/Vitaminstore-Vitamine-D3-K2-Druppels.jpg",
      imageAlt: "Vitaminstore Vitamine D3 & K2 druppels verpakking",
      werkzameStof: "vitamineD",
      vorm: "D3 (cholecalciferol) + K2 (MK-7) druppels in olijfolie",
      doseringPerDagdosis: {
        hoeveelheid: 25,
        eenheid: "ug",
        elementair: true,
        perServing: 1,
      },
      efsaClaimIds: VITAMINE_D_CLAIMS,
      thirdPartyTested: false,
    }),
    withClaimFields({
      slug: "vitalnutrition-d3-k2",
      name: "Vital Nutrition Vitamine D3 + K2",
      brand: "Vital Nutrition",
      affiliateSlug: "vitalnutrition-d3-k2",
      score: 8.7,
      bestFor: "Lab getest",
      variantTag: "D3 + K2 MK-7 — softgels",
      summary:
        "25 mcg D3 (cholecalciferol) plus 37,5 mcg K2 als MK-7 in olijfolie. Nederlands geproduceerd en lab getest op zware metalen en mycotoxines — de meest transparante combo in deze set. Geen vegan optie: lanoline-D3 en rundergelatine.",
      specs: [
        { label: "Vorm", value: "D3 + K2 (MK-7) in olijfolie" },
        { label: "Dosering", value: "25 mcg D3 + 37,5 mcg K2 per softgel" },
        { label: "Inhoud", value: "60 softgels" },
        { label: "Prijs / dag", value: "€ 0,33" },
        { label: "Prijs", value: "€ 19,95" },
        { label: "Vegan", value: "Nee (gelatine, lanoline)" },
        { label: "Reviews", value: "7" },
      ],
      pros: [
        "MK-7 met olijfolie, lab getest",
        "Nederlands geproduceerd, etiket uitgesplitst",
        "Tweede merchant naast Vitaminstore",
      ],
      cons: [
        "Hoogste prijs per dag van de drie combo’s",
        "Iets lagere K2-dosis (37,5 mcg) dan Vitaminstore (45 mcg)",
      ],
      breakdown: [
        { criterium: "Kwaliteit/vorm", score: 9 },
        { criterium: "Dosering", score: 7 },
        { criterium: "Prijs/kwaliteit", score: 7 },
        { criterium: "Transparantie", score: 10 },
      ],
      imageSrc: "/images/producten/Vital-Nutrition-Vitamine-D3-K2.jpg",
      imageAlt: "Vital Nutrition Vitamine D3 + K2 softgels verpakking",
      werkzameStof: "vitamineD",
      vorm: "D3 (cholecalciferol) + K2 (MK-7) in olijfolie",
      doseringPerDagdosis: {
        hoeveelheid: 25,
        eenheid: "ug",
        elementair: true,
        perServing: 1,
      },
      efsaClaimIds: VITAMINE_D_CLAIMS,
      thirdPartyTested: true,
    }),
  ],
  tableRows: [
    {
      slug: "vitaminstore-super-d3",
      name: "Vitaminstore Super D3",
      type: "Cholecalciferol",
      dosering: "25 µg (1000 IU) / dag",
      transparantie: "Hoog",
      gebruiksgemak: "Uitstekend",
      prijs: "€ 0,14/dag",
      badge: "Topkeuze",
    },
    {
      slug: "vitalnutrition-vitamin-d3",
      name: "Vital Nutrition D3 75 mcg",
      type: "Cholecalciferol + olijfolie",
      dosering: "75 µg (3000 IU) / dag",
      transparantie: "Hoog",
      gebruiksgemak: "Goed",
      prijs: "€ 0,20/dag",
      badge: "Hoogste dosering",
    },
    {
      slug: "solgar-vitamin-d3",
      name: "Solgar Vitamin D-3",
      type: "Levertraan",
      dosering: "25 µg (1000 IU) / dag",
      transparantie: "Hoog",
      gebruiksgemak: "Goed",
      prijs: "€ 0,16/dag",
      badge: "Vertrouwd merk",
    },
  ],
  comboVariant: {
    heading: "Vitamine D3 met K2 — als je de combinatie zoekt",
    intro:
      "In de praktijk koopt de doelgroep D3+K2 vaak als één product. Vitamine K draagt bij tot de instandhouding van normale botten en tot de normale bloedstolling — beide geautoriseerde EFSA-claims. De hart- en bloedvatenclaim voor K2 is door EFSA expliciet afgewezen: D3 werkt niet 'niet zonder K2', en calcium-in-slagaders hoort niet op het etiket. Kies MK-7 boven MK-4, bij voorkeur in olie, en overleg bij antistollingsmiddelen eerst met je arts.",
    choiceRoutes: [
      {
        badgeLabel: "Dagelijks combo",
        productName: "Vitaminstore Vitamine D3 & K2",
        teaser:
          "25 mcg D3 + 45 mcg K2 als MK-7 in olijfolie. Eén softgel per dag — de meest gangbare combo.",
        affiliateSlug: "vitaminstore-d3-k2-softgels",
        slug: "vitaminstore-d3-k2-softgels",
      },
      {
        badgeLabel: "Druppels",
        productName: "Vitaminstore Vitamine D3 & K2 Druppels",
        teaser:
          "Zelfde MK-7-formule, vloeibaar. Handig zonder capsules, of als je de dosis per druppel wilt bijstellen.",
        affiliateSlug: "vitaminstore-d3-k2-drops",
        slug: "vitaminstore-d3-k2-drops",
      },
      {
        badgeLabel: "Lab getest",
        productName: "Vital Nutrition Vitamine D3 + K2",
        teaser:
          "MK-7 in olijfolie, Nederlands geproduceerd en lab getest. Iets duurder per dag, meer transparantie.",
        affiliateSlug: "vitalnutrition-d3-k2",
        slug: "vitalnutrition-d3-k2",
      },
    ],
    tableRows: [
      {
        slug: "vitaminstore-d3-k2-softgels",
        name: "Vitaminstore D3 & K2",
        type: "D3 + K2 MK-7, olijfolie",
        dosering: "25 µg D3 + 45 µg K2 / dag",
        transparantie: "Hoog",
        gebruiksgemak: "Uitstekend",
        prijs: "€ 0,27/dag",
        badge: "Dagelijks combo",
      },
      {
        slug: "vitaminstore-d3-k2-drops",
        name: "Vitaminstore D3 & K2 druppels",
        type: "D3 + K2 MK-7, druppels",
        dosering: "25 µg D3 + 45 µg K2 / 3 druppels",
        transparantie: "Hoog",
        gebruiksgemak: "Goed",
        prijs: "€ 0,21/dag",
        badge: "Druppels",
      },
      {
        slug: "vitalnutrition-d3-k2",
        name: "Vital Nutrition D3 + K2",
        type: "D3 + K2 MK-7, olijfolie",
        dosering: "25 µg D3 + 37,5 µg K2 / dag",
        transparantie: "Zeer hoog",
        gebruiksgemak: "Uitstekend",
        prijs: "€ 0,33/dag",
        badge: "Lab getest",
      },
    ],
  },
  comparisonCriteria: [
    "Kwaliteit/vorm",
    "Dosering",
    "Prijs/kwaliteit",
    "Transparantie",
  ],
  faq: [
    {
      question: "Hoeveel vitamine D heb ik per dag nodig?",
      answer:
        "De Gezondheidsraad adviseert 10 mcg (400 IU) voor volwassenen, maar veel onderzoekers en artsen adviseren 25–50 mcg (1000–2000 IU), vooral bij beperkte zonblootstelling. Mannen 40+ in Nederland voldoen zelden aan hun behoefte via zon alleen.",
    },
    {
      question: "Kan ik te veel vitamine D nemen?",
      answer:
        "Bij langdurig gebruik boven 100 mcg (4000 IU) per dag is voorzichtigheid geboden. Laat bij hogere doseringen je bloedwaarden controleren via een huisarts of bloedtest. De producten in deze vergelijking (25–75 mcg) zitten ruim binnen de veilige bovengrens.",
    },
    {
      question: "Is vitamine D uit levertraan beter?",
      answer:
        "Levertraan is een natuurlijke bron, maar niet per se beter opneembaar dan synthetisch cholecalciferol. Beide vormen zijn effectief in het verhogen van je 25(OH)D-bloedwaarden. Het verschil zit in de bron, niet in de biologische beschikbaarheid.",
    },
    {
      question: "Waarom is vitamine D vaak ter sprake bij hormonale gezondheid?",
      answer:
        "Vitamine D is geen testosteron-claim op het etiket in de EU. Wel draagt vitamine D o.a. bij tot normale spierwerking en een normaal functionerend immuunsysteem. Observatieonderzoek koppelt lage 25(OH)D-waarden aan diverse gezondheidsmarkers — dat is correlatie, geen reden om zelf hoge doses te nemen zonder advies. Laat bloedwaarden en suppletie afstemmen met een zorgverlener.",
    },
    {
      question: "Kan ik vitamine D combineren met magnesium?",
      answer:
        "Ja — magnesium is nodig voor activatie van vitamine D in het lichaam. Zonder voldoende magnesium kan vitamine D niet optimaal worden omgezet naar zijn actieve vorm. Overweeg beide als je een tekort aanvult. Bekijk onze [magnesiumvergelijking](/beste/magnesium) voor productkeuze.",
    },
    {
      question: "Heb ik vitamine D met of zonder K2 nodig?",
      answer:
        "D3 alleen is een volwaardige keuze: de erkende vitamine-D-claims (botten, spieren, immuunsysteem, calciumopname) gelden ook zonder K2. Een combo is zinvol als je beide stoffen in één product wilt. K2 heeft eigen erkende claims op botten en bloedstolling — niet op hart en bloedvaten. Zie [vitamine K2](/kennisbank/vitamine-k2) voor de claimgrens.",
    },
    {
      question: "Waarom wordt D3 vaak met K2 gecombineerd?",
      answer:
        "Beide zijn vetoplosbaar en worden vaak samen in olie verkocht. De marketingzin 'D3 werkt niet zonder K2' is een overclaim: EFSA heeft de hartclaim voor K2 afgewezen. Wat wél mag: vitamine D draagt bij tot de normale opname van calcium en fosfor; vitamine K draagt bij tot de instandhouding van normale botten en tot de normale bloedstolling.",
    },
    {
      question: "Welke K2-vorm en dosering is gangbaar?",
      answer:
        "MK-7 (menaquinon-7) blijft langer in het bloed dan MK-4 en past bij één dosis per dag. De combo’s hier gebruiken 37,5–45 mcg MK-7 — ruim boven de 11,25 mcg die de EU-claimdrempel (15% RI) vraagt. NOW-varianten met MK-4 laten we bewust buiten de topkeuze.",
    },
    {
      question: "Wanneer neem ik vitamine D3 en K2 in?",
      answer:
        "Bij een maaltijd met vet. D3 en K2 zijn vetoplosbaar; olijfolie in de capsule of druppel helpt, een vetrijke maaltijd ook. Avond of ochtend maakt voor de erkende claims niet uit — consistentie wel.",
    },
    {
      question: "D3+K2: druppels of capsules?",
      answer:
        "Softgels zijn het makkelijkst vol te houden (één stuk, vaste dosis). Druppels zijn handig zonder capsules en laten de dosis bijstellen (3–6 druppels volgens het etiket). De werkzame stoffen zijn hetzelfde: D3 plus K2 als MK-7 in olijfolie.",
    },
    {
      question: "Kan ik D3+K2 gebruiken naast bloedverdunners?",
      answer:
        "Overleg eerst met je arts of apotheker. Vitamine K draagt bij tot de normale bloedstolling; bij vitamine-K-antagonisten (zoals acenocoumarol of fenprocoumon) kan extra K2 de werking beïnvloeden. Dat is geen reden tot paniek, wel tot overleg vóór je start.",
    },
  ],
};
