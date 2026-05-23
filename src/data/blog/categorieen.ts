import type { BlogCategorie } from "@/types/blog";

export interface IntentArticleLink {
  label: string;
  slug: string;
}

export interface CategorieConfig {
  id: BlogCategorie;
  naam: string;
  icoon: string;
  beschrijving: string;
  metaTitle: string;
  metaDescription: string;
  intentTopics: string[];
  intentArticleLinks: IntentArticleLink[];
  themaHref: string;
  kleur: {
    bg: string;
    accent: string;
    tekst: string;
    cardAccent: string;
  };
}

export const CATEGORIE_CONFIG: Record<BlogCategorie, CategorieConfig> = {
  stress: {
    id: "stress",
    naam: "Stress",
    icoon: "🔥",
    beschrijving: "Cortisol, spanning en herstel. Van ademhaling tot ashwagandha.",
    metaTitle: "Stress & cortisol na 40 — artikelen | PerfectSupplement",
    metaDescription:
      "Altijd 'aan' staan, cortisol en spanning na je 40e? Onderbouwde artikelen over stress, herstel en wat je lichaam signaleert.",
    intentTopics: [
      "altijd aan staan",
      "cortisol symptomen",
      "spanning na werk",
      "herstel na stress",
    ],
    intentArticleLinks: [
      { label: "Cortisol verlagen", slug: "cortisol-verlagen-natuurlijk" },
      { label: "Ademhaling tegen stress", slug: "ademhaling-tegen-stress" },
      { label: "Grenzen stellen op werk", slug: "stress-werk-grenzen-stellen" },
      { label: "Ashwagandha bij mannen", slug: "ashwagandha-werking-mannen" },
    ],
    themaHref: "/gids/stress",
    kleur: {
      bg: "from-amber-700 to-amber-800",
      accent: "bg-amber-500/20 ring-amber-400/20",
      tekst: "text-amber-200",
      cardAccent: "border-l-amber-500/60",
    },
  },
  slaap: {
    id: "slaap",
    naam: "Slaap",
    icoon: "🌙",
    beschrijving: "Van slaaphygiëne tot melatonine. Wat werkt na je 40e.",
    metaTitle: "Slaap verbeteren na 40 — artikelen | PerfectSupplement",
    metaDescription:
      "Moe wakker worden, nachtelijk wakker liggen of slecht doorslapen? Praktische artikelen over slaap, melatonine en herstel na je 40e.",
    intentTopics: [
      "moe wakker worden",
      "nachtelijk wakker",
      "slecht doorslapen",
      "slaap na 40",
    ],
    intentArticleLinks: [
      { label: "Slaap verbeteren na 40", slug: "slaap-verbeteren-40-plus" },
      { label: "Slaaphygiëne", slug: "slaaphygiene-mannen-40-plus" },
      { label: "Magnesium en slaap", slug: "magnesium-en-slaapkwaliteit" },
      { label: "Melatonine na 40", slug: "melatonine-na-40" },
    ],
    themaHref: "/gids/slaap",
    kleur: {
      bg: "from-slate-600 to-slate-700",
      accent: "bg-sky-500/20 ring-sky-400/20",
      tekst: "text-sky-200",
      cardAccent: "border-l-sky-500/60",
    },
  },
  energie: {
    id: "energie",
    naam: "Energie",
    icoon: "⚡",
    beschrijving:
      "Testosteron, vitamine D en dagelijkse energie. Praktisch en onderbouwd.",
    metaTitle: "Energie & vermoeidheid na 40 — artikelen | PerfectSupplement",
    metaDescription:
      "Middagdip, trager herstel of vermoeidheid na je 40e? Artikelen over energie, testosteron, vitamine D en herstel — onderbouwd en praktisch.",
    intentTopics: [
      "middagdip",
      "vermoeidheid man 40+",
      "trager herstel",
      "lage energie",
    ],
    intentArticleLinks: [
      { label: "Energie verhogen", slug: "energie-verhogen-natuurlijk" },
      { label: "Middagdip en bloedsuiker", slug: "middagdip-bloedsuiker-na-40" },
      { label: "Krachttraining na 40", slug: "krachttraining-na-40" },
      { label: "Eiwit na 40", slug: "eiwit-na-40" },
    ],
    themaHref: "/energie-na-40",
    kleur: {
      bg: "from-emerald-700 to-emerald-800",
      accent: "bg-emerald-500/20 ring-emerald-400/20",
      tekst: "text-emerald-200",
      cardAccent: "border-l-emerald-500/60",
    },
  },
  supplementen: {
    id: "supplementen",
    naam: "Supplementen",
    icoon: "🧬",
    beschrijving: "Werking, vormen en dosering. Per product uitgelegd.",
    metaTitle: "Supplementen uitgelegd — werking & dosering | PerfectSupplement",
    metaDescription:
      "Magnesium, omega-3, vitamine D en meer — werking, vormen en dosering uitgelegd voor mannen boven de 40. Geen verkooppraat.",
    intentTopics: [
      "magnesium vormen",
      "omega-3 dosering",
      "vitamine D",
      "supplement kiezen",
    ],
    intentArticleLinks: [
      { label: "Magnesium en slaap", slug: "magnesium-en-slaap" },
      { label: "Omega-3 en herstel", slug: "omega-3-en-herstel" },
      { label: "Vitamine D en energie", slug: "vitamine-d-en-energie" },
      { label: "Zink en testosteron", slug: "zink-en-testosteron" },
    ],
    themaHref: "/gids/energie",
    kleur: {
      bg: "from-stone-600 to-stone-700",
      accent: "bg-violet-500/20 ring-violet-400/20",
      tekst: "text-violet-200",
      cardAccent: "border-l-stone-500/50",
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
