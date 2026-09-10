/**
 * Spreiding per nutriëntbron — de band rond een puntwaarde, en waar die band
 * vandaan komt.
 *
 * ## Twee bronnen van spreiding, in vaste volgorde
 *
 * 1. **Waargenomen spreiding** (`NutrientValue.observed`). USDA Foundation Foods
 *    publiceert per nutriënt een `min`, `max`, `median` en het aantal monsters.
 *    Dat is de werkelijke spreiding van echte labmonsters, en hij **wint** van
 *    elke vuistregel — precies de eindstand die ONDERZOEK §2.3 beschrijft.
 * 2. **De klassenband** (dit bestand). Zolang een rij geen `observed` draagt —
 *    SR Legacy, één monster, of de WebSearch-import die de gestructureerde
 *    FDC-velden niet meelevert — valt hij terug op een gebronde factorband per
 *    (stof × voedselklasse) uit ONDERZOEK §1.7. Een tussenstap, geen eindstand.
 *
 * Deze module is de enige plek waar die keuze wordt gemaakt, zodat het dagbeeld,
 * de weekvergelijking en de omgekeerde index (`nutrition-nutrient-index.ts`)
 * allemaal dezelfde band tonen. De prebuilds
 * (`docs/design/voedingsdagboek-kompas-prebuild-v1-2026-09.html` en
 * `docs/design/voortgang-voedingslogboek-dag-week-maand-prebuild-v1-2026-09.html`)
 * spiegelen deze tabel en dezelfde volgorde.
 *
 * ## Waarom vermenigvuldigers en geen percentages
 *
 * De spreiding is bij vis asymmetrisch: gekweekte zalm ligt vaker onder de
 * tabelwaarde dan erboven. Een band `×0,40–1,60` drukt dat uit; `±40 %` niet.
 *
 * ## De ondergrens-regel blijft gelden
 *
 * Deze band is nooit een dagtotaal. De onderkant is "minstens X uit de bronnen
 * die je noemde", nooit "je haalde X binnen" (BESLUIT §2). Deze module levert
 * alleen de band; de naamgeving hoort in de UI.
 */

import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { NutrientValue } from "@/data/nutrition/food-sources";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/** De voedselklasse die de spreiding bepaalt — afgeleid, niet per rij opgeslagen. */
export type SpreadClass =
  | "dier"
  | "plant"
  | "visGekweekt"
  | "visWild"
  | "verrijkt";

type Factor = readonly [number, number];

/**
 * De gebronde klassenbanden per (stof × voedselklasse), als vermenigvuldigers
 * op de puntwaarde. Onderbouwing per rij: ONDERZOEK_SPREIDING_EN_USDA §1.7.
 *
 * `_default` dekt de klasse die de tabel voor die stof niet apart noemt.
 */
const SPREAD: Record<NutrientId, Partial<Record<SpreadClass | "_default", Factor>>> = {
  protein: { dier: [0.9, 1.1], plant: [0.85, 1.15], _default: [0.9, 1.1] },
  magnesium: { dier: [0.85, 1.15], plant: [0.6, 1.7], _default: [0.6, 1.7] },
  zinc: { dier: [0.85, 1.15], plant: [0.6, 1.7], _default: [0.6, 1.7] },
  omega3: { visGekweekt: [0.75, 1.25], visWild: [0.6, 1.5], _default: [0.6, 1.5] },
  vitamin_d: {
    visGekweekt: [0.4, 1.6],
    visWild: [0.5, 2.0],
    verrijkt: [0.95, 1.05],
    _default: [0.6, 1.6],
  },
};

/** Producten waarvan het vitamine-D-gehalte een verrijkingskeuze is, geen biologische waarde. */
const VERRIJKT: ReadonlySet<string> = new Set([
  "halvarine",
  "margarine",
  "melk-halfvol",
  "melk-mager",
  "sojadrink-verrijkt",
  "plantaardige-drank-verrijkt",
  "ontbijtgranen-verrijkt",
]);

/** Kweekvis: ander voer, andere spreiding dan wild. */
const GEKWEEKT: ReadonlySet<string> = new Set(["zalm-gekweekt"]);

/**
 * De spreidingsklasse van dit product bij deze stof.
 *
 * Afgeleid uit de voedselgroep in plaats van per rij opgeslagen — de groep
 * draagt die informatie al, en een tweede veld dat ermee mee moet bewegen loopt
 * een keer uit de pas. Alleen vitamine D kent de klasse "verrijkt": de eiwit-
 * en mineraalgehaltes van een verrijkt product zijn wél gewoon biologisch, dus
 * die volgen hun normale klasse.
 */
export function spreadClassFor(
  nutrient: NutrientId,
  groep: VoedselgroepId,
  key: string,
): SpreadClass {
  if (nutrient === "vitamin_d" && VERRIJKT.has(key)) return "verrijkt";
  if (groep === "vis") return GEKWEEKT.has(key) ? "visGekweekt" : "visWild";
  if (groep === "vlees" || groep === "eieren" || groep === "zuivel") return "dier";
  return "plant";
}

/** De klassenband-vermenigvuldigers voor deze (stof × klasse). */
function classFactor(nutrient: NutrientId, klasse: SpreadClass): Factor {
  const perStof = SPREAD[nutrient];
  return perStof[klasse] ?? perStof._default ?? [0.9, 1.1];
}

export interface SpreadBand {
  /** De ondergrens van de band, in de eenheid van `value`. */
  lo: number;
  /** De bovengrens van de band. */
  hi: number;
  /** De representatieve puntwaarde (mediaan bij observed, anders de tabelwaarde). */
  point: number;
  /**
   * Waar de band vandaan komt. `"observed"` = waargenomen spreiding uit de
   * bron (wint); `"band"` = de klassenband uit §1.7 (terugval).
   */
  basis: "observed" | "band";
}

/**
 * Draagt een brondwaarde een bruikbare waargenomen spreiding? Eén monster
 * (`samples <= 1`) is geen spreiding — dan blijven `min`/`max` leeg of gelijk,
 * en valt de rij terug op de klassenband.
 */
function heeftObserved(value: NutrientValue): value is NutrientValue &
  { observed: NonNullable<NutrientValue["observed"]> } {
  const o = value.observed;
  return o !== undefined && o.samples >= 2 && o.max > o.min;
}

/**
 * De spreidingsband per 100 g voor één brondwaarde.
 *
 * `observed` wint; ontbreekt die, dan de klassenband. De grens tussen die twee
 * staat op `basis`, zodat de UI kan tonen dat een band waargenomen is in plaats
 * van geschat.
 */
export function spreadBandPer100g(
  value: NutrientValue,
  nutrient: NutrientId,
  groep: VoedselgroepId,
  key: string,
): SpreadBand {
  if (heeftObserved(value)) {
    const o = value.observed;
    return {
      lo: o.min,
      hi: o.max,
      point: o.median ?? value.value,
      basis: "observed",
    };
  }
  const [lo, hi] = classFactor(nutrient, spreadClassFor(nutrient, groep, key));
  return { lo: value.value * lo, hi: value.value * hi, point: value.value, basis: "band" };
}

/** Rond af op één decimaal — meer precisie dan de bron heeft is schijnnauwkeurigheid. */
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * De spreidingsband voor een concrete portie, in de eenheid van de stof.
 *
 * Dit is de portie-variant van {@link spreadBandPer100g}: de per-100 g-band
 * omgerekend naar `grams`, met dezelfde `basis`. `null` bij een onzinnige
 * portie — nooit een verzonnen getal.
 */
export function spreadBandForPortion(
  value: NutrientValue,
  nutrient: NutrientId,
  groep: VoedselgroepId,
  key: string,
  grams: number,
): SpreadBand | null {
  if (!Number.isFinite(grams) || grams <= 0) return null;
  const per100 = spreadBandPer100g(value, nutrient, groep, key);
  const factor = grams / 100;
  return {
    lo: round1(per100.lo * factor),
    hi: round1(per100.hi * factor),
    point: round1(per100.point * factor),
    basis: per100.basis,
  };
}
