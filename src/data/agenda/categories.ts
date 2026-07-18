import { PILLAR } from "@/data/dashboard";
import type { AgendaCategoryDef, AgendaCategoryId } from "@/types/agenda";

const INTERVENTION_CATEGORIES: AgendaCategoryDef[] = (
  ["slaap", "stress", "voeding", "beweging", "verbinding"] as const
).map((pillarId) => {
  const pillar = PILLAR[pillarId];
  return {
    id: pillarId,
    label: pillar.label,
    color: pillar.color,
    icon: pillar.icon,
    selectable: true,
    pillarId,
  };
});

const ROUTINE_CATEGORIES: AgendaCategoryDef[] = [
  {
    id: "supplementen",
    label: "Supplementen",
    color: "#6B8E6B",
    icon: "Pill",
    selectable: true,
  },
  {
    id: "water",
    label: "Water drinken",
    color: "#4A8A99",
    icon: "Leaf",
    selectable: true,
  },
  {
    id: "medicatie",
    label: "Medicatie",
    color: "#8B6E99",
    icon: "Pill",
    selectable: true,
  },
  {
    id: "werk",
    label: "Werk",
    color: "#78716c",
    icon: "Briefcase",
    selectable: true,
  },
  {
    id: "ontspanning",
    label: "Ontspanning",
    color: "#5B6EAE",
    icon: "Spark",
    selectable: true,
  },
  {
    id: "persoonlijke_routine",
    label: "Persoonlijke routine",
    color: "#C4873B",
    icon: "Clock",
    selectable: true,
  },
];

export const AGENDA_CATEGORIES: AgendaCategoryDef[] = [
  ...INTERVENTION_CATEGORIES,
  ...ROUTINE_CATEGORIES,
];

export const AGENDA_CATEGORY_MAP: Record<AgendaCategoryId, AgendaCategoryDef> =
  Object.fromEntries(AGENDA_CATEGORIES.map((category) => [category.id, category])) as Record<
    AgendaCategoryId,
    AgendaCategoryDef
  >;

export const SELECTABLE_AGENDA_CATEGORIES = AGENDA_CATEGORIES.filter(
  (category) => category.selectable,
);

export function isAgendaCategoryId(value: string): value is AgendaCategoryId {
  return value in AGENDA_CATEGORY_MAP;
}

export function getAgendaCategory(id: AgendaCategoryId): AgendaCategoryDef {
  return AGENDA_CATEGORY_MAP[id];
}
