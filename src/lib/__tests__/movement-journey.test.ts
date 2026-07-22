import { describe, expect, it } from "vitest";
import { buildJourneyWaypoints } from "@/lib/movement-journey";

const EMPTY_INPUT = {
  baselineScore: null,
  currentScore: 42,
  hasTrend: false,
  anchorLabel: null,
  anchorWhy: null,
  activeHabitTitle: null,
  activeHabitDetail: null,
};

describe("buildJourneyWaypoints", () => {
  it("geeft bij lege input de juiste locked/todo/current states voor alle 6 waypoints", () => {
    const waypoints = buildJourneyWaypoints(EMPTY_INPUT);

    expect(waypoints).toHaveLength(6);
    expect(waypoints.map((wp) => wp.id)).toEqual([
      "begin",
      "waarom",
      "doel",
      "vandaag",
      "groei",
      "future",
    ]);

    const byId = Object.fromEntries(waypoints.map((wp) => [wp.id, wp]));

    expect(byId.begin.state).toBe("locked");
    expect(byId.begin.title).toBe("Nog geen 0-punt");
    expect(byId.begin.body).toBe("Je eerste hermeting wordt je startpunt.");

    expect(byId.waarom.state).toBe("todo");
    expect(byId.waarom.title).toBe("Kies je waarom");
    expect(byId.waarom.body).toBe(
      "Nog niet gekozen — dit stuurt elke stap die je ziet.",
    );

    expect(byId.doel.state).toBe("todo");
    expect(byId.doel.title).toBe("Nog geen doel gekozen");
    expect(byId.doel.body).toBe(
      "Kies eerst je waarom — dat bepaalt je doel.",
    );

    expect(byId.vandaag.state).toBe("current");
    expect(byId.vandaag.title).toBe("Je stap van vandaag");
    expect(byId.vandaag.body).toBe(
      "Kies je dagkeuze in de hero — hier lees je straks waarom die past bij jouw doel.",
    );

    expect(byId.groei.state).toBe("todo");
    expect(byId.groei.title).toBe("Nog te vroeg voor een lijn");
    expect(byId.groei.body).toBe("Na je eerste hermeting zie je 'm bewegen.");

    expect(byId.future.state).toBe("locked");
    expect(byId.future.title).toBe("Future You");
    expect(byId.future.body).toBe(
      "Kies eerst je waarom — dat bepaalt wie je wordt.",
    );
  });

  it("geeft bij volledige input done/current states met exacte title/body", () => {
    const waypoints = buildJourneyWaypoints({
      baselineScore: 38,
      currentScore: 52,
      hasTrend: true,
      anchorLabel: "Fit genoeg voor de mensen om me heen",
      anchorWhy:
        "Want jij wilt fit genoeg blijven om mee te doen — niet toe te kijken.",
      activeHabitTitle: "Eén krachtsessie",
      activeHabitDetail: "kracht",
    });

    const byId = Object.fromEntries(waypoints.map((wp) => [wp.id, wp]));

    expect(byId.begin.state).toBe("done");
    expect(byId.begin.title).toBe("Hier begon je");
    expect(byId.begin.body).toBe("Je beweegscore was 38 toen je begon.");

    expect(byId.waarom.state).toBe("done");
    expect(byId.waarom.title).toBe("Fit genoeg voor de mensen om me heen");
    expect(byId.waarom.body).toBe(
      "Want jij wilt fit genoeg blijven om mee te doen — niet toe te kijken.",
    );

    expect(byId.doel.state).toBe("done");
    expect(byId.doel.title).toBe("Fit genoeg voor de mensen om me heen");
    expect(byId.doel.body).toBe(
      "Want jij wilt fit genoeg blijven om mee te doen — niet toe te kijken.",
    );

    expect(byId.vandaag.state).toBe("current");
    expect(byId.vandaag.title).toBe("Eén krachtsessie");
    expect(byId.vandaag.body).toBe("kracht");

    expect(byId.groei.state).toBe("done");
    expect(byId.groei.title).toBe("Begin 38 · nu 52");
    expect(byId.groei.body).toBe(
      "Elke stip is een investering die je terugziet bij je volgende meetmoment.",
    );

    expect(byId.future.state).toBe("done");
    expect(byId.future.title).toBe("Future You");
    expect(byId.future.body).toBe(
      "Want jij wilt fit genoeg blijven om mee te doen — niet toe te kijken.",
    );
  });

  it("houdt vandaag altijd op current, ongeacht andere velden", () => {
    const withFull = buildJourneyWaypoints({
      baselineScore: 30,
      currentScore: 55,
      hasTrend: true,
      anchorLabel: "Me sterk en capabel blijven voelen",
      anchorWhy: "Want jij wilt je sterk en capabel blijven voelen.",
      activeHabitTitle: "Wandelen",
      activeHabitDetail: "zone2",
    });
    expect(withFull.find((wp) => wp.id === "vandaag")?.state).toBe("current");

    const withEmpty = buildJourneyWaypoints(EMPTY_INPUT);
    expect(withEmpty.find((wp) => wp.id === "vandaag")?.state).toBe("current");
  });
});
