import { describe, expect, it } from "vitest";
import { TRUST_LINE } from "@/data/explanation-copy";
import { explainRecommendation } from "@/lib/recommendation-explainer";
import type { ExplanationContext } from "@/types/recommendation-explanation";
import type {
  RankedRecommendation,
  RecommendationTriggerReason,
} from "@/types/recommendation";

const baseContext: ExplanationContext = {
  supplement: {
    name: "Omega-3",
    claim: "draagt bij aan de normale werking van het hart",
    grade: "A",
  },
};

function makeRecommendation(
  triggeredBy: RecommendationTriggerReason[],
  efsaStatus: RankedRecommendation["efsaStatus"] = "approved",
): RankedRecommendation {
  return {
    supplementId: "omega-3",
    comparisonPath: "/beste/omega-3-supplement",
    efsaStatus,
    domains: ["Voeding"],
    rank: 1,
    reason: { triggeredBy },
    available: true,
  };
}

describe("explainRecommendation", () => {
  it("maps signal trigger to signal factor with NL copy", () => {
    const result = explainRecommendation(
      makeRecommendation([{ type: "signal", signal: "omega3_deficiency" }]),
      baseContext,
    );

    expect(result.factors).toHaveLength(1);
    expect(result.factors[0].kind).toBe("signal");
    expect(result.factors[0].text).toBe("Je eet zelden vette vis");
  });

  it("maps domain_below trigger to measurement factor with NL copy", () => {
    const result = explainRecommendation(
      makeRecommendation([
        {
          type: "domain_below",
          domain: "sleep_score",
          score: 35,
          threshold: 50,
        },
      ]),
      baseContext,
    );

    expect(result.factors).toHaveLength(1);
    expect(result.factors[0].kind).toBe("measurement");
    expect(result.factors[0].text).toBe("Je Slaap-score zit onder de drempel");
  });

  it("maps profile trigger to profile factor with NL copy", () => {
    const result = explainRecommendation(
      makeRecommendation([{ type: "profile", label: "Onrustige Slaper" }]),
      baseContext,
    );

    expect(result.factors).toHaveLength(1);
    expect(result.factors[0].kind).toBe("profile");
    expect(result.factors[0].text).toBe("Je slaappatroon is je zwakste schakel");
  });

  it("maps hub_legacy trigger to measurement factor with NL copy", () => {
    const result = explainRecommendation(
      makeRecommendation([
        { type: "hub_legacy", rule: "sleep_or_stress_below_50" },
      ]),
      baseContext,
    );

    expect(result.factors).toHaveLength(1);
    expect(result.factors[0].kind).toBe("measurement");
    expect(result.factors[0].text).toBe(
      "Je slaap- of stressscore zit onder de drempel",
    );
  });

  it("maps pillar trigger to context factor with NL copy", () => {
    const result = explainRecommendation(
      makeRecommendation([{ type: "pillar", pillarId: "voeding" }]),
      baseContext,
    );

    expect(result.factors).toHaveLength(1);
    expect(result.factors[0].kind).toBe("context");
    expect(result.factors[0].text).toBe(
      "Voeding kwam in jouw antwoorden het laagst naar voren — daar begin je",
    );
  });

  it("filters unknown signal keys without crashing", () => {
    const result = explainRecommendation(
      makeRecommendation([
        { type: "signal", signal: "unknown_signal" as "omega3_deficiency" },
        { type: "signal", signal: "omega3_deficiency" },
      ]),
      baseContext,
    );

    expect(result.factors).toHaveLength(1);
    expect(result.factors[0].text).toBe("Je eet zelden vette vis");
  });

  it("sets efsaNote and no efsaClaim for on-hold recommendations", () => {
    const result = explainRecommendation(
      makeRecommendation(
        [{ type: "signal", signal: "cortisol_risk" }],
        "on_hold",
      ),
      baseContext,
    );

    expect(result.efsaNote).toBe("Dit is geen goedgekeurde gezondheidsclaim.");
    expect(result.efsaClaim).toBeUndefined();
  });

  it("sets efsaClaim and no efsaNote for approved recommendations", () => {
    const result = explainRecommendation(
      makeRecommendation([{ type: "signal", signal: "omega3_deficiency" }]),
      baseContext,
    );

    expect(result.efsaClaim).toBe(
      "draagt bij aan de normale werking van het hart",
    );
    expect(result.efsaNote).toBeUndefined();
  });

  it("uses lifestyleStep title in lifestyleFirst when present", () => {
    const result = explainRecommendation(
      makeRecommendation([{ type: "pillar", pillarId: "voeding" }]),
      {
        ...baseContext,
        lifestyleStep: {
          title: "Eiwitrijk ontbijt",
          detail: "30 g eiwit vóór 10 uur.",
        },
      },
    );

    expect(result.lifestyleFirst).toContain("Eiwitrijk ontbijt");
    expect(result.lifestyleFirst.startsWith("Leefstijl eerst:")).toBe(true);
  });

  it("uses generic lifestyleFirst when lifestyleStep is absent", () => {
    const result = explainRecommendation(
      makeRecommendation([{ type: "pillar", pillarId: "voeding" }]),
      baseContext,
    );

    expect(result.lifestyleFirst).toBe(
      "Leefstijl eerst — dit is een aanvulling op een gemeten gat, geen vervanging.",
    );
  });

  it("builds debug string with prefix and at least one trigger", () => {
    const result = explainRecommendation(
      makeRecommendation([
        { type: "signal", signal: "omega3_deficiency" },
        {
          type: "domain_below",
          domain: "nutrition_score",
          score: 30,
          threshold: 50,
        },
      ]),
      baseContext,
    );

    expect(result.debug).toMatch(/^route\|/);
    expect(result.debug).toContain("signal:omega3_deficiency");
    expect(result.debug).toContain("domain_below:nutrition_score<50");
    expect(result.debug).toContain("grade:A");
  });

  it("uses pillar prefix in debug for single pillar trigger", () => {
    const result = explainRecommendation(
      makeRecommendation([{ type: "pillar", pillarId: "slaap" }]),
      baseContext,
    );

    expect(result.debug).toMatch(/^pillar\|pillar:slaap\|grade:A$/);
  });

  it("includes supplementRationale and trustLine", () => {
    const result = explainRecommendation(
      makeRecommendation([{ type: "pillar", pillarId: "voeding" }]),
      baseContext,
    );

    expect(result.supplementRationale).toContain("Omega-3");
    expect(result.supplementRationale).toContain("aanvulling op een gemeten gat");
    expect(result.trustLine).toBe(TRUST_LINE);
  });
});
