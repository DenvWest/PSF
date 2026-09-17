// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { StickyMobileCta } from "@/components/supplements/StickyMobileCta";
import { magnesiumData } from "@/data/supplements/magnesium";

const topProduct = magnesiumData.products[0];

function getBar(container: HTMLElement) {
  return container.querySelector('[aria-label="Snel naar topkeuze"]');
}

describe("StickyMobileCta", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("rendert affiliate-link met sticky-cta tracking op alle vergelijkingen", () => {
    const { container } = render(
      <StickyMobileCta topProduct={topProduct} category={magnesiumData.category} />,
    );
    const bar = getBar(container);

    expect(bar).toBeTruthy();
    expect(bar!.className).toContain("md:hidden");
    expect(bar!.className).toContain("env(safe-area-inset-bottom");

    const link = bar!.querySelector("a");
    expect(link?.getAttribute("href")).toBeTruthy();
    expect(link?.className).toContain("min-h-11");
  });

  it("toont de balk na scrollen voorbij 400px", () => {
    const { container } = render(
      <StickyMobileCta topProduct={topProduct} category={magnesiumData.category} />,
    );
    const bar = getBar(container);

    expect(bar!.className).toContain("translate-y-full");

    Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
    fireEvent.scroll(window);

    expect(bar!.className).toContain("translate-y-0");
    expect(bar!.getAttribute("aria-hidden")).toBe("false");
  });

  it("verbergt interactie wanneer niet zichtbaar", () => {
    const { container } = render(
      <StickyMobileCta topProduct={topProduct} category={magnesiumData.category} />,
    );
    const bar = getBar(container);

    expect(bar!.className).toContain("pointer-events-none");
    expect(bar!.getAttribute("aria-hidden")).toBe("true");
  });
});
