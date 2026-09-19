/**
 * De supplementcatalogus van het dagboek — wat je als supplement kunt loggen,
 * naast wat `food-catalog.ts` als voedingsmiddel levert.
 *
 * ## Waarom dit geen `bron`-indirectie heeft zoals food-catalog.ts
 *
 * Een voedingsmiddel spreidt: amandelen bij de ene teler wijken af van de
 * andere, dus `FOOD_CATALOG` wijst naar één gedeelde gehaltetabel
 * (`FOOD_SOURCES`) zodat elk gehalte op precies één plek staat. Een
 * supplement spreidt niet op dezelfde manier — het etiket zegt exact hoeveel
 * milligram er in één capsule zit, en dat getal verschilt per product, niet
 * per porties-van-hetzelfde-product. Er is dus geen gedeelde bron om naar te
 * verwijzen; elke regel hier draagt zijn eigen samenstelling.
 *
 * ## Eén nutriënt per regel
 *
 * Een multivitamine met meerdere werkzame stoffen zou als meerdere regels met
 * dezelfde `key`-stam moeten landen (of een latere uitbreiding naar
 * meerdere nutriënten per regel), niet als één regel met een lijst. Voor de
 * vier stoffen die het dagboek nu toont (magnesium, eiwit, zink, omega-3)
 * volstaat één nutriënt per regel — de meeste geloggde supplementen zijn
 * mono-preparaten.
 */

import type { NutrientId } from "@/data/nutrition/intake-reference";

/** Eén portie zoals op het etiket staat, met wat die portie van de stof levert. */
export interface SupplementPortie {
  labelNl: string;
  amount: number;
  unit: "g" | "mg" | "µg";
}

export interface SupplementCatalogEntry {
  /** Stabiel, kebab-case, uniek over de hele supplementcatalogus. */
  key: string;
  labelNl: string;
  nutrient: NutrientId;
  /** Eerst de portie die mensen het vaakst bedoelen. */
  porties: readonly SupplementPortie[];
  /** Extra woorden waarop gezocht wordt — merknamen, spreektaal. */
  zoek?: readonly string[];
}

function s(
  key: string,
  labelNl: string,
  nutrient: NutrientId,
  porties: readonly (readonly [string, number, SupplementPortie["unit"]])[],
  zoek?: readonly string[],
): SupplementCatalogEntry {
  return {
    key,
    labelNl,
    nutrient,
    porties: porties.map(([labelNl, amount, unit]) => ({ labelNl, amount, unit })),
    zoek,
  };
}

export const SUPPLEMENT_CATALOG: readonly SupplementCatalogEntry[] = [
  s("magnesiumcitraat-capsule", "Magnesiumcitraat, capsule", "magnesium",
    [["1 capsule", 200, "mg"]], ["magnesium citraat"]),
  s("magnesiumbisglycinaat-capsule", "Magnesiumbisglycinaat, capsule", "magnesium",
    [["1 capsule", 150, "mg"]], ["magnesium bisglycinaat", "magnesiumbisglycinaat"]),
  s("magnesiumoxide-tablet", "Magnesiumoxide, tablet", "magnesium",
    [["1 tablet", 250, "mg"]], ["magnesium oxide"]),

  s("wei-eiwitpoeder-schep", "Wei-eiwitpoeder, schep", "protein",
    [["1 schep (30 g)", 24, "g"]], ["whey", "eiwitpoeder", "eiwitshake", "proteine poeder"]),
  s("plantaardig-eiwitpoeder-schep", "Plantaardig eiwitpoeder, schep", "protein",
    [["1 schep (30 g)", 21, "g"]], ["vegan eiwitpoeder", "erwteneiwit", "soja eiwit"]),

  s("zinkcitraat-tablet", "Zinkcitraat, tablet", "zinc",
    [["1 tablet", 15, "mg"]], ["zink citraat"]),
  s("zinkpicolinaat-capsule", "Zinkpicolinaat, capsule", "zinc",
    [["1 capsule", 22, "mg"]], ["zink picolinaat"]),

  s("visolie-capsule-1000mg", "Visolie, capsule 1000 mg", "omega3",
    [["1 capsule", 300, "mg"]], ["omega 3 capsule", "fish oil"]),
  s("algenolie-capsule", "Algenolie, capsule", "omega3",
    [["1 capsule", 250, "mg"]], ["omega 3 vegan", "algen olie"]),
];

const BY_KEY: ReadonlyMap<string, SupplementCatalogEntry> = new Map(
  SUPPLEMENT_CATALOG.map((entry) => [entry.key, entry]),
);

export function supplementCatalogEntry(key: string): SupplementCatalogEntry | null {
  return BY_KEY.get(key) ?? null;
}

/** Zelfde normalisatie als food-catalog.ts, zodat beide catalogi zich hetzelfde gedragen. */
function normaliseer(waarde: string): string {
  return waarde
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function searchSupplementCatalog(
  query: string,
  limiet = 20,
): SupplementCatalogEntry[] {
  const term = normaliseer(query);
  if (!term) return [];

  const scored = SUPPLEMENT_CATALOG.map((entry) => {
    const label = normaliseer(entry.labelNl);
    const synoniemen = (entry.zoek ?? []).map(normaliseer);
    if (label.startsWith(term)) return { entry, score: 0 };
    if (synoniemen.some((syn) => syn.startsWith(term))) return { entry, score: 1 };
    if (label.includes(term)) return { entry, score: 2 };
    if (synoniemen.some((syn) => syn.includes(term))) return { entry, score: 3 };
    if (normaliseer(entry.key).includes(term)) return { entry, score: 4 };
    return null;
  }).filter((hit): hit is { entry: SupplementCatalogEntry; score: number } => hit !== null);

  scored.sort((a, b) => a.score - b.score || a.entry.labelNl.localeCompare(b.entry.labelNl, "nl"));
  return scored.slice(0, limiet).map((hit) => hit.entry);
}
