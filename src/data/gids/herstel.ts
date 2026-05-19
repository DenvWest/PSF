import type { GuideOptInData } from "@/types/guide-opt-in";

export const herstelGuide: GuideOptInData = {
  slug: "herstel",
  guideName: "Herstelgids",
  seo: {
    title: "Gratis Herstelgids na 40 | PerfectSupplement",
    description:
      "Download de gratis Herstelgids voor mannen 40+. Begrijp waarom herstel trager gaat en wat je eraan doet.",
    canonical: "/gids/herstel",
  },
  heroLabel: "Gratis gids",
  heroTitle: "Beter herstellen begint met ruimte maken",
  heroSubtitle:
    "Na je 40e herstelt je lichaam langzamer. Deze gids helpt je herkennen waar het wringt — en welke stappen realistisch zijn.",
  recognition: {
    sectionLabel: "Herkenbaar?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Spierpijn duurt langer dan vroeger.",
      "Ik train door terwijl ik eigenlijk moe ben.",
      "Een zware week kost me dagen om te verwerken.",
      "Ik voel me niet opgeladen na rust.",
    ],
  },
  optIn: {
    sectionLabel: "Gratis herstelgids",
    title: "De complete gids voor herstel na 40",
    subtitle:
      "Van rust en slaap tot voeding en supplementen — in één overzichtelijke PDF.",
    bulletPoints: [
      "Waarom herstel trager gaat na 40",
      "Een 7-dagen protocol voor meer herstelruimte",
      "Supplementinformatie op hoofdlijnen",
    ],
    ctaText: "Stuur mij de gids",
    successMessage: "Check je inbox — de Herstelgids is onderweg.",
  },
  pdfPath: "/downloads/herstelgids-perfectsupplement.pdf",
  pillarHref: "/herstel-verbeteren-na-40",
};
