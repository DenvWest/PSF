import type { ComparisonPageData } from "@/types/supplement";

/**
 * Placeholder — vul in zodra magnesiumproductdata beschikbaar is.
 * Structuur is identiek aan omega-3.ts zodat alle supplements/-componenten
 * zonder aanpassing werken.
 */
export const magnesiumData: ComparisonPageData = {
  category: "magnesium",
  h1: "Welke magnesium past bij jou?",
  intro:
    "Drie magnesiumvormen vergeleken op opneembaarheid, doel en prijs — zodat je direct de juiste vorm kiest.",
  seoTitle: "Beste magnesium supplement 2026 — vormen vergeleken",
  seoDescription:
    "Vergelijk magnesiumbisglycinaat, -tauraat en -citraat op opneembaarheid, doel en prijs per dag. Onafhankelijke analyse voor de beste keuze in 2026.",
  lastUpdated: "2026-04-16",

  choiceRoutes: [
    {
      badgeLabel: "Beste slaap & ontspanning",
      productName: "Magnesium Bisglycinaat",
      teaser: "Beste opneembaarheid en meest slaapvriendelijke vorm.",
      affiliateSlug: "magnesium-bisglycinaat",
      slug: "magnesium-bisglycinaat",
    },
    {
      badgeLabel: "Hart & zenuwstelsel",
      productName: "Magnesium Tauraat",
      teaser: "Combineert magnesium met taurine voor extra ondersteuning.",
      affiliateSlug: "magnesium-tauraat",
      slug: "magnesium-tauraat",
    },
    {
      badgeLabel: "Beste prijs",
      productName: "Magnesium Citraat",
      teaser: "Goede opneembaarheid en betaalbaar — brede eerste keuze.",
      affiliateSlug: "magnesium-citraat",
      slug: "magnesium-citraat",
    },
  ],

  products: [
    {
      slug: "magnesium-bisglycinaat",
      name: "Magnesium Bisglycinaat",
      brand: "TBD",
      affiliateSlug: "magnesium-bisglycinaat",
      score: 9.0,
      bestFor: "Topkeuze",
      variantTag: "Bisglycinaat",
      summary: "Productdata volgt — Dennis vult de specificaties in.",
      specs: [{ label: "Elementair Mg", value: "TBD" }],
      pros: ["TBD"],
      cons: ["TBD"],
      breakdown: [
        { criterium: "Opneembaarheid", score: 9 },
        { criterium: "Slaapondersteuning", score: 9 },
        { criterium: "Maagvriendelijkheid", score: 9 },
        { criterium: "Prijs/kwaliteit", score: 8 },
      ],
    },
    {
      slug: "magnesium-tauraat",
      name: "Magnesium Tauraat",
      brand: "TBD",
      affiliateSlug: "magnesium-tauraat",
      score: 8.5,
      bestFor: "Hart & zenuwstelsel",
      variantTag: "Tauraat",
      summary: "Productdata volgt — Dennis vult de specificaties in.",
      specs: [{ label: "Elementair Mg", value: "TBD" }],
      pros: ["TBD"],
      cons: ["TBD"],
      breakdown: [
        { criterium: "Opneembaarheid", score: 8 },
        { criterium: "Slaapondersteuning", score: 7 },
        { criterium: "Maagvriendelijkheid", score: 9 },
        { criterium: "Prijs/kwaliteit", score: 8 },
      ],
    },
    {
      slug: "magnesium-citraat",
      name: "Magnesium Citraat",
      brand: "TBD",
      affiliateSlug: "magnesium-citraat",
      score: 8.0,
      bestFor: "Beste prijs",
      variantTag: "Citraat",
      summary: "Productdata volgt — Dennis vult de specificaties in.",
      specs: [{ label: "Elementair Mg", value: "TBD" }],
      pros: ["TBD"],
      cons: ["TBD"],
      breakdown: [
        { criterium: "Opneembaarheid", score: 7 },
        { criterium: "Slaapondersteuning", score: 7 },
        { criterium: "Maagvriendelijkheid", score: 7 },
        { criterium: "Prijs/kwaliteit", score: 9 },
      ],
    },
  ],

  tableRows: [
    {
      slug: "magnesium-bisglycinaat",
      name: "Magnesium Bisglycinaat",
      type: "Bisglycinaat",
      dosering: "TBD",
      transparantie: "TBD",
      gebruiksgemak: "TBD",
      prijs: "TBD",
      badge: "Topkeuze",
    },
    {
      slug: "magnesium-tauraat",
      name: "Magnesium Tauraat",
      type: "Tauraat",
      dosering: "TBD",
      transparantie: "TBD",
      gebruiksgemak: "TBD",
      prijs: "TBD",
      badge: "Hart & zenuwstelsel",
    },
    {
      slug: "magnesium-citraat",
      name: "Magnesium Citraat",
      type: "Citraat",
      dosering: "TBD",
      transparantie: "TBD",
      gebruiksgemak: "TBD",
      prijs: "TBD",
      badge: "Beste prijs",
    },
  ],

  comparisonCriteria: [
    "Opneembaarheid",
    "Slaapondersteuning",
    "Maagvriendelijkheid",
    "Prijs/kwaliteit",
  ],

  faq: [
    {
      question: "Welke magnesiumvorm is het beste voor slaap?",
      answer:
        "Magnesiumbisglycinaat heeft de beste reputatie voor slaapondersteuning: uitstekende opneembaarheid en maagvriendelijk. Magnesiumtauraat is een goed alternatief als je ook het zenuwstelsel wilt ondersteunen.",
    },
    {
      question: "Hoeveel magnesium per dag heb je nodig?",
      answer:
        "De aanbevolen dagelijkse hoeveelheid elementair magnesium is circa 300–400 mg voor volwassenen. Let op het elementaire magnesiumgehalte op het etiket, niet het totaalgewicht van de verbinding.",
    },
    {
      question: "Wanneer neem je magnesium het beste in?",
      answer:
        "Veel mensen nemen magnesium 's avonds in vanwege het ontspannende effect. Het kan ook bij een maaltijd om maagklachten te vermijden.",
    },
  ],
};
