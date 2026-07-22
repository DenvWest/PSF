import { describe, expect, it } from "vitest";
import { buildMeaningSentence, formatLastMeasured } from "@/lib/betekenis-motor";

describe("buildMeaningSentence", () => {
  it("retourneert alleen de metric wanneer dat het enige veld is", () => {
    expect(buildMeaningSentence({ metric: "X" })).toBe("X");
  });

  it("voegt referent toe met een gedachtestreepje", () => {
    expect(
      buildMeaningSentence({
        metric: "Eén krachtsessie: squat, push, pull",
        referent: "je begon bij 55",
      }),
    ).toBe("Eén krachtsessie: squat, push, pull — je begon bij 55");
  });

  it("combineert alle vier velden tot één vloeiende Nederlandse zin", () => {
    expect(
      buildMeaningSentence({
        metric: "Je deed vandaag je eerste krachtsessie",
        referent: "drie weken geleden was dat nul",
        anchorWhy: "Want jij wilt je sterk en capabel blijven voelen.",
        implication: "Morgen kies je opnieuw.",
      }),
    ).toBe(
      "Je deed vandaag je eerste krachtsessie — drie weken geleden was dat nul Want jij wilt je sterk en capabel blijven voelen. Morgen kies je opnieuw.",
    );
  });
});

describe("formatLastMeasured", () => {
  it("formatteert een ISO-datum als Nederlands laatst-gemeten-label", () => {
    expect(formatLastMeasured("2026-07-08T10:00:00.000Z")).toMatch(
      /^Laatst gemeten · 8 jul$/,
    );
  });
});
