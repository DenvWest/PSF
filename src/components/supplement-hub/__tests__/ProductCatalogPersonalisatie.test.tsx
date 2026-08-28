// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ProductCatalog from "@/components/supplement-hub/ProductCatalog";
import { getHubProducts } from "@/lib/supplement-hub/product-catalog";
import type { HubPersonalization } from "@/lib/supplement-hub/hub-personalization";

const products = getHubProducts();

const ready: HubPersonalization = {
  state: "ready",
  matches: [
    { category: "magnesium", name: "Magnesium", reason: "Reden magnesium." },
    { category: "omega-3", name: "Omega-3", reason: "Reden omega drie." },
  ],
};

describe("ProductCatalog personalisatie", () => {
  it("start op de persoonlijke selectie en markeert de kaarten", () => {
    render(<ProductCatalog products={products} personalization={ready} />);

    expect(screen.getByText(/Past bij jou: Magnesium en Omega-3/)).toBeTruthy();

    const chip = screen.getByRole("button", { name: /Past bij jou · \d+/ });
    expect(chip.getAttribute("aria-pressed")).toBe("true");

    const gemarkeerd = screen.getAllByText(/Past bij jou/);
    expect(gemarkeerd.length).toBeGreaterThan(2);

    const aantal = products.filter((p) =>
      ["magnesium", "omega-3"].includes(p.category),
    ).length;
    expect(screen.getByText(new RegExp(`${aantal} van ${products.length}`))).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Alles" }));
    expect(
      screen.getByText(new RegExp(`${products.length} van ${products.length}`)),
    ).toBeTruthy();
  });

  it("toont de check-CTA zonder sessie en geen persoonlijke chip", () => {
    render(
      <ProductCatalog products={products} personalization={{ state: "no_intake" }} />,
    );
    expect(screen.getByText(/Welke van deze/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Past bij jou ·/ })).toBeNull();
  });
});
