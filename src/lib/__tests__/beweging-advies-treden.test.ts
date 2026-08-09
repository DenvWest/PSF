import { describe, expect, it } from "vitest";
import { buildBewegingAdviesTreden } from "@/lib/beweging-advies-treden";
import type { DashboardData, DashboardModel } from "@/types/dashboard";
import type { StoredSupplementVerdict, VerdictValue } from "@/types/verdict";

function verdictRow(
  ingredientKey: string,
  verdict: VerdictValue,
  reasonKey: string,
): StoredSupplementVerdict {
  return {
    id: `id-${ingredientKey}`,
    ingredientKey,
    verdict,
    reasonKey,
    rulesVersion: "1.5.0",
    nextReviewAt: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    supersededAt: null,
    basedOn: null,
  };
}

function model(overrides: Partial<DashboardModel> = {}): DashboardModel {
  return {
    scores: { beweging: 58 },
    answers: {},
    movementPrefs: { startPattern: "kracht", anchor: null },
    movementPlanProgress: null,
    ...overrides,
  } as unknown as DashboardModel;
}

function data(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    supplementVerdicts: [],
    remeasure: null,
    ...overrides,
  } as unknown as DashboardData;
}

describe("buildBewegingAdviesTreden — trede 3 kandidaten", () => {
  it("toont alleen de beweging-kandidaten uit DOMAIN_PRODUCT_STANCE", () => {
    const treden = buildBewegingAdviesTreden(
      model(),
      data({
        supplementVerdicts: [
          verdictRow("magnesium", "kopen", "trigger_matched"),
          verdictRow("creatine", "niet_nodig", "no_trigger_matched"),
          verdictRow("eiwitpoeder", "eerst_leefstijl", "nutrition_log_incomplete"),
        ],
      }),
      null,
    );

    expect(treden.trede3.items.map((item) => item.ingredientKey)).toEqual([
      "creatine",
      "eiwitpoeder",
    ]);
  });

  it("zet open oordelen bovenaan", () => {
    const treden = buildBewegingAdviesTreden(
      model(),
      data({
        supplementVerdicts: [
          verdictRow("creatine", "niet_nodig", "no_trigger_matched"),
          verdictRow("eiwitpoeder", "kopen", "trigger_matched"),
        ],
      }),
      null,
    );

    expect(treden.trede3.items[0].ingredientKey).toBe("eiwitpoeder");
    expect(treden.trede3.status).toBe("nu");
  });

  it("is dicht zonder enig koopoordeel", () => {
    const treden = buildBewegingAdviesTreden(
      model(),
      data({
        supplementVerdicts: [verdictRow("creatine", "niet_nodig", "no_trigger_matched")],
      }),
      null,
    );

    expect(treden.trede3.status).toBe("dicht");
  });
});

describe("buildBewegingAdviesTreden — claimtekst-guard", () => {
  it("rendert geen claimtekst voor eiwitpoeder, ook niet bij een koopoordeel", () => {
    // approved-claims.eiwitpoeder heeft claims: [] — een koopoordeel via
    // protein_gap_signal mag daar geen EFSA-tekst bij tonen.
    const treden = buildBewegingAdviesTreden(
      model(),
      data({
        supplementVerdicts: [verdictRow("eiwitpoeder", "kopen", "trigger_matched")],
      }),
      null,
    );

    const eiwit = treden.trede3.items[0];
    expect(eiwit.open).toBe(true);
    expect(eiwit.claimText).toBeNull();
  });

  it("toont wel de goedgekeurde claim voor creatine bij een koopoordeel", () => {
    const treden = buildBewegingAdviesTreden(
      model(),
      data({
        supplementVerdicts: [verdictRow("creatine", "kopen", "trigger_matched")],
      }),
      null,
    );

    expect(treden.trede3.items[0].claimText).toContain("Creatine");
  });

  it("toont geen claimtekst bij een dicht oordeel", () => {
    const treden = buildBewegingAdviesTreden(
      model(),
      data({
        supplementVerdicts: [verdictRow("creatine", "niet_nodig", "no_trigger_matched")],
      }),
      null,
    );

    expect(treden.trede3.items[0].claimText).toBeNull();
    expect(treden.trede3.items[0].comparisonPath).toBeNull();
  });
});

describe("buildBewegingAdviesTreden — trede 1 en 2", () => {
  it("markeert het eiwitgat zodat trede 1 doorverwijst naar voeding", () => {
    const treden = buildBewegingAdviesTreden(
      model({
        answers: { NUT_PROT: 1, MOV_STR: 4, MOV_CARD: 4 },
      }),
      data(),
      null,
    );

    expect(treden.trede1.proteinGap).toBe(true);
    expect(treden.trede1.status).toBe("nu");
  });

  it("staat op 'staat' zonder eiwitgat", () => {
    const treden = buildBewegingAdviesTreden(model(), data(), null);
    expect(treden.trede1.proteinGap).toBe(false);
    expect(treden.trede1.status).toBe("staat");
  });

  it("leest het programmalabel uit de bewegingsvoorkeuren", () => {
    expect(buildBewegingAdviesTreden(model(), data(), null).trede1.programLabel).toBe(
      "Kracht",
    );
  });

  it("telt de hermeting af op trede 2", () => {
    const treden = buildBewegingAdviesTreden(
      model(),
      data({ remeasure: { dueDate: "2026-09-01", daysUntil: 12 } }),
      null,
    );

    expect(treden.trede2.status).toBe("wacht");
    expect(treden.trede2.statusLabel).toBe("over 12 dagen");
  });

  it("noemt de baseline in de scoreregel wanneer die afwijkt", () => {
    expect(buildBewegingAdviesTreden(model(), data(), 51).trede2.scoreLine).toBe(
      "Je beweegscore staat op 58, begonnen op 51.",
    );
  });
});
