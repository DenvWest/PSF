import {
  NUTRITION_BREADTH_SLIDER_IDS,
  NUTRITION_CORE_SLIDER_IDS_AFTER_DIET,
  NUTRITION_META_QUESTIONS,
  nutritionSliderQuestion,
  type NutritionBreadthSliderId,
  type NutritionCoreSliderAfterDietId,
} from "@/data/nutrition/lifescore-questions";

export type DietContext = {
  preference: string;
  allergies: string[];
};

export type DietSkipReason = "vegan" | "vegetarian" | "allergy";

export type SliderCopyOverride = {
  prompt?: string;
  helper?: string;
  optOutLabel?: string;
};

function isPlantBasedOmega3Context(ctx: DietContext): boolean {
  return ctx.preference === "vegetarian" || ctx.preference === "vegan";
}

const SKIP_LABELS: Record<string, string> = {
  nutsSeedsLegumes: "noten- en zadenvragen",
  oilyFish: "visserijvragen",
  dairy: "zuivelvragen",
  wholegrain: "volkorenvraag",
};

function hasFishAllergy(allergies: string[]): boolean {
  return allergies.includes("vis") || allergies.includes("zeevruchten");
}

function hasDairyAllergy(allergies: string[]): boolean {
  return allergies.includes("melk") || allergies.includes("lactose");
}

function hasNutAllergy(allergies: string[]): boolean {
  return allergies.includes("noten");
}

function hasEggAllergy(allergies: string[]): boolean {
  return allergies.includes("eieren");
}

function hasGlutenAllergy(allergies: string[]): boolean {
  return allergies.includes("tarwe");
}

export type PreferenceOption = { value: string; label: string };

/** Vis/zeevruchten-allergie: alleen vegetariër of veganist is combineerbaar. */
export function isPreferenceDisabled(
  preferenceValue: string,
  allergies: string[],
): boolean {
  if (!hasFishAllergy(allergies)) {
    return false;
  }
  return preferenceValue === "none" || preferenceValue === "pescatarian";
}

export function hasFishOrSeafoodAllergy(allergies: string[]): boolean {
  return hasFishAllergy(allergies);
}

export function getVisiblePreferenceOptions(allergies: string[]): PreferenceOption[] {
  const preferenceQuestion = NUTRITION_META_QUESTIONS.find(
    (q) => q.kind === "single" && q.id === "preference",
  );
  if (!preferenceQuestion || preferenceQuestion.kind !== "single") {
    return [];
  }
  return preferenceQuestion.options.filter(
    (opt) => !isPreferenceDisabled(opt.value, allergies),
  );
}

/** Bepaal of een dieet-gerelateerde slider overgeslagen wordt. */
export function shouldSkipSlider(
  sliderId: NutritionCoreSliderAfterDietId,
  ctx: DietContext,
): boolean {
  return getSkipReason(sliderId, ctx) !== null;
}

export function getSkipReason(
  sliderId: NutritionCoreSliderAfterDietId,
  ctx: DietContext,
): DietSkipReason | null {
  const { preference, allergies } = ctx;

  if (sliderId === "nutsSeedsLegumes" && hasNutAllergy(allergies)) {
    return "allergy";
  }

  if (sliderId === "oilyFish") {
    if (hasFishAllergy(allergies)) {
      return "allergy";
    }
  }

  if (sliderId === "dairy") {
    if (preference === "vegan") {
      return "vegan";
    }
    if (hasDairyAllergy(allergies)) {
      return "allergy";
    }
  }

  return null;
}

export function shouldSkipBreadthSlider(
  sliderId: NutritionBreadthSliderId,
  ctx: DietContext,
): boolean {
  if (sliderId === "wholegrain" && hasGlutenAllergy(ctx.allergies)) {
    return true;
  }
  return false;
}

export function getBreadthSkipReason(
  sliderId: NutritionBreadthSliderId,
  ctx: DietContext,
): DietSkipReason | null {
  if (shouldSkipBreadthSlider(sliderId, ctx)) {
    return "allergy";
  }
  return null;
}

/** Labels voor live feedback op allergie-scherm. */
export function getSkippedSliderLabels(ctx: DietContext): string[] {
  const labels: string[] = [];

  for (const id of NUTRITION_CORE_SLIDER_IDS_AFTER_DIET) {
    if (shouldSkipSlider(id, ctx) && SKIP_LABELS[id]) {
      labels.push(SKIP_LABELS[id]);
    }
  }

  if (shouldSkipBreadthSlider("wholegrain", ctx) && SKIP_LABELS.wholegrain) {
    labels.push(SKIP_LABELS.wholegrain);
  }

  return [...new Set(labels)];
}

/** Dynamische copy voor sliders waar allergie/voorkeur de prompt beïnvloedt. */
export function getSliderCopy(
  sliderId: NutritionCoreSliderAfterDietId,
  ctx: DietContext,
): SliderCopyOverride {
  const base = nutritionSliderQuestion(sliderId);
  if (!base) {
    return {};
  }

  if (sliderId === "meatLegumes" && hasFishAllergy(ctx.allergies)) {
    return {
      prompt: "Hoeveel porties vlees of peulvruchten eet je op een gewone dag?",
      helper: "bijv. kip, rundvlees, linzen, bonen",
    };
  }

  if (sliderId === "proteinMeals") {
    const parts: string[] = [];
    if (!hasEggAllergy(ctx.allergies)) {
      parts.push("ei");
    }
    if (!hasDairyAllergy(ctx.allergies) && ctx.preference !== "vegan") {
      parts.push("kwark", "yoghurt");
    }
    parts.push("kip", "peulvruchten");
    if (!hasFishAllergy(ctx.allergies) && !isPlantBasedOmega3Context(ctx)) {
      parts.push("vis");
    }
    return {
      helper: `bijv. ${parts.join(", ")}`,
    };
  }

  if (sliderId === "oilyFish" && isPlantBasedOmega3Context(ctx)) {
    return {
      prompt: "Hoe vaak gebruik je een plantaardige omega-3-bron?",
      helper: "bijv. algenolie (DHA), lijnzaad of chiazaad",
      optOutLabel: "Ik gebruik dit niet",
    };
  }

  return {
    prompt: base.prompt,
    helper: base.helper,
  };
}

function shouldAutoOptOut(sliderId: string, ctx: DietContext): boolean {
  return sliderId === "proteinMeals" && hasEggAllergy(ctx.allergies);
}

function resetSliderToDefault(sliderId: string, sliders: Record<string, number>): void {
  const question = nutritionSliderQuestion(sliderId);
  if (question) {
    sliders[sliderId] = question.defaultIndex;
  }
}

/**
 * Centrale sync: skipped sliders → 0, allergy opt-outs, reset bij deselect.
 */
export function syncDietContext(
  sliders: Record<string, number>,
  optOutChecked: Record<string, boolean>,
  ctx: DietContext,
): { sliders: Record<string, number>; optOutChecked: Record<string, boolean> } {
  const nextSliders = { ...sliders };
  const nextOptOut = { ...optOutChecked };

  for (const id of NUTRITION_CORE_SLIDER_IDS_AFTER_DIET) {
    if (shouldSkipSlider(id, ctx)) {
      nextSliders[id] = 0;
      nextOptOut[id] = false;
    } else if (shouldAutoOptOut(id, ctx)) {
      nextSliders[id] = 0;
      nextOptOut[id] = true;
    } else {
      if (nextOptOut[id] && !shouldAutoOptOut(id, ctx)) {
        nextOptOut[id] = false;
        resetSliderToDefault(id, nextSliders);
      }
    }
  }

  if (shouldSkipBreadthSlider("wholegrain", ctx)) {
    nextSliders.wholegrain = 0;
  } else if (nextSliders.wholegrain === 0) {
    resetSliderToDefault("wholegrain", nextSliders);
  }

  return { sliders: nextSliders, optOutChecked: nextOptOut };
}

/** Zet sliders op 0 waar voorkeur/allergie dat vereist. */
export function applyDietDefaults(
  sliders: Record<string, number>,
  ctx: DietContext,
): Record<string, number> {
  return syncDietContext(sliders, {}, ctx).sliders;
}

/** Eerste niet-overgeslagen index na `fromIndex`, of -1 als alles overgeslagen. */
export function nextAfterDietIndex(
  fromIndex: number,
  ctx: DietContext,
  direction: "forward" | "backward" = "forward",
): number {
  if (direction === "forward") {
    for (let i = fromIndex + 1; i < NUTRITION_CORE_SLIDER_IDS_AFTER_DIET.length; i++) {
      const id = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[i];
      if (!shouldSkipSlider(id, ctx)) {
        return i;
      }
    }
    return -1;
  }

  for (let i = fromIndex - 1; i >= 0; i--) {
    const id = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[i];
    if (!shouldSkipSlider(id, ctx)) {
      return i;
    }
  }
  return -1;
}

/** Eerste niet-overgeslagen index vanaf het begin. */
export function firstAfterDietIndex(ctx: DietContext): number {
  return nextAfterDietIndex(-1, ctx, "forward");
}

/** Laatste niet-overgeslagen index. */
export function lastAfterDietIndex(ctx: DietContext): number {
  return nextAfterDietIndex(NUTRITION_CORE_SLIDER_IDS_AFTER_DIET.length, ctx, "backward");
}

/** Corrigeer index als huidige slider skipped is. */
export function resolveAfterDietStep(
  currentIndex: number,
  ctx: DietContext,
): number {
  const id = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[currentIndex];
  if (id && !shouldSkipSlider(id, ctx)) {
    return currentIndex;
  }
  const first = firstAfterDietIndex(ctx);
  return first >= 0 ? first : currentIndex;
}

export function nextBreadthIndex(
  fromIndex: number,
  ctx: DietContext,
  direction: "forward" | "backward" = "forward",
): number {
  if (direction === "forward") {
    for (let i = fromIndex + 1; i < NUTRITION_BREADTH_SLIDER_IDS.length; i++) {
      const id = NUTRITION_BREADTH_SLIDER_IDS[i];
      if (!shouldSkipBreadthSlider(id, ctx)) {
        return i;
      }
    }
    return -1;
  }

  for (let i = fromIndex - 1; i >= 0; i--) {
    const id = NUTRITION_BREADTH_SLIDER_IDS[i];
    if (!shouldSkipBreadthSlider(id, ctx)) {
      return i;
    }
  }
  return -1;
}

export function firstBreadthIndex(ctx: DietContext): number {
  return nextBreadthIndex(-1, ctx, "forward");
}

export function lastBreadthIndex(ctx: DietContext): number {
  return nextBreadthIndex(NUTRITION_BREADTH_SLIDER_IDS.length, ctx, "backward");
}

/** Alle slider-ids die nu skipped zijn (voor GA4 dedupe). */
export function getCurrentlySkippedIds(ctx: DietContext): string[] {
  const ids: string[] = [];
  for (const id of NUTRITION_CORE_SLIDER_IDS_AFTER_DIET) {
    if (shouldSkipSlider(id, ctx)) {
      ids.push(id);
    }
  }
  if (shouldSkipBreadthSlider("wholegrain", ctx)) {
    ids.push("wholegrain");
  }
  return ids;
}
