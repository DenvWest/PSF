import type { GuideOptInData } from "@/types/guide-opt-in";

export const bewegingGuide: GuideOptInData = {
  slug: "beweging",
  guideName: "Bewegingsgids",
  seo: {
    title: "Gratis Bewegingsgids na 40 | PerfectSupplement",
    description:
      "Ontvang het beweging-stappenplan voor mannen 40+. Kracht thuis, herstel en ritme — praktische stappen vóór supplementen, zonder diagnoses.",
    canonical: "/gids/beweging",
  },
  heroLabel: "Gratis stappenplan",
  heroTitle: "Kracht thuis houdt je spieren op peil — zonder sportschool-hype",
  heroSubtitle:
    "Na je 40e telt herstel zwaarder dan volume. Dit stappenplan begint met één thuis-oefening en bouwt rustig op naar structurele krachttraining.",
  recognition: {
    sectionLabel: "Herkenbaar?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Ik train nog wel, maar herstel duurt veel langer.",
      "Cardio lukt, maar kracht schiet erbij in.",
      "Ik heb geen tijd voor de sportschool — thuis moet het ook kunnen.",
      "Creatine hoor ik overal, maar ik weet niet of het bij mij past.",
    ],
  },
  optIn: {
    sectionLabel: "Gratis beweging-stappenplan",
    title: "Van één thuis-oefening naar structureel trainen",
    subtitle:
      "Stappen per e-mail: eerst bewegen, dan meten, supplementen pas als laatste. Geen schema-druk, wel richting.",
    bulletPoints: [
      "Deze week: één kracht-oefening thuis — geen materiaal nodig",
      "Week 2–4: 2× full-body kracht + belasting bijhouden",
      "Pas daarna: creatine of eiwit als je basis op orde is",
    ],
    ctaText: "Stuur mij het stappenplan",
    successMessage: "Check je inbox — je eerste stap staat klaar.",
  },
  pdfPath: null,
  pillarHref: "/beweging-na-40",
};
