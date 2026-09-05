import { describe, expect, it } from "vitest";
import {
  buildStressCheckinSnapshot,
  buildStressFactRows,
  labelForStressField,
} from "@/lib/stress-checkin-readout";
import type { StressCheckReport } from "@/lib/stress-ladder";

const STRONG: StressCheckReport = {
  STR_FREQ: 4,
  STR_BLOCK: 4,
  STR_AUTO: 4,
  STR_AWARE: 4,
  STR_RCV: 4,
  STR_REFL: 4,
  STR_CHARGE: 4,
};

describe("labelForStressField", () => {
  it("leest labels woordelijk uit de checkin-vragen", () => {
    expect(labelForStressField("STR_FREQ", 1)).toBe("Dagelijks of bijna dagelijks");
    expect(labelForStressField("STR_BLOCK", 3)).toBe("Ik heb geen tijd");
  });
});

describe("buildStressFactRows", () => {
  it("zet de rij van de winst-laag bovenaan", () => {
    const report: StressCheckReport = { ...STRONG, STR_AUTO: 2 };
    const rows = buildStressFactRows(report, 2);
    expect(rows[0]?.layer).toBe(2);
    expect(rows[0]?.key).toBe("STR_AUTO");
  });

  it("markeert alleen spanning en herstel als score-wegend", () => {
    const rows = buildStressFactRows(STRONG, 6);
    expect(rows.find((r) => r.key === "STR_FREQ")?.scoresWeight).toBe(true);
    expect(rows.find((r) => r.key === "STR_AUTO")?.scoresWeight).toBe(false);
  });
});

describe("buildStressCheckinSnapshot", () => {
  it("levert headline, focus, staten en factRows voor een eerste check", () => {
    const snapshot = buildStressCheckinSnapshot({
      report: { ...STRONG, STR_FREQ: 1, STR_BLOCK: 3, STR_RCV: 1 },
      previousReport: null,
      startStatement: null,
    });
    expect(snapshot.focusLayer).toBe(1);
    expect(snapshot.layerStates[1]).toBe("winst");
    expect(snapshot.factRows.length).toBeGreaterThan(0);
    expect(snapshot.delta?.label).toBe("Je nulpunt");
    expect(snapshot.headline.length).toBeGreaterThan(10);
  });

  it("bouwt een delta-regel bij een vorige meting", () => {
    const snapshot = buildStressCheckinSnapshot({
      report: { ...STRONG, STR_FREQ: 3 },
      previousReport: { ...STRONG, STR_FREQ: 1 },
      startStatement: null,
    });
    expect(snapshot.delta?.label).toBe("Sinds je vorige meting");
    expect(snapshot.delta?.line).toContain("Spanning ging van");
  });
});
