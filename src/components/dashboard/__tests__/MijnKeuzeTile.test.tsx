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

const trackEvent = vi.fn();
vi.mock("@/lib/ga4", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

describe("MijnKeuzeTile — N4: wat je koos, naam + herkomst, nooit aanbod", () => {
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

  it("heeft geen afvink-knoppen of aria-pressed — afvinken is Mijn Dag", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
      { id: "padel", title: "Padel met Bram", kind: "activiteit", domain: "beweging" },
    ];
    render(<MijnKeuzeTile domain="beweging" surface="kompas_beweging" />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(document.querySelector("[aria-pressed]")).toBeNull();
  });

  it("opent Mijn Dag via de CTA en meet dat", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
    ];
    const onGoAgenda = vi.fn();
    trackEvent.mockClear();
    render(
      <MijnKeuzeTile domain="beweging" surface="kompas_beweging" onGoAgenda={onGoAgenda} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Open Mijn Dag/ }));
    expect(onGoAgenda).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_mijn_keuze_open_agenda",
      expect.objectContaining({ surface: "kompas_beweging", domain: "beweging" }),
    );
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

  it("embedded toont panel-eyebrow zonder CockpitTile-chrome", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
    ];
    render(<MijnKeuzeTile surface="kompas_home" embedded onGoAgenda={vi.fn()} />);
    expect(screen.getByText("Mijn keuze")).toBeTruthy();
    expect(screen.getByText("Kracht thuis")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Open Mijn Dag/ })).toBeTruthy();
  });

  it("embedded empty-state nodigt uit om een domein te openen", () => {
    favoriteItems = [];
    const onOpenDomain = vi.fn();
    const { container } = render(
      <MijnKeuzeTile surface="kompas_home" embedded onOpenDomain={onOpenDomain} />,
    );
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText(/Nog niets gekozen/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Open prioriteitsdomein/ }));
    expect(onOpenDomain).toHaveBeenCalled();
  });
});
