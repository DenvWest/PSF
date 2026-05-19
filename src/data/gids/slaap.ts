import type { GuideOptInData } from "@/types/guide-opt-in";

export const slaapGuide: GuideOptInData = {
  slug: "slaap",
  guideName: "Slaapgids",
  seo: {
    title: "Gratis Slaapgids na 40 | PerfectSupplement",
    description:
      "Download de gratis Slaapgids voor mannen 40+. Herkenning, 7-dagen protocol en supplementinformatie — zonder diagnoses.",
    canonical: "/gids/slaap",
  },
  heroLabel: "Gratis gids",
  heroTitle: "Beter slapen begint met begrijpen wat er verandert",
  heroSubtitle:
    "Na je 40e slaapt je lichaam anders. Deze gids helpt je herkennen wat er speelt — en welke stappen je vanavond al kunt zetten.",
  recognition: {
    sectionLabel: "Herkenbaar?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Ik slaap wel, maar word moe wakker.",
      "Ik lig 's nachts te malen over werk.",
      "Ik val makkelijk in slaap, maar word om 3 uur wakker.",
      "In het weekend slaap ik uit, maar het helpt niet.",
    ],
  },
  optIn: {
    sectionLabel: "Gratis slaapgids",
    title: "De complete gids voor betere slaap na 40",
    subtitle:
      "Alles over slaaphygiëne, ritme en supplementen — in één overzichtelijke PDF.",
    bulletPoints: [
      "Een 7-dagen protocol dat je vanavond kunt starten",
      "Welke supplementen wél en niet werken (met doseringen)",
      "Veelgemaakte fouten die je slaap saboteren",
    ],
    ctaText: "Stuur mij de gids",
    successMessage: "Check je inbox — de Slaapgids is onderweg.",
  },
  pdfPath: "/downloads/slaapgids-perfectsupplement.pdf",
  pillarHref: "/slaap-verbeteren-na-40",
};
