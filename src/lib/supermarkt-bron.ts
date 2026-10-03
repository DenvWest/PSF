import type { SupermarktBron, SupermarktProduct } from "@/types/supermarkt-product";

/**
 * Bronvermelding per `SupermarktBron` — client-veilig (geen database-import),
 * zodat de UI de bronregel bij elk getoond product kan opbouwen.
 *
 * ODbL §4.3 vraagt een vermelding die hoort bij wat de gebruiker ziet, met bron
 * én licentie, en een link naar de licentietekst. Een footer alleen is
 * onvoldoende (`docs/plan/JURIDISCHE_ANALYSE_SUPERMARKTDATA_2026-10.md`,
 * eindadvies §3). De teksten hieronder zijn het voorstel uit die analyse;
 * een jurist bevestigt ze nog (vraag 9).
 */

export const ODBL_URL = "https://opendatacommons.org/licenses/odbl/1-0/";

type BronInfo = {
  naam: string;
  /** Korte naam, voor in een bronregel: "ODbL". */
  licentie: string;
  /** Volledige naam, voor de uitgebreide bronregel. */
  licentieNaam: string;
  licentieUrl: string;
  /** Pagina van de bron zelf voor dit ene product, of van de bron in het algemeen. */
  productUrl: (bronId: string) => string;
  algemeneUrl: string;
};

export const SUPERMARKT_BRON_INFO: Record<SupermarktBron, BronInfo> = {
  off: {
    naam: "Open Food Facts",
    licentie: "ODbL",
    licentieNaam: "Open Database License",
    licentieUrl: ODBL_URL,
    productUrl: (bronId) => `https://nl.openfoodfacts.org/product/${encodeURIComponent(bronId)}`,
    algemeneUrl: "https://nl.openfoodfacts.org",
  },
  nevo: {
    naam: "NEVO-online",
    licentie: "RIVM",
    licentieNaam: "voorwaarden voor gebruik van NEVO-online",
    licentieUrl: "https://www.rivm.nl/nevo",
    productUrl: () => "https://www.rivm.nl/nevo",
    algemeneUrl: "https://www.rivm.nl/nevo",
  },
};

/** URL van het product bij de bron zelf (bij Open Food Facts: de productpagina). */
export function supermarktProductUrl(product: Pick<SupermarktProduct, "bron" | "bronId">): string {
  return SUPERMARKT_BRON_INFO[product.bron].productUrl(product.bronId);
}

/** Het getal-en-woord voor de bronregel: "Open Food Facts (ODbL)". */
export function supermarktBronLabel(bron: SupermarktBron): string {
  const info = SUPERMARKT_BRON_INFO[bron];
  return `${info.naam} (${info.licentie})`;
}

/** Alle bronnen die in een gegeven lijst producten voorkomen, in vaste volgorde. */
export function bronnenVan(producten: readonly Pick<SupermarktProduct, "bron">[]): SupermarktBron[] {
  const gezien = new Set<SupermarktBron>();
  for (const product of producten) gezien.add(product.bron);
  return [...gezien];
}
