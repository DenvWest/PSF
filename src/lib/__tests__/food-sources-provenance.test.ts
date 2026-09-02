import { describe, it, expect } from "vitest";
import {
  FOOD_SOURCES,
  NEVO_CITATION,
  amountForPortion,
  isSourceBacked,
  type FoodSource,
  type NutrientValue,
} from "@/data/nutrition/food-sources";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";

/**
 * Herkomst-invarianten van de bronnentabel.
 *
 * Deze tests bewaken de scheiding tussen wat we *citeren* (een gehalte per
 * 100 g uit een brondataset, ongewijzigd) en wat we *afleiden* (datzelfde
 * gehalte omgerekend naar onze eigen portiegrootte). NEVO's
 * gebruiksvoorwaarden staan hergebruik toe "only unchanged and stating the
 * source and version number" — een omgerekende waarde is dus geen NEVO-waarde
 * meer, en mag niet als zodanig gepresenteerd worden.
 *
 * Ze staan er ook los van de licentie: een afgeleid getal is niet tegen een
 * brondbestand te leggen, dus zonder deze scheiding is `verified: true`
 * betekenisloos.
 */

const ALL_SOURCES: readonly FoodSource[] = NUTRIENT_IDS.flatMap(
  (id) => FOOD_SOURCES[id],
);

describe("herkomst-invarianten", () => {
  it("verified: true kan niet zonder een brondwaarde om tegen te leggen", () => {
    for (const source of ALL_SOURCES) {
      if (source.verified) {
        expect(
          source.nutrientValue,
          `${source.key} staat op verified maar heeft geen nutrientValue`,
        ).toBeDefined();
      }
    }
  });

  it("isSourceBacked is alleen waar bij een geverifieerde brondwaarde", () => {
    for (const source of ALL_SOURCES) {
      expect(isSourceBacked(source)).toBe(
        source.nutrientValue !== undefined && source.verified,
      );
    }
  });

  it("elke brondwaarde draagt een dataset-referentie, niet alleen een origin", () => {
    for (const source of ALL_SOURCES) {
      const value = source.nutrientValue;
      if (value === undefined) continue;
      expect(value.source.ref, `${source.key} mist een bronreferentie`).not.toBeNull();
      expect(value.source.edition, `${source.key} mist een editie`).not.toBeNull();
    }
  });

  it("een NEVO-waarde staat altijd per 100 g — dat is wat de bron publiceert", () => {
    for (const source of ALL_SOURCES) {
      const value = source.nutrientValue;
      if (value?.source.origin !== "nevo") continue;
      expect(value.per, `${source.key} citeert NEVO niet per 100 g`).toBe("100g");
    }
  });

  it("de voorgeschreven RIVM-bronvermelding staat vast en noemt versie én plaats", () => {
    // RIVM schrijft deze referentie letterlijk voor; hij hoort bij elke pagina
    // die NEVO-gegevens toont.
    expect(NEVO_CITATION).toContain("NEVO-online");
    expect(NEVO_CITATION).toContain("RIVM");
    expect(NEVO_CITATION).toMatch(/\d{4}\/\d+\.\d+/);
  });

  it("elke rij heeft een unieke sleutel binnen zijn nutriënt", () => {
    for (const id of NUTRIENT_IDS) {
      const keys = FOOD_SOURCES[id].map((s) => s.key);
      expect(new Set(keys).size, `dubbele key binnen ${id}`).toBe(keys.length);
    }
  });
});

describe("amountForPortion — onze bewerking, expliciet gescheiden", () => {
  const perHonderdGram: NutrientValue = {
    value: 20,
    unit: "µg",
    per: "100g",
    source: { origin: "nevo", ref: "1234", edition: "2025/9.0" },
  };

  it("rekent recht evenredig om naar de portie", () => {
    expect(amountForPortion(perHonderdGram, 100)).toBe(20);
    expect(amountForPortion(perHonderdGram, 125)).toBe(25);
    expect(amountForPortion(perHonderdGram, 50)).toBe(10);
  });

  it("rondt af op één decimaal — de bron is niet preciezer", () => {
    expect(amountForPortion({ ...perHonderdGram, value: 1.55 }, 60)).toBe(0.9);
  });

  it("weigert een onzinnige portiegrootte in plaats van een getal te verzinnen", () => {
    expect(amountForPortion(perHonderdGram, 0)).toBeNull();
    expect(amountForPortion(perHonderdGram, -100)).toBeNull();
    expect(amountForPortion(perHonderdGram, NaN)).toBeNull();
  });

  it("laat de brondwaarde ongemoeid — die wordt geciteerd, niet herrekend", () => {
    const before = { ...perHonderdGram };
    amountForPortion(perHonderdGram, 125);
    expect(perHonderdGram).toEqual(before);
  });
});

describe("de huidige stand is eerlijk afleesbaar", () => {
  it("geen enkele rij claimt vandaag verificatie", () => {
    // Zodra de eerste NEVO-import landt, verandert deze test mee — en dan is
    // dat een bewuste wijziging in plaats van een sluipende.
    const verified = ALL_SOURCES.filter((s) => s.verified);
    expect(verified.map((s) => s.key)).toEqual([]);
  });

  it("elke rij zonder brondwaarde staat expliciet op niet-geverifieerd", () => {
    for (const source of ALL_SOURCES) {
      if (source.nutrientValue === undefined) {
        expect(source.verified, `${source.key}`).toBe(false);
      }
    }
  });
});
