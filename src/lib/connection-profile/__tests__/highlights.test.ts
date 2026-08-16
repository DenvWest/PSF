import { describe, expect, it } from "vitest";
import {
  isProfileUsable,
  resolveConnectionStyle,
  resolveProfileHighlights,
} from "@/lib/connection-profile/highlights";
import {
  EMPTY_CONNECTION_PROFILE,
  type ConnectionProfile,
} from "@/lib/connection-profile/types";

function profile(overrides: Partial<ConnectionProfile>): ConnectionProfile {
  return { ...EMPTY_CONNECTION_PROFILE, ...overrides };
}

describe("resolveProfileHighlights", () => {
  it("geeft de gekozen onderwerpen terug als zichtbare verantwoording", () => {
    const result = resolveProfileHighlights(
      profile({ interests: ["buiten_natuur", "klussen_techniek", "koken_voeding"] }),
    );

    expect(result.topics.map((chip) => chip.label)).toEqual([
      "Buiten & natuur",
      "Klussen & techniek",
      "Koken & eten",
    ]);
  });

  it("kort de onderwerpen niet af — het scherm bepaalt hoeveel het toont", () => {
    const result = resolveProfileHighlights(
      profile({
        interests: ["buiten_natuur", "klussen_techniek", "koken_voeding", "muziek", "reizen"],
      }),
    );

    expect(result.topics).toHaveLength(5);
  });

  it("geeft brengen en ontdekken apart terug", () => {
    const result = resolveProfileHighlights(
      profile({ brengen: ["klussen_techniek"], ontdekken: ["koken_voeding"] }),
    );

    expect(result.brengen.map((chip) => chip.id)).toEqual(["klussen_techniek"]);
    expect(result.ontdekken.map((chip) => chip.id)).toEqual(["koken_voeding"]);
  });

  it("kiest de vlakken die bij de gekozen verbindingsvorm horen", () => {
    const result = resolveProfileHighlights(profile({ vorm: ["een_op_een"] }));

    expect(result.ways.map((way) => way.id)).toEqual([4]);
  });

  it("valt terug op de bovenste vlakken zonder vormkeuze", () => {
    const result = resolveProfileHighlights(profile({ vorm: [] }));

    expect(result.ways.map((way) => way.id)).toEqual([1, 2]);
  });

  it("negeert 'maakt niet uit' als sturende vorm", () => {
    const result = resolveProfileHighlights(profile({ vorm: ["maakt_niet_uit"] }));

    expect(result.ways.map((way) => way.id)).toEqual([1, 2]);
  });

  it("haakt de eerste stap aan een activiteit die iemand al doet", () => {
    const result = resolveProfileHighlights(profile({ doet: ["wandelen"] }));

    expect(result.firstStep?.body).toContain("wandelen");
    expect(result.firstStep?.title).toBe("Samen iets doen");
  });

  it("stuurt naar een vast moment als er nog geen ritme is", () => {
    const result = resolveProfileHighlights(profile({ doet: ["niets_vasts"] }));

    expect(result.firstStep?.title).toBe("Vast moment in je week");
  });

  it("behandelt een leeg doet-veld als 'nog geen ritme'", () => {
    const result = resolveProfileHighlights(profile({ doet: [] }));

    expect(result.firstStep?.title).toBe("Vast moment in je week");
  });

  it("zet het gekozen tijdvak in de eerste stap — een dag maakt er een afspraak van", () => {
    const result = resolveProfileHighlights(
      profile({ doet: ["fietsen"], beschikbaarheid: ["zaterdag"] }),
    );

    expect(result.firstStep?.body).toContain("zaterdag");
  });

  it("laat de eerste stap zonder tijdvak heel", () => {
    const result = resolveProfileHighlights(profile({ doet: ["fietsen"] }));

    expect(result.firstStep?.body).not.toContain("Zet het op");
  });

  it("leidt contentpijlers af uit ontdekken vóór interesses", () => {
    const result = resolveProfileHighlights(
      profile({ interests: ["gezondheid_leefstijl"], ontdekken: ["koken_voeding"] }),
    );

    expect(result.contentPillars).toEqual(["voeding", "herstel"]);
  });

  it("levert geen contentpijlers bij onderwerpen zonder bibliotheek", () => {
    const result = resolveProfileHighlights(
      profile({ interests: ["fotografie", "geschiedenis", "muziek"] }),
    );

    expect(result.contentPillars).toEqual([]);
  });

  /**
   * De harde eis uit §6: de opbrengst mag nergens van andere gebruikers
   * afhangen. Een profiel dat pas iets oplevert bij genoeg anderen is een leeg
   * formulier met een belofte.
   */
  it("levert een volledige opbrengst op met alleen het eigen profiel", () => {
    const result = resolveProfileHighlights(
      profile({ interests: ["muziek"], vorm: ["samen_doen"], doet: ["koken"] }),
    );

    expect(result.topics.length).toBeGreaterThan(0);
    expect(result.ways.length).toBeGreaterThan(0);
    expect(result.firstStep).not.toBeNull();
  });

  it("belooft nergens iets over later, matching of community", () => {
    const result = resolveProfileHighlights(
      profile({
        interests: ["muziek"],
        vorm: ["samen_doen"],
        doet: ["koken"],
        beschikbaarheid: ["zondag"],
      }),
    );

    const rendered = [
      ...result.topics.map((chip) => chip.label),
      ...result.ways.flatMap((way) => [way.name, way.subtitle]),
      result.firstStep?.title ?? "",
      result.firstStep?.body ?? "",
      result.style.formLabel ?? "",
      result.style.timeLabel ?? "",
    ]
      .join(" ")
      .toLowerCase();

    for (const forbidden of ["binnenkort", "later", "matching", "community"]) {
      expect(rendered).not.toContain(forbidden);
    }
  });
});

describe("resolveConnectionStyle", () => {
  it("noemt het weekend eerst wanneer iemand meerdere blokken aanvinkt", () => {
    const style = resolveConnectionStyle(
      profile({ beschikbaarheid: ["doordeweeks_overdag", "zondag"] }),
    );

    expect(style.timeLabel).toBe("zondag");
  });

  it("kiest 'samen iets doen' boven een groepsvorm", () => {
    const style = resolveConnectionStyle(profile({ vorm: ["grotere_groep", "samen_doen"] }));

    expect(style.formLabel).toBe("samen iets doen");
  });

  it("laat 'maakt me niet uit' de vorm niet sturen", () => {
    const style = resolveConnectionStyle(profile({ vorm: ["maakt_niet_uit"] }));

    expect(style.formLabel).toBeNull();
  });

  it("neemt geen bereik aan wanneer iemand lokaal én online koos", () => {
    const style = resolveConnectionStyle(profile({ vorm: ["lokaal_ontmoeten", "online"] }));

    expect(style.reach).toBeNull();
  });

  it("geeft het bereik terug bij een eenduidige keuze", () => {
    expect(resolveConnectionStyle(profile({ vorm: ["online"] })).reach).toBe("online");
    expect(resolveConnectionStyle(profile({ vorm: ["lokaal_ontmoeten"] })).reach).toBe(
      "lokaal",
    );
  });

  it("gebruikt 'niets vasts' nooit als anker", () => {
    const style = resolveConnectionStyle(profile({ doet: ["niets_vasts"] }));

    expect(style.anchorLabel).toBeNull();
  });
});

describe("isProfileUsable", () => {
  it("vraagt minimaal één interesse", () => {
    expect(isProfileUsable(EMPTY_CONNECTION_PROFILE)).toBe(false);
    expect(isProfileUsable(profile({ interests: ["muziek"] }))).toBe(true);
  });
});
