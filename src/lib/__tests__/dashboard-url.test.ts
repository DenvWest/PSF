/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import {
  buildDashboardAgendaHref,
  buildDashboardKeuzeHref,
  buildDashboardPlanHref,
  buildDashboardVandaagHref,
  buildDashboardVoortgangHref,
  isAgendaViewId,
  isPillarId,
  isSchapTabId,
  isValidAgendaDate,
  parseAgendaViewFromUrl,
  parseDagFromUrl,
  parseKompasFromUrl,
  parseLeefstijlprofielDomeinFromUrl,
  parseKeuzeDeelFromUrl,
  parseKeuzeDomeinFromUrl,
  parseVoortgangScreenFromUrl,
  canonicalizeDashboardTabParam,
  canonicalizeVoortgangScreenParam,
  getLegacyVoortgangScreenAlias,
  syncDashboardAgendaViewParam,
  syncDashboardDagParam,
  syncDashboardKompasParam,
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
      parseVoortgangScreenFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=leefstijlprofiel",
      ),
    ).toBe("leefstijlprofiel");
    // `screen=favorieten` is legacy (22 aug, opgeheven scherm): zonder domein
    // valt de route terug op de hub.
    expect(
      parseVoortgangScreenFromUrl("http://localhost/dashboard?tab=voortgang&screen=favorieten"),
    ).toBe("hub");
    // Oude bookmark: `favorieten` mét een schap-domein wás het schap. Dit is
    // de lees-kant, want `canonicalize` draait alleen op popstate.
    expect(
      parseVoortgangScreenFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=favorieten&fav=beweging",
      ),
    ).toBe("schap");
    // Een domein zonder schap heeft geen bestemming meer — terug naar de hub.
    expect(
      parseVoortgangScreenFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=favorieten&fav=stress",
      ),
    ).toBe("hub");
    expect(
      parseVoortgangScreenFromUrl("http://localhost/dashboard?tab=voortgang&screen=inzichten"),
    ).toBe("leefstijlprofiel");
    expect(
      parseVoortgangScreenFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=domein&domein=beweging",
      ),
    ).toBe("leefstijlprofiel");
  });

  it("redirects legacy statistieken screens", () => {
    expect(
      parseVoortgangScreenFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=statistieken",
      ),
    ).toBe("hub");
    expect(
      parseVoortgangScreenFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=lichaamssamenstelling",
      ),
    ).toBe("hub");
  });

  it("canonicalizeVoortgangScreenParam rewrites legacy screen params in-place", () => {
    const inzichtenUrl = new URL(
      "http://localhost/dashboard?tab=voortgang&screen=inzichten",
    );
    expect(canonicalizeVoortgangScreenParam(inzichtenUrl)).toBe("leefstijlprofiel");
    expect(inzichtenUrl.searchParams.get("screen")).toBe("leefstijlprofiel");

    const domeinUrl = new URL(
      "http://localhost/dashboard?tab=voortgang&screen=domein&domein=beweging",
    );
    expect(canonicalizeVoortgangScreenParam(domeinUrl)).toBe("leefstijlprofiel");
    expect(domeinUrl.searchParams.get("screen")).toBe("leefstijlprofiel");
    expect(domeinUrl.searchParams.get("fav")).toBe("beweging");
    expect(domeinUrl.searchParams.has("domein")).toBe(false);

    const statistiekenUrl = new URL(
      "http://localhost/dashboard?tab=voortgang&screen=statistieken&blik=advies",
    );
    expect(canonicalizeVoortgangScreenParam(statistiekenUrl)).toBe("hub");
    expect(statistiekenUrl.searchParams.has("screen")).toBe(false);
    expect(statistiekenUrl.searchParams.has("blik")).toBe(false);

    expect(getLegacyVoortgangScreenAlias("hub")).toBeNull();
    expect(canonicalizeVoortgangScreenParam(new URL("http://localhost/dashboard?tab=voortgang"))).toBeNull();

    // Legacy (22 aug, scherm opgeheven): `favorieten` mét een schap-domein was
    // en is het schap. Oude links dragen de oude naam nog, dus die schuiven door.
    const favorietenSchapUrl = new URL(
      "http://localhost/dashboard?tab=voortgang&screen=favorieten&fav=beweging&schap=producten",
    );
    expect(canonicalizeVoortgangScreenParam(favorietenSchapUrl)).toBe("schap");
    expect(favorietenSchapUrl.searchParams.get("screen")).toBe("schap");
    expect(favorietenSchapUrl.searchParams.get("fav")).toBe("beweging");
    expect(favorietenSchapUrl.searchParams.get("schap")).toBe("producten");

    // Zonder domein mét schap is er geen bestemming meer — terug naar de hub,
    // geen dode `screen=favorieten` die blijft hangen.
    const favorietenUrl = new URL(
      "http://localhost/dashboard?tab=voortgang&screen=favorieten&fav=stress&schap=producten",
    );
    expect(canonicalizeVoortgangScreenParam(favorietenUrl)).toBe("hub");
    expect(favorietenUrl.searchParams.has("screen")).toBe(false);
    expect(favorietenUrl.searchParams.has("fav")).toBe(false);
    expect(favorietenUrl.searchParams.has("schap")).toBe(false);

    // Legacy: screen=leefstijlprofiel&fav=beweging blijft leefstijlprofiel (lifestyle).
    const leefstijlprofielUrl = new URL(
      "http://localhost/dashboard?tab=voortgang&screen=leefstijlprofiel&fav=beweging",
    );
    canonicalizeVoortgangScreenParam(leefstijlprofielUrl);
    expect(leefstijlprofielUrl.searchParams.get("screen")).toBe("leefstijlprofiel");
    expect(leefstijlprofielUrl.searchParams.get("fav")).toBe("beweging");
  });
});

describe("buildDashboardVoortgangHref", () => {
  it("builds hub without screen param", () => {
    expect(buildDashboardVoortgangHref()).toBe("/dashboard?tab=voortgang");
    expect(buildDashboardVoortgangHref("hub")).toBe("/dashboard?tab=voortgang");
  });

  it("includes screen for subviews", () => {
    expect(buildDashboardVoortgangHref("leefstijlprofiel")).toBe(
      "/dashboard?tab=voortgang&screen=leefstijlprofiel",
    );
  });

  it("includes fav for leefstijlprofiel deep links", () => {
    expect(buildDashboardVoortgangHref("leefstijlprofiel", null, null, "beweging")).toBe(
      "/dashboard?tab=voortgang&screen=leefstijlprofiel&fav=beweging",
    );
  });

  it("draagt geen fav meer voor het legacy schap-scherm — dat is de Keuze-tab", () => {
    expect(buildDashboardVoortgangHref("schap", null, null, "beweging")).toBe(
      "/dashboard?tab=voortgang&screen=schap",
    );
  });
});

describe("buildDashboardKeuzeHref", () => {
  it("bouwt een Keuze-deeplink zonder onderdeel", () => {
    expect(buildDashboardKeuzeHref("beweging")).toBe(
      "/dashboard?tab=keuze&domein=beweging",
    );
  });

  it("neemt het onderdeel mee als het gegeven is", () => {
    expect(buildDashboardKeuzeHref("beweging", "producten")).toBe(
      "/dashboard?tab=keuze&domein=beweging&deel=producten",
    );
  });

  it("deeplinkt naar favorieten — het archief van dit domein", () => {
    expect(buildDashboardKeuzeHref("beweging", "favorieten")).toBe(
      "/dashboard?tab=keuze&domein=beweging&deel=favorieten",
    );
  });
});

describe("canonicalizeDashboardTabParam", () => {
  it("stuurt het oude hermeting-tabblad naar Voortgang › Hermeting", () => {
    const url = new URL("http://localhost/dashboard?tab=hermeting");
    expect(canonicalizeDashboardTabParam(url)).toBe("voortgang");
    expect(url.search).toBe("?tab=voortgang&screen=hermeting");
  });

  it("stuurt het oude schap-scherm naar de Keuze-tab, mét onderdeel", () => {
    const url = new URL(
      "http://localhost/dashboard?tab=voortgang&screen=schap&fav=slaap&schap=favorieten",
    );
    expect(canonicalizeDashboardTabParam(url)).toBe("keuze");
    expect(url.searchParams.get("tab")).toBe("keuze");
    expect(url.searchParams.get("domein")).toBe("slaap");
    expect(url.searchParams.get("deel")).toBe("favorieten");
    expect(url.searchParams.get("screen")).toBeNull();
    expect(url.searchParams.get("fav")).toBeNull();
  });

  it("stuurt ook de nog oudere favorieten-naam door naar de Keuze-tab", () => {
    const url = new URL("http://localhost/dashboard?tab=voortgang&screen=favorieten&fav=voeding");
    expect(canonicalizeDashboardTabParam(url)).toBe("keuze");
    expect(url.searchParams.get("domein")).toBe("voeding");
  });

  it("laat een domein zonder schap op Voortgang staan i.p.v. op een lege Keuze-tab", () => {
    const url = new URL("http://localhost/dashboard?tab=voortgang&screen=schap&fav=stress");
    expect(canonicalizeDashboardTabParam(url)).toBeNull();
  });

  it("laat huidige routes met rust", () => {
    const url = new URL("http://localhost/dashboard?tab=keuze&domein=slaap");
    expect(canonicalizeDashboardTabParam(url)).toBeNull();
    expect(url.search).toBe("?tab=keuze&domein=slaap");
  });
});

describe("parseKeuzeDomeinFromUrl", () => {
  it("leest domein op de Keuze-tab", () => {
    expect(parseKeuzeDomeinFromUrl("http://localhost/dashboard?tab=keuze&domein=slaap")).toBe(
      "slaap",
    );
  });

  it("valt terug op de oude fav-param", () => {
    expect(
      parseKeuzeDomeinFromUrl("http://localhost/dashboard?tab=voortgang&screen=schap&fav=voeding"),
    ).toBe("voeding");
  });

  it("geeft null zonder domein", () => {
    expect(parseKeuzeDomeinFromUrl("http://localhost/dashboard?tab=keuze")).toBeNull();
  });
});

describe("isSchapTabId", () => {
  it("accepts the four schap tabs", () => {
    expect(isSchapTabId("producten")).toBe(true);
    expect(isSchapTabId("diensten")).toBe(true);
    expect(isSchapTabId("begeleiding")).toBe(true);
    expect(isSchapTabId("favorieten")).toBe(true);
  });

  // W4a: een oude bookmark met `schap=leefstijl` valt door naar de default-tab
  // in plaats van op een leeg paneel te landen.
  it("wijst de opgeheven leefstijl-tab af", () => {
    expect(isSchapTabId("leefstijl")).toBe(false);
  });

  it("rejects unknown values", () => {
    expect(isSchapTabId("supplementen")).toBe(false);
    expect(isSchapTabId(null)).toBe(false);
    expect(isSchapTabId(undefined)).toBe(false);
  });
});

describe("parseKeuzeDeelFromUrl", () => {
  it("parses a valid schap tab", () => {
    expect(
      parseKeuzeDeelFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=schap&fav=beweging&schap=diensten",
      ),
    ).toBe("diensten");
  });

  it("returns null when missing or invalid", () => {
    expect(
      parseKeuzeDeelFromUrl("http://localhost/dashboard?tab=voortgang&screen=schap"),
    ).toBeNull();
    expect(
      parseKeuzeDeelFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=schap&schap=onbekend",
      ),
    ).toBeNull();
  });
});

describe("parseLeefstijlprofielDomeinFromUrl", () => {
  it("parses fav on leefstijlprofiel screen", () => {
    expect(
      parseLeefstijlprofielDomeinFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=leefstijlprofiel&fav=beweging",
      ),
    ).toBe("beweging");
  });

  it("returns null for invalid fav", () => {
    expect(
      parseLeefstijlprofielDomeinFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=leefstijlprofiel&fav=invalid",
      ),
    ).toBeNull();
  });

  it("parses fav from legacy domein param", () => {
    expect(
      parseLeefstijlprofielDomeinFromUrl(
        "http://localhost/dashboard?tab=voortgang&screen=domein&domein=beweging",
      ),
    ).toBe("beweging");
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

    syncDashboardVoortgangScreenParam("leefstijlprofiel");
    expect(pushState).toHaveBeenCalledOnce();
    let nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=voortgang");
    expect(nextUrl).toContain("screen=leefstijlprofiel");

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

  it("includes view when provided", () => {
    expect(buildDashboardAgendaHref("2026-07-26", "week")).toBe(
      "/dashboard?tab=agenda&dag=2026-07-26&view=week",
    );
    expect(buildDashboardAgendaHref(null, "maand")).toBe(
      "/dashboard?tab=agenda&view=maand",
    );
  });
});

describe("parseAgendaViewFromUrl", () => {
  it("parses the three agenda views", () => {
    expect(parseAgendaViewFromUrl("http://localhost/dashboard?tab=agenda&view=week")).toBe(
      "week",
    );
    expect(parseAgendaViewFromUrl("http://localhost/dashboard?tab=agenda&view=maand")).toBe(
      "maand",
    );
    expect(parseAgendaViewFromUrl("http://localhost/dashboard?tab=agenda&view=dag")).toBe(
      "dag",
    );
  });

  it("falls back to dag when missing or invalid", () => {
    expect(parseAgendaViewFromUrl("http://localhost/dashboard?tab=agenda")).toBe("dag");
    expect(parseAgendaViewFromUrl("http://localhost/dashboard?tab=agenda&view=jaar")).toBe(
      "dag",
    );
  });

  it("ignores the legacy view param on other tabs", () => {
    expect(
      parseAgendaViewFromUrl("http://localhost/dashboard?tab=vandaag&view=stappenplan"),
    ).toBe("dag");
    expect(parseAgendaViewFromUrl("http://localhost/dashboard?tab=vandaag&view=week")).toBe(
      "dag",
    );
  });

  it("accepts only the three view ids", () => {
    expect(isAgendaViewId("dag")).toBe(true);
    expect(isAgendaViewId("week")).toBe(true);
    expect(isAgendaViewId("maand")).toBe(true);
    expect(isAgendaViewId("jaar")).toBe(false);
    expect(isAgendaViewId(undefined)).toBe(false);
  });
});

describe("syncDashboardAgendaViewParam", () => {
  it("sets view on the agenda tab", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=agenda&dag=2026-08-19"),
    });

    syncDashboardAgendaViewParam("maand");
    expect(pushState).toHaveBeenCalledOnce();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("view=maand");
    expect(nextUrl).toContain("dag=2026-08-19");

    window.history.pushState = originalPush;
  });

  it("does nothing outside the agenda tab", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=vandaag"),
    });

    syncDashboardAgendaViewParam("week");
    expect(pushState).not.toHaveBeenCalled();

    window.history.pushState = originalPush;
  });
});

describe("syncDashboardTabParam — agenda view", () => {
  it("keeps the current view when switching to agenda", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=vandaag&dag=2026-08-19"),
    });

    syncDashboardTabParam("agenda", { dag: "2026-08-19", view: "week" });
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=agenda");
    expect(nextUrl).toContain("view=week");

    window.history.pushState = originalPush;
  });

  it("drops the view param when leaving the agenda tab", () => {
    const originalPush = window.history.pushState;
    const pushState = vi.fn();
    window.history.pushState = pushState as typeof window.history.pushState;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost/dashboard?tab=agenda&view=maand"),
    });

    syncDashboardTabParam("keuze");
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).not.toContain("view=");

    window.history.pushState = originalPush;
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

describe("isPillarId — kompas URL sync", () => {
  it("accepts valid kompas values used by KompasHome searchParams sync", () => {
    expect(isPillarId("beweging")).toBe(true);
    expect(isPillarId("slaap")).toBe(true);
  });

  it("rejects invalid kompas params", () => {
    expect(isPillarId("invalid")).toBe(false);
    expect(isPillarId(null)).toBe(false);
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
      value: new URL("http://localhost/dashboard?tab=voortgang&screen=leefstijlprofiel"),
    });

    syncDashboardTabParam("keuze");
    expect(pushState).toHaveBeenCalledOnce();
    const nextUrl = pushState.mock.calls[0]?.[2] as string;
    expect(nextUrl).toContain("tab=keuze");
    expect(nextUrl).not.toContain("screen=");

    window.history.pushState = originalPush;
  });
});
