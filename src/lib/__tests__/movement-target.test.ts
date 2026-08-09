import { describe, expect, it } from "vitest";
import {
  ANSWER_KEY_TARGET_DAYS,
  ANSWER_KEY_TARGET_MINUTES,
  ANSWER_KEY_TARGET_STRENGTH,
} from "@/data/movement/targets";
import {
  buildMovementTargetGap,
  buildProgramDoseLine,
  deriveMovementCurrent,
  mergeMovementCheckinIntoAnswers,
  parseMovementTarget,
  resolveEffectiveMovementTarget,
  resolveMovementProgramDose,
} from "@/lib/movement-target";
import {
  carryOverMovementPlanProfile,
  parseMovementPlanProfile,
} from "@/lib/movement-plan-profile";
import { QUESTIONS } from "@/data/intake-questions";
import type { IntakeAnswers } from "@/types/intake-answers";

const NUMERIC_ANSWERS = Object.fromEntries(
  QUESTIONS.map((question) => [question.id, 3]),
) as IntakeAnswers;

describe("deriveMovementCurrent", () => {
  it("leest minuten uit de diepe beweegcheck en telt matig + intensief op", () => {
    const current = deriveMovementCurrent({
      MOV2_CARD: 3, // 90-149 → 120
      MOV2_VIG: 3, // 30-74 → 50
      MOV2_STR: 4, // 2x per week
    });

    expect(current.source).toBe("beweegcheck");
    expect(current.weeklyMinutes).toBe(170);
    expect(current.strengthSessions).toBe(2);
    expect(current.moderateLabel).toBe("90-149 minuten");
  });

  it("verzint geen minuten als alleen de basischeck is gedaan", () => {
    const current = deriveMovementCurrent({ MOV_CARD: 3, MOV_STR: 2 });

    expect(current.source).toBe("basischeck");
    expect(current.weeklyMinutes).toBeNull();
    expect(current.moderateLabel).toBeNull();
  });

  it("meldt onbekend zonder enige beweegvraag", () => {
    expect(deriveMovementCurrent({}).source).toBe("onbekend");
  });

  it("rekent intensief als nul wanneer die vraag ontbreekt", () => {
    const current = deriveMovementCurrent({ MOV2_CARD: 2 }); // 30-89 → 60
    expect(current.weeklyMinutes).toBe(60);
  });
});

describe("mergeMovementCheckinIntoAnswers", () => {
  const REPORT = { MOV2_CARD: 4, MOV2_VIG: 3, MOV2_SIT: 2, MOV2_STR: 5 };

  it("zet de vier velden uit de beweegcheck in de answers", () => {
    const merged = mergeMovementCheckinIntoAnswers({}, REPORT);

    expect(merged).toEqual({
      MOV2_CARD: 4,
      MOV2_VIG: 3,
      MOV2_SIT: 2,
      MOV2_STR: 5,
    });
  });

  it("laat alle andere antwoorden ongemoeid", () => {
    const merged = mergeMovementCheckinIntoAnswers(
      {
        ...NUMERIC_ANSWERS,
        MOV_CARD: 2,
        [ANSWER_KEY_TARGET_MINUTES]: 200,
        [ANSWER_KEY_TARGET_DAYS]: 4,
      },
      REPORT,
    );

    expect(merged.MOV_CARD).toBe(2);
    expect(merged[ANSWER_KEY_TARGET_MINUTES]).toBe(200);
    expect(merged[ANSWER_KEY_TARGET_DAYS]).toBe(4);
    for (const [key, value] of Object.entries(NUMERIC_ANSWERS)) {
      if (key.startsWith("MOV2_") || key === "MOV_CARD") continue;
      expect(merged[key]).toBe(value);
    }
    expect(merged.MOV2_CARD).toBe(4);
  });

  it("overschrijft een eerdere beweegcheck — laatste wint", () => {
    const merged = mergeMovementCheckinIntoAnswers(
      { MOV2_CARD: 1, MOV2_VIG: 1, MOV2_SIT: 1, MOV2_STR: 1 },
      REPORT,
    );

    expect(merged).toEqual({
      MOV2_CARD: 4,
      MOV2_VIG: 3,
      MOV2_SIT: 2,
      MOV2_STR: 5,
    });
  });

  it("negeert de zes overige rapportvelden — die voeden de score, niet het huidige beeld", () => {
    const fullReport = { ...REPORT, MOV2_COND: 3, RCV_FEEL: 2, MOV2_PAIN: 1 };
    const merged = mergeMovementCheckinIntoAnswers({}, fullReport);

    expect(Object.keys(merged).sort()).toEqual([
      "MOV2_CARD",
      "MOV2_SIT",
      "MOV2_STR",
      "MOV2_VIG",
    ]);
  });

  it("valt terug op een leeg record bij onbruikbare invoer", () => {
    for (const input of [null, undefined, 42, "answers", [1, 2, 3]]) {
      expect(mergeMovementCheckinIntoAnswers(input, REPORT)).toEqual({
        MOV2_CARD: 4,
        MOV2_VIG: 3,
        MOV2_SIT: 2,
        MOV2_STR: 5,
      });
    }
  });

  it("levert een beeld op dat deriveMovementCurrent als beweegcheck herkent", () => {
    const merged = mergeMovementCheckinIntoAnswers({ MOV_CARD: 2 }, REPORT);

    expect(deriveMovementCurrent(merged as Record<string, number>).source).toBe(
      "beweegcheck",
    );
  });
});

describe("parseMovementTarget", () => {
  it("leest een geldig doel uit de answers-jsonb", () => {
    const target = parseMovementTarget({
      [ANSWER_KEY_TARGET_MINUTES]: 150,
      [ANSWER_KEY_TARGET_DAYS]: 3,
      [ANSWER_KEY_TARGET_STRENGTH]: 2,
    });

    expect(target).toEqual({ minutes: 150, days: 3, strength: 2 });
  });

  it("accepteert elke waarde binnen de grenzen, ook buiten de presets ('anders')", () => {
    const target = parseMovementTarget({
      [ANSWER_KEY_TARGET_MINUTES]: 137,
      [ANSWER_KEY_TARGET_DAYS]: 6,
      [ANSWER_KEY_TARGET_STRENGTH]: 2,
    });

    expect(target).toEqual({ minutes: 137, days: 6, strength: 2 });
  });

  it("negeert waarden buiten de grenzen of niet-gehele getallen", () => {
    const target = parseMovementTarget({
      [ANSWER_KEY_TARGET_MINUTES]: 137.5,
      [ANSWER_KEY_TARGET_DAYS]: 9,
      [ANSWER_KEY_TARGET_STRENGTH]: 8,
    });

    expect(target).toEqual({ minutes: null, days: null, strength: null });
  });

  it("valt terug op leeg bij onbruikbare invoer", () => {
    expect(parseMovementTarget(null)).toEqual({
      minutes: null,
      days: null,
      strength: null,
    });
  });
});

describe("resolveEffectiveMovementTarget", () => {
  it("stelt de eerstvolgende preset boven het huidige beeld voor, geen sprong naar de richtlijn", () => {
    const current = deriveMovementCurrent({ MOV2_CARD: 2 }); // 60 min
    const target = resolveEffectiveMovementTarget(
      { minutes: null, days: null, strength: null },
      current,
    );

    expect(target.minutes).toBe(100);
  });

  it("laat een zelf gezet doel altijd winnen van het voorstel", () => {
    const current = deriveMovementCurrent({ MOV2_CARD: 2 });
    const target = resolveEffectiveMovementTarget(
      { minutes: 300, days: 5, strength: 3 },
      current,
    );

    expect(target).toEqual({ minutes: 300, days: 5, strength: 3 });
  });

  it("verhoogt kracht met één sessie ten opzichte van nu", () => {
    const current = deriveMovementCurrent({ MOV2_CARD: 3, MOV2_STR: 3 }); // 1x
    const target = resolveEffectiveMovementTarget(
      { minutes: null, days: null, strength: null },
      current,
    );

    expect(target.strength).toBe(2);
  });
});

describe("buildMovementTargetGap", () => {
  it("benoemt het verschil tussen doel en huidig beeld", () => {
    const current = deriveMovementCurrent({ MOV2_CARD: 3 }); // 120
    const gap = buildMovementTargetGap({ minutes: 150, days: 3, strength: 2 }, current);

    expect(gap.minutesDelta).toBe(30);
    expect(gap.stretch).toBe(false);
  });

  it("markeert een grote sprong als stretch zonder te blokkeren", () => {
    const current = deriveMovementCurrent({ MOV2_CARD: 2 }); // 60
    const gap = buildMovementTargetGap({ minutes: 300, days: 4, strength: 2 }, current);

    expect(gap.stretch).toBe(true);
  });

  it("geeft geen verschil als het huidige beeld onbekend is", () => {
    const current = deriveMovementCurrent({});
    const gap = buildMovementTargetGap({ minutes: 150, days: 3, strength: 1 }, current);

    expect(gap.minutesDelta).toBeNull();
  });
});

describe("resolveMovementProgramDose", () => {
  it("verdeelt de minuten over de dagen en rondt af op vijf", () => {
    const dose = resolveMovementProgramDose({ minutes: 150, days: 4, strength: 2 });

    expect(dose).toEqual({
      sessionsPerWeek: 4,
      minutesPerSession: 40,
      strengthSessions: 2,
    });
  });

  it("houdt een sessie minimaal tien minuten", () => {
    const dose = resolveMovementProgramDose({ minutes: 60, days: 7, strength: 0 });

    expect(dose?.minutesPerSession).toBe(10);
  });

  it("levert niets zonder minuten of dagen", () => {
    expect(resolveMovementProgramDose({ minutes: null, days: 3, strength: 1 })).toBeNull();
    expect(resolveMovementProgramDose({ minutes: 150, days: null, strength: 1 })).toBeNull();
  });
});

describe("buildProgramDoseLine", () => {
  it("meldt de dosis feitelijk, zonder ratio tegen het gedaan-log", () => {
    const dose = resolveMovementProgramDose({ minutes: 150, days: 3, strength: 2 });
    expect(dose).not.toBeNull();
    expect(buildProgramDoseLine(dose!)).toBe("doel 3× 50 min");
  });
});

describe("het doel overleeft de hermeting", () => {
  it("draagt een gezet doel over naar de nieuwe sessie", () => {
    const previous = {
      ...NUMERIC_ANSWERS,
      [ANSWER_KEY_TARGET_MINUTES]: 200,
      [ANSWER_KEY_TARGET_DAYS]: 4,
      [ANSWER_KEY_TARGET_STRENGTH]: 2,
    };
    const carried = carryOverMovementPlanProfile(previous, {
      ...NUMERIC_ANSWERS,
      MOV2_CARD: 4,
    });
    const profile = parseMovementPlanProfile(carried);

    expect(profile.targetMinutes).toBe(200);
    expect(profile.targetDays).toBe(4);
    expect(profile.targetStrength).toBe(2);
  });

  it("laat een vers doel uit de nieuwe check winnen", () => {
    const carried = carryOverMovementPlanProfile(
      { ...NUMERIC_ANSWERS, [ANSWER_KEY_TARGET_MINUTES]: 200 },
      { ...NUMERIC_ANSWERS, [ANSWER_KEY_TARGET_MINUTES]: 300 },
    );

    expect(parseMovementPlanProfile(carried).targetMinutes).toBe(300);
  });
});
