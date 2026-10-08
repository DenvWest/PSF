// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AgendaDagKaart from "@/components/dashboard/agenda/AgendaDagKaart";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { STANDAARD_NORMEN } from "@/lib/nutrition-normen";

const mockTrackEvent = vi.hoisted(() => vi.fn());
vi.mock("@/lib/ga4", () => ({ trackEvent: mockTrackEvent }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

afterEach(cleanup);

const dag: DagboekDag = {
  date: "2026-10-08",
  soort: "doordeweeks",
  porties: {},
  items: [
    { moment: "ontbijt", key: "havermout", grams: 250 },
    { moment: "lunch", key: "havermout", grams: 30 },
  ],
};

describe("AgendaDagKaart", () => {
  it("toont eiwit per maaltijd met vinkje alleen bij bewezen, en leeg zonder 'gemist'", () => {
    render(<AgendaDagKaart dag={dag} normen={STANDAARD_NORMEN} />);

    expect(screen.getByText("minimaal 20 gram eiwit")).toBeTruthy();
    expect(screen.getByText("nog niet aangetoond")).toBeTruthy();
    expect(screen.getByText("niet ingevuld")).toBeTruthy();
    expect(screen.queryByText(/gemist$/i)).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("wisselt naar een andere stof en meet de keuze", () => {
    render(<AgendaDagKaart dag={dag} normen={STANDAARD_NORMEN} />);

    fireEvent.click(screen.getByRole("tab", { name: "Magnesium" }));

    expect(screen.getByRole("tab", { name: "Magnesium" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText(/van je norm/)).toBeTruthy();
    expect(mockTrackEvent).toHaveBeenCalledWith("agenda_dagkaart_stof_gekozen", { stof: "magnesium" });
  });
});
