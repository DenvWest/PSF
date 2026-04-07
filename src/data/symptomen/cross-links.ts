import type { SymptoomSlug } from "@/types/symptomen";

export interface GerelateerdLink {
  href: string;
  label: string;
  beschrijving: string;
}

type PageType = "oorzaken" | "oplossingen";
type CrossLinkMap = Partial<Record<PageType, GerelateerdLink[]>>;

/**
 * Cross-links tussen symptoomhoofdpagina's.
 * Regels (STAP 6):
 *  - slaap/oorzaken → stress/oplossingen (stress = oorzaak van slaap)
 *  - stress/oorzaken → slaap/oplossingen (slaap als leefstijl-trigger)
 *  - energie/oorzaken → slaap + stress (beiden dragen bij)
 *
 * TODO (blogartikelen, toekomstig):
 *  - Voeg in elk blogartikel een teruglink toe naar de cornerstone-pagina (bv. /symptomen/stress/oorzaken)
 *  - Voeg breadcrumb toe: Blog > [Artikeltitel]
 */
export const crossLinks: Record<SymptoomSlug, CrossLinkMap> = {
  stress: {
    oorzaken: [
      {
        href: "/symptomen/slaap/oplossingen",
        label: "Beter slapen",
        beschrijving:
          "Slaaptekort is een van de sterkste triggers van chronische stress. Ontdek wat slaap concreet verbetert.",
      },
    ],
    oplossingen: [
      {
        href: "/symptomen/slaap/oplossingen",
        label: "Slaap als fundament",
        beschrijving:
          "Dieper slapen is het fundament van stressbestendigheid — en laat je elke dag met meer veerkracht beginnen.",
      },
    ],
  },
  slaap: {
    oorzaken: [
      {
        href: "/symptomen/stress/oplossingen",
        label: "Stress verminderen",
        beschrijving:
          "Chronische stress houdt je cortisolniveau hoog op het moment dat je wilt ontspannen. Bekijk concrete stappen.",
      },
    ],
    oplossingen: [
      {
        href: "/symptomen/stress/oorzaken",
        label: "Stressoorzaken herkennen",
        beschrijving:
          "Minder stress leidt direct tot dieper slapen — begrijp welke factoren bij jou de stress aanwakkeren.",
      },
    ],
  },
  energie: {
    oorzaken: [
      {
        href: "/symptomen/slaap/oplossingen",
        label: "Slaap verbeteren",
        beschrijving:
          "Slechte slaap is verantwoordelijk voor een groot deel van het energietekort bij mannen 40+ — zelfs als je voldoende uren maakt.",
      },
      {
        href: "/symptomen/stress/oorzaken",
        label: "Stressoorzaken herkennen",
        beschrijving:
          "Chronische stress vreet energie op een manier die weinig mannen direct herkennen als energieprobleem.",
      },
    ],
    oplossingen: [
      {
        href: "/symptomen/slaap/oplossingen",
        label: "Slaap als energiefundament",
        beschrijving:
          "Zonder goede slaap werkt geen enkele energiestrategie optimaal — bekijk hoe je slaap structureel verbetert.",
      },
    ],
  },
};
