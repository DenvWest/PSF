/**
 * PS-beoordeling van voedings-productgroepen voor de voeding-dieptool (laag 0).
 * Kwalitatief oordeel op productgroep-niveau — geen merken, geen verkoop,
 * geen statusclaims. Vuistregel-taal conform docs/core/COMPLIANCE.md.
 */

export interface CuratedChoice {
  id: string;
  icon: string;
  name: string;
  /** Waarop de productgroep beoordeeld is. */
  dimension: string;
  /** Kort kwalitatief PS-oordeel. */
  verdict: string;
  /** Hoe je het toepast — concreet, leefstijl eerst. */
  note: string;
}

export const NUTRITION_CURATED_CHOICES: CuratedChoice[] = [
  {
    id: "vette-vis",
    icon: "🐟",
    name: "Vette vis",
    dimension: "Omega-3 per portie",
    verdict: "Beste bron",
    note: "Zalm, makreel of haring — 2× per week dekt de omega-3-vuistregel.",
  },
  {
    id: "olijfolie",
    icon: "🫒",
    name: "Olijfolie extra vierge",
    dimension: "Vetzuurprofiel",
    verdict: "Sterke basis",
    note: "Als standaard bak- en dressingvet in plaats van harde vetten.",
  },
  {
    id: "peulvruchten",
    icon: "🫘",
    name: "Peulvruchten",
    dimension: "Eiwit en vezels per euro",
    verdict: "Ondergewaardeerd",
    note: "Bonen of linzen als eiwitbron in minstens 2 maaltijden per week.",
  },
  {
    id: "noten",
    icon: "🥜",
    name: "Noten (ongezouten)",
    dimension: "Mineralen en onverzadigd vet",
    verdict: "Dagelijkse aanvulling",
    note: "Eén handje per dag; gezouten en gebrande mixen laten staan.",
  },
  {
    id: "kwark-skyr",
    icon: "🥛",
    name: "Kwark & skyr",
    dimension: "Eiwit per 100 gram",
    verdict: "Sterke basis",
    note: "Het makkelijkste eiwitanker voor je ontbijt of avondsnack.",
  },
];
