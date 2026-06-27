import type { NutritionIntakeBand } from "@/types/dashboard";

export const NUTRITION_BAND: Record<
  NutritionIntakeBand,
  { label: string; color: string }
> = {
  below: { label: "Aan de lage kant", color: "var(--terra)" },
  around: { label: "Geen aandachtspunt", color: "var(--text-muted)" },
  meets: { label: "Geen aandachtspunt", color: "var(--text-muted)" },
};

export const NUTRITION_BAND_SHORT: Record<NutritionIntakeBand, string> = {
  below: "Laag",
  around: "OK",
  meets: "OK",
};
