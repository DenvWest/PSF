// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MovementMijnKeuzeTile from "@/components/dashboard/beweging/MovementMijnKeuzeTile";

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

describe("MovementMijnKeuzeTile — N4: wat je koos, naam + afvinken, nooit aanbod", () => {
  it("rendert niets zonder gekozen items voor beweging", () => {
    favoriteItems = [{ id: "magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" }];
    const { container } = render(<MovementMijnKeuzeTile />);
    expect(container.firstChild).toBeNull();
  });

  it("toont elk gekozen item van dit domein, ongeacht kind", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis, 2× per week", kind: "activiteit", domain: "beweging" },
      { id: "creatine", title: "Creatine", kind: "supplement", domain: "beweging" },
      { id: "magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    render(<MovementMijnKeuzeTile />);
    expect(screen.getByText("Kracht thuis, 2× per week")).toBeTruthy();
    expect(screen.getByText("Creatine")).toBeTruthy();
    expect(screen.queryByText("Magnesium")).toBeNull();
  });

  it("vinkt af op klik, onafhankelijk per rij", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
      { id: "padel", title: "Padel met Bram", kind: "activiteit", domain: "beweging" },
    ];
    render(<MovementMijnKeuzeTile />);
    const rows = screen.getAllByRole("button");
    fireEvent.click(rows[0]);
    expect(rows[0].getAttribute("aria-pressed")).toBe("true");
    expect(rows[1].getAttribute("aria-pressed")).toBe("false");
  });

  it("noemt geen merk, prijs of oordeel — alleen de naam", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis, 2× per week", kind: "activiteit", domain: "beweging" },
    ];
    render(<MovementMijnKeuzeTile />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/€|Aanrader|Alleen als|Nu niet|commissie/);
  });
});
