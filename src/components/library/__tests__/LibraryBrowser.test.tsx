// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import BlogLibrary from "@/components/blog/BlogLibrary";
import KennisbankLibrary from "@/components/kennisbank/KennisbankLibrary";
import { getBlogLibraryItems } from "@/lib/library/blog-items";
import { getKennisbankLibraryItems } from "@/lib/library/kennisbank-items";

const blogItems = getBlogLibraryItems();
const kennisbankItems = getKennisbankLibraryItems();

function kaartTitels(): string[] {
  return screen
    .getAllByRole("heading", { level: 3 })
    .map((kop) => kop.textContent ?? "");
}

/** Titels van alles wat expliciet vanuit de vrouwelijke fysiologie is geschreven. */
const vrouwenTitels = new Set(
  blogItems
    .filter((item) => item.audience === "vrouwen")
    .map((item) => item.title),
);

/** Titels van alles wat expliciet vanuit de mannelijke fysiologie is geschreven. */
const mannenTitels = new Set(
  blogItems
    .filter((item) => item.audience === "mannen")
    .map((item) => item.title),
);

describe("bibliotheek — publiekslens", () => {
  it("verbergt niets: het totaal blijft gelijk in elke lens", () => {
    const { rerender } = render(<BlogLibrary items={blogItems} />);
    expect(
      screen.getByText(new RegExp(`${blogItems.length} artikelen`)),
    ).toBeTruthy();

    rerender(<BlogLibrary items={blogItems} initialAudience="vrouwen" />);
    expect(
      screen.getByText(new RegExp(`${blogItems.length} artikelen`)),
    ).toBeTruthy();
  });

  it("zet de eigen fysiologie bovenaan en de andere onder een eigen kop", () => {
    render(<BlogLibrary items={blogItems} initialAudience="vrouwen" />);

    expect(vrouwenTitels.has(kaartTitels()[0])).toBe(true);
    expect(screen.getByText("Voor iedereen")).toBeTruthy();
  });

  it("zet in de mannen-lens de eigen fysiologie bovenaan", () => {
    render(<BlogLibrary items={blogItems} initialAudience="mannen" />);

    expect(mannenTitels.has(kaartTitels()[0])).toBe(true);
  });

  it("schakelen van lens herordent zonder de lijst leeg te maken", () => {
    render(<BlogLibrary items={blogItems} />);

    const groep = screen.getByRole("radiogroup", { name: /voor wie/i });
    fireEvent.click(within(groep).getByRole("radio", { name: "Vrouwen" }));

    expect(vrouwenTitels.has(kaartTitels()[0])).toBe(true);
    expect(kaartTitels().length).toBeGreaterThan(1);
  });
});

describe("bibliotheek — filteren", () => {
  it("filtert op onderwerp en telt mee in de kop", () => {
    render(<BlogLibrary items={blogItems} initialGroup="slaap" />);

    const slaap = blogItems.filter((item) => item.groupKey === "slaap").length;
    expect(screen.getByText(new RegExp(`${slaap} artikelen`))).toBeTruthy();
  });

  it("sluit basis en verdieping wederzijds uit in plaats van ze op te tellen", () => {
    render(<KennisbankLibrary items={kennisbankItems} />);

    const verdieping = screen.getAllByRole("button", { name: "Verdieping" })[0];
    const basis = screen.getAllByRole("button", { name: "Basis" })[0];

    fireEvent.click(verdieping);
    expect(verdieping.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(basis);
    expect(basis.getAttribute("aria-pressed")).toBe("true");
    expect(verdieping.getAttribute("aria-pressed")).toBe("false");
    expect(kaartTitels().length).toBeGreaterThan(0);
  });

  it("geeft een lege staat met een uitweg als het zoekwoord niets oplevert", () => {
    render(<BlogLibrary items={blogItems} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "zzzzzz" },
    });

    expect(screen.getByText(/Geen resultaten/)).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: "Wis filters" }).length,
    ).toBeGreaterThan(0);
  });
});
