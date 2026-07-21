import { describe, expect, it } from "vitest";
import { buildMovementRecoveryHint } from "@/lib/movement-recovery-hint";

describe("buildMovementRecoveryHint", () => {
  it("returns null when signals are healthy", () => {
    expect(
      buildMovementRecoveryHint({
        movStr: 2,
        movCard: 2,
        rcvPhys: 3,
        recoveryScore: 70,
        rcvFeel: 4,
      }),
    ).toBeNull();
  });

  it("suggests rest when intake recovery is low", () => {
    const hint = buildMovementRecoveryHint({
      movStr: 4,
      rcvPhys: 1,
      recoveryScore: 35,
    });
    expect(hint?.level).toBe("rest");
    expect(hint?.promoteRustdagStep).toBe(true);
    expect(hint?.source).toBe("intake");
    expect(hint?.overrideToday).toBe(false);
    expect(hint?.recommendRestChoice).toBe(true);
    expect(hint?.headline).toContain("Leefstijlcheck");
    expect(hint?.headline).not.toContain("vandaag");
  });

  it("suggests rest from low check-in feel", () => {
    const hint = buildMovementRecoveryHint({
      movStr: 2,
      movCard: 2,
      rcvPhys: 3,
      recoveryScore: 70,
      rcvFeel: 2,
    });
    expect(hint?.level).toBe("rest");
    expect(hint?.source).toBe("checkin");
    expect(hint?.overrideToday).toBe(true);
  });

  it("shows medical note only with sustained low intake + very low feel", () => {
    const hint = buildMovementRecoveryHint({
      movStr: 4,
      rcvPhys: 1,
      recoveryScore: 25,
      rcvFeel: 1,
    });
    expect(hint?.level).toBe("medical");
    expect(hint?.showMedicalNote).toBe(true);
    expect(hint?.overrideToday).toBe(true);
  });

  it("uses wearable recoveryFit when provided", () => {
    const hint = buildMovementRecoveryHint({
      movStr: 3,
      rcvPhys: 3,
      recoveryScore: 65,
      recoveryFit: 0.3,
    });
    expect(hint?.source).toBe("wearable");
    expect(hint?.level).toBe("rest");
    expect(hint?.overrideToday).toBe(true);
  });

  it("does not set overrideToday for intake-only light load hints", () => {
    const hint = buildMovementRecoveryHint({
      movStr: 4,
      movCard: 4,
      rcvPhys: 3,
      recoveryScore: 50,
    });
    expect(hint?.level).toBe("light");
    expect(hint?.source).toBe("intake");
    expect(hint?.overrideToday).toBe(false);
    expect(hint?.recommendRestChoice).toBe(true);
  });
});
