import { describe, expect, it } from "vitest";
import { derivePAL, PAL_VERSION } from "@/lib/movement-pal";

describe("derivePAL", () => {
  it("lage training, geen werk-input → sedentary 1.4", () => {
    expect(derivePAL({ MOV_STR: 1, MOV_CARD: 1 })).toMatchObject({
      pal: 1.4,
      band: "sedentary",
    });
  });

  it("matige piek → light 1.6", () => {
    expect(derivePAL({ MOV_STR: 2, MOV_CARD: 1 })).toMatchObject({
      pal: 1.6,
      band: "light",
    });
  });

  it("veel sport zonder fysiek werk → active 1.8, nooit 2.0", () => {
    expect(derivePAL({ MOV_STR: 4, MOV_CARD: 4 })).toMatchObject({
      pal: 1.8,
      band: "active",
    });
  });

  it("fysiek werk tilt een zittende sporter omhoog", () => {
    expect(derivePAL({ MOV_STR: 1, MOV_CARD: 1, workActivity: 4 })).toMatchObject({
      band: "active",
    });
  });

  it("fysiek werk én regelmatig sport → very_active 2.0", () => {
    expect(derivePAL({ MOV_STR: 3, MOV_CARD: 3, workActivity: 3 })).toMatchObject({
      pal: 2.0,
      band: "very_active",
    });
  });

  it("geen enkele input → veilige ondergrens (sedentary)", () => {
    expect(derivePAL({})).toMatchObject({ band: "sedentary" });
  });

  it("clampt buiten bereik en negeert NaN", () => {
    // MOV_STR 9 → 4, MOV_CARD NaN → genegeerd → piek 4 → active
    expect(derivePAL({ MOV_STR: 9, MOV_CARD: Number.NaN })).toMatchObject({
      band: "active",
    });
  });

  it("exporteert een versie", () => {
    expect(PAL_VERSION).toBe("1.0.0");
  });
});
