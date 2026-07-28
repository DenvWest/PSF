import { describe, it, expect } from "vitest";
import {
  buildVerdictCards,
  buildVerdictSummary,
  countVerdictsWithoutPurchase,
  toVerdictCardCopy,
} from "@/lib/supplement-verdict-copy";
import type { StoredSupplementVerdict, VerdictValue } from "@/types/verdict";

function row(
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
    createdAt: "2026-07-28T00:00:00.000Z",
    supersededAt: null,
    basedOn: null,
  };
}

describe("toVerdictCardCopy", () => {
  it("gebruikt de ingrediëntnaam uit approved-claims", () => {
    expect(toVerdictCardCopy(row("vitamineD", "niet_nodig", "no_trigger_matched")).name).toBe(
      "Vitamine D",
    );
  });

  it("linkt alleen bij een koopoordeel naar de vergelijking", () => {
    expect(
      toVerdictCardCopy(row("magnesium", "kopen", "trigger_matched")).comparisonPath,
    ).toBe("/beste/magnesium");
    expect(
      toVerdictCardCopy(row("magnesium", "niet_nodig", "no_trigger_matched"))
        .comparisonPath,
    ).toBeNull();
  });

  it("geeft een verboden ingrediënt nooit een koop-link", () => {
    const card = toVerdictCardCopy(row("melatonine", "nooit", "claim_forbidden"));
    expect(card.comparisonPath).toBeNull();
    expect(card.tone).toBe("nee");
  });

  it("splitst eerst_leefstijl visueel op reasonKey", () => {
    expect(
      toVerdictCardCopy(row("magnesium", "eerst_leefstijl", "nutrition_log_incomplete")).label,
    ).toBe("Nog niet te zeggen");
    expect(
      toVerdictCardCopy(row("ashwagandha", "eerst_leefstijl", "claim_on_hold")).label,
    ).toBe("Eerst leefstijl");
    expect(
      toVerdictCardCopy(row("zink", "eerst_leefstijl", "comparison_unavailable")).label,
    ).toBe("Geen vergelijking");
  });

  it("valt terug op neutrale tekst bij een onbekende reden", () => {
    expect(toVerdictCardCopy(row("zink", "niet_nodig", "iets_nieuws")).reason).toBe(
      "Beoordeeld op je laatste check.",
    );
  });
});

describe("buildVerdictCards", () => {
  it("zet aanvullen bovenaan en de nee's onderaan", () => {
    const cards = buildVerdictCards([
      row("melatonine", "nooit", "claim_forbidden"),
      row("magnesium", "kopen", "trigger_matched"),
      row("ashwagandha", "eerst_leefstijl", "claim_on_hold"),
    ]);

    expect(cards.map((card) => card.tone)).toEqual(["ja", "wacht", "nee"]);
  });
});

describe("buildVerdictSummary", () => {
  it("telt hoe vaak het antwoord 'niet kopen' is", () => {
    const rows = [
      row("magnesium", "kopen", "trigger_matched"),
      row("zink", "niet_nodig", "no_trigger_matched"),
      row("melatonine", "nooit", "claim_forbidden"),
    ];

    expect(countVerdictsWithoutPurchase(rows)).toBe(2);
    expect(buildVerdictSummary(rows)).toContain("Bij 2 is ons antwoord: niet kopen.");
  });

  it("zegt het hardop als niets nodig is", () => {
    const rows = [
      row("zink", "niet_nodig", "no_trigger_matched"),
      row("creatine", "niet_nodig", "no_trigger_matched"),
    ];

    expect(buildVerdictSummary(rows)).toBe(
      "We beoordeelden 2 supplementen. Geen enkele voegt nu iets toe voor jou.",
    );
  });

  it("geeft null zonder oordelen", () => {
    expect(buildVerdictSummary([])).toBeNull();
  });
});
