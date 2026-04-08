import type { BlogCategorie } from "@/types/blog";

export interface CategorieConfig {
  id: BlogCategorie;
  naam: string;
  icoon: string;
  beschrijving: string;
  metaTitle: string;
  metaDescription: string;
  kleur: {
    bg: string;
    accent: string;
    tekst: string;
  };
}

export const CATEGORIE_CONFIG: Record<BlogCategorie, CategorieConfig> = {
  stress: {
    id: "stress",
    naam: "Stress",
    icoon: "🔥",
    beschrijving: "Cortisol, spanning en herstel. Van ademhaling tot ashwagandha.",
    metaTitle: "Stress artikelen voor mannen 40+ | PerfectSupplement",
    metaDescription:
      "Alles over cortisol, chronische spanning en herstel — onderbouwde artikelen voor mannen boven de 40.",
    kleur: {
      bg: "from-amber-900/90 via-stone-900 to-stone-950",
      accent: "bg-amber-500/20 ring-amber-400/20",
      tekst: "text-amber-200",
    },
  },
  slaap: {
    id: "slaap",
    naam: "Slaap",
    icoon: "🌙",
    beschrijving: "Van slaaphygiëne tot melatonine. Wat werkt na je 40e.",
    metaTitle: "Slaap artikelen voor mannen 40+ | PerfectSupplement",
    metaDescription:
      "Slaaphygiëne, melatonine en slaaparchitectuur — praktische artikelen voor mannen boven de 40.",
    kleur: {
      bg: "from-sky-900/80 via-slate-900 to-stone-950",
      accent: "bg-sky-500/20 ring-sky-400/20",
      tekst: "text-sky-200",
    },
  },
  energie: {
    id: "energie",
    naam: "Energie",
    icoon: "⚡",
    beschrijving:
      "Testosteron, vitamine D en dagelijkse energie. Praktisch en onderbouwd.",
    metaTitle: "Energie artikelen voor mannen 40+ | PerfectSupplement",
    metaDescription:
      "Testosteron, vitamine D en mitochondriale functie — onderbouwde artikelen voor mannen boven de 40.",
    kleur: {
      bg: "from-emerald-900/80 via-stone-900 to-stone-950",
      accent: "bg-emerald-500/20 ring-emerald-400/20",
      tekst: "text-emerald-200",
    },
  },
  supplementen: {
    id: "supplementen",
    naam: "Supplementen",
    icoon: "🧬",
    beschrijving: "Werking, vormen en dosering. Per product uitgelegd.",
    metaTitle: "Supplement artikelen voor mannen 40+ | PerfectSupplement",
    metaDescription:
      "Werking, vormen en dosering van supplementen — inhoudelijk uitgelegd voor mannen boven de 40.",
    kleur: {
      bg: "from-violet-900/70 via-stone-900 to-stone-950",
      accent: "bg-violet-500/20 ring-violet-400/20",
      tekst: "text-violet-200",
    },
  },
};

export const ALLE_CATEGORIEEN = Object.values(CATEGORIE_CONFIG);

export const GELDIGE_CATEGORIE_IDS = Object.keys(
  CATEGORIE_CONFIG,
) as BlogCategorie[];

export function isGeldigeCategorie(s: string): s is BlogCategorie {
  return GELDIGE_CATEGORIE_IDS.includes(s as BlogCategorie);
}
