import { describe, it, expect } from "vitest";
import { assessSleep, buildSleepConclusion } from "@/lib/sleep-assessment";
import {
  SLEEP_STATEMENTS,
  SLEEP_CHOICES,
  SLEEP_DEEPEN,
  sleepRegieReflection,
  type SleepDimensionKey,
} from "@/data/sleep-checkin";
import { getUsableClaims } from "@/data/approved-claims";

const FORBIDDEN = [
  "tekort",
  "diagnose",
  "gezond",
  "ongezond",
  "verhoogd",
  "normaalwaarde",
  "melatonine",
];

describe("buildSleepConclusion", () => {
  it("regelmaat focus → headline + 3 acties uit SLEEP_CHOICES", () => {
    const assessment = assessSleep({
      SLP_ONSET: 4,
      SLP_WAKE: 4,
      SLP_CONS: 1,
      SLP_QUAL: 4,
    });
    const conclusion = buildSleepConclusion(assessment);

    expect(conclusion.headline).toContain("Regelmaat");
    expect(conclusion.focusLabel).toBe("Regelmaat");
    expect(conclusion.focusDimension).toBe("regelmaat");
    expect(conclusion.actions).toEqual(SLEEP_CHOICES.regelmaat.slice(0, 3));
  });

  it("alles sterk → onderhoudsheadline + 3 acties", () => {
    const assessment = assessSleep({
      SLP_ONSET: 4,
      SLP_WAKE: 4,
      SLP_CONS: 3,
      SLP_QUAL: 4,
    });
    const conclusion = buildSleepConclusion(assessment);

    expect(conclusion.headline).toBe("Je basis staat goed — houd vast wat werkt");
    expect(conclusion.focusLabel).toBeNull();
    expect(conclusion.actions).toHaveLength(3);
  });

  it("winddown ≤2 → secundaire hint Avondafbouw", () => {
    const assessment = assessSleep({
      SLP_ONSET: 1,
      SLP_WAKE: 4,
      SLP_CONS: 3,
      SLP_QUAL: 4,
    });
    const conclusion = buildSleepConclusion(assessment, { winddown: 1 });

    expect(conclusion.secondaryHint).toBe("Ook Avondafbouw vraagt aandacht.");
  });
});

describe("assessSleep — focus + supplement", () => {
  it("SLP_ONSET:1 + rest sterk → focus inslapen met magnesium + choices; statuses bevat alle 4", () => {
    const assessment = assessSleep({
      SLP_ONSET: 1,
      SLP_WAKE: 4,
      SLP_CONS: 3,
      SLP_QUAL: 4,
    });

    expect(assessment.focus?.dimension).toBe("inslapen");
    expect(assessment.focus?.choices.length).toBeGreaterThan(0);
    expect(assessment.focus?.supplement).not.toBeNull();
    expect(assessment.focus?.supplement?.comparisonPath).toBe("/beste/magnesium");
    expect(assessment.focus?.supplement?.claimText).toBe(getUsableClaims("magnesium")[0].text);
    expect(assessment.statuses).toHaveLength(4);
  });

  it("SLP_CONS:1 + rest sterk → focus regelmaat, supplement null", () => {
    const assessment = assessSleep({
      SLP_ONSET: 4,
      SLP_WAKE: 4,
      SLP_CONS: 1,
      SLP_QUAL: 4,
    });

    expect(assessment.focus?.dimension).toBe("regelmaat");
    expect(assessment.focus?.supplement).toBeNull();
  });

  it("SLP_WAKE:1 + rest sterk → focus doorslapen met magnesium", () => {
    const assessment = assessSleep({
      SLP_ONSET: 4,
      SLP_WAKE: 1,
      SLP_CONS: 3,
      SLP_QUAL: 4,
    });

    expect(assessment.focus?.dimension).toBe("doorslapen");
    expect(assessment.focus?.supplement).not.toBeNull();
  });

  it("alles sterk → focus null", () => {
    const assessment = assessSleep({
      SLP_ONSET: 4,
      SLP_WAKE: 4,
      SLP_CONS: 3,
      SLP_QUAL: 4,
    });

    expect(assessment.focus).toBeNull();
  });
});

describe("assessSleep — bandFor via statuses", () => {
  it("max:4 — waarde 3 = redelijk, 4 = sterk", () => {
    const redelijk = assessSleep({ SLP_ONSET: 3 });
    const sterk = assessSleep({ SLP_ONSET: 4 });

    expect(redelijk.statuses.find((s) => s.dimension === "inslapen")?.band).toBe("redelijk");
    expect(sterk.statuses.find((s) => s.dimension === "inslapen")?.band).toBe("sterk");
  });

  it("max:3 — waarde 2 = redelijk, 3 = sterk", () => {
    const redelijk = assessSleep({ SLP_CONS: 2 });
    const sterk = assessSleep({ SLP_CONS: 3 });

    expect(redelijk.statuses.find((s) => s.dimension === "regelmaat")?.band).toBe("redelijk");
    expect(sterk.statuses.find((s) => s.dimension === "regelmaat")?.band).toBe("sterk");
  });
});

describe("assessSleep — compliance", () => {
  it("geen statement bevat verboden woorden", () => {
    const dimensions: SleepDimensionKey[] = ["inslapen", "doorslapen", "regelmaat", "uitgerust"];
    const bands = ["aandacht", "redelijk", "sterk"] as const;

    for (const dim of dimensions) {
      for (const band of bands) {
        const text = SLEEP_STATEMENTS[dim][band].toLowerCase();
        for (const word of FORBIDDEN) {
          expect(text.includes(word), `${dim}/${band}: "${text}" bevat "${word}"`).toBe(false);
        }
      }
    }
  });

  it("geen choice of deepen bevat melatonine", () => {
    for (const choices of Object.values(SLEEP_CHOICES)) {
      for (const choice of choices) {
        expect(choice.toLowerCase().includes("melatonine")).toBe(false);
      }
    }
    for (const deepen of Object.values(SLEEP_DEEPEN)) {
      expect(deepen.toLowerCase().includes("melatonine")).toBe(false);
    }
  });
});

describe("sleepRegieReflection", () => {
  it("grip 1 geeft validatie-zin voor lage regie", () => {
    const text = sleepRegieReflection(1);
    expect(text).toContain("niet in één keer");
  });

  it("grip 3 geeft op-weg-zin", () => {
    const text = sleepRegieReflection(3);
    expect(text).toContain("op weg");
  });

  it("grip 5 geeft bevestiging", () => {
    const text = sleepRegieReflection(5);
    expect(text).toContain("pakt je slaap zelf op");
  });

  it("geen sleepRegieReflection bevat verboden woorden", () => {
    for (const grip of [1, 2, 3, 4, 5]) {
      const text = sleepRegieReflection(grip).toLowerCase();
      for (const word of FORBIDDEN) {
        expect(text.includes(word), `grip ${grip}: "${text}" bevat "${word}"`).toBe(false);
      }
    }
  });
});
