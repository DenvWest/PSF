import { describe, expect, it } from "vitest";
import {
  aanbevelingOriginLine,
  buildKompasAanbevelingen,
  rotateLadderAction,
  weekIndexFromDate,
} from "@/lib/kompas-aanbeveling";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { DashboardData } from "@/types/dashboard";

const KRACHT_ROW = {
  key: "kracht",
  label: "Kracht",
  answerLabel: "1× per week",
  benchmarkLabel: "Richtlijn: 2× per week",
  benchmarkSource: "WHO 2020",
  status: "below",
  whyLine: "Richtlijn is 2× per week; jij zit daar nu onder.",
  footnote: null,
};

function movementData(focus = 2, daysAgo = 2): DashboardData {
  return {
    domainCheckDaysAgo: { beweging: daysAgo },
    movementCheckinSnapshot: {
      date: "2026-08-23",
      headline: "Je kracht is het deel dat nu achterblijft.",
      focusDimension: "kracht",
      focusLabel: "Kracht",
      answerLabel: "1× per week",
      focusStatement: "",
      implicationLine: "",
      ladder: {
        focus,
        states: { 1: "ok", 2: "winst", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
        coverage: { onOrder: 1, measured: 3 },
      },
      factRows: [KRACHT_ROW],
    },
  } as unknown as DashboardData;
}

describe("weekIndexFromDate", () => {
  it("telt door over de jaargrens heen, zonder terug te springen", () => {
    const oud = weekIndexFromDate("2026-12-28");
    const nieuw = weekIndexFromDate("2027-01-04");
    expect(nieuw).toBe(oud + 1);
  });

  it("geeft dezelfde index binnen één week en een hogere de week erna", () => {
    const maandag = weekIndexFromDate("2026-08-24");
    expect(weekIndexFromDate("2026-08-26")).toBe(maandag);
    expect(weekIndexFromDate("2026-08-31")).toBe(maandag + 1);
  });

  it("valt terug op 0 bij een onleesbare datum", () => {
    expect(weekIndexFromDate("geen-datum")).toBe(0);
  });
});

describe("rotateLadderAction", () => {
  const acties = ["een", "twee", "drie"];

  it("wisselt per week en loopt rond", () => {
    expect(rotateLadderAction(acties, 0)).toBe("een");
    expect(rotateLadderAction(acties, 1)).toBe("twee");
    expect(rotateLadderAction(acties, 2)).toBe("drie");
    expect(rotateLadderAction(acties, 3)).toBe("een");
  });

  it("blijft binnen de lijst bij een negatieve index", () => {
    expect(rotateLadderAction(acties, -1)).toBe("drie");
  });

  it("geeft altijd dezelfde actie als de laag er maar één heeft", () => {
    expect(rotateLadderAction(["enige"], 0)).toBe("enige");
    expect(rotateLadderAction(["enige"], 7)).toBe("enige");
  });

  it("geeft null bij een laag zonder acties", () => {
    expect(rotateLadderAction([], 3)).toBeNull();
  });
});

describe("buildKompasAanbevelingen", () => {
  it("neemt de winst-laag uit de check en noemt de herkomst", () => {
    const rows = buildKompasAanbevelingen("beweging", movementData(2), 0);
    const beweging = rows.find((row) => row.domain === "beweging")!;

    expect(beweging.layerId).toBe(2);
    expect(beweging.origin).toEqual({ kind: "check", checkNoun: "beweegcheck", daysAgo: 2 });
    expect(beweging.stateLabel).not.toBeNull();
    expect(beweging.isPriority).toBe(true);
  });

  it("houdt de laag vast terwijl de actie per week wisselt", () => {
    const layer = getLeefstijlLadder("beweging")!.layers.find((row) => row.id === 2)!;
    const weekA = buildKompasAanbevelingen("beweging", movementData(2), 0)[0]!;
    const weekB = buildKompasAanbevelingen("beweging", movementData(2), 1)[0]!;

    expect(weekA.layerId).toBe(2);
    expect(weekB.layerId).toBe(2);
    if (layer.actions.length > 1) {
      expect(weekB.action).not.toBe(weekA.action);
    }
    expect(layer.actions).toContain(weekA.action);
    expect(layer.actions).toContain(weekB.action);
  });

  it("geeft voeding en verbinding nu wél een aanbeveling, op laag 1", () => {
    const rows = buildKompasAanbevelingen("voeding", undefined, 0);
    const voeding = rows.find((row) => row.domain === "voeding")!;
    const verbinding = rows.find((row) => row.domain === "verbinding")!;

    expect(voeding.layerId).toBe(1);
    expect(voeding.origin).toEqual({ kind: "ladder" });
    expect(verbinding.layerId).toBe(1);
    expect(verbinding.origin).toEqual({ kind: "ladder" });
  });

  it("verzint geen staat waar de check er geen levert", () => {
    const rows = buildKompasAanbevelingen("voeding", undefined, 0);
    for (const row of rows) {
      expect(row.stateLabel).toBeNull();
    }
  });

  it("valt terug op laag 1 zolang een domein met check nog niet gemeten is", () => {
    const rows = buildKompasAanbevelingen("beweging", undefined, 0);
    const beweging = rows.find((row) => row.domain === "beweging")!;

    expect(beweging.layerId).toBe(1);
    expect(beweging.origin).toEqual({ kind: "ladder" });
  });

  it("zet het prioriteitsdomein vooraan en markeert alleen die", () => {
    const rows = buildKompasAanbevelingen("stress", undefined, 0);

    expect(rows[0]?.domain).toBe("stress");
    expect(rows.filter((row) => row.isPriority)).toHaveLength(1);
  });

  it("levert alle vijf de laddderdomeinen, ook zonder enige check", () => {
    const rows = buildKompasAanbevelingen("slaap", undefined, 0);
    expect(rows.map((row) => row.domain).sort()).toEqual(
      ["beweging", "slaap", "stress", "verbinding", "voeding"],
    );
  });

  it("zet het analyse-domein vóór je focus als die uiteenlopen", () => {
    // Focus staat handmatig op beweging, de analyse wijst stress aan.
    const rows = buildKompasAanbevelingen("beweging", undefined, 0, "stress");

    expect(rows[0]?.domain).toBe("stress");
    expect(rows[0]?.isEngineAdvice).toBe(true);
    expect(rows[0]?.isPriority).toBe(false);

    const beweging = rows.find((row) => row.domain === "beweging")!;
    expect(beweging.isPriority).toBe(true);
    expect(beweging.isEngineAdvice).toBe(false);

    // Geen domein raakt kwijt of dubbel door het voorop zetten.
    expect(rows).toHaveLength(5);
    expect(new Set(rows.map((row) => row.domain)).size).toBe(5);
  });

  it("houdt één kaart bovenaan als focus en analyse hetzelfde domein zijn", () => {
    const rows = buildKompasAanbevelingen("voeding", undefined, 0, "voeding");

    expect(rows[0]?.domain).toBe("voeding");
    expect(rows[0]?.isPriority).toBe(true);
    expect(rows[0]?.isEngineAdvice).toBe(true);
    expect(rows.filter((row) => row.isEngineAdvice)).toHaveLength(1);
  });

  it("valt terug op je focus zonder analyse-domein", () => {
    const rows = buildKompasAanbevelingen("stress", undefined, 0);

    expect(rows[0]?.domain).toBe("stress");
    expect(rows.some((row) => row.isEngineAdvice)).toBe(false);
  });

  it("geeft elke rij het favoriet-id dat de ladder er ook aan geeft", () => {
    const rows = buildKompasAanbevelingen("voeding", undefined, 0);
    const voeding = rows.find((row) => row.domain === "voeding")!;
    expect(voeding.itemId).toMatch(/^laag-voeding-p1-/);
  });
});

describe("aanbevelingOriginLine", () => {
  it("noemt de check en hoe vers hij is", () => {
    expect(aanbevelingOriginLine({ kind: "check", checkNoun: "beweegcheck", daysAgo: 0 })).toBe(
      "Uit je beweegcheck van vandaag.",
    );
    expect(aanbevelingOriginLine({ kind: "check", checkNoun: "beweegcheck", daysAgo: 1 })).toBe(
      "Uit je beweegcheck van gisteren.",
    );
    expect(aanbevelingOriginLine({ kind: "check", checkNoun: "slaapcheck", daysAgo: 4 })).toBe(
      "Uit je slaapcheck van 4 dagen geleden.",
    );
    expect(aanbevelingOriginLine({ kind: "check", checkNoun: "slaapcheck", daysAgo: null })).toBe(
      "Uit je slaapcheck.",
    );
  });

  it("doet zonder check niet alsof er gemeten is", () => {
    const line = aanbevelingOriginLine({ kind: "ladder" });
    expect(line).toBe("Nog niet apart gemeten — dit is de basis van je ladder.");
    expect(line).not.toMatch(/check/i);
  });
});
