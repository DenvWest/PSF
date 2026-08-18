import { describe, expect, it } from "vitest";
import {
  hasVoortgangReturnParam,
  VOORTGANG_FAVORIETEN_HREF,
  withVoortgangReturn,
} from "@/lib/voortgang-return-link";

describe("withVoortgangReturn", () => {
  it("appends from=voortgang to internal paths", () => {
    expect(withVoortgangReturn("/supplementen")).toBe("/supplementen?from=voortgang");
    expect(withVoortgangReturn("/beste/magnesium")).toBe(
      "/beste/magnesium?from=voortgang",
    );
  });

  it("preserves existing query params", () => {
    expect(withVoortgangReturn("/supplementen?foo=bar")).toBe(
      "/supplementen?foo=bar&from=voortgang",
    );
  });

  it("leaves external URLs unchanged", () => {
    const url = "https://example.com/page";
    expect(withVoortgangReturn(url)).toBe(url);
  });
});

describe("hasVoortgangReturnParam", () => {
  it("detects voortgang return param", () => {
    expect(hasVoortgangReturnParam({ from: "voortgang" })).toBe(true);
    expect(hasVoortgangReturnParam({ from: ["voortgang", "other"] })).toBe(true);
    expect(hasVoortgangReturnParam({ from: "dashboard" })).toBe(false);
    expect(hasVoortgangReturnParam({})).toBe(false);
  });
});

describe("VOORTGANG_FAVORIETEN_HREF", () => {
  it("points to favorieten screen on voortgang tab", () => {
    expect(VOORTGANG_FAVORIETEN_HREF).toContain("tab=voortgang");
    expect(VOORTGANG_FAVORIETEN_HREF).toContain("screen=favorieten");
  });
});
