// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AgendaEiwitMaaltijdKaart from "@/components/dashboard/agenda/AgendaEiwitMaaltijdKaart";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

afterEach(cleanup);

describe("AgendaEiwitMaaltijdKaart", () => {
  it("toont een vinkje alleen bij een bewezen maaltijd en nooit 'gemist' bij leeg", () => {
    render(
      <AgendaEiwitMaaltijdKaart
        title="Begin elke maaltijd met 20–30 g eiwit"
        maaltijden={[
          { id: "ontbijt", label: "Ontbijt", stand: "gehaald", gram: 31 },
          { id: "lunch", label: "Lunch", stand: "open", gram: 12 },
          { id: "avondeten", label: "Avondeten", stand: "leeg", gram: null },
        ]}
      />,
    );

    expect(screen.getByText("31 g")).toBeTruthy();
    expect(screen.getByText("12 g")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.getByText("minimaal 20 gram eiwit")).toBeTruthy();
    expect(screen.getByText("nog niet aangetoond")).toBeTruthy();
    expect(screen.getByText("niet ingevuld")).toBeTruthy();
    expect(screen.queryByText(/gemist$/i)).toBeNull();
    expect(screen.getByRole("link", { name: /Naar je dagboek/ }).getAttribute("href")).toContain(
      "tab=vandaag",
    );
  });
});
