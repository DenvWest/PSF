import { describe, expect, it } from "vitest";
import {
  getVitalityBand,
  getVitalityBandMessage,
  VITALITY_BANDS,
} from "@/lib/vitality-gauge";

describe("getVitalityBand", () => {
  it("returns uit_balans for low scores", () => {
    expect(getVitalityBand(10).id).toBe("uit_balans");
  });

  it("returns optimaal for high scores", () => {
    expect(getVitalityBand(90).id).toBe("optimaal");
  });

  it("clamps out-of-range values", () => {
    expect(getVitalityBand(-5).id).toBe(VITALITY_BANDS[0].id);
    expect(getVitalityBand(150).id).toBe("optimaal");
  });
});

describe("getVitalityBandMessage", () => {
  it("includes the optional category label", () => {
    const message = getVitalityBandMessage(90, "Je voeding");
    expect(message).toContain("Je voeding");
  });
});
