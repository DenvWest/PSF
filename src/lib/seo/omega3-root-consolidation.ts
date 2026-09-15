/**
 * A5 — de twee omega-3 root-URL's opruimen ten gunste van /supplementen/omega-3.
 *
 * `/wat-is-omega-3` en `/waar-let-je-op-bij-omega-3` zijn het enige geval waarin
 * één stof een derde contentlaag heeft; hun onderwerp valt samen met de gids
 * (zie docs/research/BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md, bevinding 3).
 *
 * Staat uit tot in Search Console bevestigd is dat ze nul eigen impressies
 * hebben — samenvoegen kost anders vertoning die je nog niet gemist hebt.
 * Aanzetten: `NEXT_PUBLIC_OMEGA3_ROOT_301=1` in de server-`.env`, daarna
 * `bash deploy.sh` (de waarde wordt bij de build ingebakken). Terugdraaien is
 * dezelfde handeling met de vlag eruit.
 *
 * Zodra de vlag aanstaat gebeurt alles tegelijk: de 301 in de proxy, de twee
 * pagina's uit de sitemap, en elke interne link rechtstreeks naar de gids —
 * anders staat er een redirect-keten in je eigen navigatie.
 */

export const OMEGA3_ROOT_PATHS = [
  "/wat-is-omega-3",
  "/waar-let-je-op-bij-omega-3",
] as const;

export const OMEGA3_GUIDE_PATH = "/supplementen/omega-3";

const ROOT_PATH_SET: ReadonlySet<string> = new Set(OMEGA3_ROOT_PATHS);

export function isOmega3RootConsolidationEnabled(): boolean {
  return process.env.NEXT_PUBLIC_OMEGA3_ROOT_301 === "1";
}

export function isOmega3RootPath(path: string): boolean {
  return ROOT_PATH_SET.has(path);
}

/** Interne links: wijzen naar de gids zodra de 301 leeft, nooit via een omweg. */
export function resolveOmega3RootHref(href: string): string {
  if (!isOmega3RootConsolidationEnabled()) return href;
  return isOmega3RootPath(href) ? OMEGA3_GUIDE_PATH : href;
}

/** Sitemap: een URL die 301't hoort er niet in te staan. */
export function shouldIndexPath(path: string): boolean {
  return !(isOmega3RootConsolidationEnabled() && isOmega3RootPath(path));
}
