import { describe, it, expect } from "vitest";
import { buildAfleiding } from "@/lib/supplement-afleiding";
import type { StoredSupplementVerdict, VerdictEvidence } from "@/types/verdict";

function evidence(
  triggeredBy: VerdictEvidence["triggeredBy"] = [],
): VerdictEvidence {
  return {
    scores: {
      sleep_score: 50,
      energy_score: 50,
      stress_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
      connection_score: 50,
    },
    signals: {
      omega3_deficiency: false,
      magnesium_signal: false,
      cortisol_risk: false,
      creatine_signal: false,
      melatonine_signal: false,
      protein_gap_signal: false,
      low_recovery_no_load: false,
      sleep_issue_no_stress: false,
      energy_dip_unexplained: false,
    },
    profileLabel: "In Balans",
    triggeredBy,
    nutritionLogCompleted: true,
  };
}

function row(
  ingredientKey: string,
  basedOn: VerdictEvidence | null,
): StoredSupplementVerdict {
  return {
    id: `id-${ingredientKey}`,
    ingredientKey,
    verdict: "kopen",
    reasonKey: "trigger_matched",
    rulesVersion: "1.5.0",
    nextReviewAt: null,
    createdAt: "2026-08-16T00:00:00.000Z",
    supersededAt: null,
    basedOn,
  };
}

describe("buildAfleiding", () => {
  it("geeft null zonder bewaarde snapshot", () => {
    expect(buildAfleiding("magnesium", row("magnesium", null))).toBeNull();
  });

  it("combineert inname en beweegprofiel voor eiwit — niet inname alleen", () => {
    const view = buildAfleiding(
      "eiwitpoeder",
      row("eiwitpoeder", evidence([{ type: "signal", signal: "protein_gap_signal" }])),
    );
    expect(view?.signaalLine).toContain("beweegcheck");
    expect(view?.signaalLine).toContain("samen zijn het signaal, niet de inname alleen");
  });

  it("combineert belasting en herstel voor creatine via de custom matcher", () => {
    const view = buildAfleiding(
      "creatine",
      row("creatine", evidence([{ type: "hub_legacy", rule: "creatine_custom_matcher" }])),
    );
    expect(view?.signaalLine).toContain("beweegcheck");
  });

  it("magnesium-signaal komt uit slaapvragen, niet uit beweging", () => {
    const view = buildAfleiding(
      "magnesium",
      row("magnesium", evidence([{ type: "signal", signal: "magnesium_signal" }])),
    );
    expect(view?.signaalLine).toContain("slaapvragen");
    expect(view?.signaalLine).not.toContain("beweegcheck");
  });

  it("zegt het hardop als er geen signaal is", () => {
    const view = buildAfleiding("zink", row("zink", evidence([])));
    expect(view?.signaalLine).toContain("geen signaal");
  });

  it("geeft zekerheid en bloedwaarde voor nutriënten met een referentie", () => {
    const view = buildAfleiding("vitamineD", row("vitamineD", evidence([])));
    expect(view?.zekerheidLine).toContain("Zekerheid 1 van 4");
    expect(view?.bloedLine).toContain("Bloedwaarde maakt dit harder");
  });

  it("heeft geen zekerheid/bloedwaarde-regel voor creatine (geen voedingscheck-nutriënt)", () => {
    const view = buildAfleiding("creatine", row("creatine", evidence([])));
    expect(view?.zekerheidLine).toBeNull();
    expect(view?.bloedLine).toBeNull();
  });

  it("citeert de claim woordelijk bij een goedgekeurd ingrediënt", () => {
    const view = buildAfleiding("magnesium", row("magnesium", evidence([])));
    expect(view?.claimLine).toContain("De claim die mag:");
  });

  it("geeft de geen-claim-regel voor eiwitpoeder, nooit een vrije formulering", () => {
    const view = buildAfleiding("eiwitpoeder", row("eiwitpoeder", evidence([])));
    expect(view?.claimLine).toContain("Hier bestaat geen goedgekeurde gezondheidsclaim voor");
  });

  it("meldt on-hold zonder oordeel bij ashwagandha", () => {
    const view = buildAfleiding("ashwagandha", row("ashwagandha", evidence([])));
    expect(view?.claimLine).toContain("on-hold");
  });

  it("bevat nergens statuswoorden als tekort of gebrek", () => {
    const view = buildAfleiding(
      "magnesium",
      row(
        "magnesium",
        evidence([
          { type: "domain_below", domain: "sleep_score", score: 30, threshold: 50 },
        ]),
      ),
    );
    const text = [view?.signaalLine, view?.zekerheidLine, view?.bloedLine, view?.claimLine].join(
      " ",
    );
    expect(text).not.toMatch(/tekort|gebrek|te weinig|deficiënt/i);
  });
});
