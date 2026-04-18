import type { ComparisonPageData } from "@/types/supplement";

export const magnesiumData: ComparisonPageData = {
  category: "magnesium",
  h1: "Welke magnesium past bij jou?",
  intro:
    "Magnesiumsupplementen vergeleken op vorm, elementaire dosering, prijs per dag en toepasbaarheid — zodat je weet welke variant bij jouw doel past.",
  seoTitle: "Beste magnesium supplement 2026 — onafhankelijk vergeleken",
  seoDescription:
    "Vergelijk magnesiumsupplementen op vorm (bisglycinaat, citraat, malaat), dosering en prijs per dag. Onafhankelijke analyse voor mannen 40+.",
  lastUpdated: "2026-04-18",
  choiceRoutes: [
    {
      badgeLabel: "Beste allround",
      productName: "Vitaminstore Super Magnesium",
      teaser:
        "Complex met 5 vormen waaronder bisglycinaat, citraat en tauraat. Dekt meerdere doelen tegelijk.",
      affiliateSlug: "vitaminstore-super-magnesium",
      slug: "vitaminstore-super-magnesium",
    },
    {
      badgeLabel: "Beste voor slaap",
      productName: "Magnesium Bisglycinaat (puur)",
      teaser:
        "Enkele vorm, hoge opneembaarheid. Ideaal als avondroutine voor betere slaap.",
      affiliateSlug: "magnesium-bisglycinaat",
      slug: "magnesium-bisglycinaat-puur",
    },
    {
      badgeLabel: "Beste prijs",
      productName: "Magnesium Citraat",
      teaser:
        "Bewezen opneembare vorm tegen de scherpste prijs per dag. Goed startpunt.",
      affiliateSlug: "magnesium-citraat",
      slug: "magnesium-citraat",
    },
  ],
  products: [
    {
      slug: "vitaminstore-super-magnesium",
      name: "Vitaminstore Super Magnesium",
      brand: "Vitaminstore",
      affiliateSlug: "vitaminstore-super-magnesium",
      score: 8.5,
      bestFor: "Beste allround",
      variantTag: "Complex (5 vormen)",
      summary:
        "Combineert bisglycinaat, citraat, tauraat, malaat en glycerofosfaat in één tablet. Dekt slaap, stress, energie en algemeen welzijn zonder meerdere potjes.",
      specs: [
        { label: "Vormen", value: "5 (bisglycinaat, citraat, tauraat, malaat, glycerofosfaat)" },
        { label: "Elementair Mg", value: "200 mg / 2 tabletten" },
        { label: "Vorm", value: "Tabletten" },
        { label: "Prijs / dag", value: "€ 0,43" },
        { label: "Inhoud", value: "120 tabletten (60 dagen)" },
      ],
      pros: [
        "Vijf vormen — breed spectrum",
        "Geen oxide als hoofdvorm",
        "Redelijke prijs per dag voor een complex",
      ],
      cons: [
        "Exacte verdeling per vorm niet op etiket",
        "Tabletten, geen capsules (minder snel opneembaar)",
        "Coating bevat hydroxypropylmethylcellulose",
      ],
      breakdown: [
        { criterium: "Vormkwaliteit", score: 9 },
        { criterium: "Dosering", score: 8 },
        { criterium: "Transparantie", score: 7 },
        { criterium: "Prijs/kwaliteit", score: 8 },
      ],
      imageSrc: "",
      imageAlt: "Vitaminstore Super Magnesium verpakking",
    },
    {
      slug: "magnesium-bisglycinaat-puur",
      name: "Magnesium Bisglycinaat (puur)",
      brand: "Nog te selecteren",
      affiliateSlug: "magnesium-bisglycinaat",
      score: 0,
      bestFor: "Beste voor slaap",
      variantTag: "Bisglycinaat (enkele vorm)",
      summary:
        "Puur magnesium bisglycinaat — de meest onderzochte vorm voor slaap en ontspanning. Glycine heeft zelf een kalmerend effect op het zenuwstelsel.",
      specs: [
        { label: "Vormen", value: "1 (bisglycinaat)" },
        { label: "Elementair Mg", value: "Nog te verifiëren" },
        { label: "Vorm", value: "Capsules" },
        { label: "Prijs / dag", value: "Nog te verifiëren" },
        { label: "Inhoud", value: "Nog te verifiëren" },
      ],
      pros: [
        "Beste vorm voor slaap en stress",
        "Glycine heeft eigen kalmerend effect",
        "Mild voor de maag",
      ],
      cons: [
        "Product nog niet geselecteerd",
        "Dekt maar één domein optimaal",
      ],
      breakdown: [
        { criterium: "Vormkwaliteit", score: 10 },
        { criterium: "Dosering", score: 0 },
        { criterium: "Transparantie", score: 0 },
        { criterium: "Prijs/kwaliteit", score: 0 },
      ],
      imageSrc: "",
      imageAlt: "",
    },
    {
      slug: "magnesium-citraat",
      name: "Magnesium Citraat",
      brand: "Nog te selecteren",
      affiliateSlug: "magnesium-citraat",
      score: 0,
      bestFor: "Beste prijs",
      variantTag: "Citraat (enkele vorm)",
      summary:
        "Goed opneembare, betaalbare vorm. Breed inzetbaar voor wie een eenvoudig en bewezen magnesiumsupplement zoekt.",
      specs: [
        { label: "Vormen", value: "1 (citraat)" },
        { label: "Elementair Mg", value: "Nog te verifiëren" },
        { label: "Vorm", value: "Capsules of poeder" },
        { label: "Prijs / dag", value: "Nog te verifiëren" },
        { label: "Inhoud", value: "Nog te verifiëren" },
      ],
      pros: [
        "Goed opneembaar",
        "Vaak de scherpste prijs per dag",
        "Breed beschikbaar",
      ],
      cons: [
        "Product nog niet geselecteerd",
        "Kan laxerend werken bij hoge doses",
      ],
      breakdown: [
        { criterium: "Vormkwaliteit", score: 8 },
        { criterium: "Dosering", score: 0 },
        { criterium: "Transparantie", score: 0 },
        { criterium: "Prijs/kwaliteit", score: 0 },
      ],
      imageSrc: "",
      imageAlt: "",
    },
  ],
  tableRows: [
    {
      slug: "vitaminstore-super-magnesium",
      name: "Vitaminstore Super Magnesium",
      type: "Complex (5 vormen)",
      dosering: "200 mg elem. / 2 tab",
      transparantie: "Goed",
      gebruiksgemak: "Goed",
      prijs: "€ 0,43/dag",
      badge: "Beste allround",
    },
    {
      slug: "magnesium-bisglycinaat-puur",
      name: "Bisglycinaat (puur)",
      type: "Enkele vorm",
      dosering: "Nog te verifiëren",
      transparantie: "Nog te verifiëren",
      gebruiksgemak: "Nog te verifiëren",
      prijs: "Nog te verifiëren",
      badge: "Beste voor slaap",
    },
    {
      slug: "magnesium-citraat",
      name: "Citraat",
      type: "Enkele vorm",
      dosering: "Nog te verifiëren",
      transparantie: "Nog te verifiëren",
      gebruiksgemak: "Nog te verifiëren",
      prijs: "Nog te verifiëren",
      badge: "Beste prijs",
    },
  ],
  comparisonCriteria: [
    "Vormkwaliteit",
    "Dosering",
    "Transparantie",
    "Prijs/kwaliteit",
  ],
  faq: [
    {
      question: "Welke vorm magnesium is het beste?",
      answer:
        "Dat hangt af van je doel. Bisglycinaat is het best onderzocht voor slaap en stress. Citraat is goed opneembaar en betaalbaar voor algemeen gebruik. Een complex met meerdere vormen dekt de breedste basis.",
    },
    {
      question: "Hoeveel magnesium per dag heb ik nodig?",
      answer:
        "De aanbevolen dagelijkse hoeveelheid voor mannen is 350-400 mg. Via voeding krijg je gemiddeld 270-300 mg binnen. Het tekort van 80-120 mg kun je aanvullen met een supplement. Let op: kijk naar elementair magnesium, niet het totaalgewicht van de verbinding.",
    },
    {
      question: "Wat is het verschil tussen elementair magnesium en totaal magnesium?",
      answer:
        "Magnesium zit altijd gebonden aan een andere stof (glycine, citroenzuur, etc.). Een capsule van 500 mg magnesium bisglycinaat bevat maar ~70 mg elementair magnesium — dat is wat je lichaam daadwerkelijk gebruikt. Vergelijk altijd op elementair gewicht.",
    },
    {
      question: "Kan ik te veel magnesium nemen?",
      answer:
        "De EFSA-bovengrens voor suppletie is 350 mg elementair magnesium per dag bovenop voeding. Hogere doses kunnen maag-darmklachten veroorzaken, vooral bij citraat en oxide. Bij nierproblemen altijd eerst overleggen met een arts.",
    },
    {
      question: "Wanneer neem ik magnesium het beste in?",
      answer:
        "Voor slaap: 30-60 minuten voor het slapen, bij voorkeur bisglycinaat. Voor energie of sport: bij een maaltijd overdag, bij voorkeur malaat of citraat. Een complex kun je het beste verdelen over twee momenten.",
    },
  ],
};
