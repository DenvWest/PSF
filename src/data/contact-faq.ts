import type { FaqItem } from "@/components/faq-search";

export const faqHelpCards = [
  {
    title: "Veelgestelde vragen",
    description:
      "Snelle antwoorden op veelvoorkomende vragen over de website en onze content.",
    href: "/faqs#veelgestelde-vragen",
  },
  {
    title: "Methodologie",
    description:
      "Lees hoe wij supplementen beoordelen op basis van transparantie, dosering en kwaliteit.",
    href: "/methodologie",
  },
  {
    title: "Feedback of suggestie",
    description:
      "Zie je een fout of heb je een aanvulling voor onze content? Laat het ons weten.",
    href: "/contact#kom-je-er-niet-uit",
  },
  {
    title: "Contact opnemen",
    description: "Voor algemene vragen, feedback of zakelijke aanvragen.",
    href: "/contact#kom-je-er-niet-uit",
  },
] as const;

export const faqItems: FaqItem[] = [
  {
    q: "Hoe beoordelen jullie supplementen?",
    a: "We kijken onder meer naar dosering, vorm, transparantie van etikettering, prijs per werkzame eenheid en hoe duidelijk de bron en samenstelling zijn. Waar mogelijk leggen we de link met gangbare wetenschappelijke richtlijnen. De volledige aanpak staat beschreven in onze methodologie.",
  },
  {
    q: "Geven jullie medisch advies?",
    a: "Nee. Onze artikelen en vergelijkingen zijn informatief en geen vervanging voor een consult bij je arts, diëtist of apotheker. Bij gezondheidsklachten, zwangerschap, medicijngebruik of twijfel: altijd professioneel advies inwinnen.",
  },
  {
    q: "Kun je een product of merk voorstellen?",
    a: "We geven geen persoonlijke aanbevelingen buiten wat we op de site publiceren. Onze gidsen en vergelijkingen volgen vaste, open criteria, voor iedere lezer hetzelfde.",
  },
  {
    q: "Werken jullie onafhankelijk?",
    a: "Redactioneel wel: inhoud en keuzes zijn gebaseerd op onze methodologie, niet op adverteerders. De site kan affiliate-links bevatten; dat is altijd duidelijk aangegeven en verandert niet hoe we producten beoordelen. Meer over hoe we dat communiceren:",
    link: { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
  },
  {
    q: "Hoe neem ik contact op voor samenwerking?",
    a: "Gebruik het contactformulier op de contactpagina of mail naar info@perfectsupplement.nl met een korte omschrijving van je organisatie en je vraag. We lezen alles en reageren zodra dat past bij de aard van je aanvraag.",
  },
  {
    q: "Wanneer kan ik een reactie verwachten?",
    a: "Meestal binnen 1 tot 3 werkdagen. Bij inhoudelijke correcties of zakelijke aanvragen kan het iets langer duren.",
  },
];
