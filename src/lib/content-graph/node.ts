import { alleArtikelen, getArtikelBySlug } from "@/data/blog";
import { blogArtikelPad } from "@/lib/blog-artikel-pad";
import { kennisbankTerms } from "@/data/kennisbank";
import { ALL_SUPPLEMENT_SLUGS, getSupplementData } from "@/data/supplement-guides";
import { SUPPLEMENT_SLUGS, getSupplementComparisonData } from "@/data/supplements";
import { PROFILE_PAGES, PROFILE_SLUGS } from "@/data/profiles";
import { GUIDE_SLUGS, getGuideData } from "@/data/gids";
import { NUTRIENT_PAGES } from "@/data/nutrition/nutrient-pages";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";

/**
 * De knopen van de contentgraaf: elke publieke pagina die inhoud draagt en
 * onderdeel is van het interne linknetwerk.
 *
 * ## Waarom dit bestand bestaat
 *
 * De content staat in zes losse datamodellen (`BlogArtikel`, `KennisbankTerm`,
 * `SupplementData`, `ComparisonPageData`, `ProfilePageData`, `GuideOptInData`)
 * die niets van elkaar weten. Daardoor was een vraag als *"welke pagina's
 * linken hiernaartoe"* alleen met de hand te beantwoorden — en dus nooit.
 *
 * Deze module legt er één union overheen. Geen nieuw contentmodel: elke knoop
 * verwijst naar de bestaande data en voegt alleen een pad, een type en een
 * titel toe.
 *
 * ## Wat een knoop níét is
 *
 * Hubs (`/blog`, `/kennisbank`, `/supplementen`), checks (`/intake/*`) en
 * juridische pagina's staan er bewust niet in. Ze dragen geen onderwerp en
 * horen dus niet mee te tellen in wees- en relevantie-analyse; een artikel dat
 * alleen vanaf `/blog` gelinkt wordt, is nog steeds een wees.
 *
 * Ze zijn wél geldige link-doelen — zie `edges.ts`, dat pad-resolutie los houdt
 * van knoop-identiteit.
 */

export type GraphNodeType =
  | "blog"
  | "kennisbank"
  | "supplementgids"
  | "vergelijking"
  | "pillar"
  | "profiel"
  | "gezondheidsgids"
  | "voedingsstof";

export interface GraphNode {
  /** Het pad is de identiteit. Eén pagina, één knoop. */
  path: string;
  type: GraphNodeType;
  slug: string;
  title: string;
  /** De ruwe data, voor consumenten die meer nodig hebben dan pad en titel. */
  source: unknown;
}

/**
 * De acht leefstijl-pillars.
 *
 * Bewust een eigen lijst en niet afgeleid uit `PILLARS[].hubRoute`: dat veld
 * wijst voor `verbinding` naar `/inzichten` (een hub, geen pillar) en kent
 * `/testosteron-na-40` en `/overgang` niet, die geen gemeten domein zijn maar
 * wel een pillarpagina hebben.
 */
export const PILLAR_NODES: ReadonlyArray<{ path: string; title: string }> = [
  { path: "/slaap-verbeteren-na-40", title: "Beter slapen na 30" },
  { path: "/stress-verminderen-na-40", title: "Stress verminderen na 30" },
  { path: "/energie-na-40", title: "Meer energie na 30" },
  { path: "/herstel-verbeteren-na-40", title: "Herstel verbeteren na 30" },
  { path: "/voeding-na-40", title: "Voeding na 30" },
  { path: "/beweging-na-40", title: "Beweging na 30" },
  { path: "/testosteron-na-40", title: "Testosteron na 30" },
  { path: "/overgang", title: "De overgang" },
];

/** Het pad van een blogartikel; cornerstone-artikelen dragen een eigen `pad`. */
export function blogPathForSlug(slug: string): string | null {
  const artikel = getArtikelBySlug(slug);
  return artikel ? blogArtikelPad(artikel) : null;
}

let cache: GraphNode[] | null = null;

/**
 * Alle contentknopen, één keer opgebouwd.
 *
 * De graaf is onveranderlijk binnen een build, dus het resultaat wordt
 * vastgehouden: `edges.ts` en elke consument daarvan lopen hem meerdere keren
 * af.
 */
export function allGraphNodes(): GraphNode[] {
  if (cache) return cache;

  const nodes: GraphNode[] = [];
  const seen = new Set<string>();

  function push(node: GraphNode) {
    // Zeven cornerstone-"artikelen" dragen een `pad` naar /beste/* of naar een
    // root-pagina. Die pagina bestaat al als eigen knoop; de eerste wint.
    if (seen.has(node.path)) return;
    seen.add(node.path);
    nodes.push(node);
  }

  for (const slug of SUPPLEMENT_SLUGS) {
    const data = getSupplementComparisonData(slug);
    if (!data) continue;
    push({
      path: `/beste/${slug}`,
      type: "vergelijking",
      slug,
      title: data.h1,
      source: data,
    });
  }

  for (const slug of ALL_SUPPLEMENT_SLUGS) {
    const data = getSupplementData(slug);
    push({
      path: `/supplementen/${slug}`,
      type: "supplementgids",
      slug,
      title: data.h1,
      source: data,
    });
  }

  for (const pillar of PILLAR_NODES) {
    push({
      path: pillar.path,
      type: "pillar",
      slug: pillar.path.slice(1),
      title: pillar.title,
      source: null,
    });
  }

  for (const artikel of alleArtikelen) {
    push({
      path: blogArtikelPad(artikel),
      type: "blog",
      slug: artikel.slug,
      title: artikel.titel,
      source: artikel,
    });
  }

  for (const term of kennisbankTerms) {
    push({
      path: `/kennisbank/${term.slug}`,
      type: "kennisbank",
      slug: term.slug,
      title: term.term,
      source: term,
    });
  }

  for (const slug of PROFILE_SLUGS) {
    const data = PROFILE_PAGES[slug];
    if (!data) continue;
    push({
      path: `/profiel/${slug}`,
      type: "profiel",
      slug,
      title: data.label,
      source: data,
    });
  }

  for (const nutrient of NUTRIENT_IDS) {
    const copy = NUTRIENT_PAGES[nutrient];
    push({
      path: `/voedingsstoffen/${copy.slug}`,
      type: "voedingsstof",
      slug: copy.slug,
      title: copy.h1,
      source: copy,
    });
  }

  for (const slug of GUIDE_SLUGS) {
    const data = getGuideData(slug);
    if (!data) continue;
    push({
      path: `/gids/${slug}`,
      type: "gezondheidsgids",
      slug,
      title: data.heroTitle,
      source: data,
    });
  }

  cache = nodes;
  return nodes;
}

export function getGraphNode(path: string): GraphNode | undefined {
  return allGraphNodes().find((node) => node.path === path);
}
