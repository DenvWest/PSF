import type { GevolgdeNormen } from "@/data/nutrition/voedingsnormen";
import { normVoorVeld, STANDAARD_GEVOLGDE_NORMEN } from "@/lib/nutrition-normen";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { nevoKoppelingVoor } from "@/data/nutrition/food-catalog-nevo";
import { isVrijgegevenBenadering } from "@/lib/nutrition-catalog-gehalte";
import { bedragVanItem, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import {
  bedragVanSupermarktveld,
  type SupermarktPortie,
  type SupermarktVeld,
} from "@/lib/nutrition-supermarkt-items";
import { toBase } from "@/lib/nutrition-units";
import type { SupermarktProduct } from "@/types/supermarkt-product";

/**
 * De volledige voedingswaarde van een dag of één portie: calorieën, macro's en
 * de brede micronutriënten, zoals een etiket. Informatief, geen oordeel
 * (`BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §0.1).
 *
 * ## Eén gehalte per plek
 *
 * Eiwit is ook een kernstof. Voor een catalogusregel komt het daarom uit
 * {@link bedragVanItem} (FOOD_SOURCES eerst, NEVO vult aan), niet uit het
 * NEVO-record: zo staat in deze tabel hetzelfde getal als in de krans.
 * Magnesium, zink, vitamine D en omega-3 staan hier niet; die toont de krans.
 *
 * ## Wat niet meetelt
 *
 * Een benaderingskoppeling (`basis: "benadering"`) is een vergelijkbaar
 * voedingsmiddel, geen brongetal. Is hij vrijgegeven
 * (`FOOD_CATALOG_NEVO_BENADERINGEN`), dan telt hij voor elk veld mee,
 * gemarkeerd als `benaderd` (≈). Een "gehaald" rekent met
 * `aandeelZonderBenadering` (`BESLUIT_MICRO_IN_BEELD_2026-10.md` §1b). Een
 * niet-vrijgegeven benadering en een
 * supplement tellen als `zonderWaarde`, zodat de UI kan zeggen dat het totaal
 * onvolledig is.
 *
 * %RI alleen voor vitamines en mineralen (bijlage XIII, 1169/2011). Energie
 * en macro's krijgen geen percentage: het systeem legt daar geen doel op.
 */

export type VoedingswaardeVeld = {
  veld: SupermarktVeld;
  label: string;
  unit: "kcal" | "g" | "mg" | "µg";
  /** Referentie-inname uit bijlage XIII, of `null` als er geen is of we er geen tonen. */
  ri: number | null;
  /** "waarvan …"-regel onder de vorige. */
  waarvan?: boolean;
};

export const VOEDINGSWAARDE_VELDEN: readonly VoedingswaardeVeld[] = [
  { veld: "energyKcal", label: "Energie", unit: "kcal", ri: null },
  { veld: "fatG", label: "Vet", unit: "g", ri: null },
  { veld: "saturatedFatG", label: "waarvan verzadigd", unit: "g", ri: null, waarvan: true },
  { veld: "carbohydrateG", label: "Koolhydraten", unit: "g", ri: null },
  { veld: "sugarsG", label: "waarvan suikers", unit: "g", ri: null, waarvan: true },
  { veld: "fiberG", label: "Vezels", unit: "g", ri: null },
  { veld: "proteinG", label: "Eiwit", unit: "g", ri: null },
  { veld: "sodiumMg", label: "Natrium", unit: "mg", ri: null },
  { veld: "potassiumMg", label: "Kalium", unit: "mg", ri: 2000 },
  { veld: "calciumMg", label: "Calcium", unit: "mg", ri: 800 },
  { veld: "ironMg", label: "IJzer", unit: "mg", ri: 14 },
  { veld: "vitaminB12µg", label: "Vitamine B12", unit: "µg", ri: 2.5 },
  { veld: "vitaminCMg", label: "Vitamine C", unit: "mg", ri: 80 },
];

export type VoedingswaardeRij = VoedingswaardeVeld & {
  /** Som in {@link VoedingswaardeVeld.unit}, of `null` als geen enkel product een waarde had. */
  waarde: number | null;
  /** De persoonlijke norm (`voedingsnormen.ts`), of null voor een stof zonder norm. */
  norm: number | null;
  /** Aandeel van de norm (0–∞): wat de ringen en Je patroon tonen. */
  aandeel: number | null;
  /** Aandeel van de RI (0–∞): alleen voor de etiketvermelding in de voedingswaardetabel. */
  aandeelRi: number | null;
  /** Of een benadering aan deze som bijdroeg: toon de waarde met ≈. */
  benaderd?: boolean;
  /**
   * Aandeel van de norm zonder benaderingen. Alleen hiermee mag een ✓ of
   * "gehaald" (`BESLUIT_MICRO_IN_BEELD_2026-10.md` §1b). Ontbreekt het, dan is
   * het gelijk aan `aandeel`.
   */
  aandeelZonderBenadering?: number | null;
};

/** Of een rij zijn norm haalt zonder benaderingen: de enige grond voor een ✓. */
export function rijGehaald(rij: Pick<VoedingswaardeRij, "aandeel" | "aandeelZonderBenadering">): boolean {
  const aandeel = rij.aandeelZonderBenadering === undefined ? rij.aandeel : rij.aandeelZonderBenadering;
  return aandeel !== null && aandeel >= 1;
}

export type Voedingswaarde = {
  rijen: VoedingswaardeRij[];
  /** Producten met een waarde in minstens één rij. */
  metWaarde: number;
  /** Producten die niets bijdroegen (geen koppeling, niet-vrijgegeven benadering, supplement, onbekend product). */
  zonderWaarde: number;
  /** Producten die als benadering meetelden, met ≈. */
  benaderd: number;
};

/** De NEVO-code waaruit een dagboekregel zijn voedingswaarde haalt, of `null`. Nooit een benadering. */
export function nevoCodeVoorItem(item: DagboekItem): string | null {
  if (item.bron !== "voeding") return null;
  const koppeling = nevoKoppelingVoor(item.key);
  if (!koppeling || koppeling.basis === "benadering") return null;
  return koppeling.code;
}

/** De NEVO-code van een vrijgegeven benadering: telt mee als ≈. */
function benaderingCodeVoorItem(item: DagboekItem): string | null {
  if (item.bron !== "voeding" || !isVrijgegevenBenadering(item.key)) return null;
  const koppeling = nevoKoppelingVoor(item.key);
  return koppeling?.basis === "benadering" ? koppeling.code : null;
}

/** Alle NEVO-codes die nodig zijn om deze items door te rekenen, uniek en gesorteerd. */
export function nevoCodesVoorItems(items: readonly DagboekItem[]): string[] {
  return [
    ...new Set(items.flatMap((item) => nevoCodeVoorItem(item) ?? benaderingCodeVoorItem(item) ?? [])),
  ].sort();
}

function eiwitVanItem(item: DagboekItem): number | null {
  const bedrag = bedragVanItem(item, "protein");
  if (!bedrag) return null;
  return toBase(bedrag.value, bedrag.unit, "protein");
}

type Bijdrage = { waarden: Map<SupermarktVeld, number>; benaderd: boolean };

function waardenVanItem(item: DagboekItem, nevoProducten: ReadonlyMap<string, SupermarktProduct>): Bijdrage | null {
  const waarden = new Map<SupermarktVeld, number>();
  const eiwit = eiwitVanItem(item);
  if (eiwit !== null) waarden.set("proteinG", eiwit);

  const benaderingCode = nevoCodeVoorItem(item) === null ? benaderingCodeVoorItem(item) : null;
  const code = nevoCodeVoorItem(item) ?? benaderingCode;
  const product = code && catalogEntry(item.key) ? nevoProducten.get(`nevo:${code}`) : undefined;
  if (product) {
    for (const { veld } of VOEDINGSWAARDE_VELDEN) {
      if (veld === "proteinG") continue;
      const bedrag = bedragVanSupermarktveld(product, veld, item.grams);
      if (bedrag !== null) waarden.set(veld, bedrag);
    }
  }
  return waarden.size > 0 ? { waarden, benaderd: benaderingCode !== null } : null;
}

function waardenVanLog(log: Pick<SupermarktPortie, "product" | "grams">): Bijdrage | null {
  if (!log.product) return null;
  const waarden = new Map<SupermarktVeld, number>();
  for (const { veld } of VOEDINGSWAARDE_VELDEN) {
    const bedrag = bedragVanSupermarktveld(log.product, veld, log.grams);
    if (bedrag !== null) waarden.set(veld, bedrag);
  }
  return waarden.size > 0 ? { waarden, benaderd: false } : null;
}

/**
 * Telt dagboekregels en supermarktporties op tot één voedingswaardetabel.
 * `nevoProducten` is gesleuteld op `nevo:<code>` (zoals `SupermarktProduct.prodId`).
 */
export function berekenVoedingswaarde({
  items,
  supermarktLogs = [],
  nevoProducten,
  normen = STANDAARD_GEVOLGDE_NORMEN,
}: {
  items: readonly DagboekItem[];
  supermarktLogs?: readonly Pick<SupermarktPortie, "product" | "grams">[];
  nevoProducten: ReadonlyMap<string, SupermarktProduct>;
  normen?: GevolgdeNormen;
}): Voedingswaarde {
  const bijdragen = [
    ...items.map((item) => waardenVanItem(item, nevoProducten)),
    ...supermarktLogs.map(waardenVanLog),
  ];

  const rijen = VOEDINGSWAARDE_VELDEN.map((veld): VoedingswaardeRij => {
    let som = 0;
    let uitBenadering = 0;
    let heeftWaarde = false;
    let benaderd = false;
    for (const bijdrage of bijdragen) {
      const bedrag = bijdrage?.waarden.get(veld.veld);
      if (bedrag === undefined) continue;
      som += bedrag;
      heeftWaarde = true;
      if (bijdrage?.benaderd) {
        benaderd = true;
        uitBenadering += bedrag;
      }
    }
    const waarde = heeftWaarde ? som : null;
    const norm = normVoorVeld(normen, veld.veld)?.waarde ?? null;
    return {
      ...veld,
      waarde,
      norm,
      aandeel: waarde !== null && norm !== null ? waarde / norm : null,
      aandeelRi: waarde !== null && veld.ri !== null ? waarde / veld.ri : null,
      benaderd,
      aandeelZonderBenadering: waarde !== null && norm !== null ? (waarde - uitBenadering) / norm : null,
    };
  });

  const metWaarde = bijdragen.filter((bijdrage) => bijdrage !== null).length;
  const benaderdAantal = bijdragen.filter((bijdrage) => bijdrage?.benaderd).length;
  return { rijen, metWaarde, zonderWaarde: bijdragen.length - metWaarde, benaderd: benaderdAantal };
}

/** Eén decimaal onder 100, zoals de kernstoffen erboven; daarboven hele getallen. */
export function rondVoedingswaarde(waarde: number): string {
  const afgerond = waarde >= 100 ? Math.round(waarde) : Math.round(waarde * 10) / 10;
  return afgerond.toLocaleString("nl-NL");
}
