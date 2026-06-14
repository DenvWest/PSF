import { describe, expect, it } from "vitest";
import {
  MOVEMENT_DIRECTION_THRESHOLD,
  movementDirection,
  movementScoreFromReport,
  movementStartStatement,
} from "@/lib/movement-delta";

describe("movementScoreFromReport", () => {
  it("schaalt MOV_STR + MOV_CARD naar 0–100", () => {
    expect(movementScoreFromReport({ MOV_STR: 4, MOV_CARD: 4 })).toBe(100);
    expect(movementScoreFromReport({ MOV_STR: 1, MOV_CARD: 1 })).toBe(25);
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
