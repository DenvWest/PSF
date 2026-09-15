// @vitest-environment jsdom
//
// A1 — meet-audit als regressietest. Per /beste/*-pagina wordt elke affiliate-link
// die op die pagina gerenderd wordt daadwerkelijk aangeklikt, en daarna gecontroleerd
// dat de drie lagen van de funnel landen: affiliate_clicks (pagina/categorie/sub-ID/
// surface), GA4 (affiliate_click + affiliate_klik) en de SEO-attributen op de <a>.
//
// Zonder deze test is "CTA verplaatst" een wijziging waarvan pas weken later blijkt
// dat de klik niet meer geteld werd.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ChoiceHero } from "@/components/supplements/ChoiceHero";
import { ComboVariantSection } from "@/components/supplements/ComboVariantSection";
import { ProductCard } from "@/components/supplements/ProductCard";
import { StickyMobileCta } from "@/components/supplements/StickyMobileCta";
import { affiliateLinks } from "@/data/affiliate-links";
import {
  SUPPLEMENT_SLUGS,
  getSupplementComparisonData,
} from "@/data/supplements";
import { MARKETING_CONSENT_STATE_COOKIE_NAME } from "@/lib/marketing-consent-client";
import type { ComparisonPageData } from "@/types/supplement";

type ClickBody = {
  product_id: string;
  product_naam: string;
  categorie: string;
  surface: string;
  pagina: string;
};

type GtagCall = [string, string, Record<string, unknown>];

function grantMarketingConsent() {
  document.cookie = `${MARKETING_CONSENT_STATE_COOKIE_NAME}=granted; path=/`;
}

function clearMarketingConsent() {
  document.cookie = `${MARKETING_CONSENT_STATE_COOKIE_NAME}=; max-age=0; path=/`;
}

function affiliateAnchors(): HTMLAnchorElement[] {
  return screen
    .queryAllByRole("link")
    .filter((el): el is HTMLAnchorElement =>
      (el.getAttribute("rel") ?? "").includes("sponsored"),
    );
}

function lastClickBody(fetchMock: ReturnType<typeof vi.fn>): ClickBody {
  const calls = fetchMock.mock.calls;
  const last = calls[calls.length - 1] as [string, RequestInit];
  expect(last[0]).toBe("/api/affiliate/click");
  return JSON.parse(String(last[1].body)) as ClickBody;
}

function gtagEvents(gtag: ReturnType<typeof vi.fn>, name: string): GtagCall[] {
  return (gtag.mock.calls as GtagCall[]).filter(
    (call) => call[0] === "event" && call[1] === name,
  );
}

/** Rendert alle blokken die op /beste/[supplement] affiliate-links tonen. */
function renderComparisonSurfaces(data: ComparisonPageData) {
  const comboSlugs = new Set(
    data.comboVariant?.choiceRoutes.map((route) => route.slug) ?? [],
  );
  const primaryProducts = data.products.filter((p) => !comboSlugs.has(p.slug));
  const comboProducts = data.products.filter((p) => comboSlugs.has(p.slug));
  const topProductLabel = data.topProductLabel ?? "Topkeuze";
  const topProduct =
    primaryProducts.find((p) => p.bestFor === topProductLabel) ??
    data.products.find((p) => p.bestFor === topProductLabel) ??
    data.products[0];

  render(
    <>
      <ChoiceHero data={data} />
      {primaryProducts.map((product, i) => (
        <ProductCard
          key={product.slug}
          product={product}
          category={data.category}
          position={i + 1}
        />
      ))}
      {data.comboVariant ? (
        <ComboVariantSection data={data} products={comboProducts} />
      ) : null}
      <StickyMobileCta topProduct={topProduct} category={data.category} />
    </>,
  );
}

beforeEach(() => {
  grantMarketingConsent();
});

afterEach(() => {
  cleanup();
  clearMarketingConsent();
  delete window.gtag;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe.each(SUPPLEMENT_SLUGS)("/beste/%s — klik → affiliate_clicks → GA4", (slug) => {
  const data = getSupplementComparisonData(slug);
  if (!data) {
    throw new Error(`Geen vergelijkingsdata voor /beste/${slug}`);
  }

  it("stuurt elke affiliate-klik volledig door naar Supabase én GA4", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const gtag = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    window.gtag = gtag as unknown as typeof window.gtag;
    window.history.replaceState({}, "", `/beste/${slug}`);

    renderComparisonSurfaces(data);

    const anchors = affiliateAnchors();
    expect(anchors.length).toBeGreaterThan(0);

    for (const anchor of anchors) {
      // jsdom navigeert niet, maar target=_blank zou de testpagina wel verlaten.
      anchor.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );

      const body = lastClickBody(fetchMock);
      expect(body.categorie).toBe(data.category);
      expect(body.pagina).toBe(`/beste/${slug}`);
      expect(body.surface.length).toBeGreaterThan(0);
      expect(body.product_id in affiliateLinks).toBe(true);
      expect(anchor.getAttribute("href")).toBe(
        affiliateLinks[body.product_id as keyof typeof affiliateLinks],
      );
    }

    expect(fetchMock).toHaveBeenCalledTimes(anchors.length);
    expect(gtagEvents(gtag, "affiliate_click")).toHaveLength(anchors.length);
    expect(gtagEvents(gtag, "affiliate_klik")).toHaveLength(anchors.length);

    for (const call of gtagEvents(gtag, "affiliate_click")) {
      expect(call[2].item_category).toBe(data.category);
      expect(call[2].event_category).toBe("affiliate");
    }
    for (const call of gtagEvents(gtag, "affiliate_klik")) {
      expect(call[2].categorie).toBe(data.category);
    }
  });

  it("houdt de SEO- en veiligheidsattributen op elke affiliate-link intact", () => {
    renderComparisonSurfaces(data);

    const anchors = affiliateAnchors();
    expect(anchors.length).toBeGreaterThan(0);

    for (const anchor of anchors) {
      const rel = (anchor.getAttribute("rel") ?? "").split(/\s+/);
      expect(rel).toContain("nofollow");
      expect(rel).toContain("sponsored");
      expect(rel).toContain("noopener");
      expect(anchor.getAttribute("target")).toBe("_blank");
    }
  });

  it("dekt elke keuzeroute en elk product met een klikbare, getrackte link", () => {
    renderComparisonSurfaces(data);

    const hrefs = new Set(
      affiliateAnchors().map((anchor) => anchor.getAttribute("href")),
    );
    const verwacht = [
      ...data.choiceRoutes.map((route) => route.affiliateSlug),
      ...(data.comboVariant?.choiceRoutes.map((route) => route.affiliateSlug) ??
        []),
      ...data.products.map((product) => product.affiliateSlug),
    ];

    for (const affiliateSlug of verwacht) {
      expect(affiliateLinks[affiliateSlug]).toBeTruthy();
      expect(hrefs.has(affiliateLinks[affiliateSlug])).toBe(true);
    }
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe("/beste/* — funnel-dekking als geheel", () => {
  it("dekt precies de zeven live vergelijkingspagina's", () => {
    expect(SUPPLEMENT_SLUGS).toHaveLength(7);
  });

  it("laat geen affiliate-link buiten AffiliateLink om lopen", () => {
    const toegestaan = path.join("src", "components", "supplements", "AffiliateLink.tsx");
    const omzeilers = sourceFiles("src")
      .filter((file) => !file.includes("__tests__"))
      .filter((file) => file !== toegestaan)
      .filter((file) => /affiliateLinks\s*\[/.test(readFileSync(file, "utf8")));

    expect(omzeilers).toEqual([]);
  });
});
