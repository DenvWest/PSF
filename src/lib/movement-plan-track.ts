import type { PlanIntakeContext } from "@/types/lifestyle-plan";

export type MovementTrack = {
  label: string;
  summary: string;
};

function strengthBand(ctx: PlanIntakeContext): "starter" | "onderhoud" {
  const movStr = ctx.answers.MOV_STR;
  return typeof movStr === "number" && movStr >= 3 ? "onderhoud" : "starter";
}

function cardioBand(ctx: PlanIntakeContext): "starter" | "onderhoud" {
  const movCard = ctx.answers.MOV_CARD;
  return typeof movCard === "number" && movCard >= 3 ? "onderhoud" : "starter";
}

/** L1 track-label for the movement plan header — derived from MOV_STR / MOV_CARD. */
export function getMovementTrack(ctx: PlanIntakeContext): MovementTrack {
  const strength = strengthBand(ctx);
  const cardio = cardioBand(ctx);

  if (strength === "starter" && cardio === "starter") {
    return {
      label: "Starter — kracht & conditie opbouwen",
      summary:
        "Op basis van je leefstijlcheck: start licht thuis, bouw daarna rustig op.",
    };
  }

  if (strength === "onderhoud" && cardio === "onderhoud") {
    return {
      label: "Onderhoud — ritme en herstel scherp houden",
      summary:
        "Je beweegt al regelmatig — focus op consistentie, rust en voedingssteun.",
    };
  }

  if (strength === "starter") {
    return {
      label: "Kracht opbouwen",
      summary:
        "Conditie staat redelijk op peil — deze week vooral een echte krachtprikkel toevoegen.",
    };
  }

  return {
    label: "Conditie opbouwen",
    summary:
      "Kracht staat redelijk op peil — deze week vooral matig intensief bewegen.",
  };
}
