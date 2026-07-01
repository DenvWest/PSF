import { describe, expect, it } from "vitest";
import { getVitalityScoreCardCopy } from "@/lib/vitality-score-copy";

const STRESS_ANSWERS: Record<string, number> = {
  SLP_QUAL: 3,
  SLP_CONS: 3,
  SLP_ONSET: 3,
  SLP_WAKE: 3,
  NRG_PATN: 3,
  NRG_DEP: 4,
  STR_FREQ: 1,
  STR_RCV: 2,
  NUT_O3: 3,
  NUT_PROT: 3,
  MOV_STR: 4,
  MOV_CARD: 4,
  RCV_PHYS: 3,
};

const DOMAIN_SCORES = {
  sleep_score: 58,
  energy_score: 54,
  stress_score: 35,
  nutrition_score: 47,
  movement_score: 71,
  recovery_score: 51,
    connection_score: 51,
};

describe("getVitalityScoreCardCopy", () => {
  it("gebruikt naam en 5-band status in heading", () => {
    const copy = getVitalityScoreCardCopy({
      firstName: "Dennis",
      vitality: 47,
      priorityId: "stress",
      priorityScore: 35,
      answers: STRESS_ANSWERS,
      domainScores: DOMAIN_SCORES,
    });

    expect(copy.heading).toBe("Dennis, je bent op gang.");
  });

  it("geeft generieke heading zonder naam", () => {
    const copy = getVitalityScoreCardCopy({
      firstName: null,
      vitality: 90,
      priorityId: "stress",
      priorityScore: 35,
      answers: STRESS_ANSWERS,
      domainScores: DOMAIN_SCORES,
    });

    expect(copy.heading).toBe("Je bent optimaal.");
  });

  it("past body aan op basis van leefstijlcheck-antwoorden", () => {
    const stressCopy = getVitalityScoreCardCopy({
      firstName: "Dennis",
      vitality: 47,
      priorityId: "stress",
      priorityScore: 35,
      answers: STRESS_ANSWERS,
      domainScores: DOMAIN_SCORES,
    });

    const nutritionCopy = getVitalityScoreCardCopy({
      firstName: "Dennis",
      vitality: 47,
      priorityId: "voeding",
      priorityScore: 38,
      answers: {
        ...STRESS_ANSWERS,
        NUT_PROT: 1,
        NUT_O3: 1,
      },
      domainScores: DOMAIN_SCORES,
    });

    expect(stressCopy.body).toContain("Stress is je prioriteit.");
    expect(stressCopy.body).toContain("Spanning ligt te vaak boven je herstel.");
    expect(nutritionCopy.body).toContain("Voeding is je prioriteit.");
    expect(nutritionCopy.body).not.toBe(stressCopy.body);
  });
});
