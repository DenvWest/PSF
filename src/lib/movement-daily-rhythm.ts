import {
  DAILY_RHYTHM_EVIDENCE_HREF,
  DAILY_RHYTHM_SNACK_HEADLINE,
  DAILY_RHYTHM_STEPS_HEADLINE,
  MOVEMENT_SNACK_CATALOG,
  STEPS_TARGET_BY_PAL,
  type MovementSnackDefinition,
  type StepsTargetBand,
} from "@/data/movement/daily-rhythm";
import { derivePAL } from "@/lib/movement-pal";
import type { PlanIntakeContext } from "@/types/lifestyle-plan";

export type MovementDailyRhythm = {
  snackHeadline: string;
  stepsHeadline: string;
  snacks: MovementSnackDefinition[];
  stepsTarget: StepsTargetBand;
  evidenceHref: string;
};

function strengthBand(ctx: PlanIntakeContext): "starter" | "onderhoud" {
  const movStr = ctx.answers.MOV_STR;
  return typeof movStr === "number" && movStr >= 3 ? "onderhoud" : "starter";
}

function cardioBand(ctx: PlanIntakeContext): "starter" | "onderhoud" {
  const movCard = ctx.answers.MOV_CARD;
  return typeof movCard === "number" && movCard >= 3 ? "onderhoud" : "starter";
}

function snackPriorityTags(
  ctx: PlanIntakeContext,
): readonly ("kracht" | "conditie" | "bureau")[] {
  const strength = strengthBand(ctx);
  const cardio = cardioBand(ctx);

  if (strength === "starter" && cardio === "starter") {
    return ["kracht", "conditie", "bureau"];
  }
  if (strength === "starter") {
    return ["kracht", "bureau", "conditie"];
  }
  if (cardio === "starter") {
    return ["conditie", "kracht", "bureau"];
  }
  return ["bureau", "conditie", "kracht"];
}

/** Top 4 beweegsnacks for the daily rhythm strip — personalized by MOV bands. */
export function selectMovementSnacks(ctx: PlanIntakeContext): MovementSnackDefinition[] {
  const priorities = snackPriorityTags(ctx);
  const ranked = [...MOVEMENT_SNACK_CATALOG].sort((a, b) => {
    const scoreA = priorities.findIndex((tag) => a.tags.includes(tag));
    const scoreB = priorities.findIndex((tag) => b.tags.includes(tag));
    const normalizedA = scoreA === -1 ? priorities.length : scoreA;
    const normalizedB = scoreB === -1 ? priorities.length : scoreB;
    return normalizedA - normalizedB;
  });
  return ranked.slice(0, 4);
}

export function buildMovementDailyRhythm(ctx: PlanIntakeContext): MovementDailyRhythm {
  const pal = derivePAL({
    MOV_STR: ctx.answers.MOV_STR,
    MOV_CARD: ctx.answers.MOV_CARD,
  });
  const stepsTarget =
    STEPS_TARGET_BY_PAL.find((item) => item.band === pal.band) ??
    STEPS_TARGET_BY_PAL[0];

  return {
    snackHeadline: DAILY_RHYTHM_SNACK_HEADLINE,
    stepsHeadline: DAILY_RHYTHM_STEPS_HEADLINE,
    snacks: selectMovementSnacks(ctx),
    stepsTarget,
    evidenceHref: DAILY_RHYTHM_EVIDENCE_HREF,
  };
}
