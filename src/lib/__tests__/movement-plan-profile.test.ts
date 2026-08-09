import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/data/intake-questions";
import {
  buildMovementProgramPreview,
  carryOverMovementPlanProfile,
  hasMovementPlanProfileValues,
  isMovementTrainingGuidance,
  parseMovementPlanProfile,
} from "@/lib/movement-plan-profile";
import type { IntakeAnswers } from "@/types/intake-answers";

const NUMERIC_ANSWERS = Object.fromEntries(
  QUESTIONS.map((question) => [question.id, 3]),
) as IntakeAnswers;

const FULL_PROFILE = {
  preferredStartPattern: "kracht",
  movementAnchor: "zelfstandigheid",
  preferredSport: "sportschool",
  weeklyAvailability: "2x",
};

describe("hasMovementPlanProfileValues", () => {
  it("herkent een gezet profiel aan één enkele key", () => {
    expect(hasMovementPlanProfileValues({ movementAnchor: "kracht" })).toBe(true);
    expect(hasMovementPlanProfileValues({ weeklyAvailability: "3x" })).toBe(true);
  });

  it("is onwaar zonder geldige profielwaarden", () => {
    expect(hasMovementPlanProfileValues(null)).toBe(false);
    expect(hasMovementPlanProfileValues([])).toBe(false);
    expect(hasMovementPlanProfileValues({ MOV_STR: 2 })).toBe(false);
    expect(
      hasMovementPlanProfileValues({ movementAnchor: "squat", weeklyAvailability: "5x" }),
    ).toBe(false);
  });
});

describe("carryOverMovementPlanProfile", () => {
  it("neemt het volledige profiel mee naar een nieuwe sessie", () => {
    const carried = carryOverMovementPlanProfile(
      { ...NUMERIC_ANSWERS, ...FULL_PROFILE },
      NUMERIC_ANSWERS,
    );

    expect(parseMovementPlanProfile(carried)).toEqual({
      startPattern: "kracht",
      anchor: "zelfstandigheid",
      preferredSport: "sportschool",
      weeklyFrequency: "2x",
      trainingLocation: "sportschool",
      trainingGuidance: null,
      sports: [],
      targetMinutes: null,
      targetDays: null,
      targetStrength: null,
    });
  });

  it("laat de numerieke antwoorden van de nieuwe check ongemoeid", () => {
    const next = { ...NUMERIC_ANSWERS, MOV_STR: 1 };
    const carried = carryOverMovementPlanProfile(
      { ...NUMERIC_ANSWERS, MOV_STR: 4, ...FULL_PROFILE },
      next,
    );

    expect(carried.MOV_STR).toBe(1);
    for (const question of QUESTIONS) {
      expect(carried[question.id]).toBe(next[question.id]);
    }
  });

  it("laat een verse keuze winnen van de overgedragen waarde", () => {
    const carried = carryOverMovementPlanProfile(
      { ...NUMERIC_ANSWERS, ...FULL_PROFILE },
      { ...NUMERIC_ANSWERS, movementAnchor: "energie" },
    );

    expect(parseMovementPlanProfile(carried).anchor).toBe("energie");
    expect(parseMovementPlanProfile(carried).startPattern).toBe("kracht");
  });

  it("negeert ongeldige vorige waarden zonder de rest te blokkeren", () => {
    const carried = carryOverMovementPlanProfile(
      {
        ...NUMERIC_ANSWERS,
        movementAnchor: "squat",
        preferredStartPattern: "conditie",
      },
      NUMERIC_ANSWERS,
    );

    expect(parseMovementPlanProfile(carried)).toEqual({
      startPattern: "conditie",
      anchor: null,
      preferredSport: null,
      weeklyFrequency: null,
      trainingLocation: null,
      trainingGuidance: null,
      sports: [],
      targetMinutes: null,
      targetDays: null,
      targetStrength: null,
    });
  });

  it("verandert niets als er geen vorig profiel is", () => {
    expect(carryOverMovementPlanProfile(null, NUMERIC_ANSWERS)).toEqual(
      NUMERIC_ANSWERS,
    );
  });

  it("neemt trainingGuidance mee als de nieuwe sessie hem mist", () => {
    const carried = carryOverMovementPlanProfile(
      { ...NUMERIC_ANSWERS, trainingGuidance: "coach" },
      NUMERIC_ANSWERS,
    );

    expect(parseMovementPlanProfile(carried).trainingGuidance).toBe("coach");
  });
});

describe("isMovementTrainingGuidance", () => {
  it("herkent alle vier de waarden, inclusief onbekend als geldig antwoord", () => {
    expect(isMovementTrainingGuidance("zelf")).toBe(true);
    expect(isMovementTrainingGuidance("groep")).toBe(true);
    expect(isMovementTrainingGuidance("coach")).toBe(true);
    expect(isMovementTrainingGuidance("onbekend")).toBe(true);
  });

  it("wijst ongeldige waarden af", () => {
    expect(isMovementTrainingGuidance("vriend")).toBe(false);
    expect(isMovementTrainingGuidance(null)).toBe(false);
    expect(isMovementTrainingGuidance(undefined)).toBe(false);
  });
});

describe("parseMovementPlanProfile — trainingGuidance", () => {
  it("parst een geldige waarde", () => {
    expect(parseMovementPlanProfile({ trainingGuidance: "groep" }).trainingGuidance).toBe(
      "groep",
    );
  });

  it("valt terug op null bij een ongeldige of ontbrekende waarde", () => {
    expect(parseMovementPlanProfile({ trainingGuidance: "vriend" }).trainingGuidance).toBeNull();
    expect(parseMovementPlanProfile({}).trainingGuidance).toBeNull();
  });
});

describe("hasMovementPlanProfileValues — trainingGuidance", () => {
  it("telt een gezette trainingGuidance als een gezet profiel, ook onbekend", () => {
    expect(hasMovementPlanProfileValues({ trainingGuidance: "coach" })).toBe(true);
    expect(hasMovementPlanProfileValues({ trainingGuidance: "onbekend" })).toBe(true);
  });
});

describe("buildMovementProgramPreview", () => {
  it("valt weg zonder frequentie of locatie, ook als guidance wel gezet is", () => {
    expect(buildMovementProgramPreview(null, "thuis", "coach")).toBeNull();
    expect(buildMovementProgramPreview("2x", null, "coach")).toBeNull();
  });

  it("toont frequentie · locatie zonder guidance-argument (R0b-gedrag blijft werken)", () => {
    expect(buildMovementProgramPreview("2x", "thuis")).toBe("2× per week · thuis");
  });

  it("voegt het guidance-segment toe voor zelf/groep/coach", () => {
    expect(buildMovementProgramPreview("1x", "sportschool", "zelf")).toBe(
      "1× per week · sportschool · zelf",
    );
    expect(buildMovementProgramPreview("2x", "thuis", "groep")).toBe(
      "2× per week · thuis · groep",
    );
    expect(buildMovementProgramPreview("3x", "sportschool", "coach")).toBe(
      "3× per week · sportschool · coach",
    );
  });

  it("laat het guidance-segment weg bij onbekend — geen 'weet niet' in de samenvatting", () => {
    expect(buildMovementProgramPreview("2x", "thuis", "onbekend")).toBe("2× per week · thuis");
  });

  it("laat het guidance-segment weg bij null", () => {
    expect(buildMovementProgramPreview("2x", "thuis", null)).toBe("2× per week · thuis");
  });
});
