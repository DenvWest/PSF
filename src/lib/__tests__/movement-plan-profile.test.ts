import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/data/intake-questions";
import {
  carryOverMovementPlanProfile,
  hasMovementPlanProfileValues,
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
    });
  });

  it("verandert niets als er geen vorig profiel is", () => {
    expect(carryOverMovementPlanProfile(null, NUMERIC_ANSWERS)).toEqual(
      NUMERIC_ANSWERS,
    );
  });
});
