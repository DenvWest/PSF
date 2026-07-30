import { describe, expect, it } from "vitest";
import { buildJourneyWaypoints } from "@/lib/movement-journey";

const EMPTY_INPUT = {
  baselineScore: null,
  currentScore: 42,
  hasTrend: false,
  anchorLabel: null,
  anchorWhy: null,
  capabilityStatement: null,
  activeHabitTitle: null,
  activeHabitDetail: null,
  goalProgress: null,
};

describe("buildJourneyWaypoints", () => {
  it("geeft bij lege input vijf waypoints met pijn-deel", () => {
    const waypoints = buildJourneyWaypoints(EMPTY_INPUT);

    expect(waypoints).toHaveLength(5);
    expect(waypoints.map((wp) => wp.id)).toEqual([
      "begin",
      "doel",
      "vandaag",
      "pijn",
      "future",
    ]);

    const byId = Object.fromEntries(waypoints.map((wp) => [wp.id, wp]));

    expect(byId.begin.state).toBe("locked");
    expect(byId.doel.state).toBe("todo");
    expect(byId.vandaag.state).toBe("current");
    expect(byId.pijn.state).toBe("pain");
    expect(byId.future.state).toBe("locked");
  });

  it("geeft bij volledige input done/current/pain states", () => {
    const waypoints = buildJourneyWaypoints({
      baselineScore: 38,
      currentScore: 52,
      hasTrend: true,
      anchorLabel: "Fit genoeg voor de mensen om me heen",
      anchorWhy:
        "Want jij wilt fit genoeg blijven om mee te doen — niet toe te kijken.",
      capabilityStatement: "De trap op zonder aan de leuning.",
      activeHabitTitle: "Eén krachtsessie",
      activeHabitDetail: "kracht",
      goalProgress: "Op weg: 52/100. Hermeting over 19 dagen.",
    });

    const byId = Object.fromEntries(waypoints.map((wp) => [wp.id, wp]));

    expect(byId.begin.state).toBe("done");
    expect(byId.doel.state).toBe("done");
    expect(byId.vandaag.state).toBe("current");
    expect(byId.pijn.state).toBe("pain");
    expect(byId.pijn.body).toBe("De trap op zonder aan de leuning.");
    expect(byId.future.state).toBe("done");
    expect(byId.future.body).toContain("Op weg: 52/100");
  });

  it("houdt vandaag altijd op current", () => {
    const withFull = buildJourneyWaypoints({
      baselineScore: 30,
      currentScore: 55,
      hasTrend: true,
      anchorLabel: "Me sterk en capabel blijven voelen",
      anchorWhy: "Want jij wilt je sterk en capabel blijven voelen.",
      capabilityStatement: "Lang staan zonder pauze.",
      activeHabitTitle: "Wandelen",
      activeHabitDetail: "zone2",
      goalProgress: "Op weg: 55/100",
    });
    expect(withFull.find((wp) => wp.id === "vandaag")?.state).toBe("current");

    const withEmpty = buildJourneyWaypoints(EMPTY_INPUT);
    expect(withEmpty.find((wp) => wp.id === "vandaag")?.state).toBe("current");
  });
});
