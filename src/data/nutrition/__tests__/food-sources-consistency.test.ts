import { describe, it, expect } from "vitest";
import {
  FOOD_SOURCES,
  amountForPortion,
  type FoodSource,
} from "@/data/nutrition/food-sources";
import { NUTRIENT_IDS, type NutrientId } from "@/data/nutrition/intake-reference";

/**
 * Interne-consistentie-audit van de bronrijen — de API-onafhankelijke helft van
 * "een eerlijke audit van wat er staat" (ONDERZOEK etappe 3, taak 1.3). De
 * volledige audit legt elke waarde naast het echte FDC-record; dat vraagt
 * netwerktoegang. Deze tests vragen dat niet: ze bewaken wat je zonder de bron
 * al kunt controleren — dat de eenheid bij de stof past, dat de afgeleide
 * portiewaarde klopt bij de gepubliceerde per-100 g-waarde, en dat een
 * `observed`-band een echte band is.
 *
 * Ze bewaken twee dingen tegelijk: de 85 WebSearch-rijen van september 2026, én
 * de rijen die een latere `scripts/usda-extract.mjs`-run met `observed` vult.
 */

const EENHEID_PER_STOF: Record<NutrientId, "g" | "mg" | "µg"> = {
  protein: "g",
  omega3: "mg",
  magnesium: "mg",
  zinc: "mg",
  vitamin_d: "µg",
};

const ALLE_RIJEN: readonly { id: NutrientId; source: FoodSource }[] =
  NUTRIENT_IDS.flatMap((id) =>
    (FOOD_SOURCES[id] as FoodSource[]).map((source) => ({ id, source })),
  );

/** De grammen uit een portielabel als "25 g (handvol)"; null bij ml of stuks. */
function gramsUitPortie(portionNl: string): number | null {
  const m = portionNl.match(/(\d+(?:[.,]\d+)?)\s*g\b/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}

describe("de bronrijen zijn intern consistent — audit zonder de brondataset", () => {
  it("draagt per stof de juiste eenheid: eiwit in g, mineralen in mg, vitamine D in µg", () => {
    const fout = ALLE_RIJEN.filter(
      ({ id, source }) =>
        source.nutrientValue && source.nutrientValue.unit !== EENHEID_PER_STOF[id],
    ).map(
      ({ id, source }) =>
        `${id}/${source.key}: ${source.nutrientValue?.unit} ≠ ${EENHEID_PER_STOF[id]}`,
    );
    expect(fout).toEqual([]);
  });

  it("leidt `amount` recht af uit de gepubliceerde waarde × de portie", () => {
    // `amount` is onze bewerking van `nutrientValue.value` naar de portie in
    // `portionNl`. Wijkt hij af, dan is er een getal met de hand aangepast
    // zonder het andere mee te nemen — precies het soort stille fout dat een
    // audit hoort te vangen. Alleen rijen met een gepubliceerde waarde én een
    // portie in grammen: ml en stuks lopen via de portie-dictionary.
    const fout: string[] = [];
    for (const { id, source } of ALLE_RIJEN) {
      if (!source.nutrientValue || source.amount === null) continue;
      const grams = gramsUitPortie(source.portionNl);
      if (grams === null) continue;
      const verwacht = amountForPortion(source.nutrientValue, grams);
      if (verwacht !== null && Math.abs(verwacht - source.amount) > 0.15) {
        fout.push(
          `${id}/${source.key}: amount ${source.amount} ≠ ${verwacht} ` +
            `(=${source.nutrientValue.value}×${grams}/100)`,
        );
      }
    }
    expect(fout).toEqual([]);
  });

  it("laat een observed-band een echte band zijn: min ≤ median ≤ max, en de waarde valt erbinnen", () => {
    // Vandaag draagt geen rij `observed` (de WebSearch-route leverde hem niet).
    // Deze test staat er voor de API-run die hem wél vult: één monster is geen
    // spreiding, en een band waar de waarde buiten valt is een fout.
    const fout: string[] = [];
    for (const { id, source } of ALLE_RIJEN) {
      const o = source.nutrientValue?.observed;
      if (!o) continue;
      if (!(o.min <= o.max)) fout.push(`${id}/${source.key}: min > max`);
      if (!(o.samples >= 1)) fout.push(`${id}/${source.key}: samples < 1`);
      if (o.median != null && (o.median < o.min || o.median > o.max)) {
        fout.push(`${id}/${source.key}: median buiten [min,max]`);
      }
      const waarde = source.nutrientValue!.value;
      if (waarde < o.min || waarde > o.max) {
        fout.push(`${id}/${source.key}: value ${waarde} buiten [${o.min},${o.max}]`);
      }
    }
    expect(fout).toEqual([]);
  });
});
