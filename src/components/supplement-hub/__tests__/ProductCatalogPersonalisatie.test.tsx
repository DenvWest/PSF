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

    const gemarkeerd = screen.getAllByText(/past bij jouw check/);
    expect(gemarkeerd.length).toBeGreaterThan(1);

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

describe("ProductCatalog zoeken en pagineren", () => {
  it("toont tien producten en laadt de rest in stappen bij", () => {
    render(
      <ProductCatalog products={products} personalization={{ state: "no_intake" }} />,
    );

    expect(screen.getAllByRole("article")).toHaveLength(10);

    fireEvent.click(screen.getByRole("button", { name: /Toon \d+ meer/ }));
    expect(screen.getAllByRole("article")).toHaveLength(
      Math.min(20, products.length),
    );
  });

  it("zoekt op categorie en op merk, en reset daarna de paginering", () => {
    render(
      <ProductCatalog products={products} personalization={{ state: "no_intake" }} />,
    );

    const zoekveld = screen.getByRole("searchbox", {
      name: /Zoek in de supplementen/,
    });

    fireEvent.change(zoekveld, { target: { value: "omega 3" } });
    const omega = products.filter((p) => p.category === "omega-3").length;
    expect(screen.getByText(new RegExp(`${omega} van ${products.length}`))).toBeTruthy();
    expect(screen.getAllByRole("article").length).toBe(Math.min(omega, 10));

    const merk = products[0].brand;
    fireEvent.change(zoekveld, { target: { value: merk } });
    const merkTreffers = products.filter((p) => p.brand === merk).length;
    expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("article").length).toBeLessThanOrEqual(
      Math.min(merkTreffers + products.length, 10),
    );

    fireEvent.change(zoekveld, { target: { value: "bestaatniet" } });
    expect(screen.getByText(/Geen product gevonden voor/)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: `Toon alle ${products.length} producten` }),
    );
    expect(screen.getAllByRole("article")).toHaveLength(10);
  });
});
