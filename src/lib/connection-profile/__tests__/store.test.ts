import { describe, expect, it } from "vitest";
import { CONNECTION_NOTE_MAX_LENGTH } from "@/data/connection/vocabulary";
import { normalizeProfileInput } from "@/lib/connection-profile/store";

describe("normalizeProfileInput", () => {
  it("weert tags die niet in de woordenlijst staan", () => {
    const result = normalizeProfileInput({
      interests: ["muziek", "iets_verzonnens"] as never,
      doet: ["wandelen", "parachutespringen"] as never,
    });

    expect(result.interests).toEqual(["muziek"]);
    expect(result.doet).toEqual(["wandelen"]);
  });

  it("ontdubbelt tags", () => {
    const result = normalizeProfileInput({ interests: ["muziek", "muziek", "reizen"] });

    expect(result.interests).toEqual(["muziek", "reizen"]);
  });

  it("accepteert alleen een tweecijferig postcodegebied", () => {
    expect(normalizeProfileInput({ areaPc2: "35" }).areaPc2).toBe("35");
    expect(normalizeProfileInput({ areaPc2: " 35 " }).areaPc2).toBe("35");
    expect(normalizeProfileInput({ areaPc2: "3512" }).areaPc2).toBeNull();
    expect(normalizeProfileInput({ areaPc2: "05" }).areaPc2).toBeNull();
    expect(normalizeProfileInput({ areaPc2: "ab" }).areaPc2).toBeNull();
  });

  it("slaat niets op bij 'zeg ik liever niet'", () => {
    expect(normalizeProfileInput({ ageBand: "zeg_ik_liever_niet" as never }).ageBand).toBeNull();
    expect(normalizeProfileInput({ ageBand: "45_54" }).ageBand).toBe("45_54");
  });

  it("kapt de vrije tekst af en maakt leeg tekst null", () => {
    const long = "x".repeat(CONNECTION_NOTE_MAX_LENGTH + 40);

    expect(normalizeProfileInput({ note: long }).note).toHaveLength(
      CONNECTION_NOTE_MAX_LENGTH,
    );
    expect(normalizeProfileInput({ note: "   " }).note).toBeNull();
  });

  /** v1 kent geen zichtbaarheidskeuze — de waarde staat vast (§3.5). */
  it("dwingt zichtbaarheid af op prive", () => {
    expect(normalizeProfileInput({ visibility: "openbaar" as never }).visibility).toBe("prive");
  });

  it("levert een leeg maar geldig profiel bij lege invoer", () => {
    const result = normalizeProfileInput({});

    expect(result.interests).toEqual([]);
    expect(result.visibility).toBe("prive");
    expect(result.areaPc2).toBeNull();
  });
});
