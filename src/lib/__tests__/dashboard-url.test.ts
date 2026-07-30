/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import {
  buildDashboardAgendaHref,
  buildDashboardPlanHref,
  buildDashboardVandaagHref,
  buildDashboardVoortgangHref,
  isValidAgendaDate,
  parseDagFromUrl,
  parseKompasFromUrl,
  parseStatistiekenBlikFromUrl,
  parseVoortgangScreenFromUrl,
  syncDashboardDagParam,
  syncDashboardKompasParam,
  syncDashboardStatistiekenBlikParam,
  syncDashboardTabParam,
  syncDashboardVoortgangScreenParam,
} from "@/lib/dashboard-url";

describe("parseVoortgangScreenFromUrl", () => {
  it("returns hub when screen missing or invalid", () => {
    expect(parseVoortgangScreenFromUrl("http://localhost/dashboard?tab=voortgang")).toBe(
      "hub",
    );
    expect(
      parseVoortgangScreenFromUrl("http://localhost/dashboard?tab=voortgang&screen=invalid"),
    ).toBe("hub");
  });

  it("parses valid subview screens", () => {
    expect(
      parseVoortgangScreenFromUrl("http://localhost/dashboard?tab=voortgang&screen=favorieten"),
    ).toBe("favorieten");
    expect(
      parseVoortgangScreenFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=statistieken",
      ),
    ).toBe("statistieken");
    expect(
      parseVoortgangScreenFromUrl("http://localhost/dashboard?tab=voortgang&screen=inzichten"),
    ).toBe("inzichten");
  });
});

describe("buildDashboardVoortgangHref", () => {
  it("builds hub without screen param", () => {
    expect(buildDashboardVoortgangHref()).toBe("/dashboard?tab=voortgang");
    expect(buildDashboardVoortgangHref("hub")).toBe("/dashboard?tab=voortgang");
  });

  it("includes screen for subviews", () => {
    expect(buildDashboardVoortgangHref("favorieten")).toBe(
      "/dashboard?tab=voortgang&screen=favorieten",
    );
    expect(buildDashboardVoortgangHref("statistieken", "advies")).toBe(
      "/dashboard?tab=voortgang&screen=statistieken&blik=advies",
    );
  });
});

describe("parseStatistiekenBlikFromUrl", () => {
  it("parses valid blik on statistieken screen", () => {
    expect(
      parseStatistiekenBlikFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=statistieken&blik=tijd",
      ),
    ).toBe("tijd");
  });

  it("returns null for invalid blik", () => {
    expect(
      parseStatistiekenBlikFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=statistieken&blik=invalid",
      ),
    ).toBeNull();
  });
});

describe("syncDashboardStatistiekenBlikParam", () => {
  it("sets blik when on statistieken screen", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL(
        "http://localhost/dashboard?tab=voortgang&screen=statistieken&blik=stand",
      ),
    });

    syncDashboardStatistiekenBlikParam("advies");
    expect(pushState).toHaveBeenCalledOnce();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("blik=advies");

    window.history.pushState = originalPush;
  });
});

describe("syncDashboardVoortgangScreenParam", () => {
  it("sets and clears screen on voortgang tab", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=voortgang"),
    });

    syncDashboardVoortgangScreenParam("favorieten");
    expect(pushState).toHaveBeenCalledOnce();
    let nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=voortgang");
    expect(nextUrl).toContain("screen=favorieten");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL(nextUrl),
    });
    pushState.mockClear();

    syncDashboardVoortgangScreenParam("hub");
    expect(pushState).toHaveBeenCalledOnce();
    nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=voortgang");
    expect(nextUrl).not.toContain("screen=");

    window.history.pushState = originalPush;
  });
});

describe("parseDagFromUrl", () => {
  it("parses valid dag param", () => {
    expect(parseDagFromUrl("http://localhost/dashboard?tab=agenda&dag=2026-07-26")).toBe(
      "2026-07-26",
    );
  });

  it("returns null for invalid dag", () => {
    expect(parseDagFromUrl("http://localhost/dashboard?dag=invalid")).toBeNull();
  });
});

describe("isValidAgendaDate", () => {
  it("accepts ISO dates", () => {
    expect(isValidAgendaDate("2026-07-26")).toBe(true);
  });

  it("rejects invalid dates", () => {
    expect(isValidAgendaDate("2026-13-01")).toBe(false);
  });
});

describe("buildDashboardAgendaHref", () => {
  it("includes dag when provided", () => {
    expect(buildDashboardAgendaHref("2026-07-26")).toBe(
      "/dashboard?tab=agenda&dag=2026-07-26",
    );
  });
});

describe("syncDashboardDagParam", () => {
  it("sets dag on agenda tab", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=agenda"),
    });

    syncDashboardDagParam("2026-07-30");
    expect(pushState).toHaveBeenCalledOnce();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("dag=2026-07-30");

    window.history.pushState = originalPush;
  });
});

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
  it("routes movement plan to the dashboard vandaag view", () => {
    expect(buildDashboardPlanHref("movement")).toBe(buildDashboardVandaagHref("beweging"));
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

describe("syncDashboardTabParam", () => {
  it("pushState on tab change and clears kompas and screen for non-vandaag tabs", () => {
    const originalReplace = window.history.replaceState;
    const originalPush = window.history.pushState;
    const replaceState = vi.fn();
    const pushState = vi.fn();
    window.history.replaceState = replaceState as typeof window.history.replaceState;
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL(
        "http://localhost/dashboard?tab=vandaag&kompas=slaap&view=stappenplan",
      ),
    });

    syncDashboardTabParam("voortgang");
    expect(pushState).toHaveBeenCalledOnce();
    expect(replaceState).not.toHaveBeenCalled();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=voortgang");
    expect(nextUrl).not.toContain("kompas=");
    expect(nextUrl).not.toContain("view=");
    expect(nextUrl).not.toContain("screen=");

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

  it("clears screen when leaving voortgang", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=voortgang&screen=favorieten"),
    });

    syncDashboardTabParam("hermeting");
    expect(pushState).toHaveBeenCalledOnce();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=hermeting");
    expect(nextUrl).not.toContain("screen=");

    window.history.pushState = originalPush;
  });
});
