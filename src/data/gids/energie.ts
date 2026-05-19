import type { GuideOptInData } from "@/types/guide-opt-in";

export const energieGuide: GuideOptInData = {
  slug: "energie",
  guideName: "Energiegids",
  seo: {
    title: "Gratis Energiegids na 40 | PerfectSupplement",
    description:
      "Download de gratis Energiegids voor mannen 40+. Concrete stappen voor meer energie — zonder diagnoses.",
    canonical: "/gids/energie",
  },
  heroLabel: "Gratis gids",
  heroTitle: "Meer energie begint met begrijpen waar het lekt",
  heroSubtitle:
    "Structurele vermoeidheid na 40 heeft meestal meerdere oorzaken. Deze gids helpt je de belangrijkste aanknopingspunten te zien.",
  recognition: {
    sectionLabel: "Herkenbaar?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Ik word moe wakker en haal de middag niet.",
      "Koffie helpt steeds minder.",
      "Ik voel me leeg, ook na een rustig weekend.",
      "Sporten kost me meer energie dan het oplevert.",
    ],
  },
  optIn: {
    sectionLabel: "Gratis energiegids",
    title: "Gratis Energiegids (PDF)",
    subtitle:
      "Concrete stappen voor meer energie na 40 — van voeding en beweging tot supplementen met evidence.",
    bulletPoints: [
      "Hoe leefstijl en hormonen elkaar versterken na je 40e",
      "Eenvoudig weekplan: eten, beweging, licht",
      "Supplementinformatie op hoofdlijnen",
    ],
    ctaText: "Stuur mij de gids",
    successMessage: "Check je inbox — de Energiegids is onderweg.",
  },
  pdfPath: "/downloads/energiegids-perfectsupplement.pdf",
  pillarHref: "/energie-na-40",
};
