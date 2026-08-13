import { describe, expect, it } from "vitest";
import {
  isProfileUsable,
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

    expect(result.topics).toEqual(["Buiten & natuur", "Klussen & techniek", "Koken & eten"]);
  });

  it("toont hooguit drie onderwerpen", () => {
    const result = resolveProfileHighlights(
      profile({
        interests: ["buiten_natuur", "klussen_techniek", "koken_voeding", "muziek", "reizen"],
      }),
    );

    expect(result.topics).toHaveLength(3);
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
      profile({ interests: ["muziek"], vorm: ["samen_doen"], doet: ["koken"] }),
    );

    const rendered = [
      ...result.topics,
      ...result.ways.flatMap((way) => [way.name, way.subtitle]),
      result.firstStep?.title ?? "",
      result.firstStep?.body ?? "",
    ]
      .join(" ")
      .toLowerCase();

    for (const forbidden of ["binnenkort", "later", "matching", "community"]) {
      expect(rendered).not.toContain(forbidden);
    }
  });
});

describe("isProfileUsable", () => {
  it("vraagt minimaal één interesse", () => {
    expect(isProfileUsable(EMPTY_CONNECTION_PROFILE)).toBe(false);
    expect(isProfileUsable(profile({ interests: ["muziek"] }))).toBe(true);
  });
});
