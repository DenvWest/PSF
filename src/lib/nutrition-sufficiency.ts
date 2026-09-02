import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import type { NutrientContribution } from "@/lib/nutrition-contribution";
import type { IntakeBand } from "@/lib/nutrition-intake-estimate";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";
import type { ProteinTargetRange } from "@/lib/protein-target";

export type SufficiencyOutcome = "sufficient" | "insufficient" | "uncertain";

export type NutrientSufficiency = {
  nutrient: NutrientId;
  label: string;
  outcome: SufficiencyOutcome;
  band: IntakeBand;
  contextLine: string | null;
  leadingSources: readonly { labelNl: string; share: number }[];
  p6Relevant: boolean;
};

export type NutritionPersonalizationContext = {
  weightKg: number | null;
  trainingLoad: number | undefined;
  proteinTarget: ProteinTargetRange | null;
  ageRange: string | null;
};

export type NutritionSufficiencySummary = {
  layerState: LeefstijlLayerState;
  contextLine: string | null;
  trainingLoadLabel: string | null;
  nutrients: readonly NutrientSufficiency[];
  /** Stoffen met een gat of onzekerheid — P6 opent hierop. */
  focusNutrients: readonly NutrientId[];
  /**
   * Wat deze laag níét meeweegt, in de woorden van de gebruiker.
   *
   * "Op jouw situatie" belooft dat werk, sport en voorkeuren je stappen
   * kleuren. Sport en gewicht wegen mee; werk (ploegendienst, onregelmatige
   * eettijden, fysiek beroep) vragen we nergens uit. Die belofte half waarmaken
   * zonder het te zeggen laat de gebruiker denken dat een ploegendienst is
   * meegenomen. Deze regel zegt de grens hardop.
   */
  blindeVlekken: readonly string[];
};

function bandToOutcome(band: IntakeBand): SufficiencyOutcome {
  if (band === "meets") return "sufficient";
  if (band === "below") return "insufficient";
  return "uncertain";
}

export function trainingLoadLabelNl(trainingLoad: number | undefined): string | null {
  if (trainingLoad === undefined) {
    return null;
  }
  if (trainingLoad >= 4) {
    return "Hoge trainingsbelasting (kracht én cardio actief)";
  }
  if (trainingLoad >= 3) {
    return "Actieve trainingsbelasting";
  }
  if (trainingLoad >= 2) {
    return "Matige trainingsbelasting";
  }
  return "Lichte trainingsbelasting";
}

function buildContextLine(ctx: NutritionPersonalizationContext): string | null {
  const loadLine = trainingLoadLabelNl(ctx.trainingLoad);
  const parts: string[] = [];
  if (ctx.weightKg != null) {
    parts.push(`${Math.round(ctx.weightKg)} kg`);
  }
  if (ctx.ageRange) {
    parts.push(`leeftijd ${ctx.ageRange}`);
  }
  if (loadLine) {
    parts.push(loadLine.toLowerCase());
  }
  if (ctx.proteinTarget) {
    parts.push(
      `eiwitdoel circa ${ctx.proteinTarget.gramsLow}–${ctx.proteinTarget.gramsHigh} g per dag`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function proteinContextLine(ctx: NutritionPersonalizationContext): string | null {
  if (!ctx.proteinTarget) {
    return null;
  }
  const load = trainingLoadLabelNl(ctx.trainingLoad);
  if (load) {
    return `Met ${load.toLowerCase()} mik je op ${ctx.proteinTarget.gramsLow}–${ctx.proteinTarget.gramsHigh} g eiwit per dag — dat is hoger dan de basisrichtlijn na veertig.`;
  }
  return `Op basis van je gewicht mik je op ${ctx.proteinTarget.gramsLow}–${ctx.proteinTarget.gramsHigh} g eiwit per dag.`;
}

/**
 * De velden die deze laag mist, van meest naar minst bepalend.
 *
 * Werk staat altijd in de lijst: er is geen enkel veld dat ploegendienst,
 * onregelmatige eettijden of fysieke arbeid vastlegt. Gewicht en
 * trainingsbelasting staan er alleen in zolang ze ontbreken — die kan hij zelf
 * aanvullen, en dan verdwijnt de regel.
 */
function buildBlindeVlekken(ctx: NutritionPersonalizationContext): string[] {
  const missing = ["je werkritme (ploegendienst, onregelmatige eettijden, fysiek werk)"];
  if (ctx.weightKg == null) {
    missing.push("je gewicht");
  }
  if (ctx.trainingLoad === undefined) {
    missing.push("hoeveel je traint");
  }
  return missing;
}

function leadingSourcesFrom(
  contribution: NutrientContribution | undefined,
): readonly { labelNl: string; share: number }[] {
  if (!contribution) {
    return [];
  }
  return contribution.sources
    .filter((source) => !source.missing && source.weighted > 0)
    .slice(0, 2)
    .map((source) => ({ labelNl: source.labelNl, share: source.share }));
}

function routeIsGap(route: NutrientRouteStatus | undefined): boolean {
  return route?.status === "gap" || route?.status === "partial";
}

export function buildNutritionSufficiency(input: {
  intakeItems: readonly { nutrient: NutrientId; band: IntakeBand }[];
  routes: readonly NutrientRouteStatus[];
  contribution: readonly NutrientContribution[];
  personalization: NutritionPersonalizationContext;
}): NutritionSufficiencySummary {
  const contributionByNutrient = new Map(input.contribution.map((item) => [item.nutrient, item]));
  const routeByNutrient = new Map(input.routes.map((route) => [route.nutrient, route]));

  const nutrients: NutrientSufficiency[] = input.intakeItems.map((item) => {
    const outcome = bandToOutcome(item.band);
    const route = routeByNutrient.get(item.nutrient);
    const contribution = contributionByNutrient.get(item.nutrient);
    const contextLine =
      item.nutrient === "protein" ? proteinContextLine(input.personalization) : null;

    return {
      nutrient: item.nutrient,
      label: nutrientReferences[item.nutrient]?.label ?? item.nutrient,
      outcome,
      band: item.band,
      contextLine,
      leadingSources: leadingSourcesFrom(contribution),
      p6Relevant: outcome !== "sufficient" || routeIsGap(route),
    };
  });

  const focusNutrients = nutrients
    .filter((item) => item.outcome !== "sufficient" || item.p6Relevant)
    .map((item) => item.nutrient);

  const hasInsufficient = nutrients.some((item) => item.outcome === "insufficient");
  const hasUncertain = nutrients.some((item) => item.outcome === "uncertain");

  let layerState: LeefstijlLayerState = "ok";
  if (hasInsufficient) {
    layerState = "winst";
  } else if (hasUncertain) {
    layerState = "watch";
  }

  return {
    layerState,
    contextLine: buildContextLine(input.personalization),
    trainingLoadLabel: trainingLoadLabelNl(input.personalization.trainingLoad),
    nutrients,
    focusNutrients,
    blindeVlekken: buildBlindeVlekken(input.personalization),
  };
}
