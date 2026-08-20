// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SchapView from "@/components/dashboard/voortgang/SchapView";
import type { DashboardModel, PillarId, SchapTabId } from "@/types/dashboard";

type FakeFavorite = { id: string; title: string; kind: string; domain?: string };

let favoriteItems: FakeFavorite[] = [];
const save = vi.fn();

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: favoriteItems,
    hydrated: true,
    isSaved: (id: string) => favoriteItems.some((item) => item.id === id),
    save,
    remove: vi.fn(),
  }),
}));

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

const model = {} as DashboardModel;

function renderSchap(domain: PillarId, activeTab: SchapTabId | null = null) {
  return render(
    <SchapView
      model={model}
      domain={domain}
      activeTab={activeTab}
      onTabChange={vi.fn()}
      onBack={vi.fn()}
      onOpenLeefstijlprofiel={vi.fn()}
    />,
  );
}

function tabLabels(): string[] {
  return screen.getAllByRole("tab").map((tab) => tab.textContent ?? "");
}

beforeEach(() => {
  favoriteItems = [];
  save.mockClear();
});

describe("SchapView — welke tabs een domein draagt", () => {
  it("toont op slaap alleen Leefstijl en Producten", () => {
    renderSchap("slaap");
    expect(tabLabels()).toEqual(["Leefstijl", "Producten"]);
    expect(screen.queryByRole("tab", { name: "Diensten" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });

  it("toont op voeding alleen Leefstijl en Producten", () => {
    renderSchap("voeding");
    expect(tabLabels()).toEqual(["Leefstijl", "Producten"]);
    expect(screen.queryByRole("tab", { name: "Diensten" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });

  it("toont op beweging Leefstijl, Producten en Diensten, nooit Begeleiding", () => {
    renderSchap("beweging");
    expect(tabLabels()).toEqual(["Leefstijl", "Producten", "Diensten"]);
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });
});

describe("SchapView — de Leefstijl-tab is een spiegel", () => {
  it("draagt geen kaart en geen knop behalve terug en de leefstijlprofiel-link", () => {
    favoriteItems = [
      { id: "laag-beweging-p2-tweemaal-per-week-kracht", title: "Kracht", kind: "activiteit" },
    ];
    renderSchap("beweging", "leefstijl");

    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label") ?? button.textContent)).toEqual(
      ["Terug", "Je leefstijlprofiel →"],
    );
    expect(screen.queryByText("Bewaar in Favorieten")).toBeNull();
    expect(screen.queryByText("Bekijk ons oordeel")).toBeNull();
  });

  it("telt per laag wat je koos in dit domein", () => {
    favoriteItems = [
      { id: "laag-beweging-p1-elk-werkuur-staan", title: "Staan", kind: "activiteit" },
      { id: "laag-beweging-p1-stevig-wandelen", title: "Wandelen", kind: "activiteit" },
      { id: "laag-slaap-p1-vast-opstaan", title: "Vast opstaan", kind: "activiteit" },
    ];
    renderSchap("beweging", "leefstijl");

    expect(screen.getAllByText("2 gekozen")).toHaveLength(1);
    expect(screen.getAllByText("niets gekozen").length).toBeGreaterThan(0);
  });
});

describe("SchapView — een tab die dit domein niet heeft", () => {
  it("valt terug op de default zonder te crashen", () => {
    renderSchap("slaap", "diensten");
    const selected = screen.getAllByRole("tab").filter(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]?.textContent).toBe("Producten");
  });

  it("valt ook terug bij begeleiding, die nooit rendert", () => {
    renderSchap("beweging", "begeleiding");
    const selected = screen.getAllByRole("tab").filter(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]?.textContent).toBe("Producten");
  });
});
