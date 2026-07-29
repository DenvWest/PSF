import { buildStatistiekenAdviesModel } from "@/lib/statistieken-advies-model";
import type { DashboardData, DashboardModel, StatistiekenBlik } from "@/types/dashboard";

const VALID_STATISTIEKEN_BLIK = new Set<StatistiekenBlik>(["stand", "advies", "tijd"]);

export function isStatistiekenBlik(value: string | null | undefined): value is StatistiekenBlik {
  return value != null && VALID_STATISTIEKEN_BLIK.has(value as StatistiekenBlik);
}

export function resolveDefaultStatistiekenBlik(
  model: DashboardModel,
  data: DashboardData,
): StatistiekenBlik {
  const adviesModel = buildStatistiekenAdviesModel(model, data);
  if (adviesModel.adviesState === "nutrition_missing") {
    return "advies";
  }
  return "stand";
}

export const STATISTIEKEN_BLIK_LABELS: Record<StatistiekenBlik, string> = {
  stand: "Stand",
  advies: "Advies",
  tijd: "Over tijd",
};

export const STATISTIEKEN_BLIK_HEADERS: Record<
  StatistiekenBlik,
  { eyebrow: string; title: string; body: string }
> = {
  stand: {
    eyebrow: "Stand van zaken",
    title: "Waar sta je?",
    body: "Op basis van je laatste check — en hoe recent je domeinen zijn gemeten.",
  },
  advies: {
    eyebrow: "Stap voor stap",
    title: "Wat betekent dat?",
    body: "Eerst je bord, dan ons oordeel, dan welk potje past.",
  },
  tijd: {
    eyebrow: "Beweging",
    title: "Beweegt het?",
    body: "Je lijn per domein, prioriteit over checks en je historie.",
  },
};
