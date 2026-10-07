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
