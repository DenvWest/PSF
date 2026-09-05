import { describe, expect, it } from "vitest";
import {
  buildKompasDomainRows,
  buildCycleLine,
  prioritySegmentIndex,
} from "@/lib/kompas-home";
import { buildModel } from "@/lib/dashboard-model";
import { resolvePlanStepContent } from "@/lib/day-model";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

const scores: CheckScores = {
  slaap: 55,
  energie: 60,
  stress: 50,
  voeding: 45,
  beweging: 38,
  herstel: 67,
  verbinding: 50,
};

const trend: CheckTrend = {
  slaap: [40, 48, 55],
  energie: [50, 55, 60],
  stress: [55, 52, 50],
  voeding: [42, 44, 45],
  beweging: [30, 34, 38],
  herstel: [33, 50, 67],
  verbinding: [50, 50, 50],
};

const answers = {
  SLP_01: 2,
  STR_01: 2,
  NUT_O3: 1,
  MOV_01: 2,
} as Record<string, number>;

describe("buildKompasDomainRows", () => {
  it("returns the visible domains in fixed rail order", () => {
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend },
      null,
      [],
      false,
      answers,
      null,
      null,
    );
    const rows = buildKompasDomainRows(model);

    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.id)).toEqual(KOMPAS_RAIL_PILLAR_IDS);
  });

  it("marks the model priority domain", () => {
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend },
      null,
      [],
      false,
      answers,
      null,
      null,
      "beweging",
    );
    const rows = buildKompasDomainRows(model);

    expect(rows.find((row) => row.id === "beweging")?.isPriority).toBe(true);
    expect(rows.filter((row) => row.isPriority)).toHaveLength(1);
  });

  it("derives delta from trend series", () => {
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend },
      null,
      [],
      false,
      answers,
      null,
      null,
    );
    const beweging = buildKompasDomainRows(model).find((row) => row.id === "beweging");

    expect(beweging?.score).toBe(38);
    expect(beweging?.delta).toBe(8);
  });

  it("returns null delta when fewer than two trend points", () => {
    const singlePointTrend: CheckTrend = {
      ...trend,
      beweging: [38],
    };
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend: singlePointTrend },
      null,
      [],
      false,
      answers,
      null,
      null,
    );
    const beweging = buildKompasDomainRows(model).find((row) => row.id === "beweging");

    expect(beweging?.delta).toBeNull();
  });

  /**
   * De quick-win-fallback werd hier via verbinding getest — het enige domein
   * zonder plan-template. Dat domein staat niet meer in de rail (zie
   * `zichtbare-domeinen.ts`), dus het gedrag wordt getest waar het woont:
   * `resolvePlanStepContent` zelf. Zonder template valt hij terug op de
   * quick-win-copy van de pilaar, ongeacht of dat domein getoond wordt.
   */
  it("falls back to quick-win copy for a domain without a plan template", () => {
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend },
      null,
      [],
      false,
      answers,
      null,
      null,
    );
    const stap = resolvePlanStepContent("verbinding", model, 0);

    expect(stap.title).toBe("Eén contactmoment deze week");
    expect(stap.stepId).toBe("quickwin-verbinding");
  });
});

describe("prioritySegmentIndex", () => {
  it("returns the index of the priority row", () => {
    const rows = buildKompasDomainRows(
      buildModel(
        { scores, vitality: 46, date: "10 jul 2026", trend },
        null,
        [],
        false,
        answers,
        null,
        null,
        "stress",
      ),
    );

    expect(prioritySegmentIndex(rows)).toBe(3);
  });
});

describe("buildCycleLine", () => {
  it("toont dag en actieve dagen tijdens de cyclus", () => {
    expect(
      buildCycleLine({ cycleDay: 12, daysUntilRemeasure: 18, activeDaysInCycle: 8 }),
    ).toBe("Dag 12 van 30 — 8 dagen actief.");
  });

  it("telt af in de laatste week", () => {
    expect(
      buildCycleLine({ cycleDay: 27, daysUntilRemeasure: 3, activeDaysInCycle: 14 }),
    ).toBe("Nog 3 dagen tot je hermeting — 14 dagen actief.");
  });

  it("noemt morgen apart", () => {
    expect(
      buildCycleLine({ cycleDay: 29, daysUntilRemeasure: 1, activeDaysInCycle: 15 }),
    ).toBe("Dag 29 van 30 — morgen is je hermeting (15 dagen actief).");
  });

  it("zwijgt zodra de hermeting klaarstaat", () => {
    expect(
      buildCycleLine({ cycleDay: 30, daysUntilRemeasure: 0, activeDaysInCycle: 16 }),
    ).toBeNull();
    expect(buildCycleLine(null)).toBeNull();
  });

  it("zwijgt zodra de cyclus verlopen is", () => {
    expect(
      buildCycleLine({ cycleDay: 34, daysUntilRemeasure: 2, activeDaysInCycle: 16 }),
    ).toBe("Nog 2 dagen tot je hermeting — 16 dagen actief.");
    expect(
      buildCycleLine({ cycleDay: 34, daysUntilRemeasure: 9, activeDaysInCycle: 16 }),
    ).toBeNull();
  });
});
