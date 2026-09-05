// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";
import { COOKIE_PREFERENCES_EVENT } from "@/lib/analytics-consent-client";
import { MARKETING_CONSENT_STATE_COOKIE_NAME } from "@/lib/marketing-consent-client";

function setMarketingConsent(state: "granted" | "denied" | null) {
  if (state === null) {
    document.cookie = `${MARKETING_CONSENT_STATE_COOKIE_NAME}=; max-age=0; path=/`;
    return;
  }
  document.cookie = `${MARKETING_CONSENT_STATE_COOKIE_NAME}=${state}; path=/`;
}

function renderLink() {
  render(
    <AffiliateLink affiliateSlug="arctic-blue-visolie" sourcePage="test">
      Bekijk bij partner
    </AffiliateLink>,
  );
  return screen.getByRole("link", { name: "Bekijk bij partner" });
}

afterEach(() => {
  setMarketingConsent(null);
  vi.restoreAllMocks();
});

describe("AffiliateLink — marketing-consent-gate", () => {
  it("blokkeert de partnerredirect zonder marketingtoestemming en opent cookievoorkeuren", () => {
    setMarketingConsent("denied");
    const openedPreferences = vi.fn();
    window.addEventListener(COOKIE_PREFERENCES_EVENT, openedPreferences);

    const link = renderLink();
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(openedPreferences).toHaveBeenCalledTimes(1);

    window.removeEventListener(COOKIE_PREFERENCES_EVENT, openedPreferences);
  });

  it("laat de klik door zodra marketing is toegestaan", () => {
    setMarketingConsent("granted");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const link = renderLink();
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/affiliate/click",
      expect.anything(),
    );
  });

  it("houdt de affiliate-attributen intact", () => {
    setMarketingConsent("granted");
    const link = renderLink();

    expect(link.getAttribute("rel")).toBe("noopener noreferrer sponsored");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("referrerPolicy")).toBe("strict-origin");
  });
});

describe("AffiliateLink — onbekende slug", () => {
  it("toont een statusregel in plaats van een dode link", () => {
    render(
      // @ts-expect-error — bewust een slug zonder link, om de fallback te dekken
      <AffiliateLink affiliateSlug="bestaat-niet">Koop</AffiliateLink>,
    );

    expect(screen.getByRole("status").textContent).toContain(
      "Vergelijking volgt binnenkort",
    );
  });
});
