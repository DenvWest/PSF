import { describe, expect, it } from "vitest";
import {
  buildAccountLoginHref,
  buildSleepAnalysisLoginHref,
  parseAccountLoginFrom,
  parseSleepAnalysisFocus,
} from "@/lib/account-login-href";

describe("parseAccountLoginFrom", () => {
  it("maps known from values", () => {
    expect(parseAccountLoginFrom("intake")).toBe("intake");
    expect(parseAccountLoginFrom("voortgang")).toBe("voortgang");
    expect(parseAccountLoginFrom("sleep_analysis")).toBe("sleep_analysis");
    expect(parseAccountLoginFrom(undefined)).toBe("default");
    expect(parseAccountLoginFrom("other")).toBe("default");
  });
});

describe("buildAccountLoginHref", () => {
  it("prefers intake session over voortgang param", () => {
    expect(
      buildAccountLoginHref({
        hasIntakeSession: true,
        searchParams: { from: "voortgang" },
      }),
    ).toBe("/account/login?from=intake");
  });

  it("adds voortgang context from current page params", () => {
    expect(
      buildAccountLoginHref({
        searchParams: { from: "voortgang" },
      }),
    ).toBe("/account/login?from=voortgang");
  });

  it("falls back to plain login", () => {
    expect(buildAccountLoginHref({})).toBe("/account/login");
  });
});

describe("parseSleepAnalysisFocus", () => {
  it("maps valid focus keys", () => {
    expect(parseSleepAnalysisFocus("inslapen")).toBe("inslapen");
    expect(parseSleepAnalysisFocus("doorslapen")).toBe("doorslapen");
    expect(parseSleepAnalysisFocus("regelmaat")).toBe("regelmaat");
  });

  it("returns null for invalid focus values", () => {
    expect(parseSleepAnalysisFocus("uitgerust")).toBeNull();
    expect(parseSleepAnalysisFocus(undefined)).toBeNull();
    expect(parseSleepAnalysisFocus(null)).toBeNull();
    expect(parseSleepAnalysisFocus("")).toBeNull();
  });
});

describe("buildSleepAnalysisLoginHref", () => {
  it("includes focus when valid", () => {
    expect(buildSleepAnalysisLoginHref("doorslapen")).toBe(
      "/account/login?from=sleep_analysis&focus=doorslapen",
    );
  });

  it("omits focus when invalid or missing", () => {
    expect(buildSleepAnalysisLoginHref(null)).toBe("/account/login?from=sleep_analysis");
    expect(buildSleepAnalysisLoginHref("onzin")).toBe("/account/login?from=sleep_analysis");
  });
});
