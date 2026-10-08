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

export const DBCL_URL = "https://opendatacommons.org/licenses/dbcl/1-0/";

/**
 * Wat wij met de Open Food Facts-gegevens deden voordat ze in `sm_products` en
 * in de download kwamen (`scripts/off-extract.py`, `sm-products-dump.ts`).
 * Eén bron voor /bronnen en voor de LEESMIJ.txt in de zip; wijzigt de extractor,
 * dan wijzigt deze lijst mee.
 */
export const OFF_WIJZIGINGEN: readonly string[] = [
  "alleen producten behouden die Open Food Facts als verkocht in Nederland aanmerkt, die niet als verouderd zijn gemarkeerd, een barcode van 8 tot 14 cijfers hebben en een energiewaarde in kcal; producten waarvan alleen kJ bekend is, zijn weggelaten;",
  "per barcode één rij bewaard;",
  "de productnaam gekozen in het Nederlands, anders in de hoofdtaal van het product, anders in het Engels, anders de eerste beschikbare taal, met extra spaties weggehaald en afgekapt op 300 tekens;",
  "alleen het eerste merk en de laatste (meest specifieke) categorie bewaard, en een zoektekst toegevoegd: naam en merk zonder accenten en hoofdletters;",
  "natrium omgerekend van gram naar milligram per 100 g of ml, en alle waarden afgerond: energie en natrium op 1 decimaal, de overige op 2 decimalen;",
  "calcium, ijzer, vitamine C en vitamine D leeggelaten: in de bron staan schattingen die Open Food Facts uit de ingrediëntenlijst berekent tussen de etiketwaarden, zonder dat ze van elkaar te onderscheiden zijn;",
  "rijen weggelaten waarvan de energiewaarde niet bij eiwit, koolhydraten en vet past, of met een onmogelijke waarde (zoals meer dan 100 g vet per 100 g), en een natriumgehalte boven 40.000 mg per 100 g leeggelaten;",
  "tekst die met =, +, - of @ begint in de download voorzien van een apostrof, zodat een spreadsheet er geen formule van maakt; die cellen beginnen daardoor met een apostrof die niet in de bron staat.",
];

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
