import { describe, expect, it } from "vitest";
import { calcDomainScores, RULES_VERSION } from "@/lib/intake-engine";
import { isNutritionDeltaComparable } from "@/lib/rules-version";

/**
 * 1.7.0 — voeding van twee naar vier score-items.
 *
 * De drie P1-bugs bij de 1.4.0-herskalering zaten allemaal in dezelfde hoek:
 * een deltagrens die niet meebewoog met een itemwijziging. Deze tests bewaken
 * die hoek expliciet.
 */

/** Alle niet-voedingsantwoorden neutraal, zodat alleen voeding varieert. */
const BASIS: Record<string, number> = {
  SLP_QUAL: 3,
  SLP_CONS: 2,
  SLP_ONSET: 3,
  SLP_WAKE: 3,
  NRG_PATN: 3,
  NRG_DEP: 3,
  STR_FREQ: 3,
  STR_RCV: 3,
  CON_SOC: 3,
  MOV_STR: 3,
  MOV_CARD: 3,
  RCV_PHYS: 2,
};

describe("RULES_VERSION", () => {
  it("staat op 1.7.0", () => {
    expect(RULES_VERSION).toBe("1.7.0");
  });
});

describe("calcDomainScores — voeding v1.7.0", () => {
  it("weegt de twee nieuwe items mee", () => {
    const zonder = calcDomainScores({ ...BASIS, NUT_O3: 3, NUT_PROT: 4 });
    const metSlechteStructuur = calcDomainScores({
      ...BASIS,
      NUT_O3: 3,
      NUT_PROT: 4,
      NUT_STRUCT: 1,
      NUT_QUAL: 1,
    });
    // Twee items op hun laagste stand horen de score omlaag te trekken.
    expect(metSlechteStructuur.nutrition_score).toBeLessThan(zonder.nutrition_score);
  });

  it("laat de andere zes domeinen ongemoeid", () => {
    const v150 = calcDomainScores({ ...BASIS, NUT_O3: 2, NUT_PROT: 3 }, "1.6.0");
    const v170 = calcDomainScores({ ...BASIS, NUT_O3: 2, NUT_PROT: 3 }, "1.7.0");
    expect(v170.sleep_score).toBe(v150.sleep_score);
    expect(v170.stress_score).toBe(v150.stress_score);
    expect(v170.movement_score).toBe(v150.movement_score);
    expect(v170.connection_score).toBe(v150.connection_score);
    expect(v170.energy_score).toBe(v150.energy_score);
    expect(v170.recovery_score).toBe(v150.recovery_score);
  });

  it("straft een oude sessie niet die de nieuwe items mist", () => {
    // Doorrekenen van een pre-1.7.0-sessie mag geen kunstmatig lage score
    // geven: averageItemScores negeert ontbrekende items.
    const oud = { ...BASIS, NUT_O3: 3, NUT_PROT: 4 };
    expect(calcDomainScores(oud, "1.7.0").nutrition_score).toBe(
      calcDomainScores(oud, "1.6.0").nutrition_score,
    );
  });

  it("blijft 1.6.0 op de oude formule berekenen", () => {
    const antwoorden = {
      ...BASIS,
      NUT_O3: 3,
      NUT_PROT: 4,
      NUT_STRUCT: 1,
      NUT_QUAL: 1,
    };
    // Een 1.6.0-sessie mag de nieuwe items niet meetellen, ook al staan ze in
    // de antwoorden — anders verandert een bestaande score met terugwerkende
    // kracht.
    const v160 = calcDomainScores(antwoorden, "1.6.0");
    const v170 = calcDomainScores(antwoorden, "1.7.0");
    expect(v160.nutrition_score).not.toBe(v170.nutrition_score);
  });

  it("houdt de score binnen 0–100", () => {
    const laagst = calcDomainScores({
      ...BASIS,
      NUT_O3: 1,
      NUT_PROT: 2,
      NUT_STRUCT: 1,
      NUT_QUAL: 1,
    });
    const hoogst = calcDomainScores({
      ...BASIS,
      NUT_O3: 3,
      NUT_PROT: 4,
      NUT_STRUCT: 4,
      NUT_QUAL: 4,
    });
    expect(laagst.nutrition_score).toBeGreaterThanOrEqual(0);
    expect(hoogst.nutrition_score).toBeLessThanOrEqual(100);
    expect(hoogst.nutrition_score).toBeGreaterThan(laagst.nutrition_score);
  });
});

describe("isNutritionDeltaComparable", () => {
  it("laat twee 1.7.0-metingen vergelijken", () => {
    expect(isNutritionDeltaComparable("1.7.0", "1.7.0")).toBe(true);
  });

  it("blokkeert een vergelijking over de itemgrens heen", () => {
    // Dit is de bug-klasse uit S3: een delta tonen tussen scores die over een
    // andere itemset gemiddeld zijn.
    expect(isNutritionDeltaComparable("1.6.0", "1.7.0")).toBe(false);
    expect(isNutritionDeltaComparable("1.4.0", "1.7.0")).toBe(false);
  });

  it("laat identieke oude versies wél vergelijken", () => {
    // Twee metingen op 1.6.0 meten hetzelfde; de grens gaat over het
    // overschrijden, niet over de leeftijd.
    expect(isNutritionDeltaComparable("1.6.0", "1.6.0")).toBe(true);
  });
});
