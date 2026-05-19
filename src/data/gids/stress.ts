import type { GuideOptInData } from "@/types/guide-opt-in";

export const stressGuide: GuideOptInData = {
  slug: "stress",
  guideName: "Stressgids",
  seo: {
    title: "Gratis Stressgids na 40 | PerfectSupplement",
    description:
      "Download de gratis Stressgids voor mannen 40+. Herkenning, praktische stappen en supplementinformatie — zonder diagnoses.",
    canonical: "/gids/stress",
  },
  heroLabel: "Gratis gids",
  heroTitle: "Meer grip op stress begint met herkennen wat er gebeurt",
  heroSubtitle:
    "Chronische spanning kost je slaap, energie en herstel. Deze gids helpt je begrijpen wat er speelt — en welke stappen haalbaar zijn.",
  recognition: {
    sectionLabel: "Herkenbaar?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Ik ben de hele dag 'aan' en kan 's avonds niet schakelen.",
      "Kleine dingen irriteren me sneller dan vroeger.",
      "Ik voel me opgejaagd, ook als er niets speciaals aan de hand is.",
      "Mijn partner zegt dat ik gespannen ben.",
    ],
  },
  optIn: {
    sectionLabel: "Gratis stressgids",
    title: "De compacte gids: stress duiden en stappen kiezen",
    subtitle:
      "Herkenning, snelle interventies en supplementinformatie — in één PDF.",
    bulletPoints: [
      "4 domeinen waar stress bij 40+ vandaan komt",
      "Snelle interventies die je binnen 15 minuten kunt proberen",
      "Supplementinformatie op hoofdlijnen, gekoppeld aan onze gidsen",
    ],
    ctaText: "Stuur mij de gids",
    successMessage: "Check je inbox — de Stressgids is onderweg.",
  },
  pdfPath: "/downloads/stressgids-perfectsupplement.pdf",
  pillarHref: "/stress-verminderen-man",
};
