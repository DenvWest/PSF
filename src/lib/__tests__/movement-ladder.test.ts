import { describe, expect, it } from "vitest";
import { MOVEMENT_PRIORITY_LAYERS } from "@/data/movement/lifestyle-priorities";
import {
  assessMovement,
  buildMovementConclusion,
  type MovementSelfReport,
} from "@/lib/movement-assessment";
import {
  MOVEMENT_LAYER_STATE_LABEL,
  movementLayerWhyWait,
  resolveMovementFocusPriority,
  resolveMovementLadderCoverage,
  resolveMovementLayerStates,
} from "@/lib/movement-ladder";

/** Draait de echte engine, zodat de test de koppeling toetst en niet een mock. */
function ladderFor(report: MovementSelfReport) {
  const conclusion = buildMovementConclusion(report, assessMovement(report));
  const focusDimension = conclusion.focusDimension;
  return {
    conclusion,
    focus: resolveMovementFocusPriority(focusDimension),
    states: resolveMovementLayerStates(report, focusDimension),
  };
}

const KRACHT_ZWAK: MovementSelfReport = {
  MOV2_STR: 1, // kracht: minder dan 1× per week
  MOV2_CARD: 3,
  MOV2_VIG: 3,
  MOV2_SIT: 2, // zit veel, maar minder zwak dan kracht
  MOV2_CONSIST: 4,
  MOV2_MOB: 4,
};

describe("de beweegladder komt uit dezelfde bron als de readout", () => {
  it("zet de winst-prioriteit op de laag waar de readout-focus in valt", () => {
    const { conclusion, focus, states } = ladderFor(KRACHT_ZWAK);

    expect(conclusion.focusDimension).toBe("kracht");
    expect(focus).toBe(2);
    expect(states[2]).toBe("winst");
  });

  it("laat readout en ladder niet uiteenlopen, over alle focusdimensies", () => {
    // Eén veld per keer op 1 zetten dwingt die dimensie tot focus. Als de
    // mapping ooit een dimensie mist, valt hier precies die combinatie om.
    const cases: { field: keyof MovementSelfReport; expected: number }[] = [
      { field: "MOV2_SIT", expected: 1 },
      { field: "MOV2_MOB", expected: 1 },
      { field: "MOV2_STR", expected: 2 },
      { field: "MOV2_CARD", expected: 2 },
      { field: "MOV2_VIG", expected: 2 },
      { field: "MOV2_CONSIST", expected: 3 },
    ];

    for (const { field, expected } of cases) {
      const report: MovementSelfReport = {
        MOV2_STR: 5,
        MOV2_CARD: 5,
        MOV2_VIG: 5,
        MOV2_SIT: 5,
        MOV2_CONSIST: 5,
        MOV2_MOB: 5,
        [field]: 1,
      };
      const { conclusion, focus, states } = ladderFor(report);

      expect(conclusion.focusDimension, `focus voor ${field}`).not.toBeNull();
      expect(focus, `prioriteit voor ${field}`).toBe(expected);
      expect(states[expected as 1 | 2 | 3], `staat voor ${field}`).toBe("winst");

      // Precies één winst-laag. Twee zou betekenen dat de gebruiker twee
      // "grootste" winsten heeft, en dat is geen prioriteitenladder meer.
      const winstCount = Object.values(states).filter((s) => s === "winst").length;
      expect(winstCount, `aantal winst-lagen voor ${field}`).toBe(1);
    }
  });

  it("geeft geen winst-laag als er niets te winnen valt", () => {
    const sterk: MovementSelfReport = {
      MOV2_STR: 5,
      MOV2_CARD: 5,
      MOV2_VIG: 5,
      MOV2_SIT: 5,
      MOV2_CONSIST: 5,
      MOV2_MOB: 5,
    };
    const { conclusion, focus, states } = ladderFor(sterk);

    expect(conclusion.focusDimension).toBeNull();
    expect(focus).toBeNull();
    expect(Object.values(states)).not.toContain("winst");
    expect(states[1]).toBe("ok");
    expect(states[2]).toBe("ok");
  });
});

describe("staten per prioriteit", () => {
  it("houdt een open laag bóven de winst-laag zichtbaar als watch", () => {
    const { states } = ladderFor(KRACHT_ZWAK);
    // Zitten is zwak (2 = aandacht) maar staat boven kracht: hij telt mee,
    // hij wacht niet. Dat is de prebuild-regel "dit telt mee, maar kracht
    // levert nu meer op".
    expect(states[1]).toBe("watch");
  });

  it("zet lagen zonder meting op wacht — geen meting is geen oordeel", () => {
    const { states } = ladderFor(KRACHT_ZWAK);
    expect(states[4]).toBe("wacht");
    expect(states[5]).toBe("wacht");
    expect(states[6]).toBe("wacht");
  });

  it("geeft alleen lagen ónder de winst-laag een wachtregel", () => {
    expect(movementLayerWhyWait(1, 2)).toBeNull();
    expect(movementLayerWhyWait(2, 2)).toBeNull();
    expect(movementLayerWhyWait(3, 2)).toBe(
      "Opbouwen begint pas als je krachtdagen vier weken staan.",
    );
    expect(movementLayerWhyWait(6, 2)).toBe(
      "Eerst je voedingscheck en je hertest, dan pas aanvullen.",
    );
  });
});

describe("de ladder-data", () => {
  it("heeft acties op prioriteit 1 tot en met 4, en bewust niet op 5 en 6", () => {
    const byId = Object.fromEntries(MOVEMENT_PRIORITY_LAYERS.map((l) => [l.id, l]));
    for (const id of [1, 2, 3, 4]) {
      expect(byId[id].actions.length, `acties op P${id}`).toBe(3);
    }
    expect(byId[5].actions).toHaveLength(0);
    expect(byId[6].actions).toHaveLength(0);
  });

  it("dekt elke staat met een label", () => {
    const { states } = ladderFor(KRACHT_ZWAK);
    for (const state of Object.values(states)) {
      expect(MOVEMENT_LAYER_STATE_LABEL[state]).toBeTruthy();
    }
  });
});

describe("resolveMovementLadderCoverage — percentage over wat de check meet", () => {
  it("telt alleen lagen met een checkveld als noemer", () => {
    const coverage = resolveMovementLadderCoverage({
      MOV2_SIT: 5,
      MOV2_MOB: 5,
      MOV2_STR: 5,
      MOV2_CARD: 4,
      MOV2_VIG: 4,
      MOV2_CONSIST: 2,
    });
    expect(coverage.measured).toEqual([1, 2, 3]);
    expect(coverage.onOrder).toEqual([1, 2]);
    expect(coverage.percentage).toBe(67);
  });

  it("laat een laag zonder antwoord buiten de noemer", () => {
    const coverage = resolveMovementLadderCoverage({ MOV2_SIT: 5, MOV2_MOB: 4 });
    expect(coverage.measured).toEqual([1]);
    expect(coverage.percentage).toBe(100);
  });

  it("rekent 'redelijk' niet als voldaan — dat is de laag die je in de gaten houdt", () => {
    const coverage = resolveMovementLadderCoverage({ MOV2_CONSIST: 3 });
    expect(coverage.measured).toEqual([3]);
    expect(coverage.onOrder).toEqual([]);
    expect(coverage.percentage).toBe(0);
  });

  it("geeft null zonder enige meting, in plaats van 0%", () => {
    expect(resolveMovementLadderCoverage({}).percentage).toBeNull();
  });

  it("laat de zwakste deelvraag de laag bepalen", () => {
    const coverage = resolveMovementLadderCoverage({
      MOV2_STR: 5,
      MOV2_CARD: 5,
      MOV2_VIG: 2,
    });
    expect(coverage.onOrder).toEqual([]);
  });
});
