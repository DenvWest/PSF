import type { IngredientClaimKey } from "@/data/approved-claims";
import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { onderzoekVoor } from "@/data/nutrition/onderzoek-per-stof";
import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import type { KeuzeStofStand } from "@/lib/keuze-stof-stand";
import { gehaltePerPortie, stofInfo, type RijksteStof } from "@/lib/nutrition-rijkste-bronnen";
import type { KeuzeProduct } from "@/lib/supplement-hub/ps-score-per-stof";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * De rekenregels achter één stofkaart in Keuze → Vergelijken
 * (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, herziening 7 okt).
 *
 * ## Wat een supplement toevoegt
 *
 * Optellen mag sinds de stand uit het dagboek komt: het dagboek is gemeten
 * inname, en dus een ondergrens. Ondergrens + etiket = nog steeds een
 * ondergrens, en zo heet het ook ("minstens"). De regel van 21 augustus
 * ("nooit optellen tot een dagtotaal") gold voor de schatting uit de
 * frequentievragen van de check; daar blijft hij gelden.
 *
 * ## De bovengrens
 *
 * Uit `onderzoek-per-stof.ts`, dezelfde bron als Je doelen. Bij magnesium en
 * omega-3 geldt de EFSA-grens alleen voor supplementen: daar telt het etiket
 * alleen. Bij zink en vitamine D geldt hij voor alles samen: daar telt het
 * dagboek mee, en kan het dagboek het niet meten, dan zegt de regel dat.
 */

const INGREDIENT_VAN_STOF: Record<NutrientId, IngredientClaimKey> = {
  protein: "eiwitpoeder",
  omega3: "omega3",
  magnesium: "magnesium",
  vitamin_d: "vitamineD",
  zinc: "zink",
};

/** Het geldige oordeel uit je check voor deze stof, of null. */
export function checkOordeelVoorStof(
  nutrient: NutrientId,
  verdicts: readonly StoredSupplementVerdict[],
): StoredSupplementVerdict | null {
  const key = INGREDIENT_VAN_STOF[nutrient];
  return verdicts.find((verdict) => verdict.ingredientKey === key && verdict.supersededAt === null) ?? null;
}

export function ingredientVanStof(nutrient: NutrientId): IngredientClaimKey {
  return INGREDIENT_VAN_STOF[nutrient];
}

export type BovengrensUitkomst = {
  waarde: number;
  unit: string;
  bron: string;
  /** Wat er tegen de grens is gelegd: het etiket alleen, of etiket + dagboek. */
  basis: "etiket" | "samen" | "etiket_zonder_eten";
  boven: boolean;
};

export type SupplementErbij = {
  /** Dagboek + etiket per dag, als het dagboek de stof meet en de eenheden kloppen. */
  samen: number | null;
  /** `samen` als deel van je norm (1 = 100 %). */
  aandeelNorm: number | null;
  bovengrens: BovengrensUitkomst | null;
};

export function supplementErbij(
  nutrient: NutrientId,
  stand: KeuzeStofStand,
  product: Pick<KeuzeProduct, "dosisPerDag" | "eenheid">,
): SupplementErbij {
  const dosis = product.dosisPerDag;
  const eenhedenKloppen = product.eenheid !== null && product.eenheid === stand.unit;
  const gemeten = stand.gemiddeld !== null && eenhedenKloppen ? stand.gemiddeld : null;

  const samen = dosis !== null && gemeten !== null ? gemeten + dosis : null;
  const aandeelNorm = samen !== null && stand.norm ? samen / stand.norm : null;

  const grens = onderzoekVoor(nutrient)?.bovengrens ?? null;
  let bovengrens: BovengrensUitkomst | null = null;
  if (grens && dosis !== null && product.eenheid === grens.unit) {
    if (grens.alleenSupplement) {
      bovengrens = { ...grens, basis: "etiket", boven: dosis > grens.waarde };
    } else if (samen !== null) {
      bovengrens = { ...grens, basis: "samen", boven: samen > grens.waarde };
    } else {
      bovengrens = { ...grens, basis: "etiket_zonder_eten", boven: dosis > grens.waarde };
    }
  }

  return { samen, aandeelNorm, bovengrens };
}

/**
 * Wat een etenswaar naast deze stof nog meebrengt: de andere stoffen waarvan
 * één portie minstens 15 % van de referentie levert — dezelfde drempel als
 * "bron van" in verordening 1924/2006, hier per portie gelezen en alleen
 * als feitelijke samenstelling getoond, nooit als claim.
 *
 * Referenties: de RI uit 1169/2011 bijlage XIII; voor omega-3 de 250 mg van
 * EFSA (er is geen RI); voor vezels 3 g per portie (het "bron van"-gehalte,
 * er is geen RI). Natrium, verzadigd vet en suikers doen niet mee
 * (`nutrition-rijkste-bronnen.ts`).
 */
const MEEBRENG_STOFFEN: readonly RijksteStof[] = [
  "protein",
  "omega3",
  "magnesium",
  "zinc",
  "vitamin_d",
  "fiberG",
  "potassiumMg",
  "calciumMg",
  "ironMg",
  "vitaminB12µg",
  "vitaminCMg",
];

const DREMPEL = 0.15;
const VEZELS_PER_PORTIE_G = 3;

function referentie(stof: RijksteStof): number | null {
  if (stof === "fiberG") return VEZELS_PER_PORTIE_G / DREMPEL;
  if (stof === "protein" || stof === "omega3" || stof === "magnesium" || stof === "zinc" || stof === "vitamin_d") {
    return REFERENCE_INTAKES[stof].value;
  }
  return stofInfo(stof).ri;
}

/** "Vitamine B12" → "vitamine B12"; de IJ is één letter, dus "IJzer" → "ijzer". */
function inZin(label: string): string {
  if (label.startsWith("IJ")) return `ij${label.slice(2)}`;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

export function brengtOokMee(entry: CatalogEntry, stof: NutrientId, limiet = 3): string[] {
  const treffers: { label: string; aandeel: number }[] = [];
  for (const andere of MEEBRENG_STOFFEN) {
    if (andere === stof) continue;
    const ref = referentie(andere);
    const portie = gehaltePerPortie(entry, andere);
    if (!ref || !portie) continue;
    const aandeel = portie.value / ref;
    if (aandeel >= DREMPEL) treffers.push({ label: inZin(stofInfo(andere).label), aandeel });
  }
  return treffers
    .sort((a, b) => b.aandeel - a.aandeel)
    .slice(0, limiet)
    .map((treffer) => treffer.label);
}

/** "€ 0,14" */
export function euroPerDag(centen: number): string {
  return `€ ${(centen / 100).toFixed(2).replace(".", ",")}`;
}

/**
 * Of een voedingsmiddel een echte bron is van deze stof: één portie levert
 * minstens 15 % van de referentie — dezelfde drempel als {@link brengtOokMee}.
 * Zo komt een gesterde haring in Mijn keuzes bij omega-3 en vitamine D, en
 * niet bij magnesium.
 */
export function isBronVan(entry: CatalogEntry, stof: NutrientId): boolean {
  const ref = referentie(stof);
  const portie = gehaltePerPortie(entry, stof);
  return Boolean(ref && portie && portie.value / ref >= DREMPEL);
}

/** Hoeveel van de referentie één portie van deze stof levert (1 = 100 %), of null. */
export function bronAandeel(entry: CatalogEntry, stof: NutrientId): number | null {
  const ref = referentie(stof);
  const portie = gehaltePerPortie(entry, stof);
  return ref && portie ? portie.value / ref : null;
}

/**
 * De stof waar een voedingsmiddel het meest aan bijdraagt, onder de stoffen
 * waarvan het een bron is. Zo staat een gesterde forel in Mijn keuzes één keer
 * (bij omega-3) in plaats van op drie kaarten; de andere kaarten zeggen dat
 * hij daar ook meetelt.
 */
export function hoofdStof(entry: CatalogEntry, stoffen: readonly NutrientId[]): NutrientId | null {
  let beste: { stof: NutrientId; aandeel: number } | null = null;
  for (const stof of stoffen) {
    const aandeel = bronAandeel(entry, stof);
    if (aandeel === null || aandeel < DREMPEL) continue;
    if (!beste || aandeel > beste.aandeel) beste = { stof, aandeel };
  }
  return beste?.stof ?? null;
}
