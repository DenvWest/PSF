import type { ComparisonPageData, EfsaClaimId } from "@/types/supplement";
import { withClaimFields } from "@/lib/product-claim-fields";

const MAGNESIUM_SLEEP_CLAIMS: EfsaClaimId[] = [
  "magnesium.nerve-function",
  "magnesium.muscle-function",
  "magnesium.fatigue",
  "magnesium.psychological-function",
];

export const magnesiumData: ComparisonPageData = {
  category: "magnesium",
  slug: "magnesium",
  guideHref: "/supplementen/magnesium",
  h1: "Welke magnesium past bij jou?",
  intro:
    "Slecht slapen, gespannen spieren of moeilijk tot rust komen? Magnesium wordt vaak genoemd — maar bisglycinaat, citraat of complex maakt wél uit. Drie producten vergeleken op vorm, elementaire dosering en prijs per dag.",
  seoTitle: "Beste magnesium supplement 2026 — onafhankelijk vergeleken",
  seoDescription:
    "Vergelijk magnesiumsupplementen op vorm (bisglycinaat, citraat, complex), dosering en prijs per dag. Onafhankelijke analyse voor mannen 40+.",
  lastUpdated: "2026-04-18",
  tableDoseringColumnLabel: "Elementair mg / dag",
  topProductLabel: "Beste allround",
  showEducationalLead: false,
  showIntakeFallbackCta: true,
  breadcrumbs: [
    { name: "Home", url: "https://perfectsupplement.nl" },
    { name: "Vergelijkingen", url: "https://perfectsupplement.nl/beste/magnesium" },
    { name: "Beste magnesium", url: "https://perfectsupplement.nl/beste/magnesium" },
  ],
  moreAboutTitle: "Meer over magnesium",
  moreAboutLinks: [
    { href: "/beste/magnesium", label: "Magnesium vormen vergelijken — waar let je op per vorm en dosering? →" },
    { href: "/blog/magnesium-en-slaapkwaliteit", label: "Magnesium en slaapkwaliteit: wat zegt het onderzoek? →" },
  ],
  readAlsoCards: [
    {
      href: "/slaap-verbeteren-na-40",
      text: "Slaap na 40 in context — ritme, licht en supplementen in één pillar.",
      cta: "Naar slaap-pillar →",
    },
    {
      href: "/blog/magnesium-en-slaapkwaliteit",
      text: "Cluster-artikel: hoe magnesium past in slaapkwaliteit zonder marketing-claims.",
      cta: "Lees het artikel →",
    },
    {
      href: "/blog/magnesium-en-slaap",
      text: "Korter artikel: magnesium voor slaap — vorm, dosering en timing.",
      cta: "Lees het artikel →",
    },
  ],
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
      badgeLabel: "Beste bisglycinaat",
      productName: "Viridian Magnesium Bisglycinate",
      teaser:
        "Puur bisglycinaat, vegetarisch, van een gerespecteerd supplementmerk. Veel gekozen voor inname later op de dag.",
      affiliateSlug: "viridian-bisglycinaat",
      slug: "viridian-bisglycinaat",
    },
    {
      badgeLabel: "Beste prijs",
      productName: "Vital Nutrition Magnesium Citraat",
      teaser:
        "Scherpe prijs per dag voor een goed opneembare vorm. Solide startpunt.",
      affiliateSlug: "vital-nutrition-citraat",
      slug: "vital-nutrition-citraat",
    },
  ],
  products: [
    withClaimFields({
      slug: "vitaminstore-super-magnesium",
      name: "Vitaminstore Super Magnesium",
      brand: "Vitaminstore",
      affiliateSlug: "vitaminstore-super-magnesium",
      score: 8.5,
      bestFor: "Beste allround",
      variantTag: "Complex (5 vormen)",
      summary:
        "Combineert bisglycinaat, citraat, tauraat, malaat en glycerofosfaat in één tablet. Magnesium draagt onder meer bij tot normale spier- en zenuwfunctie, tot een normale psychologische functie en tot vermindering van vermoeidheid — zonder dat je meerdere potjes nodig hebt.",
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
        "Tabletten, geen capsules",
        "Coating bevat hydroxypropylmethylcellulose",
      ],
      breakdown: [
        { criterium: "Vormkwaliteit", score: 9 },
        { criterium: "Dosering", score: 8 },
        { criterium: "Transparantie", score: 7 },
        { criterium: "Prijs/kwaliteit", score: 8 },
      ],
      imageSrc: "/images/producten/Vitaminstore-Super-Magnesium.jpg",
      imageAlt: "Vitaminstore Super Magnesium verpakking",
      werkzameStof: "magnesium",
      vorm: "complex (bisglycinaat, citraat, tauraat, malaat, glycerofosfaat)",
      doseringPerDagdosis: {
        hoeveelheid: 200,
        eenheid: "mg",
        elementair: true,
        perServing: 2,
      },
      efsaClaimIds: MAGNESIUM_SLEEP_CLAIMS,
      thirdPartyTested: false,
    }),
    withClaimFields({
      slug: "viridian-bisglycinaat",
      name: "Viridian Magnesium Bisglycinate",
      brand: "Viridian",
      affiliateSlug: "viridian-bisglycinaat",
      score: 8.2,
      bestFor: "Beste bisglycinaat",
      variantTag: "Bisglycinaat (vegetarisch)",
      summary:
        "Puur magnesium bisglycinaat van Viridian — een gerespecteerd Brits supplementmerk. Vegetarische capsules; magnesium draagt bij tot normale zenuw- en spierfunctie en tot een normale psychologische functie.",
      specs: [
        { label: "Vormen", value: "1 (bisglycinaat)" },
        { label: "Elementair Mg", value: "Check etiket per capsule" },
        { label: "Vorm", value: "Vegetarische capsules" },
        { label: "Prijs / dag", value: "€ 0,29" },
        { label: "Inhoud", value: "120 vegicaps" },
      ],
      pros: [
        "Bisglycinaat — vaak gekozen voor latere momenten op de dag",
        "Glycine is een aminozuur; dit product levert vooral magnesium als mineraal",
        "Gerespecteerd merk met kwaliteitsreputatie",
        "100% vegetarisch",
      ],
      cons: [
        "Enkele vorm — minder breed dan een complex",
        "Prijs hoger per mg dan citraat",
        "Elementair mg per capsule niet direct duidelijk",
      ],
      breakdown: [
        { criterium: "Vormkwaliteit", score: 10 },
        { criterium: "Dosering", score: 7 },
        { criterium: "Transparantie", score: 7 },
        { criterium: "Prijs/kwaliteit", score: 7 },
      ],
      imageSrc: "/images/producten/Viridian-Magnesium-Bisglycinate.jpg",
      imageAlt: "Viridian Magnesium Bisglycinate verpakking",
      werkzameStof: "magnesium",
      vorm: "bisglycinaat",
      doseringPerDagdosis: {
        hoeveelheid: 0,
        eenheid: "mg",
        elementair: true,
        perServing: 1,
      },
      efsaClaimIds: [],
      thirdPartyTested: false,
    }),
    withClaimFields({
      slug: "vital-nutrition-citraat",
      name: "Vital Nutrition Magnesium Citraat",
      brand: "Vital Nutrition",
      affiliateSlug: "vital-nutrition-citraat",
      score: 7.8,
      bestFor: "Beste prijs",
      variantTag: "Citraat (plantaardig)",
      summary:
        "Goed opneembare magnesiumvorm tegen de scherpste prijs. 200 mg magnesium per tablet in plantaardige vorm — een solide keuze voor wie bewezen kwaliteit zoekt zonder te veel te betalen.",
      specs: [
        { label: "Vormen", value: "1 (citraat)" },
        { label: "Elementair Mg", value: "200 mg / tablet" },
        { label: "Vorm", value: "Plantaardige tabletten" },
        { label: "Prijs / dag", value: "€ 0,20" },
        { label: "Inhoud", value: "100 tabletten (100 dagen)" },
      ],
      pros: [
        "Goed opneembaar",
        "Scherpste prijs per dag (€ 0,20)",
        "Eenvoudige, heldere formule",
        "Plantaardig",
      ],
      cons: [
        "Kan laxerend werken bij hoge doses",
        "Enkele vorm — minder breed dan een complex",
      ],
      breakdown: [
        { criterium: "Vormkwaliteit", score: 8 },
        { criterium: "Dosering", score: 8 },
        { criterium: "Transparantie", score: 8 },
        { criterium: "Prijs/kwaliteit", score: 9 },
      ],
      imageSrc: "/images/producten/Vitalnutrition-Magnesium-Citraat.jpg",
      imageAlt: "Vital Nutrition Magnesium Citraat verpakking",
      werkzameStof: "magnesium",
      vorm: "citraat",
      doseringPerDagdosis: {
        hoeveelheid: 200,
        eenheid: "mg",
        elementair: true,
        perServing: 1,
      },
      efsaClaimIds: MAGNESIUM_SLEEP_CLAIMS,
      thirdPartyTested: false,
    }),
  ],
  tableRows: [
    {
      slug: "vitaminstore-super-magnesium",
      name: "Super Magnesium",
      type: "Complex (5 vormen)",
      dosering: "200 mg / 2 tab",
      transparantie: "Goed",
      gebruiksgemak: "Goed",
      prijs: "€ 0,43/dag",
      badge: "Beste allround",
    },
    {
      slug: "viridian-bisglycinaat",
      name: "Viridian Bisglycinate",
      type: "Bisglycinaat (veg.)",
      dosering: "Check etiket",
      transparantie: "Goed",
      gebruiksgemak: "Goed",
      prijs: "€ 0,29/dag",
      badge: "Beste bisglycinaat",
    },
    {
      slug: "vital-nutrition-citraat",
      name: "Vital Nutrition Citraat",
      type: "Citraat (plantaardig)",
      dosering: "200 mg / 1 tab",
      transparantie: "Goed",
      gebruiksgemak: "Goed",
      prijs: "€ 0,20/dag",
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
        "Dat hangt af van je voorkeur voor vorm, dosering en verdraagzaamheid. Bisglycinaat is een gechloreerde chelaatvorm met over het algemeen goede maagverdraagzaamheid; citraat is goed opneembaar en vaak voordeliger. Een complex met meerdere vormen dekt een breder spectrum aan magnesiumzouten op het etiket.",
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
        "Dat is persoonlijk. Magnesium draagt bij tot vermindering van vermoeidheid — veel mensen kiezen voor opname bij een maaltijd om maagcomfort te houden. Bij meerdere tabletten per dag kun je de dosis verdelen. Voor concrete klachten of medicatie: stem het af met je arts.",
    },
    {
      question: "Werkt magnesium samen met vitamine D?",
      answer:
        "Ja. Magnesium speelt onder meer mee bij de omzetting van vitamine D naar biologisch actieve vormen in het lichaam. Wie beide aanvult, doet er goed aan op beide te letten. Zie ook onze [vitamine D-vergelijking](/beste/vitamine-d).",
    },
  ],
};
