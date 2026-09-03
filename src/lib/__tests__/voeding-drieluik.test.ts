import { describe, expect, it } from "vitest";
import type { WerkbankPrioriteit } from "@/lib/domein-werkbank";
import {
  bouwDrieluik,
  DRIELUIK,
  kiesStartKnop,
  stapVoorLaag,
} from "@/lib/voeding-drieluik";

function prioriteit(
  id: number,
  overrides: Partial<WerkbankPrioriteit> = {},
): WerkbankPrioriteit {
  return {
    id,
    naam: `laag ${id}`,
    samenvatting: "",
    staat: null,
    feiten: 0,
    isWinst: false,
    ...overrides,
  };
}

describe("voeding-drieluik", () => {
  it("zet meten vooraan, want daar vul je in", () => {
    expect(DRIELUIK.map((stap) => stap.id)).toEqual(["meten", "basis", "aanvullen"]);
    expect(DRIELUIK[0].lagen).toEqual([5]);
  });

  it("bundelt de basis-, kwaliteits- en situatielaag onder één knop", () => {
    expect(stapVoorLaag(1)?.id).toBe("basis");
    expect(stapVoorLaag(2)?.id).toBe("basis");
    expect(stapVoorLaag(4)?.id).toBe("basis");
  });

  /**
   * Verhoudingen (laag 3) is de enige laag zonder knop. Deze test is de vangnet
   * voor wie hem later terugzet: dan moet hij hier een plek krijgen, niet
   * stilletjes onvindbaar worden.
   */
  it("toont de verhoudingenlaag niet meer", () => {
    expect(stapVoorLaag(3)).toBeNull();
  });

  it("laat de zwaarste staat van drie lagen de knop bepalen", () => {
    const knoppen = bouwDrieluik([
      prioriteit(1, { staat: "ok" }),
      prioriteit(2, { staat: "winst" }),
      prioriteit(4, { staat: "wacht" }),
    ]);
    expect(knoppen.find((knop) => knop.id === "basis")?.staat).toBe("winst");
  });

  it("negeert lege staten bij het samenvoegen", () => {
    const knoppen = bouwDrieluik([
      prioriteit(1, { staat: null }),
      prioriteit(2, { staat: "watch" }),
      prioriteit(4, { staat: null }),
    ]);
    expect(knoppen.find((knop) => knop.id === "basis")?.staat).toBe("watch");
  });

  it("telt de feiten van alle gebundelde lagen op", () => {
    const knoppen = bouwDrieluik([
      prioriteit(1, { feiten: 4 }),
      prioriteit(2, { feiten: 3 }),
      prioriteit(3, { feiten: 9 }),
      prioriteit(4, { feiten: 2 }),
    ]);
    // Laag 3 telt niet mee: hij wordt niet getoond.
    expect(knoppen.find((knop) => knop.id === "basis")?.feiten).toBe(9);
  });

  it("erft de winst-vlag van elke laag eronder", () => {
    const knoppen = bouwDrieluik([
      prioriteit(1, { isWinst: false }),
      prioriteit(4, { isWinst: true }),
    ]);
    expect(knoppen.find((knop) => knop.id === "basis")?.isWinst).toBe(true);
  });

  it("opent een deeplink naar een gebundelde laag op de knop die hem draagt", () => {
    const knoppen = bouwDrieluik([prioriteit(1), prioriteit(4), prioriteit(5), prioriteit(6)]);
    expect(kiesStartKnop({ urlLayer: 4, knoppen })).toBe("basis");
    expect(kiesStartKnop({ urlLayer: 6, knoppen })).toBe("aanvullen");
  });

  it("opent zonder deeplink op meten & timing", () => {
    const knoppen = bouwDrieluik([prioriteit(5), prioriteit(1)]);
    expect(kiesStartKnop({ urlLayer: null, knoppen })).toBe("meten");
  });

  it("valt terug op de eerste knop bij een deeplink naar een laag zonder knop", () => {
    const knoppen = bouwDrieluik([prioriteit(5), prioriteit(1)]);
    expect(kiesStartKnop({ urlLayer: 3, knoppen })).toBe("meten");
  });
});
