/**
 * Compacte sessie-catalogus voor het beweegplan — uitbreidbaar zonder planner-engine.
 * Read-only weergave; uitvoering blijft via VANDAAG-hero (daily-log).
 */

export type MovementSessionVariantId =
  | "kracht-thuis"
  | "kracht-sportschool"
  | "conditie-wandelen"
  | "conditie-zone2"
  | "dagelijks-ritme";

export type MovementSessionCatalogEntry = {
  id: MovementSessionVariantId;
  label: string;
  goal: string;
  durationMin: string;
  frequency: string;
  intensity: string;
  /** Globale opbouw — geen volledige oefeningendatabase. */
  structure: string;
  detailStatus: "ready" | "coming_soon";
};

export const MOVEMENT_SESSION_CATALOG: readonly MovementSessionCatalogEntry[] = [
  {
    id: "kracht-thuis",
    label: "Kracht thuis",
    goal: "Spierbehoud en functionele kracht zonder sportschool",
    durationMin: "20–45 min",
    frequency: "1–2× per week",
    intensity: "Matig — techniek eerst",
    structure: "Squat/goblet, push, pull, hip hinge — 2–3 sets × 8–12",
    detailStatus: "ready",
  },
  {
    id: "kracht-sportschool",
    label: "Kracht sportschool",
    goal: "Structureel full-body trainen met apparatuur",
    durationMin: "45 min",
    frequency: "2× per week",
    intensity: "Matig — rust 48–72 u tussen sessies",
    structure: "Full-body: compound-oefeningen, 2–3 sets × 8–12",
    detailStatus: "coming_soon",
  },
  {
    id: "conditie-wandelen",
    label: "Stevig wandelen",
    goal: "Conditie opbouwen zonder je herstel te slopen",
    durationMin: "20–30 min",
    frequency: "2–3× per week",
    intensity: "Matig — praten-nog-lukt test",
    structure: "Warm-up 5 min · stevig tempo · afkoelen 5 min",
    detailStatus: "ready",
  },
  {
    id: "conditie-zone2",
    label: "Zone 2",
    goal: "Aerobe basis voor langdurige energie",
    durationMin: "30 min",
    frequency: "2× per week",
    intensity: "Matig — hartslag rustig, adem onder controle",
    structure: "Fietsen, wandelen of roeien — constant matig tempo",
    detailStatus: "ready",
  },
  {
    id: "dagelijks-ritme",
    label: "Dagelijks ritme",
    goal: "Minder zitten, meer bewegen door je dag",
    durationMin: "3–10 min per snack",
    frequency: "Dagelijks",
    intensity: "Licht — onderbrekingen tellen mee",
    structure: "Trap, blokje om, 10 squats, schoudermobiliteit",
    detailStatus: "ready",
  },
] as const;

export function getMovementSessionCatalogEntry(
  id: MovementSessionVariantId,
): MovementSessionCatalogEntry | undefined {
  return MOVEMENT_SESSION_CATALOG.find((entry) => entry.id === id);
}

/** Map startspoor + profiel naar aanbevolen catalogus-variant. */
export function resolveRecommendedSessionVariant(input: {
  startPattern: "kracht" | "conditie" | "dagelijks_ritme" | null;
  movStr: number | undefined;
  preferredSport: MovementSport | null;
}): MovementSessionVariantId {
  if (input.startPattern === "dagelijks_ritme") {
    return "dagelijks-ritme";
  }
  if (input.startPattern === "conditie") {
    return input.movStr != null && input.movStr >= 3 ? "conditie-zone2" : "conditie-wandelen";
  }
  if (input.preferredSport === "sportschool") {
    return "kracht-sportschool";
  }
  return "kracht-thuis";
}

export type MovementSport =
  | "thuis"
  | "sportschool"
  | "wandelen"
  | "fietsen"
  | "zwemmen";

export const MOVEMENT_SPORT_OPTIONS: readonly {
  id: MovementSport;
  label: string;
}[] = [
  { id: "thuis", label: "Kracht thuis" },
  { id: "sportschool", label: "Sportschool" },
  { id: "wandelen", label: "Wandelen / hardlopen" },
  { id: "fietsen", label: "Fietsen" },
  { id: "zwemmen", label: "Zwemmen" },
] as const;

export type MovementWeeklyFrequency = "1x" | "2x" | "3x";

export const MOVEMENT_FREQUENCY_OPTIONS: readonly {
  id: MovementWeeklyFrequency;
  label: string;
}[] = [
  { id: "1x", label: "1× per week" },
  { id: "2x", label: "2× per week" },
  { id: "3x", label: "3× per week" },
] as const;
