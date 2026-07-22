/**
 * Waypoint-rail voor beweeg-cockpit: pure state/copy uit dashboard-data.
 * Vervolg: domein-agnostisch maken (slaap/stress/voeding) — zie BLAUWDRUK_DOMEIN_STAPPENPLANNEN.
 * Waypoint-detail kan later naar CockpitInspector (InspectorCardKind "doel") i.p.v. lokale uitklap.
 * "doel" en "future" krijgen aparte content zodra domein-specifieke Future-You-copy is goedgekeurd.
 */

export type JourneyWaypointId =
  | "begin"
  | "waarom"
  | "doel"
  | "vandaag"
  | "groei"
  | "future";

export type JourneyWaypointState = "done" | "current" | "todo" | "locked";

export type JourneyWaypoint = {
  id: JourneyWaypointId;
  label: string;
  state: JourneyWaypointState;
  title: string;
  body: string;
};

export type JourneyInput = {
  baselineScore: number | null;
  currentScore: number;
  hasTrend: boolean;
  anchorLabel: string | null;
  anchorWhy: string | null;
  activeHabitTitle: string | null;
  activeHabitDetail: string | null;
};

export function buildJourneyWaypoints(input: JourneyInput): JourneyWaypoint[] {
  const {
    baselineScore,
    currentScore,
    hasTrend,
    anchorLabel,
    anchorWhy,
    activeHabitTitle,
    activeHabitDetail,
  } = input;

  const beginDone = baselineScore != null;
  const anchorDone = anchorLabel != null;
  const futureDone = anchorWhy != null;

  return [
    {
      id: "begin",
      label: "Hier begon je",
      state: beginDone ? "done" : "locked",
      title: beginDone ? "Hier begon je" : "Nog geen 0-punt",
      body: beginDone
        ? `Je beweegscore was ${baselineScore} toen je begon.`
        : "Je eerste hermeting wordt je startpunt.",
    },
    {
      id: "waarom",
      label: "Waarom",
      state: anchorDone ? "done" : "todo",
      title: anchorDone ? anchorLabel : "Kies je waarom",
      body: anchorDone
        ? (anchorWhy ?? "")
        : "Nog niet gekozen — dit stuurt elke stap die je ziet.",
    },
    {
      id: "doel",
      label: "Mijn doel",
      state: anchorDone ? "done" : "todo",
      title: anchorDone ? anchorLabel : "Nog geen doel gekozen",
      body: anchorDone
        ? (anchorWhy ?? "")
        : "Kies eerst je waarom — dat bepaalt je doel.",
    },
    {
      id: "vandaag",
      label: "Vandaag",
      state: "current",
      title: activeHabitTitle ?? "Je stap van vandaag",
      body:
        activeHabitDetail ??
        "Kies je dagkeuze in de hero — hier lees je straks waarom die past bij jouw doel.",
    },
    {
      id: "groei",
      label: "Mijn groei",
      state: hasTrend ? "done" : "todo",
      title: hasTrend
        ? `Begin ${baselineScore} · nu ${currentScore}`
        : "Nog te vroeg voor een lijn",
      body: hasTrend
        ? "Elke stip is een investering die je terugziet bij je volgende meetmoment."
        : "Na je eerste hermeting zie je 'm bewegen.",
    },
    {
      id: "future",
      label: "Future You",
      state: futureDone ? "done" : "locked",
      title: "Future You",
      body: futureDone
        ? (anchorWhy ?? "")
        : "Kies eerst je waarom — dat bepaalt wie je wordt.",
    },
  ];
}
