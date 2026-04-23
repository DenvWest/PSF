import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { creatineData } from "@/data/supplements/creatine";
import { zinkData } from "@/data/supplements/zink";

export type ThemaTag = "slaap" | "stress" | "energie" | "herstel";

export type CatalogEntry = {
  slug: string;
  name: string;
  wiifm: string;
  themas: ThemaTag[];
  topScore: number | null;
  guideHref: string;
  comparisonHref: string | null;
  comingSoon: boolean;
  icon: string;
};

function maxProductScore(products: ReadonlyArray<{ score: number }>): number {
  if (products.length === 0) return 0;
  return Math.max(...products.map((p) => p.score));
}

/** Korte introregels bij productvergelijkingen op de hub. */
export const HUB_COMPARISON_TAGLINES: Record<string, string> = {
  magnesium: "Vormen, elementair gehalte en prijs per dag op een rij.",
  "omega-3": "EPA/DHA, zuiverheid en dagkosten — eerlijk vergeleken.",
  ashwagandha: "Extracten, withanoliden en dosering voor stress & herstel.",
  "vitamine-d": "D3, K2-combo’s en wat het etiket écht zegt.",
  creatine: "Monohydraat, micronized en prijs per dosering.",
  zink: "Bisglycinaat, picolinaat en opname — praktisch gekozen.",
};

export const CATALOG: CatalogEntry[] = [
  {
    slug: "magnesium",
    name: "Magnesium",
    wiifm:
      "Ondersteunt slaapkwaliteit, stressverwerking en spierherstel",
    themas: ["slaap", "stress", "herstel"],
    topScore: maxProductScore(magnesiumData.products),
    guideHref: "/supplementen/magnesium",
    comparisonHref: "/beste-magnesium",
    comingSoon: false,
    icon: "⚡",
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha",
    wiifm: "Helpt bij chronische stress en ondersteunt energieniveau",
    themas: ["stress", "herstel"],
    topScore: maxProductScore(ashwagandhaData.products),
    guideHref: "/supplementen/ashwagandha",
    comparisonHref: "/beste-ashwagandha",
    comingSoon: false,
    icon: "🌿",
  },
  {
    slug: "omega-3",
    name: "Omega-3",
    wiifm:
      "Essentieel voor hersenen, gewrichten en ontstekingsbalans",
    themas: ["herstel", "energie"],
    topScore: maxProductScore(omega3Data.products),
    guideHref: "/supplementen/omega-3",
    comparisonHref: "/beste-omega-3-supplement",
    comingSoon: false,
    icon: "🐟",
  },
  {
    slug: "vitamine-d",
    name: "Vitamine D",
    wiifm:
      "Belangrijk voor immuunsysteem, botten en stemming",
    themas: ["energie", "herstel"],
    topScore: maxProductScore(vitamineDData.products),
    guideHref: "/supplementen/vitamine-d",
    comparisonHref: "/beste-vitamine-d",
    comingSoon: false,
    icon: "☀️",
  },
  {
    slug: "creatine",
    name: "Creatine",
    wiifm:
      "Ondersteunt spierkracht, herstel en cognitieve prestaties",
    themas: ["energie", "herstel"],
    topScore: maxProductScore(creatineData.products),
    guideHref: "/supplementen/creatine",
    comparisonHref: "/beste-creatine",
    comingSoon: false,
    icon: "💪",
  },
  {
    slug: "zink",
    name: "Zink",
    wiifm:
      "Essentieel voor immuunfunctie, testosteron en wondgenezing",
    themas: ["herstel", "stress"],
    topScore: maxProductScore(zinkData.products),
    guideHref: "/supplementen/zink",
    comparisonHref: "/beste-zink",
    comingSoon: false,
    icon: "🛡️",
  },
];

export const catalogBySlug: Record<string, CatalogEntry> = Object.fromEntries(
  CATALOG.map((entry) => [entry.slug, entry]),
);
