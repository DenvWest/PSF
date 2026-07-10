/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { parseKompasFromUrl, syncDashboardKompasParam, syncDashboardTabParam } from "@/lib/dashboard-url";

describe("parseKompasFromUrl", () => {
  it("parses valid kompas param", () => {
    expect(parseKompasFromUrl("http://localhost/dashboard?tab=vandaag&kompas=slaap")).toBe(
      "slaap",
    );
  });

  it("returns null for unknown kompas", () => {
    expect(parseKompasFromUrl("http://localhost/dashboard?kompas=invalid")).toBeNull();
  });

  it("returns null when kompas missing", () => {
    expect(parseKompasFromUrl("http://localhost/dashboard?tab=vandaag")).toBeNull();
  });
});

describe("syncDashboardKompasParam", () => {
  it("updates kompas in URL without navigation", () => {
    const original = window.history.replaceState;
    const replaceState = vi.fn();
    window.history.replaceState = replaceState as typeof window.history.replaceState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=voortgang"),
    });

    syncDashboardKompasParam("beweging");

    expect(replaceState).toHaveBeenCalledOnce();
    const nextUrl = replaceState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=vandaag");
    expect(nextUrl).toContain("kompas=beweging");

    syncDashboardKompasParam(null);
    const clearedUrl = replaceState.mock.calls[1]?.[2] as string;
    expect(clearedUrl).toContain("tab=vandaag");
    expect(clearedUrl).not.toContain("kompas=");

    window.history.replaceState = original;
  });
});

describe("syncDashboardTabParam", () => {
  it("sets the tab in the URL without navigation and clears kompas for non-vandaag tabs", () => {
    const original = window.history.replaceState;
    const replaceState = vi.fn();
    window.history.replaceState = replaceState as typeof window.history.replaceState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=vandaag&kompas=slaap"),
    });

    syncDashboardTabParam("voortgang");
    const nextUrl = replaceState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=voortgang");
    expect(nextUrl).not.toContain("kompas=");

    window.history.replaceState = original;
  });
});
