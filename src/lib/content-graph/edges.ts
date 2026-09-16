import { allGraphNodes, blogPathForSlug, type GraphNode } from "@/lib/content-graph/node";

/**
 * De randen van de contentgraaf: elke interne link die in de contentdata staat.
 *
 * ## Waarom een generieke boomwandeling en geen veldenlijst
 *
 * De zes contentmodellen dragen links op minstens twintig verschillende
 * plekken: markdown in `secties[].tekst`, in `callouts[].tekst`, in
 * `content.howItWorks`, losse `href`-velden in `blogLinks`, in
 * `gerelateerdeSymptomen.links`, in `readAlsoCards`, en zo verder.
 *
 * Die met de hand opsommen werkt één keer. Daarna groeit een model met een
 * veld, vergeet iemand deze lijst bij te werken, en telt de graaf stilletjes te
 * weinig — precies het soort stille omissie dat de acht supplementgidsen uit de
 * sitemap hield.
 *
 * Deze module loopt daarom de hele objectboom af. Een nieuw tekstveld doet
 * vanzelf mee; een nieuw `href`-veld ook.
 *
 * ## Wat als link telt
 *
 * 1. **Markdown** — `[label](/pad)` in élke string. Dit is de dominante
 *    linkvorm in de artikelen en de redactioneel sterkste.
 * 2. **`href` / `url`** met een waarde die met `/` begint.
 * 3. **Slug-verwijzingen** — `gerelateerdeSluggen` en `relatedSlugs` dragen
 *    slugs, geen paden; die worden hier opgelost.
 * 4. **`relatedComparisons`** — kale paden in een array.
 *
 * Afbeeldingen (`/images/...`) tellen niet mee; dat zijn geen navigatielinks.
 */

export type EdgeKind =
  | "inline"
  | "cta"
  | "related"
  | "comparison"
  | "breadcrumb";

export interface GraphEdge {
  /** Pad van de bronpagina. */
  from: string;
  /** Pad van de doelpagina, zonder fragment of query. */
  to: string;
  kind: EdgeKind;
  /** JSON-pad binnen de brondata, bijvoorbeeld `secties[3].tekst`. */
  field: string;
}

const MARKDOWN_LINK = /\[[^\]]*\]\((\/[^)\s]*)\)/g;
const HREF_KEYS = new Set(["href", "url"]);
const SLUG_ARRAY_KEYS = new Set(["gerelateerdeSluggen", "relatedSlugs"]);
const COMPARISON_ARRAY_KEYS = new Set(["relatedComparisons"]);

/** Fragment en query eraf; een link naar `#top` is een link naar de pagina. */
export function normalizePath(raw: string): string | null {
  const withoutHash = raw.split("#")[0]?.split("?")[0] ?? "";
  if (!withoutHash.startsWith("/")) return null;
  if (withoutHash.startsWith("/images/")) return null;
  if (withoutHash === "/") return "/";
  return withoutHash.replace(/\/+$/, "");
}

function isBreadcrumbField(field: string): boolean {
  return field.includes("breadcrumb");
}

function walk(
  value: unknown,
  field: string,
  from: string,
  out: GraphEdge[],
): void {
  if (typeof value === "string") {
    for (const match of value.matchAll(MARKDOWN_LINK)) {
      const to = normalizePath(match[1] ?? "");
      if (to && to !== from) {
        out.push({ from, to, kind: "inline", field });
      }
    }

    const key = field.split(".").pop() ?? "";
    if (HREF_KEYS.has(key)) {
      const to = normalizePath(value);
      if (to && to !== from) {
        out.push({
          from,
          to,
          kind: isBreadcrumbField(field) ? "breadcrumb" : "cta",
          field,
        });
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${field}[${index}]`, from, out));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (SLUG_ARRAY_KEYS.has(key) && Array.isArray(child)) {
        for (const slug of child) {
          if (typeof slug !== "string") continue;
          // `relatedSlugs` staat op kennisbanktermen, `gerelateerdeSluggen` op
          // artikelen — dezelfde vorm, twee naamruimtes.
          const to =
            key === "relatedSlugs"
              ? `/kennisbank/${slug}`
              : blogPathForSlug(slug);
          if (to && to !== from) {
            out.push({ from, to, kind: "related", field: `${field}${key}` });
          }
        }
        continue;
      }

      if (COMPARISON_ARRAY_KEYS.has(key) && Array.isArray(child)) {
        for (const entry of child) {
          if (typeof entry !== "string") continue;
          const to = normalizePath(entry);
          if (to && to !== from) {
            out.push({ from, to, kind: "comparison", field: `${field}${key}` });
          }
        }
        continue;
      }

      walk(child, field ? `${field}.${key}` : key, from, out);
    }
  }
}

let cache: GraphEdge[] | null = null;

/** Alle interne links uit de contentdata, één keer opgebouwd. */
export function graphEdges(): GraphEdge[] {
  if (cache) return cache;

  const out: GraphEdge[] = [];
  for (const node of allGraphNodes()) {
    if (node.source == null) continue;
    walk(node.source, "", node.path, out);
  }
  cache = out;
  return out;
}

/**
 * Hoe vaak elke pagina gelinkt wordt vanuit andere contentpagina's.
 *
 * Breadcrumbs tellen niet mee: die wijzen altijd naar de hub en zeggen niets
 * over inhoudelijke relevantie. Een pagina die alleen via breadcrumbs bereikt
 * wordt, is nog steeds een wees.
 */
export function inboundCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of graphEdges()) {
    if (edge.kind === "breadcrumb") continue;
    counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
  }
  return counts;
}

export function outboundCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of graphEdges()) {
    if (edge.kind === "breadcrumb") continue;
    counts.set(edge.from, (counts.get(edge.from) ?? 0) + 1);
  }
  return counts;
}

/** Contentpagina's zonder één inhoudelijke inkomende link. */
export function orphanNodes(): GraphNode[] {
  const inbound = inboundCounts();
  return allGraphNodes().filter((node) => !inbound.has(node.path));
}

/** Alle unieke doelpaden — de lijst die tegen de echte routes gelegd wordt. */
export function linkTargets(): string[] {
  return [...new Set(graphEdges().map((edge) => edge.to))].sort();
}
