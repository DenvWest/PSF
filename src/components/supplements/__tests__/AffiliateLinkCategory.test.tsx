// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AffiliateLink } from "@/components/supplements/AffiliateLink";
import { MARKETING_CONSENT_STATE_COOKIE_NAME } from "@/lib/marketing-consent-client";

function setMarketingConsent(state: "granted" | "denied" | null) {
  if (state === null) {
    document.cookie = `${MARKETING_CONSENT_STATE_COOKIE_NAME}=; max-age=0; path=/`;
    return;
  }
  document.cookie = `${MARKETING_CONSENT_STATE_COOKIE_NAME}=${state}; path=/`;
}

function clickAndGetFetchBody(fetchMock: ReturnType<typeof vi.fn>) {
  const call = fetchMock.mock.calls.find(
    ([url]) => url === "/api/affiliate/click",
  );
  if (!call) {
    throw new Error("trackClick heeft /api/affiliate/click niet aangeroepen");
  }
  const init = call[1] as RequestInit;
  return JSON.parse(init.body as string) as Record<string, unknown>;
}

afterEach(() => {
  setMarketingConsent(null);
  vi.restoreAllMocks();
});

describe("AffiliateLink — categorie-tracking per /beste/*-stof", () => {
  it("stuurt de doorgegeven category als affiliate_clicks.categorie", () => {
    setMarketingConsent("granted");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AffiliateLink
        affiliateSlug="arctic-blue-visolie"
        sourcePage="product-card"
        category="omega-3"
      >
        Bekijk bij partner
      </AffiliateLink>,
    );

    const link = screen.getByRole("link", { name: "Bekijk bij partner" });
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );

    const body = clickAndGetFetchBody(fetchMock);
    expect(body.categorie).toBe("omega-3");
  });

  it("valt terug op 'vergelijking' zonder category-prop (bestaand gedrag intact)", () => {
    setMarketingConsent("granted");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AffiliateLink affiliateSlug="arctic-blue-visolie" sourcePage="product-card">
        Bekijk bij partner
      </AffiliateLink>,
    );

    const link = screen.getByRole("link", { name: "Bekijk bij partner" });
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );

    const body = clickAndGetFetchBody(fetchMock);
    expect(body.categorie).toBe("vergelijking");
  });
});
