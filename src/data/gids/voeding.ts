import type { GuideOptInData } from "@/types/guide-opt-in";

export const voedingGuide: GuideOptInData = {
  slug: "voeding",
  guideName: "Voedingsgids",
  seo: {
    title: "Gratis Voedingsgids na 40 | PerfectSupplement",
    description:
      "Ontvang het voedings-stappenplan voor mannen 40+. Eiwit, ritme en vetten — praktische stappen vóór supplementen, zonder diagnoses.",
    canonical: "/gids/voeding",
  },
  heroLabel: "Gratis stappenplan",
  heroTitle: "Spieronderhoud begint aan tafel — niet in een potje",
  heroSubtitle:
    "Na je 40e telt eiwit per maaltijd, vette vis en een stabiel ritme zwaarder. Dit stappenplan helpt je herkennen wat er schuurt — en welke gewoonte je deze week kunt zetten.",
  recognition: {
    sectionLabel: "Herkenbaar?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Ik eet gezond genoeg, maar herstel blijft traag.",
      "Ik weet dat eiwit belangrijk is, maar ik eet het niet elke maaltijd.",
      "Ik eet weinig vis — omega-3 kom ik waarschijnlijk tekort.",
      "Supplementen lijken makkelijker dan mijn voeding structureren.",
    ],
  },
  optIn: {
    sectionLabel: "Gratis voedings-stappenplan",
    title: "Eiwit, ritme en vetten — week voor week",
    subtitle:
      "Stappen per e-mail: eerst leefstijl, daarna pas vergelijken. Geen dieet-hype, wel haalbare gewoonten.",
    bulletPoints: [
      "Deze week: eiwit bij elke maaltijd — concreet en zonder tellen",
      "Week 2–4: inzicht in je patroon via een korte voedingscheck",
      "Pas daarna: omega-3 of eiwitpoeder alleen als aanvulling",
    ],
    ctaText: "Stuur mij het stappenplan",
    successMessage: "Check je inbox — je eerste stap staat klaar.",
  },
  pdfPath: null,
  pillarHref: "/voeding-na-40",
};
