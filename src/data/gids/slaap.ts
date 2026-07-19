import type { GuideOptInData } from "@/types/guide-opt-in";

export const slaapGuide: GuideOptInData = {
  slug: "slaap",
  guideName: "Slaapgids",
  seo: {
    title: "Gratis Slaapgids na 40 | PerfectSupplement",
    description:
      "Interactieve slaapgids voor mannen 40+. Herken patronen, meet Inslapen, Doorslapen, Regelmaat en Uitgerust wakker — met persoonlijke vervolgstappen.",
    canonical: "/gids/slaap",
  },
  heroLabel: "Gratis gids",
  heroTitle: "Beter slapen begint met begrijpen",
  heroSubtitle:
    "Begin met zelf onderzoek: herken wat speelt, meet je vier slaappijlers en kies je eerste stappen — supplementen komen pas daarna.",
  recognition: {
    sectionLabel: "Herkenbaar?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Ik slaap wel, maar word niet uitgerust wakker.",
      "Ik lig lang wakker voordat ik slaap.",
      "Ik val in slaap, maar word om 3 uur wakker.",
      "In het weekend slaap ik uit, maar het helpt niet.",
    ],
  },
  optIn: {
    sectionLabel: "Gratis slaapgids",
    title: "De praktische slaapgids voor mannen 40+",
    subtitle:
      "Van herkenning naar actie: leefstijl eerst, supplementen als aanvulling — in één overzichtelijke PDF.",
    bulletPoints: [
      "Waarom slaap verandert — en hoe je Inslapen, Doorslapen, Regelmaat en Uitgerust wakker verbetert",
      "Leefstijlhefbomen en een 7-dagen startplan",
      "Checklist en actieplan om één of twee verbeterpunten te kiezen",
    ],
    ctaText: "Stuur mij de gids",
    successMessage: "Check je inbox — de Slaapgids is onderweg.",
  },
  pdfPath: "/downloads/slaapgids-perfectsupplement.pdf",
  pillarHref: "/slaap-verbeteren-na-40",
};
