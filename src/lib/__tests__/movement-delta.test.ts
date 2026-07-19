import { describe, expect, it } from "vitest";
import {
  MOVEMENT_DIRECTION_THRESHOLD,
  movementDirection,
  movementScoreFromReport,
  movementStartStatement,
} from "@/lib/movement-delta";

const depthReport = {
  MOV2_STR: 5,
  MOV2_CARD: 5,
  MOV2_VIG: 5,
  MOV2_SIT: 5,
  MOV2_COND: 5,
  MOV2_PAIN: 5,
  MOV2_MOB: 5,
  MOV2_FUNC: 5,
  MOV2_CONSIST: 5,
  MOV2_MOTIV: 5,
  RCV_FEEL: 1,
};

describe("movementScoreFromReport", () => {
  it("schaalt 10 MOV2-velden naar 0–100 via depth-pad", () => {
    expect(movementScoreFromReport(depthReport)).toBe(100);
    expect(
      movementScoreFromReport({
        ...depthReport,
        MOV2_STR: 1,
        MOV2_CARD: 1,
        MOV2_VIG: 1,
        MOV2_SIT: 1,
        MOV2_COND: 1,
        MOV2_PAIN: 1,
        MOV2_MOB: 1,
        MOV2_FUNC: 1,
        MOV2_CONSIST: 1,
        MOV2_MOTIV: 1,
      }),
    ).toBe(0);
  });

  it("negeert RCV_FEEL voor movement_score", () => {
    expect(
      movementScoreFromReport({
        ...depthReport,
        RCV_FEEL: 5,
      }),
    ).toBe(100);
  });
});

describe("movementDirection", () => {
  it("verbeterd op of boven de drempel", () => {
    expect(movementDirection(50, 50 + MOVEMENT_DIRECTION_THRESHOLD)).toBe("improved");
  });
  it("verslechterd op of onder de drempel", () => {
    expect(movementDirection(50, 50 - MOVEMENT_DIRECTION_THRESHOLD)).toBe("worsened");
  });
  it("stabiel binnen de drempel", () => {
    expect(movementDirection(50, 52)).toBe("stable");
  });
});

describe("movementStartStatement", () => {
  it("geeft een passende zin per richting", () => {
    expect(movementStartStatement("improved")).toContain("goede kant op");
    expect(movementStartStatement("stable")).toContain("gelijk aan je start");
    expect(movementStartStatement("worsened")).toContain("proces");
  });
});
