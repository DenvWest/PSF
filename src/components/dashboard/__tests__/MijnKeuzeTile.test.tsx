// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MijnKeuzeTile from "@/components/dashboard/MijnKeuzeTile";

let favoriteItems: Array<{
  id: string;
  title: string;
  kind: string;
  domain?: string;
}> = [];
vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: favoriteItems,
    hydrated: true,
    isSaved: () => false,
    save: vi.fn(),
    remove: vi.fn(),
  }),
}));

describe("MijnKeuzeTile — N4: wat je koos, naam + afvinken, nooit aanbod", () => {
  it("rendert niets zonder gekozen items voor dit domein", () => {
    favoriteItems = [{ id: "magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" }];
    const { container } = render(<MijnKeuzeTile domain="beweging" surface="kompas_beweging" />);
    expect(container.firstChild).toBeNull();
  });

  it("toont elk gekozen item van dit domein, ongeacht kind", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis, 2× per week", kind: "activiteit", domain: "beweging" },
      { id: "creatine", title: "Creatine", kind: "supplement", domain: "beweging" },
      { id: "magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    render(<MijnKeuzeTile domain="beweging" surface="kompas_beweging" />);
    expect(screen.getByText("Kracht thuis, 2× per week")).toBeTruthy();
    expect(screen.getByText("Creatine")).toBeTruthy();
    expect(screen.queryByText("Magnesium")).toBeNull();
  });

  it("vinkt af op klik, onafhankelijk per rij", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
      { id: "padel", title: "Padel met Bram", kind: "activiteit", domain: "beweging" },
    ];
    render(<MijnKeuzeTile domain="beweging" surface="kompas_beweging" />);
    const rows = screen.getAllByRole("button");
    fireEvent.click(rows[0]);
    expect(rows[0].getAttribute("aria-pressed")).toBe("true");
    expect(rows[1].getAttribute("aria-pressed")).toBe("false");
  });

  it("noemt geen merk, prijs of oordeel — alleen de naam", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis, 2× per week", kind: "activiteit", domain: "beweging" },
    ];
    render(<MijnKeuzeTile domain="beweging" surface="kompas_beweging" />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/€|Aanrader|Alleen als|Nu niet|commissie/);
  });
});

describe("MijnKeuzeTile — de home-variant is domein-overstijgend", () => {
  it("toont alle domeinen zonder domain-prop, elk met zijn herkomst", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
      { id: "magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    render(<MijnKeuzeTile surface="kompas_home" />);
    expect(screen.getByText("Kracht thuis")).toBeTruthy();
    expect(screen.getByText("Magnesium")).toBeTruthy();
    // N2: de bron staat in beeld, anders is niet te zien waar een rij vandaan komt.
    expect(screen.getByText("Beweging")).toBeTruthy();
    expect(screen.getByText("Slaap")).toBeTruthy();
  });

  it("laat de herkomst weg op een domeinscherm — daar is hij ruis", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
    ];
    render(<MijnKeuzeTile domain="beweging" surface="kompas_beweging" />);
    expect(screen.queryByText("Beweging")).toBeNull();
  });

  it("houdt een gekozen supplement een handeling: geen merk, prijs of oordeel", () => {
    favoriteItems = [
      { id: "magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    render(<MijnKeuzeTile surface="kompas_home" />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/€|Aanrader|Alleen als|Nu niet|commissie|vergelijk/i);
  });
});
