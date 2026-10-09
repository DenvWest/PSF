// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TerugNaarKeuze from "@/components/supplement-hub/TerugNaarKeuze";

const zoek = vi.hoisted(() => ({ waarde: "" }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(zoek.waarde) }));
vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));

afterEach(cleanup);

function renderTerug() {
  return render(
    <TerugNaarKeuze surface="product" slug="royal-green-whey" catalogusHref="/supplementen?categorie=eiwitpoeder" categorieLabel="Eiwitpoeder" />,
  );
}

describe("TerugNaarKeuze", () => {
  it("toont de weg terug naar dezelfde stof en naar alle producten, alleen vanuit Keuze", () => {
    zoek.waarde = "van=keuze&stof=protein";
    renderTerug();
    expect(screen.getByRole("link", { name: /Terug naar je keuze · Eiwit/ }).getAttribute("href")).toBe(
      "/dashboard?tab=keuze&stof=protein",
    );
    expect(screen.getByRole("link", { name: /Alle eiwitpoeder-producten met PS-Score/ }).getAttribute("href")).toBe(
      "/supplementen?categorie=eiwitpoeder",
    );
  });

  it("rendert niets voor een bezoeker die niet uit Keuze komt", () => {
    zoek.waarde = "";
    const { container } = renderTerug();
    expect(container.innerHTML).toBe("");
  });

  it("brengt je terug naar Mijn keuzes als je daar vandaan kwam", () => {
    zoek.waarde = "van=keuze&stof=omega3&deel=favorieten";
    renderTerug();
    expect(screen.getByRole("link", { name: /Terug naar Mijn keuzes · Omega-3/ }).getAttribute("href")).toBe(
      "/dashboard?tab=keuze&stof=omega3&deel=favorieten",
    );
  });
});
