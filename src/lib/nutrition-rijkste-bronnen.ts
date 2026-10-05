import { FOOD_CATALOG, type CatalogEntry } from "@/data/nutrition/food-catalog";
import { FOOD_CATALOG_NEVO_GEHALTES, type NevoGehaltes } from "@/data/nutrition/food-catalog-nevo-gehaltes";
import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import { REFERENCE_INTAKES } from "@/data/nutrition/reference-intake";
import { gehaltePer100g } from "@/lib/nutrition-catalog-gehalte";
import { VOEDINGSWAARDE_VELDEN } from "@/lib/nutrition-voedingswaarde";

/**
 * De rijkste voedingsbronnen van één stof, uit de eigen catalogus.
 *
 * Drie manieren om "rijk" te lezen, en ze geven echt een andere lijst:
 *
 * - **per portie** — wat je per keer binnenkrijgt. Standaard, omdat 15 g
 *   pompoenpitten iets anders is dan 100 g.
 * - **per 100 g** — gehalte naar gewicht: veel stof in weinig volume.
 * - **per 100 kcal** — dichtheid naar energie: veel stof voor weinig
 *   calorieën. Een afgeleid getal (gehalte ÷ NEVO-energie), en zo gelabeld.
 *
 * Twee soorten stof. De vijf kernstoffen lezen hun gehalte zoals de krans
 * (`gehaltePer100g`: FOOD_SOURCES eerst, NEVO vult aan). De informatieve
 * stoffen ({@link InformatieveStof}) komen alleen uit NEVO. Natrium,
 * verzadigd vet en suikers staan er bewust niet bij: "rijkste bron van zout"
 * leest als een aanrader.
 *
 * Alleen voeding: een supplement wint per definitie en maakt de lijst
 * zinloos. Alleen gemeten gehaltes: wat niet gemeten is staat er niet in,
 * en komt dus nooit als 0 onderaan.
 *
 * Sauzen en smaakmakers doen niet mee: sojasaus en sambal halen per 100 kcal
 * de top, terwijl je er een theelepel van eet.
 *
 * Bereidingsvarianten (broccoli rauw/gekookt/diepvries) delen een
 * `imageOwner`; per groep blijft alleen de rijkste variant over, zodat de
 * top 10 niet uit drie keer spinazie bestaat.
 *
 * Vezels en energie per portie gaan mee als context, zonder oordeel
 * (`BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §0.1): ze sturen de
 * volgorde niet.
 */

export type RijksteStand = "portie" | "100g" | "100kcal";

export type InformatieveStof = "fiberG" | "potassiumMg" | "calciumMg" | "ironMg" | "vitaminB12µg" | "vitaminCMg";

export type RijksteStof = NutrientId | InformatieveStof;

const NEVO_VELD: Record<InformatieveStof, keyof NevoGehaltes> = {
  fiberG: "fiber_g",
  potassiumMg: "potassium_mg",
  calciumMg: "calcium_mg",
  ironMg: "iron_mg",
  "vitaminB12µg": "vitamin_b12_ug",
  vitaminCMg: "vitamin_c_mg",
};

export const INFORMATIEVE_STOFFEN = Object.keys(NEVO_VELD) as readonly InformatieveStof[];

export function isInformatieveStof(stof: string): stof is InformatieveStof {
  return stof in NEVO_VELD;
}

/** Kernstoffen waarvoor een %RI per portie zinnig is (eiwit heeft een persoonlijk doel, omega-3 geen RI). */
const KERN_MET_RI: ReadonlySet<NutrientId> = new Set(["magnesium", "zinc", "vitamin_d"]);

export interface StofInfo {
  label: string;
  /** Referentie-inname in dezelfde eenheid als het gehalte, of `null`. */
  ri: number | null;
  kern: boolean;
}

export function stofInfo(stof: RijksteStof): StofInfo {
  if (isInformatieveStof(stof)) {
    const veld = VOEDINGSWAARDE_VELDEN.find((v) => v.veld === stof);
    return { label: veld?.label ?? stof, ri: veld?.ri ?? null, kern: false };
  }
  return {
    label: nutrientReferences[stof].label,
    ri: KERN_MET_RI.has(stof) ? REFERENCE_INTAKES[stof].value : null,
    kern: true,
  };
}

/**
 * Onder deze energie per 100 g wordt "per 100 kcal" een deling door bijna
 * nul: kruidenthee en bouillon zouden dan bovenaan staan terwijl niemand er
 * zijn magnesium uit haalt.
 */
export const MIN_KCAL_PER_100G = 15;

const UITGESLOTEN_CATEGORIEEN: ReadonlySet<string> = new Set(["sauzen"]);

export interface RijksteBron {
  entry: CatalogEntry;
  /** De waarde waarop gerangschikt is, in de stand die gevraagd werd. */
  waarde: number;
  unit: string;
  portieLabel: string;
  portieGram: number;
  perPortie: number;
  kcalPerPortie: number | null;
  vezelsPerPortie: number | null;
}

function gehalteVoor(entry: CatalogEntry, stof: RijksteStof): { value: number; unit: string } | null {
  if (!isInformatieveStof(stof)) return gehaltePer100g(entry, stof);
  const waarde = FOOD_CATALOG_NEVO_GEHALTES[entry.key]?.[NEVO_VELD[stof]];
  if (typeof waarde !== "number") return null;
  const unit = VOEDINGSWAARDE_VELDEN.find((v) => v.veld === stof)?.unit ?? "mg";
  return { value: waarde, unit };
}

function waardeIn(stand: RijksteStand, per100g: number, portieGram: number, kcal: number | undefined): number | null {
  if (stand === "portie") return (per100g * portieGram) / 100;
  if (stand === "100g") return per100g;
  if (kcal === undefined || kcal < MIN_KCAL_PER_100G) return null;
  return (per100g / kcal) * 100;
}

export function rijksteBronnen(stof: RijksteStof, stand: RijksteStand, limiet = 10): RijksteBron[] {
  const besteperGroep = new Map<string, RijksteBron>();

  for (const entry of FOOD_CATALOG) {
    if (UITGESLOTEN_CATEGORIEEN.has(entry.category)) continue;
    const gehalte = gehalteVoor(entry, stof);
    const portie = entry.porties[0];
    if (!gehalte || gehalte.value <= 0 || !portie) continue;

    const nevo = FOOD_CATALOG_NEVO_GEHALTES[entry.key];
    const waarde = waardeIn(stand, gehalte.value, portie.grams, nevo?.energy_kcal);
    if (waarde === null) continue;

    const bron: RijksteBron = {
      entry,
      waarde,
      unit: gehalte.unit,
      portieLabel: portie.labelNl,
      portieGram: portie.grams,
      perPortie: (gehalte.value * portie.grams) / 100,
      kcalPerPortie: nevo?.energy_kcal !== undefined ? (nevo.energy_kcal * portie.grams) / 100 : null,
      vezelsPerPortie: nevo?.fiber_g !== undefined ? (nevo.fiber_g * portie.grams) / 100 : null,
    };

    const groep = entry.imageOwner ?? entry.key;
    const huidige = besteperGroep.get(groep);
    if (!huidige || bron.waarde > huidige.waarde) besteperGroep.set(groep, bron);
  }

  return [...besteperGroep.values()].sort((a, b) => b.waarde - a.waarde).slice(0, limiet);
}

const NIET_VEGETARISCH: ReadonlySet<string> = new Set(["vis", "vlees", "vlees-vis"]);
const NIET_VEGANISTISCH: ReadonlySet<string> = new Set([...NIET_VEGETARISCH, "eieren", "zuivel"]);

/**
 * Of een catalogusregel past bij een voedingswijze, op de voedselgroep. Grof
 * maar eerlijk: een gerecht telt in de groep van zijn hoofdbestanddeel.
 */
export function pastBijVoedingswijze(
  entry: Pick<CatalogEntry, "groep">,
  voedingswijze: "vegetarisch" | "veganistisch" | null,
): boolean {
  if (voedingswijze === null) return true;
  const uitgesloten = voedingswijze === "veganistisch" ? NIET_VEGANISTISCH : NIET_VEGETARISCH;
  return !uitgesloten.has(entry.groep);
}
