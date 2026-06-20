import { describe, expect, it } from "vitest";
import {
  parseDashboardUnlockVariant,
  resolveDashboardUnlockVariant,
} from "@/lib/dashboard-unlock-variant";

describe("dashboard-unlock-variant", () => {
  it("parses valid variants", () => {
    expect(parseDashboardUnlockVariant("a")).toBe("a");
    expect(parseDashboardUnlockVariant("b")).toBe("b");
    expect(parseDashboardUnlockVariant("c")).toBeNull();
    expect(parseDashboardUnlockVariant(null)).toBeNull();
  });

  it("prefers query param over cookie", () => {
    const result = resolveDashboardUnlockVariant({
      queryVariant: "b",
      cookieVariant: "a",
    });
    expect(result).toEqual({ variant: "b", persistCookie: false });
  });

  it("uses cookie when query is absent", () => {
    const result = resolveDashboardUnlockVariant({
      queryVariant: null,
      cookieVariant: "a",
    });
    expect(result).toEqual({ variant: "a", persistCookie: false });
  });

  it("assigns new variant when nothing is set", () => {
    const result = resolveDashboardUnlockVariant({
      queryVariant: undefined,
      cookieVariant: undefined,
    });
    expect(["a", "b"]).toContain(result.variant);
    expect(result.persistCookie).toBe(true);
  });
});
