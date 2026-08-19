/** @vitest-environment jsdom */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LeefstijlprofielDomeinView from "@/components/dashboard/voortgang/LeefstijlprofielDomeinView";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

// KompasDomainGauge → VitalityGauge leest prefers-reduced-motion; jsdom kent
// matchMedia niet standaard.
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ??
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
});

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

let favoriteItems: Array<{
  id: string;
  title: string;
  kind: string;
  domain?: string;
  source?: string;
}> = [];
vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: favoriteItems,
    hydrated: true,
    isSaved: (id: string) => favoriteItems.some((item) => item.id === id),
    save: vi.fn(),
    remove: vi.fn(),
  }),
}));

function model(): DashboardModel {
  return {
    scores: { beweging: 52 },
    trend: {},
    trendBaselines: {},
    answers: {},
    domainScores: {},
    movementPlanProgress: null,
  } as unknown as DashboardModel;
}

const noop = () => {};

describe("LeefstijlprofielDomeinView — beweging, geen check", () => {
  it("toont lege staten en nul toggle, nul schap-kaarten", () => {
    favoriteItems = [];
    render(
      <LeefstijlprofielDomeinView
        model={model()}
        data={undefined}
        domain="beweging"
        onBack={noop}
        onGoVandaag={noop}
      />,
    );

    expect(screen.queryByRole("tablist", { name: "Leefstijlkeuzeweergave" })).toBeNull();
    expect(screen.getByText("Doe je beweegcheck om te zien welke prioriteiten en acties bij jou passen.")).toBeTruthy();
    expect(screen.getByText("Je hebt hier nog niets gekozen. Alles onder Aanbeveling werkt zonder dat je er iets naast zet.")).toBeTruthy();
  });
});

describe("LeefstijlprofielDomeinView — beweging, met check", () => {
  function data(): DashboardData {
    return {
      movementCheckinSnapshot: {
        date: "19 augustus 2026",
        headline: "Kracht is je winst-prioriteit",
        focusLabel: "Kracht + basisconditie",
        answerLabel: "Aandacht",
        focusStatement: "Twee keer per week kracht plus regelmatig matig intensief bewegen.",
        focusDimension: "kracht",
        delta: null,
        implicationLine: null,
        startStatement: null,
        factRows: [],
        ladder: {
          focus: 2,
          states: { 1: "ok", 2: "winst", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
        },
      },
      supplementVerdicts: [],
    } as unknown as DashboardData;
  }

  it("toont aanbevolen activiteiten met bewaarknop, geen prijs of oordeelslabel", () => {
    favoriteItems = [];
    render(
      <LeefstijlprofielDomeinView
        model={model()}
        data={data()}
        domain="beweging"
        onBack={noop}
        onGoVandaag={noop}
      />,
    );

    expect(screen.getAllByText("Kracht + basisconditie").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Twee krachtsessies per week, vijf oefeningen, hele lichaam.").length,
    ).toBeGreaterThan(0);

    const text = document.body.textContent ?? "";
    expect(text).not.toContain("€");
    expect(text).not.toContain("Aanrader");
    expect(text).not.toContain("commissie");
    expect(screen.queryByRole("tablist", { name: "Leefstijlkeuzeweergave" })).toBeNull();
  });

  it("toont opgeslagen activiteiten onder Mijn keuze, geen supplementen", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis, 2× per week", kind: "activiteit", domain: "beweging" },
      { id: "creatine", title: "Creatine", kind: "supplement", domain: "beweging" },
    ];
    render(
      <LeefstijlprofielDomeinView
        model={model()}
        data={data()}
        domain="beweging"
        onBack={noop}
        onGoVandaag={noop}
      />,
    );

    expect(screen.getByText("Kracht thuis, 2× per week")).toBeTruthy();
    expect(screen.queryByText("Creatine")).toBeNull();
  });

  it("de deur naar het schap gaat naar de favorieten-schap-href met producten-tab", () => {
    favoriteItems = [];
    render(
      <LeefstijlprofielDomeinView
        model={model()}
        data={data()}
        domain="beweging"
        onBack={noop}
        onGoVandaag={noop}
      />,
    );

    fireEvent.click(screen.getByText("Open je schap ›"));
    expect(mockPush).toHaveBeenCalledWith(
      "/dashboard?tab=voortgang&screen=favorieten&fav=beweging&schap=producten",
    );
  });
});
