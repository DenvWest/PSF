import { describe, expect, it } from "vitest";
import {
  buildAccountLoginHref,
  parseAccountLoginFrom,
} from "@/lib/account-login-href";

describe("parseAccountLoginFrom", () => {
  it("maps known from values", () => {
    expect(parseAccountLoginFrom("intake")).toBe("intake");
    expect(parseAccountLoginFrom("voortgang")).toBe("voortgang");
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
