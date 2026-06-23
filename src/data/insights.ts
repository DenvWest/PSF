import { alleArtikelen } from "@/data/blog";
import {
  kennisbankTerms,
  type KennisbankTheme,
} from "@/data/kennisbank";
import type { BlogCategorie } from "@/types/blog";
import type { PillarId } from "@/types/dashboard";
import type { InsightItem, InsightType } from "@/types/insight";

export const BLOG_CATEGORIE_TO_PIJLER: Record<
  BlogCategorie,
  PillarId | null
> = {
  slaap: "slaap",
  stress: "stress",
  energie: "energie",
  supplementen: null,
};

export const KENNISBANK_THEME_TO_PIJLER: Record<KennisbankTheme, PillarId> = {
  "lichaam-veroudering": "herstel",
  "leefstijl-herstel": "herstel",
  supplementwetenschap: "voeding",
  longevity: "herstel",
};

export const INSIGHT_PIJLER_OVERRIDE: Record<string, PillarId> = {
  "ashwagandha-werking-mannen": "stress",
  "magnesium-en-slaapkwaliteit": "slaap",
  "zink-en-testosteron": "energie",
  "creatine-en-herstel": "herstel",
  "omega-3-en-herstel": "herstel",
  "beste-omega-3-supplement": "voeding",
  "wat-is-omega-3": "voeding",
  "waar-let-je-op-bij-omega-3": "voeding",
  "beste-magnesium": "slaap",
  "supplement-kiezen-waar-op-letten": "voeding",
  "circadiaan-ritme": "slaap",
  "hpa-as": "stress",
  cortisol: "stress",
  melatonine: "slaap",
  mitochondrien: "energie",
  testosteron: "energie",
  "vitamine-d": "voeding",
  insulineresistentie: "voeding",
  slaaphygiene: "slaap",
  "eiwitbehoefte-na-40": "voeding",
  "nervus-vagus": "stress",
  slaapschuld: "slaap",
  adaptogens: "stress",
  atp: "energie",
};

function parseLeestijdMinuten(leestijd: string): number {
  const match = leestijd.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function blogTypeFromLeestijd(leestijd: string): InsightType {
  return parseLeestijdMinuten(leestijd) >= 8 ? "deepdive" : "artikel";
}

function niveauFromType(type: InsightType): "Basis" | "Verdiepend" {
  return type === "deepdive" ? "Verdiepend" : "Basis";
}

function resolvePijler(slug: string, fallback: PillarId | null): PillarId {
  const pijler = INSIGHT_PIJLER_OVERRIDE[slug] ?? fallback;
  if (!pijler) {
    throw new Error("Geen pijler voor artikel: " + slug);
  }
  return pijler;
}

function normalizeBlogArtikel(
  artikel: (typeof alleArtikelen)[number],
): InsightItem {
  const pijler = resolvePijler(
    artikel.slug,
    BLOG_CATEGORIE_TO_PIJLER[artikel.categorie],
  );

  const type = blogTypeFromLeestijd(artikel.leestijd);

  return {
    slug: artikel.slug,
    href: artikel.pad ?? `/blog/${artikel.slug}`,
    title: artikel.titel,
    excerpt: artikel.samenvatting,
    pijler,
    type,
    niveau: niveauFromType(type),
    readingTime: artikel.leestijd,
    publishedAt: artikel.gepubliceerdOp,
    source: "blog",
  };
}

function normalizeKennisbankTerm(
  term: (typeof kennisbankTerms)[number],
): InsightItem {
  const pijler = resolvePijler(
    term.slug,
    KENNISBANK_THEME_TO_PIJLER[term.theme],
  );

  const type = "begrip" as const;

  return {
    slug: term.slug,
    href: `/kennisbank/${term.slug}`,
    title: term.term,
    excerpt: term.shortDefinition,
    pijler,
    type,
    niveau: niveauFromType(type),
    source: "kennisbank",
    insightTier: term.insightTier,
  };
}

export function isPremiumKennisbankInsight(item: InsightItem): boolean {
  return (
    item.source === "kennisbank" &&
    item.insightTier !== undefined &&
    item.insightTier >= 2 &&
    item.insightTier <= 3
  );
}

export function getPremiumKennisbankInsights(filters?: {
  pijler?: PillarId;
}): InsightItem[] {
  return allInsights.filter((item) => {
    if (!isPremiumKennisbankInsight(item)) return false;
    if (filters?.pijler && item.pijler !== filters.pijler) return false;
    return true;
  });
}

export function buildPremiumKennisbankHref(pijler?: PillarId): string {
  const params = new URLSearchParams({ kennisbank: "premium" });
  if (pijler) params.set("pijler", pijler);
  return `/inzichten?${params.toString()}#premium-kennisbank`;
}

export const allInsights: InsightItem[] = [
  ...alleArtikelen.map(normalizeBlogArtikel),
  ...kennisbankTerms.map(normalizeKennisbankTerm),
].sort((a, b) => {
  if (a.publishedAt && b.publishedAt) {
    return b.publishedAt.localeCompare(a.publishedAt);
  }
  if (a.publishedAt) return -1;
  if (b.publishedAt) return 1;
  return a.title.localeCompare(b.title, "nl");
});

export const INSIGHT_TYPES_IN_DATA: InsightType[] = [
  ...new Set(allInsights.map((item) => item.type)),
];

export function getInsightsByPijler(p: PillarId): InsightItem[] {
  return allInsights.filter((item) => item.pijler === p);
}

export function filterInsights(filters: {
  pijler?: PillarId;
  type?: InsightType;
}): InsightItem[] {
  return allInsights.filter((item) => {
    if (filters.pijler && item.pijler !== filters.pijler) return false;
    if (filters.type && item.type !== filters.type) return false;
    return true;
  });
}

export function getRecentInsights(n = 3): InsightItem[] {
  return allInsights
    .filter((i) => Boolean(i.publishedAt))
    .sort((a, b) =>
      (b.publishedAt as string).localeCompare(a.publishedAt as string),
    )
    .slice(0, n);
}

export function buildInsightFilterHref(filters: {
  pijler?: PillarId;
  type?: InsightType;
}): string {
  const params = new URLSearchParams();
  if (filters.pijler) params.set("pijler", filters.pijler);
  if (filters.type) params.set("type", filters.type);
  const query = params.toString();
  return query ? `/inzichten?${query}` : "/inzichten";
}
