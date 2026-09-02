/**
 * Doordruk-laag onder het categorie-overzicht: van "Noten & peulvruchten" naar
 * wat die groep bij jou levert, en uit welke bronnen dat komt.
 *
 * ## De drie niveaus
 *
 * 1. **Categorie** — `categorieKaarten()` in `nutrition-voedselgroepen.ts`:
 *    jouw antwoord naast de richtlijn, één kaart per groep.
 * 2. **Wat het levert** — dit bestand: welke nutriënten deze groep draagt, en
 *    hoe jouw band voor elk daarvan staat.
 * 3. **Welke bron** — `FOOD_SOURCES`, gefilterd op de portiegroepen van deze
 *    categorie: concrete voedingsmiddelen met hun NEVO-gehalte per portie.
 *
 * Niveau 3 bestond al en niveau 1 ook; wat ontbrak was de brug ertussen. Die
 * brug is een **map**, geen berekening: welke `PortionGroup`s horen bij welke
 * `VoedselgroepId`, en welke nutriënten dragen die groepen. Er komt geen enkel
 * nieuw getal bij.
 *
 * ## De harde grens die hier onverkort geldt
 *
 * **Geen dagtotalen, geen optelsommen, geen percentage van een ADH.** Een
 * bronrij toont wat één portie van dát voedingsmiddel levert — dat is een
 * geciteerde NEVO-waarde omgerekend naar onze portie (zie `amountForPortion`),
 * en die staan naast elkaar zodat je kunt kíezen, nooit onder elkaar zodat je
 * kunt optellen. De reden staat in de kop van `nutrient-routes.ts` en verandert
 * hier niet: de check meet frequenties, niet grammen.
 *
 * Wat deze laag dus wél zegt: "deze categorie draagt bij jou magnesium en zink;
 * binnen de categorie zijn dit de sterkste bronnen". Dat is productkennis naast
 * een frequentie-antwoord, geen inname-berekening.
 */

import {
  FOOD_SOURCES,
  isSourceBacked,
  type FoodSource,
} from "@/data/nutrition/food-sources";
import type { PortionGroup } from "@/data/nutrition/portion-dictionary";
import {
  NUTRIENT_IDS,
  nutrientReferences,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import type { IntakeBand, NutritionSelfReport } from "@/lib/nutrition-intake-estimate";
import { estimateNutritionIntake } from "@/lib/nutrition-intake-estimate";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Welke portiegroepen uit `food-sources.ts` horen bij welke categorie uit het
 * overzicht.
 *
 * Twee dingen om te weten bij het lezen:
 *
 * - Een categorie kan meerdere portiegroepen dekken ("Vlees & vis" is zowel
 *   `leanMeat` als `oilyFish` als `egg`), en een portiegroep kan in meerdere
 *   categorieën vallen (`legumes` zit bij noten én bij vlees-vis, want
 *   peulvruchten zijn in beide vragen de plantaardige tegenhanger).
 * - `other` staat bewust nergens. Dat is de restgroep in `food-sources.ts`
 *   (seitan, tahin, algenolie, verrijkte dranken) en die hoort niet onder één
 *   categorie te hangen — anders belooft een doordruk iets wat de vraag
 *   erboven niet meet.
 */
const CATEGORIE_PORTIEGROEPEN: Record<VoedselgroepId, readonly PortionGroup[]> = {
  groente: ["vegetables"],
  fruit: ["fruit"],
  "vlees-vis": ["leanMeat", "oilyFish", "egg", "legumes"],
  zuivel: ["dairy"],
  granen: ["wholegrain"],
  noten: ["nuts", "legumes"],
  // Suiker en bewerkte producten hebben geen bronnenlijst: je kiest hier niet
  // tussen bronnen, je mindert. Een doordruk zou een keuze suggereren die de
  // categorie niet kent.
  suiker: [],
};

/**
 * Welke nutriënten een categorie in de praktijk draagt.
 *
 * Afgeleid van waar de bronnen daadwerkelijk staan in `FOOD_SOURCES` — niet
 * handmatig ingevuld, zodat deze lijst niet kan gaan afwijken van de tabel.
 * Een categorie draagt een nutriënt zodra er minstens één bron van dat
 * nutriënt in een van zijn portiegroepen valt.
 */
export function nutrientenVoorCategorie(id: VoedselgroepId): NutrientId[] {
  const groepen = new Set(CATEGORIE_PORTIEGROEPEN[id] ?? []);
  if (groepen.size === 0) {
    return [];
  }
  return NUTRIENT_IDS.filter((nutrient) =>
    FOOD_SOURCES[nutrient].some((source) => groepen.has(source.portionGroup)),
  );
}

/** Eén bronrij in de doordruk: wat levert deze portie, en hoe hard is dat getal. */
export interface CategorieBron {
  key: string;
  labelNl: string;
  portionNl: string;
  /** Onze portiewaarde, afgeleid van de brondwaarde. Null = niet te geven. */
  amount: number | null;
  /** Eenheid van `amount`, uit de brondwaarde; null zolang die ontbreekt. */
  unit: "g" | "mg" | "µg" | null;
  /** Staat het gehalte naast een brondataset, of is het nog indicatief? */
  bronGeverifieerd: boolean;
  /** Naam zoals de brondataset het voedingsmiddel noemt. */
  bronNaam: string | null;
  /** Waarom de opname afwijkt van het gehalte (fytaat). Null bij `normal`. */
  opnameNote: string | null;
  /** Waarom het gehalte spreidt (wild/kweek, seizoen). Null bij lage spreiding. */
  spreidingNote: string | null;
}

/** Wat één nutriënt binnen deze categorie doet, en waar het vandaan komt. */
export interface CategorieNutrient {
  nutrient: NutrientId;
  label: string;
  /** Jouw band voor deze stof — dezelfde als op het nutriëntspoor. */
  band: IntakeBand;
  /** De richtlijn in gebruikerswoorden ("2× vette vis per week"). */
  referenceLabel: string;
  /**
   * Hoe hard de schatting voor deze stof is, 1–4, uit `intake-reference.ts`.
   * Staat erbij zodat een zwakke proxy niet als een meting leest.
   */
  confidence: number;
  confidenceWhy: string;
  /** Sterkste bronnen binnen déze categorie, aflopend. Nooit een optelsom. */
  bronnen: readonly CategorieBron[];
}

/** Het volledige doordruk-beeld van één categorie. */
export interface CategorieDetail {
  id: VoedselgroepId;
  /** Nutriënten die deze categorie draagt, aandacht eerst. */
  nutrienten: readonly CategorieNutrient[];
  /** Aantal bronrijen in totaal — voor een compacte samenvatting in de kop. */
  bronCount: number;
  /** Hoeveel van die bronnen een geverifieerd brondcijfer dragen. */
  geverifieerdCount: number;
}

/** Aandacht eerst: below vóór around vóór meets. */
const BAND_VOLGORDE: Record<IntakeBand, number> = { below: 0, around: 1, meets: 2 };

function toCategorieBron(source: FoodSource): CategorieBron {
  return {
    key: source.key,
    labelNl: source.labelNl,
    portionNl: source.portionNl,
    amount: source.amount,
    unit: source.nutrientValue?.unit ?? null,
    bronGeverifieerd: isSourceBacked(source),
    bronNaam: source.nutrientValue?.sourceNameNl ?? null,
    opnameNote:
      source.bioavailability === "normal" ? null : (source.bioavailabilityWhy ?? null),
    spreidingNote: source.variability === "low" ? null : (source.variabilityWhy ?? null),
  };
}

/**
 * Bouw het doordruk-beeld voor één categorie.
 *
 * @param id - De categorie waarop is doorgedrukt.
 * @param report - Het zelfrapport; bepaalt de band per nutriënt. Zonder rapport
 *   krijgen alle stoffen band "around" — dat is de neutrale staat, niet een
 *   oordeel.
 * @param referenceDate - Zelfde datum als aan `estimateNutritionIntake` geven,
 *   anders lopen de banden hier uit de pas met die op het nutriëntspoor.
 * @param maxBronnen - Hoeveel bronnen per nutriënt. Default 5: genoeg om te
 *   kiezen, kort genoeg om te lezen op 375px.
 */
export function categorieDetail(
  id: VoedselgroepId,
  report: NutritionSelfReport | null,
  referenceDate: Date = new Date(),
  maxBronnen = 5,
): CategorieDetail {
  const groepen = new Set(CATEGORIE_PORTIEGROEPEN[id] ?? []);
  const estimates = estimateNutritionIntake(report ?? {}, referenceDate);
  const bandByNutrient = new Map(estimates.map((e) => [e.nutrient, e.band]));

  const nutrienten: CategorieNutrient[] = [];
  let bronCount = 0;
  let geverifieerdCount = 0;

  for (const nutrient of nutrientenVoorCategorie(id)) {
    const ref = nutrientReferences[nutrient];
    // FOOD_SOURCES staat al aflopend op amount; filteren houdt die volgorde.
    const bronnen = FOOD_SOURCES[nutrient]
      .filter((source) => groepen.has(source.portionGroup))
      .slice(0, maxBronnen)
      .map(toCategorieBron);

    bronCount += bronnen.length;
    geverifieerdCount += bronnen.filter((b) => b.bronGeverifieerd).length;

    nutrienten.push({
      nutrient,
      label: ref.label,
      band: bandByNutrient.get(nutrient) ?? "around",
      referenceLabel: ref.referenceLabel,
      confidence: ref.confidence,
      confidenceWhy: ref.confidenceWhy,
      bronnen,
    });
  }

  nutrienten.sort((a, b) => BAND_VOLGORDE[a.band] - BAND_VOLGORDE[b.band]);

  return { id, nutrienten, bronCount, geverifieerdCount };
}

/**
 * Heeft deze categorie iets om door te drukken?
 *
 * Een knop die een leeg paneel opent is erger dan geen knop: hij belooft een
 * antwoord dat er niet is. Suiker heeft bewust geen bronnenlijst, en een
 * categorie zonder bronnen in `FOOD_SOURCES` evenmin.
 */
export function heeftDetail(id: VoedselgroepId): boolean {
  return nutrientenVoorCategorie(id).length > 0;
}
