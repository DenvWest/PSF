import { describe, expect, it } from "vitest";
import {
  COOKIE_CATEGORY_SHORT,
  COOKIE_INVENTORY,
  DEFAULT_OPTIONAL_COOKIE_PREFERENCES,
  categoryToggleState,
  cookieCountByCategory,
  cookiesByCategory,
  providersByCategory,
} from "@/data/cookie-inventory";

describe("cookie-inventory", () => {
  it("bevat alle kern-cookies uit privacy-tabel", () => {
    const names = COOKIE_INVENTORY.map((entry) => entry.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "psf_intake_sid",
        "psf_account",
        "psf_sleep_focus",
        "psf_analytics_state",
        "_ga / _ga_*",
        "_clck",
        "_clsk",
      ]),
    );
  });

  it("groeperen per categorie", () => {
    expect(cookieCountByCategory("necessary")).toBe(5);
    expect(cookieCountByCategory("statistics")).toBe(3);
    expect(cookiesByCategory("marketing")).toHaveLength(1);
  });

  it("groepeert cookies per aanbieder", () => {
    const necessaryProviders = providersByCategory("necessary");
    expect(necessaryProviders.some((group) => group.provider === "PerfectSupplement")).toBe(
      true,
    );
    expect(necessaryProviders.some((group) => group.provider === "Cloudflare")).toBe(true);
  });

  it("bepaalt toggle-state per categorie", () => {
    expect(categoryToggleState("necessary", { statistics: false, marketing: false }).locked).toBe(
      true,
    );
    expect(
      categoryToggleState("statistics", { statistics: true, marketing: false }).checked,
    ).toBe(true);
    expect(
      categoryToggleState("marketing", { statistics: false, marketing: true }).checked,
    ).toBe(true);
    expect(
      categoryToggleState("marketing", { statistics: false, marketing: false }).editable,
    ).toBe(true);
  });

  it("houdt optionele cookies standaard uit", () => {
    expect(DEFAULT_OPTIONAL_COOKIE_PREFERENCES).toEqual({
      statistics: false,
      marketing: false,
    });
    expect(
      categoryToggleState("statistics", DEFAULT_OPTIONAL_COOKIE_PREFERENCES).checked,
    ).toBe(false);
    expect(
      categoryToggleState("marketing", DEFAULT_OPTIONAL_COOKIE_PREFERENCES).checked,
    ).toBe(false);
    expect(
      categoryToggleState("necessary", DEFAULT_OPTIONAL_COOKIE_PREFERENCES).checked,
    ).toBe(true);
  });

  it("heeft korte consent-tekst alleen voor statistieken en marketing", () => {
    expect(COOKIE_CATEGORY_SHORT.necessary).toBeUndefined();
    expect(COOKIE_CATEGORY_SHORT.preferences).toBeUndefined();
    expect(COOKIE_CATEGORY_SHORT.statistics).toMatch(/anoniem/i);
    expect(COOKIE_CATEGORY_SHORT.marketing).toMatch(/geen advertenties/i);
  });
});
