/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import {
  buildDashboardBewegingStappenplanHref,
  buildDashboardPlanHref,
  buildDashboardVandaagHref,
  parseKompasDeepViewFromUrl,
  parseKompasFromUrl,
  syncDashboardKompasDeepView,
  syncDashboardKompasParam,
  syncDashboardTabParam,
} from "@/lib/dashboard-url";

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

describe("parseKompasDeepViewFromUrl", () => {
  it("returns stappenplan for beweging + view param", () => {
    expect(
      parseKompasDeepViewFromUrl(
        "http://localhost/dashboard?tab=vandaag&kompas=beweging&view=stappenplan",
      ),
    ).toBe("stappenplan");
  });

  it("returns cockpit when view missing or other domain", () => {
    expect(parseKompasDeepViewFromUrl("http://localhost/dashboard?kompas=beweging")).toBe(
      "cockpit",
    );
    expect(
      parseKompasDeepViewFromUrl("http://localhost/dashboard?kompas=slaap&view=stappenplan"),
    ).toBe("cockpit");
  });
});

describe("buildDashboardVandaagHref", () => {
  it("builds vandaag tab without kompas", () => {
    expect(buildDashboardVandaagHref()).toBe("/dashboard?tab=vandaag");
    expect(buildDashboardVandaagHref(null)).toBe("/dashboard?tab=vandaag");
  });

  it("includes kompas when provided", () => {
    expect(buildDashboardVandaagHref("stress")).toBe("/dashboard?tab=vandaag&kompas=stress");
  });
});

describe("buildDashboardPlanHref", () => {
  it("routes movement plan to dashboard sub-view", () => {
    expect(buildDashboardPlanHref("movement")).toBe(buildDashboardBewegingStappenplanHref());
  });

  it("keeps intake route for other plan domains", () => {
    expect(buildDashboardPlanHref("stress")).toBe("/intake/plan/stress?from=dashboard");
  });
});

describe("syncDashboardKompasParam", () => {
  it("pushState on domain open, switch, and close", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=vandaag"),
    });

    syncDashboardKompasParam("stress");
    expect(pushState).toHaveBeenCalledOnce();
    let nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=vandaag");
    expect(nextUrl).toContain("kompas=stress");
    expect(nextUrl).not.toContain("view=");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL(nextUrl),
    });
    pushState.mockClear();

    syncDashboardKompasParam("stress");
    expect(pushState).not.toHaveBeenCalled();

    syncDashboardKompasParam("beweging");
    expect(pushState).toHaveBeenCalledOnce();
    nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("kompas=beweging");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL(nextUrl),
    });
    pushState.mockClear();

    syncDashboardKompasParam(null);
    expect(pushState).toHaveBeenCalledOnce();
    nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=vandaag");
    expect(nextUrl).not.toContain("kompas=");
    expect(nextUrl).not.toContain("view=");

    window.history.pushState = originalPush;
  });

  it("pushState when switching from another tab to vandaag home", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=agenda"),
    });

    syncDashboardKompasParam(null);
    expect(pushState).toHaveBeenCalledOnce();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=vandaag");
    expect(nextUrl).not.toContain("kompas=");

    window.history.pushState = originalPush;
  });
});

describe("syncDashboardKompasDeepView", () => {
  it("sets view=stappenplan for beweging deep view", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=vandaag&kompas=beweging"),
    });

    syncDashboardKompasDeepView("beweging", "stappenplan");
    expect(pushState).toHaveBeenCalledOnce();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("kompas=beweging");
    expect(nextUrl).toContain("view=stappenplan");

    window.history.pushState = originalPush;
  });
});

describe("syncDashboardTabParam", () => {
  it("pushState on tab change and clears kompas for non-vandaag tabs", () => {
    const originalReplace = window.history.replaceState;
    const originalPush = window.history.pushState;
    const replaceState = vi.fn();
    const pushState = vi.fn();
    window.history.replaceState = replaceState as typeof window.history.replaceState;
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=vandaag&kompas=slaap&view=stappenplan"),
    });

    syncDashboardTabParam("voortgang");
    expect(pushState).toHaveBeenCalledOnce();
    expect(replaceState).not.toHaveBeenCalled();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=voortgang");
    expect(nextUrl).not.toContain("kompas=");
    expect(nextUrl).not.toContain("view=");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL(nextUrl),
    });
    pushState.mockClear();
    syncDashboardTabParam("voortgang");
    expect(pushState).not.toHaveBeenCalled();

    window.history.replaceState = originalReplace;
    window.history.pushState = originalPush;
  });
});
