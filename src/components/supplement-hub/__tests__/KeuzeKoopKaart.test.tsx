// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import KeuzeKoopKaart from "@/components/supplement-hub/KeuzeKoopKaart";

const zoek = vi.hoisted(() => ({ waarde: "" }));
const klik = vi.hoisted(() => ({ trackAffiliateClick: vi.fn() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(zoek.waarde) }));
vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn(), trackAffiliateKlik: vi.fn(), GA4_EVENTS: { COOKIE_MARKETING_GATE: "g" } }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/track", () => ({ trackClick: vi.fn() }));
vi.mock("@/lib/track-affiliate-click", () => ({ trackAffiliateClick: klik.trackAffiliateClick }));
vi.mock("@/lib/marketing-consent-client", () => ({ readMarketingConsentStateClient: () => "granted" }));
vi.mock("@/lib/supplement-catalog-db/register-click-client", () => ({ registerSupplementClick: vi.fn() }));

beforeEach(() => klik.trackAffiliateClick.mockClear());
afterEach(cleanup);

function renderKaart() {
  return render(
    <KeuzeKoopKaart
      naam="Orangefit Protein"
      prijsPerDag="€ 1,36"
      score="75,9"
      affiliateSlug="proteine-orangefit-protein"
      category="eiwitpoeder"
    />,
  );
}

describe("KeuzeKoopKaart", () => {
  it("staat bovenaan de productpagina voor wie uit Keuze komt, met prijs per dag en de commissie-uitleg", () => {
    zoek.waarde = "van=keuze&stof=protein";
    renderKaart();
    const kaart = screen.getByRole("region", { name: "Prijs en winkels" });
    expect(kaart.textContent).toMatch(/Orangefit Protein/);
    expect(kaart.textContent).toMatch(/€ 1,36 per dag/);
    expect(kaart.textContent).toMatch(/PS-Score 75,9/);
    expect(kaart.textContent).toMatch(/vergoeding als je via deze link koopt/);
    expect(screen.getByRole("link", { name: "Hoe dat werkt" }).getAttribute("href")).toBe("/affiliate-disclosure");
    const winkel = screen.getByRole("link", { name: /Prijs en winkels/ });
    expect(winkel.getAttribute("rel")).toBe("nofollow sponsored noopener noreferrer");
    expect(winkel.getAttribute("target")).toBe("_blank");
  });

  it("meldt de klik met een eigen herkomst, zodat Keuze apart af te lezen is", () => {
    zoek.waarde = "van=keuze&stof=protein";
    renderKaart();
    fireEvent.click(screen.getByRole("link", { name: /Prijs en winkels/ }));
    expect(klik.trackAffiliateClick).toHaveBeenCalledWith(
      "proteine-orangefit-protein",
      expect.objectContaining({ pageType: "productpagina-keuze", category: "eiwitpoeder" }),
    );
  });

  it("rendert niets voor een bezoeker die niet uit Keuze komt", () => {
    zoek.waarde = "";
    const { container } = renderKaart();
    expect(container.innerHTML).toBe("");
  });
});
