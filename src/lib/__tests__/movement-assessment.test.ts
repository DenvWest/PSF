import { describe, it, expect } from "vitest";
import {
  assessMovement,
  buildMovementCheckinSnapshot,
  buildMovementConclusion,
  buildMovementDimensionDeltas,
  buildMovementFactRows,
  type MovementSelfReport,
} from "@/lib/movement-assessment";
import {
  MOVEMENT_MAINTENANCE_IMPLICATION,
  MOVEMENT_QUESTIONS,
  MOVEMENT_STATEMENTS,
  movementAnswerLabel,
  type MovementDimensionKey,
} from "@/data/movement-checkin";
import { getUsableClaims } from "@/data/approved-claims";

// Naast de medische claims sinds R0d ook het engine-vocabulaire: de gebruiker
// leest antwoordlabels en een richting, nooit een onzichtbare meetlat.
const FORBIDDEN = [
  "tekort",
  "diagnose",
  "gezond",
  "ongezond",
  "verhoogd",
  "normaal",
  "band",
  "niveau",
  "trede",
  "schijf",
  "categorie",
  "punten",
  "beweegscore",
  "dimensie",
];

describe("assessMovement — band + supplement", () => {
  it("MOV2_STR:1 + MOV2_CARD:5 → kracht aandacht met choices + creatine; conditie sterk zonder choices", () => {
    const results = assessMovement({ MOV2_STR: 1, MOV2_CARD: 5 });
    const kracht = results.find((r) => r.dimension === "kracht");
    const conditie = results.find((r) => r.dimension === "conditie");

    expect(kracht?.band).toBe("aandacht");
    expect(kracht?.choices.length).toBeGreaterThan(0);
    expect(kracht?.deepen).not.toBeNull();
    expect(kracht?.supplement).not.toBeNull();
    expect(kracht?.supplement?.comparisonPath).toBe("/beste/creatine");
    expect(kracht?.supplement?.claimText).toBe(getUsableClaims("creatine")[0].text);

    expect(conditie?.band).toBe("sterk");
    expect(conditie?.choices).toHaveLength(0);
    expect(conditie?.deepen).toBeNull();
    expect(conditie?.supplement).toBeNull();
  });

  it("MOV2_STR:5 + MOV2_CARD:1 → kracht sterk zonder supplement; conditie aandacht met choices", () => {
    const results = assessMovement({ MOV2_STR: 5, MOV2_CARD: 1 });
    const kracht = results.find((r) => r.dimension === "kracht");
    const conditie = results.find((r) => r.dimension === "conditie");

    expect(kracht?.band).toBe("sterk");
    expect(kracht?.choices).toHaveLength(0);
    expect(kracht?.deepen).toBeNull();
    expect(kracht?.supplement).toBeNull();

    expect(conditie?.band).toBe("aandacht");
    expect(conditie?.choices.length).toBeGreaterThan(0);
    expect(conditie?.supplement).toBeNull();
  });

  it("MOV2_STR:3 → band redelijk met choices", () => {
    const results = assessMovement({ MOV2_STR: 3 });
    const kracht = results.find((r) => r.dimension === "kracht");

    expect(kracht?.band).toBe("redelijk");
    expect(kracht?.choices.length).toBeGreaterThan(0);
    expect(kracht?.deepen).not.toBeNull();
  });

  it("klachten en motivatie hebben geen verdieping", () => {
    const results = assessMovement({
      MOV2_PAIN: 1,
      MOV2_MOTIV: 1,
    });
    const klachten = results.find((r) => r.dimension === "klachten");
    const motivatie = results.find((r) => r.dimension === "motivatie");

    expect(klachten?.deepen).toBeNull();
    expect(motivatie?.deepen).toBeNull();
  });
});

describe("assessMovement — compliance", () => {
  it("geen statement bevat verboden woorden", () => {
    const dimensions: MovementDimensionKey[] = ["kracht", "conditie"];
    const bands = ["aandacht", "redelijk", "sterk"] as const;

    for (const dim of dimensions) {
      for (const band of bands) {
        const text = MOVEMENT_STATEMENTS[dim][band].toLowerCase();
        for (const word of FORBIDDEN) {
          expect(text.includes(word), `${dim}/${band}: "${text}" bevat "${word}"`).toBe(false);
        }
      }
    }
  });

  it("supplement zit nooit op conditie", () => {
    for (const movCard of [1, 2, 3, 4, 5]) {
      const results = assessMovement({ MOV2_CARD: movCard });
      const conditie = results.find((r) => r.dimension === "conditie");
      expect(conditie?.supplement).toBeNull();
    }
  });
});

const ALL_FIVE: Required<MovementSelfReport> = {
  MOV2_STR: 5,
  MOV2_CARD: 5,
  MOV2_VIG: 5,
  MOV2_SIT: 5,
  MOV2_COND: 5,
  RCV_FEEL: 5,
  MOV2_PAIN: 5,
  MOV2_MOB: 5,
  MOV2_FUNC: 5,
  MOV2_CONSIST: 5,
  MOV2_MOTIV: 5,
};

function conclusionFor(overrides: Partial<MovementSelfReport>) {
  const report = { ...ALL_FIVE, ...overrides };
  return buildMovementConclusion(report, assessMovement(report));
}

describe("buildMovementConclusion", () => {
  it("MOV2_STR:1, rest 5 → focus kracht met 3 acties en 'kracht' in de headline", () => {
    const conclusion = conclusionFor({ MOV2_STR: 1 });

    expect(conclusion.focusDimension).toBe("kracht");
    expect(conclusion.actions).toHaveLength(3);
    expect(conclusion.headline.toLowerCase()).toContain("kracht");
  });

  it("MOV2_SIT:1 + MOV2_STR:1 → gelijkspel, ladder-volgorde kiest zitten", () => {
    const conclusion = conclusionFor({ MOV2_SIT: 1, MOV2_STR: 1 });

    expect(conclusion.focusDimension).toBe("zitten");
  });

  it("MOV2_CONSIST:2 + MOV2_MOTIV:2 + MOV2_STR:1 → override kiest consistentie", () => {
    const conclusion = conclusionFor({ MOV2_CONSIST: 2, MOV2_MOTIV: 2, MOV2_STR: 1 });

    expect(conclusion.focusDimension).toBe("consistentie");
  });

  it("alles op 5 → geen focus, 3 onderhoudsacties", () => {
    const conclusion = conclusionFor({});

    expect(conclusion.focusDimension).toBeNull();
    expect(conclusion.focusLabel).toBeNull();
    expect(conclusion.actions).toHaveLength(3);
  });

  it("MOV2_PAIN:1 + RCV_FEEL:1 + MOV2_STR:1 → 2 moderatorHints, klachten eerst; focus nooit klachten/herstel", () => {
    const conclusion = conclusionFor({ MOV2_PAIN: 1, RCV_FEEL: 1, MOV2_STR: 1 });

    expect(conclusion.moderatorHints).toHaveLength(2);
    expect(conclusion.moderatorHints[0].toLowerCase()).toContain("klachten");
    expect(conclusion.focusDimension).not.toBe("klachten");
    expect(conclusion.focusDimension).not.toBe("herstel");
  });

  it("MOV2_MOTIV:2 + MOV2_STR:1 → statement eindigt op de kleiner-beginnen-zin", () => {
    const conclusion = conclusionFor({ MOV2_MOTIV: 2, MOV2_STR: 1 });

    expect(conclusion.statement.endsWith(
      "Begin kleiner dan je denkt nodig te hebben — één moment dat je zeker haalt telt zwaarder dan een plan dat je laat liggen.",
    )).toBe(true);
  });

  it("compliance: geen verboden woorden in headline, statement of acties", () => {
    const scenarios: Partial<MovementSelfReport>[] = [
      {},
      { MOV2_STR: 1 },
      { MOV2_SIT: 1, MOV2_STR: 1 },
      { MOV2_CONSIST: 2, MOV2_MOTIV: 2, MOV2_STR: 1 },
      { MOV2_PAIN: 1, RCV_FEEL: 1, MOV2_STR: 1 },
      { MOV2_MOTIV: 2, MOV2_STR: 1 },
      { MOV2_VIG: 1 },
      { MOV2_MOB: 1 },
    ];

    for (const overrides of scenarios) {
      const conclusion = conclusionFor(overrides);
      const texts = [conclusion.headline, conclusion.statement, ...conclusion.actions];
      for (const text of texts) {
        const lower = text.toLowerCase();
        for (const word of FORBIDDEN) {
          expect(lower.includes(word), `"${text}" bevat "${word}"`).toBe(false);
        }
      }
    }
  });
});

describe("buildMovementFactRows", () => {
  it("cardio en intensief zijn één rij; 150-299 matig zonder intensief haalt de norm", () => {
    const rows = buildMovementFactRows({ ...ALL_FIVE, MOV2_CARD: 4, MOV2_VIG: 1 }, null);
    const aeroob = rows.find((row) => row.key === "aeroob");

    expect(rows.filter((row) => row.key === "aeroob")).toHaveLength(1);
    expect(aeroob?.status).toBe("meets");
    expect(aeroob?.answerLabel).toBe("150-299 minuten matig · niet intensief");
    expect(aeroob?.benchmarkSource).toBe("WHO 2020 · Beweegrichtlijnen 2017");
  });

  it("intensieve minuten tellen dubbel: 90-149 matig plus 30-74 intensief haalt de norm", () => {
    const combined = buildMovementFactRows({ ...ALL_FIVE, MOV2_CARD: 3, MOV2_VIG: 3 }, null);
    expect(combined.find((row) => row.key === "aeroob")?.status).toBe("meets");

    const moderateOnly = buildMovementFactRows({ ...ALL_FIVE, MOV2_CARD: 3, MOV2_VIG: 1 }, null);
    expect(moderateOnly.find((row) => row.key === "aeroob")?.status).toBe("near");

    const neither = buildMovementFactRows({ ...ALL_FIVE, MOV2_CARD: 2, MOV2_VIG: 2 }, null);
    expect(neither.find((row) => row.key === "aeroob")?.status).toBe("below");
  });

  it("kracht toetst aan de richtlijn, de rest is het eigen ijkpunt", () => {
    const rows = buildMovementFactRows({ ...ALL_FIVE, MOV2_STR: 2, MOV2_SIT: 2 }, null);

    expect(rows.find((row) => row.key === "kracht")?.status).toBe("below");
    expect(rows.find((row) => row.key === "kracht")?.whyLine).toContain("binnen bereik");
    expect(rows.find((row) => row.key === "zitten")?.status).toBe("own");
    expect(rows.find((row) => row.key === "consistentie")?.status).toBe("own");
    expect(rows.find((row) => row.key === "motivatie")?.status).toBe("own");
  });

  it("zitten toont de richtlijn als kwalitatief en labelt de 8-uursgrens als onderzoek", () => {
    const zitten = buildMovementFactRows({ ...ALL_FIVE, MOV2_SIT: 1 }, null).find(
      (row) => row.key === "zitten",
    );

    expect(zitten?.status).toBe("own");
    expect(zitten?.benchmarkLabel).toContain("geen getalsnorm");
    expect(zitten?.footnote).toContain("cohortonderzoek");
  });

  it("herstel en klachten krijgen nooit een eigen rij — dus ook nooit een oordeel", () => {
    const keys = buildMovementFactRows({ ...ALL_FIVE, MOV2_PAIN: 1, RCV_FEEL: 1 }, null).map(
      (row) => row.key,
    );

    expect(keys).not.toContain("herstel");
    expect(keys).not.toContain("klachten");
    expect(keys).not.toContain("conditie");
    expect(keys).not.toContain("intensiteit");
  });

  it("de focus-rij staat vooraan; conditie en intensiteit wijzen naar de aerobe rij", () => {
    expect(buildMovementFactRows(ALL_FIVE, "consistentie")[0].key).toBe("consistentie");
    expect(buildMovementFactRows(ALL_FIVE, "intensiteit")[0].key).toBe("aeroob");
    expect(buildMovementFactRows(ALL_FIVE, "conditie")[0].key).toBe("aeroob");
  });
});

describe("resolveMovementStripVariant", () => {
  it("eerste check en een laag deel gaan naar S1, een stap terug naar S2, de rest naar S3", () => {
    expect(snapshotFor({ MOV2_STR: 2 }).stripVariant).toBe("S1");
    expect(snapshotFor({ MOV2_CARD: 2 }, { MOV2_CARD: 3 }).stripVariant).toBe("S2");
    expect(snapshotFor({}, {}).stripVariant).toBe("S3");
    expect(snapshotFor({ MOV2_SIT: 3 }, { MOV2_SIT: 3 }).stripVariant).toBe("S3");
  });
});

function snapshotFor(
  overrides: Partial<MovementSelfReport>,
  previous: Partial<MovementSelfReport> | null = null,
  previousFocusLabel: string | null = null,
) {
  const report = { ...ALL_FIVE, ...overrides };
  const results = assessMovement(report);
  return buildMovementCheckinSnapshot({
    report,
    results,
    conclusion: buildMovementConclusion(report, results),
    previousReport: previous ? { ...ALL_FIVE, ...previous } : null,
    previousFocusLabel,
  });
}

describe("movementAnswerLabel", () => {
  it("leest het label op value, niet op index — MOV2_STR:2 is 'Minder dan 1x per week'", () => {
    expect(movementAnswerLabel("MOV2_STR", 2)).toBe("Minder dan 1x per week");
    expect(movementAnswerLabel("MOV2_STR", 5)).toBe("3x per week of vaker");
    expect(movementAnswerLabel("MOV2_CARD", 3)).toBe("90-149 minuten");
  });

  it("elk veld levert voor elke waarde 1-5 een label", () => {
    for (const question of MOVEMENT_QUESTIONS) {
      for (let value = 1; value <= 5; value += 1) {
        expect(movementAnswerLabel(question.field, value)).toBeTruthy();
      }
    }
  });
});

describe("buildMovementDimensionDeltas", () => {
  it("zonder vorige meting is elke dimensie 'new' zonder vorige band", () => {
    const deltas = buildMovementDimensionDeltas(ALL_FIVE, null);

    expect(deltas).toHaveLength(MOVEMENT_QUESTIONS.length);
    for (const delta of deltas) {
      expect(delta.direction).toBe("new");
      expect(delta.previousBand).toBeNull();
      expect(delta.previousAnswerValue).toBeNull();
    }
  });

  it("een veld dat in de vorige meting ontbreekt telt als 'new', de rest niet", () => {
    const deltas = buildMovementDimensionDeltas(
      { ...ALL_FIVE, MOV2_STR: 3 },
      { MOV2_CARD: 5 },
    );

    expect(deltas.find((d) => d.dimension === "kracht")?.direction).toBe("new");
    expect(deltas.find((d) => d.dimension === "conditie")?.direction).toBe("same");
  });

  it("richting volgt de ruwe waarde, bandwissel volgt band vs previousBand", () => {
    const deltas = buildMovementDimensionDeltas(
      { ...ALL_FIVE, MOV2_STR: 3, MOV2_CARD: 5 },
      { ...ALL_FIVE, MOV2_STR: 1, MOV2_CARD: 4 },
    );

    const kracht = deltas.find((d) => d.dimension === "kracht");
    expect(kracht?.direction).toBe("up");
    expect(kracht?.previousBand).toBe("aandacht");
    expect(kracht?.band).toBe("redelijk");

    const conditie = deltas.find((d) => d.dimension === "conditie");
    expect(conditie?.direction).toBe("up");
    expect(conditie?.band).toBe(conditie?.previousBand);
  });
});

describe("buildMovementCheckinSnapshot", () => {
  it("F1 eerste check → template T1, antwoordlabel uit de gekozen optie, geen alsoLine", () => {
    const snapshot = snapshotFor({ MOV2_STR: 2 });

    expect(snapshot.focusDimension).toBe("kracht");
    expect(snapshot.answerLabel).toBe("Minder dan 1x per week");
    expect(snapshot.focusDelta?.template).toBe("T1");
    expect(snapshot.focusDelta?.label).toBe("Je nulpunt");
    expect(snapshot.focusDelta?.alsoLine).toBeNull();
  });

  it("F2 focus zakt naar een lagere antwoordgroep → T3 met beide antwoordlabels", () => {
    const snapshot = snapshotFor({ MOV2_CARD: 2 }, { MOV2_CARD: 3 });

    expect(snapshot.focusDimension).toBe("conditie");
    expect(snapshot.focusDelta?.template).toBe("T3");
    expect(snapshot.focusDelta?.line).toContain("90-149 minuten");
    expect(snapshot.focusDelta?.line).toContain("30-89 minuten");
    expect(snapshot.focusDelta?.line).toContain("Dat is minder dan vorige keer");
    expect(snapshot.focusDelta?.followLine).toContain("kleiner te maken");
    expect(snapshot.stripVariant).toBe("S2");
  });

  it("F3 focus stijgt naar een andere antwoordgroep → T2 in mensentaal", () => {
    const snapshot = snapshotFor({ MOV2_STR: 3 }, { MOV2_STR: 1 });

    expect(snapshot.focusDelta?.template).toBe("T2");
    expect(snapshot.focusDelta?.line).toContain("Dat is een stap vooruit");
    expect(snapshot.focusDelta?.line).toContain("Nooit");
    expect(snapshot.focusDelta?.line).toContain("1x per week");
    expect(snapshot.focusDelta?.followLine).toBeNull();
  });

  it("T2 noemt de richtlijn pas wanneer die ook gehaald wordt", () => {
    const halfway = snapshotFor({ MOV2_STR: 3 }, { MOV2_STR: 1 });
    expect(halfway.focusDelta?.line).not.toContain("richtlijn");

    // Kracht op 2x per week is geen focus meer (niets staat er lager), dus de
    // winst verhuist naar de winLine — precies waarvoor die regel bestaat.
    const reached = snapshotFor({ MOV2_STR: 4, MOV2_SIT: 3 }, { MOV2_STR: 3, MOV2_SIT: 3 });
    expect(reached.focusDimension).toBe("zitten");
    expect(reached.focusDelta?.winLine).toContain("Je grootste stap: Kracht");
    expect(reached.focusDelta?.winLine).toContain("richtlijn van twee keer per week");
    expect(reached.focusDelta?.alsoLine ?? "").not.toContain("Kracht");
  });

  it("F4 alles sterk → geen focus, onderhouds-implicatie, T6", () => {
    const snapshot = snapshotFor({}, {});

    expect(snapshot.focusDimension).toBeNull();
    expect(snapshot.answerLabel).toBeNull();
    expect(snapshot.focusDelta?.template).toBe("T6");
    expect(snapshot.implicationLine).toBe(MOVEMENT_MAINTENANCE_IMPLICATION);
  });

  it("F4 met een vorige focus → T7 benoemt de dimensie die op orde kwam", () => {
    const snapshot = snapshotFor({}, { MOV2_STR: 1 }, "Kracht");

    expect(snapshot.focusDelta?.template).toBe("T7");
    expect(snapshot.focusDelta?.line).toContain("Kracht");
  });

  it("F5 stalled → focus consistentie met de verklein-implicatie", () => {
    const snapshot = snapshotFor(
      { MOV2_CONSIST: 1, MOV2_MOTIV: 1, MOV2_STR: 1 },
      { MOV2_CONSIST: 3, MOV2_MOTIV: 3, MOV2_STR: 1 },
    );

    expect(snapshot.focusDimension).toBe("consistentie");
    expect(snapshot.focusDelta?.template).toBe("T3");
    expect(snapshot.implicationLine).toContain("kleinere week");
  });

  it("ongewijzigde focus → T5, en de regel bevat geen getal", () => {
    const snapshot = snapshotFor({ MOV2_STR: 2 }, { MOV2_STR: 2 });

    expect(snapshot.focusDelta?.template).toBe("T5");
    expect(snapshot.focusDelta?.line).not.toMatch(/[+-]\d/);
  });

  it("beweging binnen dezelfde antwoordgroep → T4, zonder groep-taal", () => {
    const snapshot = snapshotFor({ MOV2_STR: 2 }, { MOV2_STR: 1 });

    expect(snapshot.focusDelta?.template).toBe("T4");
    expect(snapshot.focusDelta?.line).toContain("Een stap vooruit");
    expect(snapshot.focusDelta?.line).toContain("richtlijn van twee keer per week is nog niet in beeld");
    expect(snapshot.focusDelta?.followLine).toBeNull();
  });

  it("een stap terug binnen dezelfde antwoordgroep krijgt óók de verkleinzin", () => {
    // "1 week" → "Geen" wisselt niet van antwoordgroep en zou anders de zachtste
    // regel krijgen, terwijl het de zwaarste daling is die er is.
    const snapshot = snapshotFor(
      { MOV2_CONSIST: 1, MOV2_MOTIV: 1 },
      { MOV2_CONSIST: 2, MOV2_MOTIV: 2 },
    );

    expect(snapshot.focusDimension).toBe("consistentie");
    expect(snapshot.focusDelta?.template).toBe("T4");
    expect(snapshot.focusDelta?.followLine).toContain("kleiner te maken, niet zwaarder");
    expect(snapshot.stripVariant).toBe("S2");
  });

  it("alsoLine noemt maximaal twee andere delen, met beide antwoordlabels, nooit de focus", () => {
    const snapshot = snapshotFor(
      { MOV2_STR: 1, MOV2_CARD: 2, MOV2_SIT: 2, MOV2_MOB: 2 },
      { MOV2_STR: 2, MOV2_CARD: 4, MOV2_SIT: 4, MOV2_MOB: 4 },
    );

    const alsoLine = snapshot.focusDelta?.alsoLine ?? "";
    expect(alsoLine.startsWith("Ook veranderd — ")).toBe(true);
    expect(alsoLine.split(" · ").length).toBeLessThanOrEqual(2);
    expect(alsoLine).toContain("→");
    expect(alsoLine.toLowerCase()).not.toContain("kracht");
  });

  it("compliance: geen verboden woorden in delta, implicatie of headline", () => {
    const scenarios: [Partial<MovementSelfReport>, Partial<MovementSelfReport> | null][] = [
      [{ MOV2_STR: 2 }, null],
      [{ MOV2_CARD: 2 }, { MOV2_CARD: 3 }],
      [{ MOV2_STR: 3 }, { MOV2_STR: 1 }],
      [{}, {}],
      [{ MOV2_CONSIST: 1, MOV2_MOTIV: 1 }, { MOV2_CONSIST: 2, MOV2_MOTIV: 2 }],
      [{ MOV2_SIT: 1 }, { MOV2_SIT: 3 }],
      [{ MOV2_VIG: 1 }, { MOV2_VIG: 2 }],
      [{ MOV2_MOB: 2 }, { MOV2_MOB: 4 }],
    ];

    for (const [overrides, previous] of scenarios) {
      const snapshot = snapshotFor(overrides, previous);
      const texts = [
        snapshot.headline,
        snapshot.focusStatement,
        snapshot.implicationLine,
        snapshot.focusDelta?.line ?? "",
        snapshot.focusDelta?.alsoLine ?? "",
        snapshot.focusDelta?.winLine ?? "",
        snapshot.focusDelta?.followLine ?? "",
        ...snapshot.factRows.flatMap((row) => [
          row.label,
          row.answerLabel,
          row.benchmarkLabel ?? "",
          row.whyLine,
          row.footnote ?? "",
        ]),
      ];
      for (const text of texts) {
        const lower = text.toLowerCase();
        for (const word of FORBIDDEN) {
          expect(lower.includes(word), `"${text}" bevat "${word}"`).toBe(false);
        }
      }
    }
  });
});
