import { describe, it, expect } from "vitest";
import {
  isUsableFirstName,
  getHeroTitle,
  getMailConfirmation,
} from "@/lib/intake-greetings";
import { normalizeFirstName } from "@/lib/intake-consent";

describe("isUsableFirstName", () => {
  it("returns false for null", () => {
    expect(isUsableFirstName(null)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isUsableFirstName("")).toBe(false);
  });

  it("returns false for lone dash", () => {
    expect(isUsableFirstName("-")).toBe(false);
  });

  it("returns false for apostrophe only", () => {
    expect(isUsableFirstName("'")).toBe(false);
  });

  it("returns false for whitespace only", () => {
    expect(isUsableFirstName("   ")).toBe(false);
  });

  it("returns true for a normal name", () => {
    expect(isUsableFirstName("Jan")).toBe(true);
  });

  it("returns true for name with accented chars", () => {
    expect(isUsableFirstName("André")).toBe(true);
  });

  it("returns true for hyphenated name", () => {
    expect(isUsableFirstName("Jan-Willem")).toBe(true);
  });
});

describe("getHeroTitle", () => {
  it("returns fallback for null", () => {
    expect(getHeroTitle(null)).toBe("Jouw vitaliteitsprofiel");
  });

  it("returns fallback for empty string", () => {
    expect(getHeroTitle("")).toBe("Jouw vitaliteitsprofiel");
  });

  it("returns fallback for lone dash", () => {
    expect(getHeroTitle("-")).toBe("Jouw vitaliteitsprofiel");
  });

  it("includes name when usable", () => {
    expect(getHeroTitle("Jan")).toBe("Jouw vitaliteitsprofiel, Jan");
  });

  it("trims surrounding whitespace from name", () => {
    expect(getHeroTitle("  Jan  ")).toBe("Jouw vitaliteitsprofiel, Jan");
  });
});

describe("getMailConfirmation", () => {
  it("returns impersonal sentence for null", () => {
    expect(getMailConfirmation(null)).toBe(
      "Je ontvangt je leefstijl-overzicht ook per mail.",
    );
  });

  it("returns impersonal sentence for empty string", () => {
    expect(getMailConfirmation("")).toBe(
      "Je ontvangt je leefstijl-overzicht ook per mail.",
    );
  });

  it("returns impersonal sentence for lone dash", () => {
    expect(getMailConfirmation("-")).toBe(
      "Je ontvangt je leefstijl-overzicht ook per mail.",
    );
  });

  it("includes name when usable", () => {
    expect(getMailConfirmation("Jan")).toBe(
      "Jan, je ontvangt je leefstijl-overzicht ook per mail.",
    );
  });
});

describe("normalizeFirstName — stricter letter check", () => {
  it("returns null for lone dash", () => {
    expect(normalizeFirstName("-")).toBeNull();
  });

  it("returns null for apostrophe only", () => {
    expect(normalizeFirstName("'")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeFirstName("")).toBeNull();
  });

  it("returns null for non-string", () => {
    expect(normalizeFirstName(42)).toBeNull();
  });

  it("returns name for normal input", () => {
    expect(normalizeFirstName("Jan")).toBe("Jan");
  });

  it("truncates to 60 chars", () => {
    const long = "A".repeat(70);
    const result = normalizeFirstName(long);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(60);
  });
});
