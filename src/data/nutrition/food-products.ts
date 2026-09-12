/**
 * De supermarktlaag — een product wijst naar een voedingsmiddel, het draagt
 * geen eigen gehalterij.
 *
 * ## Waarom een product geen gehaltes heeft
 *
 * Voor een enkelvoudig product is het merk verpakking, geen samenstelling.
 * "AH ongezouten amandelen" en "Jumbo amandelen" zijn allebei *amandelen*; het
 * verschil tussen die twee valt weg tegen het verschil tussen cultivars en
 * groeigebieden — en dat laatste zit al in de spreidingsband
 * (ONDERZOEK_SPREIDING_EN_USDA §1.7). Wie een band toont in plaats van een punt,
 * kan een merkproduct dus verantwoorden: het merkverschil valt binnen de band.
 *
 * Een {@link Product} draagt daarom **geen `nutrients`-veld**. Het wijst met
 * `foodKey` naar een {@link CatalogEntry}, erft daarvan de gehaltes én de
 * voedselgroep, en voegt toe wat de verpakking wél zelf weet: een portie die je
 * herkent. Drie gevolgen, alle drie gunstig:
 *
 * 1. Een nieuw product is één regel — sleutel, label, `foodKey`, porties. Geen
 *    onderzoek per product; dát maakt de groei naar honderden producten haalbaar.
 * 2. Een verbeterd gehalte verbetert alle merken tegelijk: vervang de waarde
 *    voor `amandelen` en elk merk amandelen volgt.
 * 3. De portie is de echte winst van het merk — "een zakje" of "een handvol"
 *    is precies wat het generieke voedingsmiddel niet weet.
 *
 * ## Wanneer het merk wél de samenstelling bepaalt — `etiket`
 *
 * Alleen bij verrijkte en claimproducten wint het etiket van `foodKey`. Dat is
 * exact de klasse die de catalogus als `geenBron: "verrijkt"` markeert: het
 * getal komt niet uit USDA maar van de verpakking. De invariant (zie
 * `food-products.test.ts`): **`etiket` bestaat alleen op een product waarvan de
 * `foodKey` een `verrijkt`-regel is**, en omgekeerd draagt een product op zo'n
 * regel altijd een `etiket` — anders levert het niets.
 *
 * Twee dingen die `etiket` NIET is:
 *
 * - **Geen verzonnen getal.** Een etiketwaarde is pas een waarde als hij
 *   gelézen is (`bron` zegt waar, `jaar` wanneer). Een "typische" waarde voor
 *   een productcategorie is een verzonnen getal met een nette jas aan. Daarom
 *   staan hier alleen citeerbare kaderwaarden (het NL-verrijkingskader, de
 *   wettelijke melkverrijking); merkspecifieke waarden — plantaardige dranken,
 *   verrijkte granen, eiwitshakes en -repen — wachten op een echt etiket en
 *   staan er bewust nog niet in.
 * - **Geen merk-meting.** Het getal blijft van het voedingsmiddel of van het
 *   kader, niet van het merk. `merk` is er om te vínden, nooit om te rekenen of
 *   naar te rangschikken — en zeker niet om naar te linken. Affiliate-links
 *   horen op de vergelijkingspagina's, niet in het dagboek.
 *
 * ## Houdbaarheid
 *
 * Een recept en een verrijkingsniveau veranderen per batch, dus elk etiket
 * draagt `jaar`. Een merk-etiket dat te oud wordt, is geen stille waarheid
 * meer — {@link isEtiketVerouderd} maakt dat afleesbaar. Kaderwaarden (zonder
 * `merk`) veranderen alleen als de regelgeving verandert en verouderen dus niet
 * vanzelf.
 */

import { catalogEntry, type CatalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";

/** Een portie zoals de verpakking hem noemt, met het gram-equivalent. */
export interface ProductPortie {
  labelNl: string;
  grams: number;
}

/**
 * Een gelezen etiketwaarde per 100 g. `bron` noemt merk + editie of het
 * wettelijk kader; `jaar` is wanneer hij gelezen is — een recept verandert.
 */
export interface EtiketWaarde {
  per100g: number;
  bron: string;
  jaar: number;
}

export interface Product {
  /** Stabiel, kebab-case, uniek over alle producten. */
  key: string;
  labelNl: string;
  /** Alleen om te vinden, nooit om te rekenen of te rangschikken. */
  merk?: string;
  /**
   * Waar de gehaltes en de voedselgroep vandaan komen: een `CatalogEntry.key`.
   * Het product heeft er zelf geen — het erft ze.
   */
  foodKey: string;
  /** Wat de verpakking wél toevoegt: een portie die je herkent. */
  porties: readonly ProductPortie[];
  /**
   * Alleen bij verrijkte/claimproducten: dan wint het etiket van `foodKey`.
   * Zie de moduledoc voor de invariant.
   */
  etiket?: Partial<Record<NutrientId, EtiketWaarde>>;
}

/**
 * Een merk-etiket ouder dan dit aantal jaren telt als verouderd: een recept of
 * verrijkingsniveau kan intussen veranderd zijn. Kaderwaarden (zonder `merk`)
 * vallen hier buiten — die volgen de regelgeving, niet de batch.
 */
export const ETIKET_HOUDBAARHEID_JAREN = 3;

/**
 * De producten. Vandaag bewust smal: de citeerbare kaderverrijkingen plus een
 * handvol verwijsproducten die de vorm tonen. De merkspecifieke etiketten
 * (plantaardige dranken, verrijkte granen, eiwitshakes/-repen) wachten op een
 * gelezen verpakking — een verzonnen getal is hier verboden.
 */
export const FOOD_PRODUCTS: readonly Product[] = [
  // ── Kaderverrijkingen: citeerbaar, generiek, geen merk ───────────────────
  {
    key: "margarine-verrijkt",
    labelNl: "Margarine (verrijkt)",
    foodKey: "margarine",
    porties: [
      { labelNl: "mespunt", grams: 5 },
      { labelNl: "voor twee sneden", grams: 10 },
    ],
    etiket: {
      vitamin_d: { per100g: 7.5, bron: "NL-verrijkingskader (Warenwet)", jaar: 2024 },
    },
  },
  {
    key: "margarine-ouderen",
    labelNl: "Margarine, ouderenvariant (verrijkt)",
    foodKey: "margarine",
    porties: [
      { labelNl: "mespunt", grams: 5 },
      { labelNl: "voor twee sneden", grams: 10 },
    ],
    etiket: {
      vitamin_d: { per100g: 25, bron: "NL-verrijkingskader, ouderenvariant", jaar: 2024 },
    },
  },
  {
    key: "halfvolle-melk-verrijkt",
    labelNl: "Halfvolle melk",
    foodKey: "melk-halfvol",
    porties: [
      { labelNl: "glas", grams: 200 },
      { labelNl: "beker", grams: 250 },
    ],
    etiket: {
      // 1,5 µg per 100 ml; melk ≈ 1,03 g/ml, dus per 100 g nagenoeg gelijk.
      vitamin_d: { per100g: 1.5, bron: "Warenwet, verplicht sinds 2021 (per 100 ml)", jaar: 2021 },
    },
  },
  {
    key: "magere-melk-verrijkt",
    labelNl: "Magere melk",
    foodKey: "melk-mager",
    porties: [
      { labelNl: "glas", grams: 200 },
      { labelNl: "beker", grams: 250 },
    ],
    etiket: {
      vitamin_d: { per100g: 1.5, bron: "Warenwet, verplicht sinds 2021 (per 100 ml)", jaar: 2021 },
    },
  },

  // ── Verwijsproducten: erven van foodKey, geen eigen getal ────────────────
  {
    key: "amandelen-ongezouten",
    labelNl: "Amandelen, ongezouten",
    foodKey: "amandelen",
    porties: [
      { labelNl: "handvol", grams: 25 },
      { labelNl: "zakje", grams: 200 },
    ],
  },
  {
    key: "walnoten-ongezouten",
    labelNl: "Walnoten, ongezouten",
    foodKey: "walnoten",
    porties: [
      { labelNl: "handvol", grams: 25 },
      { labelNl: "zakje", grams: 150 },
    ],
  },
  {
    key: "havermout-standaard",
    labelNl: "Havermout",
    foodKey: "havermout",
    porties: [
      { labelNl: "portie", grams: 60 },
      { labelNl: "grote portie", grams: 80 },
    ],
  },
];

const OP_KEY: ReadonlyMap<string, Product> = new Map(
  FOOD_PRODUCTS.map((product) => [product.key, product]),
);

export function productByKey(key: string): Product | null {
  return OP_KEY.get(key) ?? null;
}

/** De catalogusregel waar dit product naar wijst — de bron van zijn groep en gehaltes. */
export function foodEntryVoorProduct(product: Product): CatalogEntry | null {
  return catalogEntry(product.foodKey);
}

/**
 * Waar het gehalte voor deze stof vandaan komt bij dit product: van het etiket
 * (verrijkt/claim) of van het voedingsmiddel achter `foodKey`. Dit is de plek
 * waar de eiwitroute zich verbreedt: een shake of reep draagt zijn eiwit op het
 * etiket, terwijl een gewoon product het uit `foodKey` erft.
 */
export function etiketWaarde(product: Product, nutrient: NutrientId): EtiketWaarde | null {
  return product.etiket?.[nutrient] ?? null;
}

/**
 * Of een etiketwaarde te oud is om nog te vertrouwen. Alleen merk-etiketten
 * verouderen: een recept of verrijkingsniveau kan per batch wijzigen.
 * Kaderwaarden (product zonder `merk`) volgen de regelgeving en verouderen niet
 * vanzelf.
 */
export function isEtiketVerouderd(
  product: Product,
  waarde: EtiketWaarde,
  peiljaar: number = new Date().getFullYear(),
): boolean {
  if (!product.merk) return false;
  return peiljaar - waarde.jaar > ETIKET_HOUDBAARHEID_JAREN;
}

/** Zoeken op label, merk en sleutel — merk telt mee om te vínden, niet om te rekenen. */
export function searchProducts(query: string, limiet = 20): Product[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  return FOOD_PRODUCTS.filter((product) => {
    const velden = [product.labelNl, product.merk ?? "", product.key];
    return velden.some((veld) => veld.toLowerCase().includes(term));
  }).slice(0, limiet);
}
