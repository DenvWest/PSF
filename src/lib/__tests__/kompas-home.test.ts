import { describe, expect, it } from "vitest";
import {
  buildKompasDomainRows,
  buildKompasMilestone,
  prioritySegmentIndex,
} from "@/lib/kompas-home";
import { buildModel } from "@/lib/dashboard-model";
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
  it("returns five domains in fixed rail order", () => {
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

    expect(rows).toHaveLength(5);
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

  it("falls back to quick-win copy for verbinding without a plan template", () => {
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend },
      null,
      [],
      false,
      answers,
      null,
      null,
    );
    const verbinding = buildKompasDomainRows(model).find((row) => row.id === "verbinding");

    expect(verbinding?.nextStep).toBe("Eén contactmoment deze week");
    expect(verbinding?.stepId).toBe("quickwin-verbinding");
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

describe("buildKompasMilestone", () => {
  const baseModel = buildModel(
    { scores, vitality: 46, date: "10 jul 2026", trend },
    null,
    [],
    false,
    answers,
    null,
    null,
    "beweging",
  );

  it("skips hermeting due-state on kompas home and falls through to week nudge", () => {
    const milestone = buildKompasMilestone(baseModel, 6);
    expect(milestone.kind).toBe("week");
    expect(milestone.line).toContain("Nog één gewoonte");
  });

  it("shows 30-day cycle progress before hermeting due", () => {
    const milestone = buildKompasMilestone(baseModel, 7, {
      cycleDay: 12,
      daysUntilRemeasure: 18,
      activeDaysInCycle: 8,
    });
    expect(milestone.kind).toBe("cycle");
    expect(milestone.line).toContain("Dag 12 van 30");
    expect(milestone.line).toContain("8 dagen actief");
  });

  it("nudges hermeting countdown in final week", () => {
    const milestone = buildKompasMilestone(baseModel, 7, {
      cycleDay: 27,
      daysUntilRemeasure: 3,
      activeDaysInCycle: 14,
    });
    expect(milestone.kind).toBe("cycle");
    expect(milestone.line).toContain("Nog 3 dagen tot je hermeting");
  });

  it("nudges when one day remains in the week", () => {
    const milestone = buildKompasMilestone(baseModel, 6);
    expect(milestone.kind).toBe("week");
    expect(milestone.line).toContain("Nog één gewoonte");
  });

  it("uses priority improvement when trend shows progress", () => {
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
    const milestone = buildKompasMilestone(model, 7);
    expect(milestone.kind).toBe("neutral");
    expect(milestone.line).toContain("beweging verbeterde");
  });

  it("falls back to neutral encouragement", () => {
    const flatTrend: CheckTrend = {
      slaap: [55],
      energie: [60],
      stress: [50],
      voeding: [45],
      beweging: [38],
      herstel: [67],
      verbinding: [50],
    };
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend: flatTrend },
      null,
      [],
      false,
      answers,
      null,
      null,
      "stress",
    );
    const milestone = buildKompasMilestone(model, 7);
    expect(milestone.line).toBe("Elke stap telt — ook de kleine.");
  });
});
