/**
 * Waypoint-rail voor beweeg-cockpit: 5 waypoints (waarom verviel als duplicaat).
 * Positie is display-only — lock 5: niemand schrijft "hoe ver ben ik".
 */

export type JourneyWaypointId = "begin" | "doel" | "vandaag" | "pijn" | "future";

export type JourneyWaypointState = "done" | "current" | "todo" | "locked" | "pain";

export type JourneyWaypoint = {
  id: JourneyWaypointId;
  label: string;
  state: JourneyWaypointState;
  /** Bron-label zoals in het prototype (baseline, anker, …). */
  sourceLabel: string;
  title: string;
  body: string;
};

export type JourneyInput = {
  baselineScore: number | null;
  currentScore: number;
  hasTrend: boolean;
  anchorLabel: string | null;
  anchorWhy: string | null;
  capabilityStatement: string | null;
  activeHabitTitle: string | null;
  activeHabitDetail: string | null;
  goalProgress: string | null;
};

export function buildJourneyWaypoints(input: JourneyInput): JourneyWaypoint[] {
  const {
    baselineScore,
    currentScore: _currentScore,
    hasTrend,
    anchorLabel,
    anchorWhy,
    capabilityStatement,
    activeHabitTitle,
    activeHabitDetail,
    goalProgress,
  } = input;

  const beginDone = baselineScore != null;
  const anchorDone = anchorLabel != null;

  return [
    {
      id: "begin",
      label: "Hier begon je",
      state: beginDone ? "done" : "locked",
      sourceLabel: "baseline",
      title: beginDone ? "Hier begon je" : "Nog geen 0-punt",
      body: beginDone
        ? `Je beweegscore was ${baselineScore} toen je begon.`
        : "Je eerste hermeting wordt je startpunt.",
    },
    {
      id: "doel",
      label: "Jouw doel",
      state: anchorDone ? "done" : "todo",
      sourceLabel: "anker",
      title: anchorDone ? anchorLabel : "Nog geen doel gekozen",
      body: anchorDone
        ? (anchorWhy ?? "Dit is waar je plan naartoe werkt.")
        : "Kies je waarom — dat bepaalt je doel.",
    },
    {
      id: "vandaag",
      label: "Vandaag",
      state: "current",
      sourceLabel: "daily-log + fase",
      title: activeHabitTitle ?? "Je stap van vandaag",
      body:
        activeHabitDetail ??
        "Kies je dagkeuze in Overzicht — hier lees je waarom die past bij jouw doel.",
    },
    {
      id: "pijn",
      label: "Nog niet",
      state: "pain",
      sourceLabel: "anker + check-in",
      title: "Nog niet",
      body:
        capabilityStatement ??
        "Wat je wilt maar nog niet lukt — herkenning, geen diagnose.",
    },
    {
      id: "future",
      label: "Future You",
      state: hasTrend || goalProgress ? "done" : "locked",
      sourceLabel: "trend + doel",
      title: "Future You",
      body:
        goalProgress ??
        (anchorWhy
          ? anchorWhy
          : "Kies eerst je waarom — dat bepaalt wie je wordt."),
    },
  ];
}
