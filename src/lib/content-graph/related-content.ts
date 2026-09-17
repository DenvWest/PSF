import { metadataForNode } from "@/data/content-graph/node-metadata";
import { NUTRIENT_PAGES } from "@/data/nutrition/nutrient-pages";
import type { ContentMetadata } from "@/data/insight-metadata";
import { inboundCounts } from "@/lib/content-graph/edges";
import {
  allGraphNodes,
  blogPathForSlug,
  getGraphNode,
  type GraphNode,
} from "@/lib/content-graph/node";

/**
 * Welke pagina's horen bij deze pagina?
 *
 * ## Waarom dit berekend wordt en niet geschreven
 *
 * Negen artikelen hadden nul inkomende links, en het patroon was duidelijk:
 * nieuwe stukken krijgen wél uitgaande links, maar bestaande stukken worden
 * niet bijgewerkt om ernaar terug te wijzen. Dat is geen slordigheid maar een
 * eigenschap van handwerk — bij honderdvijftig pagina's kán niemand elke nieuwe
 * publicatie in het hele web nawegen.
 *
 * ## De tiebreak is het hele punt
 *
 * Sorteren op score alleen zou de populaire stukken aan elkaar blijven knopen.
 * De tweede sorteersleutel is daarom **het minst gelinkte stuk eerst**: bij
 * gelijke relevantie wint het artikel dat de aandacht het hardst nodig heeft.
 * Dat is het mechanisme dat wezen opheft en voorkomt dat er nieuwe bij komen.
 *
 * ## Geen cyclus
 *
 * De tiebreak leest `inboundCounts()`, en dat telt alleen **redactionele**
 * links uit de data. Zou hij de berekende links meetellen, dan voedt deze
 * functie zichzelf en is de uitkomst afhankelijk van de volgorde waarin je hem
 * aanroept. De automatische laag ligt er dus bovenop, niet in.
 *
 * ## Waarom de stof een eigen categorie is
 *
 * Een stuk over magnesium hoort altijd naar de magnesiumpagina te wijzen — dat
 * is geen kwestie van genoeg overeenkomstige dimensies, dat is dezelfde stof.
 * Die link is daarom gegarandeerd en niet gescoord.
 */

export type RelationKind =
  | "handmatig"
  | "stof"
  | "onderwerp"
  | "probleem"
  | "supplement";

export interface RelatedLink {
  href: string;
  /** Ankertekst komt van de doelpagina, nooit van de bron. */
  label: string;
  relation: RelationKind;
}

/** Hoeveel automatisch afgeleide links een pagina hoogstens toont. */
export const MAX_RELATED = 6;

/** Hoeveel daarvan gescoord mogen zijn; de rest is handmatig of de stofpagina. */
const MAX_GESCOORD = 4;

/**
 * De drempel. Vier punten betekent in de praktijk: een gedeelde stof, óf twee
 * zwakkere dimensies samen. Eén gedeeld thema is te weinig — dat zou alle
 * negentien energie-artikelen aan elkaar knopen.
 */
const DREMPEL = 4;

/**
 * Hubs matchen op één gedeeld thema.
 *
 * Een pillar, een profielpagina, een gezondheidsgids en een stofpagina zijn
 * gemaakt om een heel onderwerp te bundelen. Voor hen ís één gedeeld thema de
 * relatie — `SEO_RULES.md` zegt het al: "pillar pages linken naar al hun
 * cluster-posts en vice versa". De strengere drempel bestaat om te voorkomen
 * dat negentien energie-artikelen elkaar knopen, en dat gevaar bestaat tussen
 * een hub en zijn cluster niet.
 */
const HUB_DREMPEL = 2;

const HUB_TYPES = new Set<GraphNode["type"]>([
  "pillar",
  "profiel",
  "gezondheidsgids",
  "voedingsstof",
]);

function isHub(node: GraphNode): boolean {
  return HUB_TYPES.has(node.type);
}

/**
 * Hoeveel hublinks een pagina hoogstens toont.
 *
 * Zonder deze grens verdringen pillar, profiel en gids samen de artikelen uit
 * de lijst: een stress-artikel raakt op thema alleen al drie hubs, en dan leest
 * het blok als een navigatiemenu in plaats van als leessuggesties.
 */
const MAX_HUBS = 2;

function gedeeldeStof(a: ContentMetadata, b: ContentMetadata): boolean {
  const links = a.nutrients ?? [];
  const rechts = new Set(b.nutrients ?? []);
  return links.some((nutrient) => rechts.has(nutrient));
}

function score(a: ContentMetadata, b: ContentMetadata): number {
  let punten = 0;
  if (gedeeldeStof(a, b)) punten += 4;
  if (a.theme && a.theme === b.theme) punten += 2;
  if (a.gapSignal && a.gapSignal === b.gapSignal) punten += 2;
  if (a.relatedSupplementId && a.relatedSupplementId === b.relatedSupplementId) {
    punten += 1;
  }
  if (a.planPhase && a.planPhase === b.planPhase) punten += 1;
  return punten;
}

function relatieVoor(a: ContentMetadata, b: ContentMetadata): RelationKind {
  if (gedeeldeStof(a, b)) return "stof";
  if (a.gapSignal && a.gapSignal === b.gapSignal) return "probleem";
  if (a.relatedSupplementId && a.relatedSupplementId === b.relatedSupplementId) {
    return "supplement";
  }
  return "onderwerp";
}

/** De stofpagina('s) die bij dit stuk horen. Gegarandeerd, niet gescoord. */
function stofPaginas(node: GraphNode, meta: ContentMetadata): RelatedLink[] {
  if (node.type === "voedingsstof") return [];
  const links: RelatedLink[] = [];
  for (const nutrient of meta.nutrients ?? []) {
    const doel = getGraphNode(`/voedingsstoffen/${NUTRIENT_PAGES[nutrient].slug}`);
    if (doel) links.push({ href: doel.path, label: doel.title, relation: "stof" });
  }
  return links;
}

/** De handmatig gekozen verwanten. Die winnen altijd. */
function handmatig(node: GraphNode): RelatedLink[] {
  const source = node.source as { gerelateerdeSluggen?: readonly string[] } | null;
  const slugs = source?.gerelateerdeSluggen ?? [];
  const links: RelatedLink[] = [];
  for (const slug of slugs) {
    const pad = blogPathForSlug(slug);
    const doel = pad ? getGraphNode(pad) : undefined;
    if (doel) links.push({ href: doel.path, label: doel.title, relation: "handmatig" });
  }
  return links;
}

let cache: Map<string, RelatedLink[]> | null = null;

function bouwAlles(): Map<string, RelatedLink[]> {
  const nodes = allGraphNodes();
  const redactioneelInbound = inboundCounts();
  const metas = new Map(nodes.map((node) => [node.path, metadataForNode(node)]));
  const uit = new Map<string, RelatedLink[]>();

  for (const node of nodes) {
    const meta = metas.get(node.path)!;
    const links: RelatedLink[] = [];
    const gezien = new Set<string>([node.path]);

    for (const link of [...handmatig(node), ...stofPaginas(node, meta)]) {
      if (gezien.has(link.href)) continue;
      gezien.add(link.href);
      links.push(link);
    }

    const kandidaten = nodes
      .filter((ander) => !gezien.has(ander.path))
      .map((ander) => ({
        node: ander,
        punten: score(meta, metas.get(ander.path)!),
      }))
      .filter((kandidaat) => {
        const drempel =
          isHub(node) || isHub(kandidaat.node) ? HUB_DREMPEL : DREMPEL;
        return kandidaat.punten >= drempel;
      })
      .sort((links_, rechts) => {
        if (rechts.punten !== links_.punten) return rechts.punten - links_.punten;
        // Het minst gelinkte stuk eerst — dit heft wezen op.
        const a = redactioneelInbound.get(links_.node.path) ?? 0;
        const b = redactioneelInbound.get(rechts.node.path) ?? 0;
        if (a !== b) return a - b;
        // Alfabetisch als laatste sleutel, zodat de uitkomst stabiel is.
        return links_.node.path.localeCompare(rechts.node.path);
      })
      .slice(0, MAX_GESCOORD);

    let hubs = links.filter((link) => {
      const doel = getGraphNode(link.href);
      return doel ? isHub(doel) : false;
    }).length;

    for (const kandidaat of kandidaten) {
      if (links.length >= MAX_RELATED) break;
      if (isHub(kandidaat.node)) {
        if (hubs >= MAX_HUBS) continue;
        hubs += 1;
      }
      links.push({
        href: kandidaat.node.path,
        label: kandidaat.node.title,
        relation: relatieVoor(meta, metas.get(kandidaat.node.path)!),
      });
    }

    uit.set(node.path, links.slice(0, MAX_RELATED));
  }

  return uit;
}

/** De verwante pagina's bij één knoop. Eén keer opgebouwd per build. */
export function relatedContent(path: string): RelatedLink[] {
  if (!cache) cache = bouwAlles();
  return cache.get(path) ?? [];
}

/** Alle automatisch afgeleide links, als randen — voor wees-analyse en tests. */
export function autoEdges(): Array<{ from: string; to: string; relation: RelationKind }> {
  if (!cache) cache = bouwAlles();
  return [...cache.entries()].flatMap(([from, links]) =>
    links.map((link) => ({ from, to: link.href, relation: link.relation })),
  );
}

/** Inkomende links inclusief de automatische laag. */
export function inboundCountsWithAuto(): Map<string, number> {
  const counts = new Map(inboundCounts());
  for (const edge of autoEdges()) {
    counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
  }
  return counts;
}
