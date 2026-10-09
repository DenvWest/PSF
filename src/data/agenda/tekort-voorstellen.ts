import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { AgendaCategoryId } from "@/types/agenda";

export type TekortVoorstelDef = {
  title: string;
  categoryId: AgendaCategoryId;
  startTime: string;
  endTime: string;
  moment: string;
};

export const TEKORT_VOORSTELLEN: Partial<Record<NutrientId, TekortVoorstelDef>> = {
  omega3: {
    title: "Vette vis bij het avondeten (zalm, makreel of haring)",
    categoryId: "voeding",
    startTime: "18:00",
    endTime: "18:30",
    moment: "avond",
  },
  magnesium: {
    title: "Noten, zaden of peulvruchten bij de lunch",
    categoryId: "voeding",
    startTime: "12:30",
    endTime: "12:45",
    moment: "middag",
  },
  protein: {
    title: "Eiwitbron bij het ontbijt (ei, kwark of skyr)",
    categoryId: "voeding",
    startTime: "08:00",
    endTime: "08:15",
    moment: "ochtend",
  },
};
