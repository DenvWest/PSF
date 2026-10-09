/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DagboekMaaltijd from "@/components/dashboard/dagboek/DagboekMaaltijd";

vi.mock("@/lib/use-gevolgde-stoffen", () => ({ useGevolgdeStoffen: () => ({ stoffen: [] }) }));

afterEach(cleanup);

const basis = {
  moment: "lunch" as const,
  label: "Lunch",
  items: [],
  onVerwijder: () => {},
  onGram: () => {},
  onToevoegen: () => {},
  onOpenProduct: () => {},
};

describe("DagboekMaaltijd · niet gegeten", () => {
  it("biedt 'Niet gegeten' op een lege hoofdmaaltijd en meldt de keuze", () => {
    const onOvergeslagen = vi.fn();
    render(<DagboekMaaltijd {...basis} onOvergeslagen={onOvergeslagen} />);
    fireEvent.click(screen.getByRole("button", { name: "Niet gegeten" }));
    expect(onOvergeslagen).toHaveBeenCalledWith(true);
  });

  it("toont een overgeslagen maaltijd als niet gegeten, met 'Toch gegeten' om terug te zetten", () => {
    const onOvergeslagen = vi.fn();
    render(<DagboekMaaltijd {...basis} overgeslagen onOvergeslagen={onOvergeslagen} />);
    expect(screen.getByText(/Niet gegeten op deze dag/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Toch gegeten" }));
    expect(onOvergeslagen).toHaveBeenCalledWith(false);
  });

  it("zonder handler (tussendoor) geen knop", () => {
    render(<DagboekMaaltijd {...basis} moment="tussendoor" label="Tussendoor" />);
    expect(screen.queryByRole("button", { name: "Niet gegeten" })).toBeNull();
  });
});

describe("DagboekMaaltijd · buiten je eetpatroon", () => {
  it("leeg is het één regel om toch iets toe te voegen, zonder 'Niet gegeten'", () => {
    const onToevoegen = vi.fn();
    render(<DagboekMaaltijd {...basis} buitenPatroon onToevoegen={onToevoegen} onOvergeslagen={() => {}} />);
    expect(screen.getByText("niet in je eetpatroon")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Niet gegeten" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Lunch — product toevoegen" }));
    expect(onToevoegen).toHaveBeenCalledWith("lunch");
  });

  it("met items is het weer een gewone maaltijd", () => {
    render(
      <DagboekMaaltijd
        {...basis}
        buitenPatroon
        items={[{ bron: "voeding", key: "havermout", grams: 50, moment: "lunch" }]}
      />,
    );
    expect(screen.queryByText("niet in je eetpatroon")).toBeNull();
    expect(screen.getByText("Samen minstens")).toBeTruthy();
  });
});
