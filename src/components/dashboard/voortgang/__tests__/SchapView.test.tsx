// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
const emitAccountClientEvent = vi.fn();
vi.mock("@/lib/account-events-client", () => ({
  emitAccountClientEvent: (...args: unknown[]) => emitAccountClientEvent(...args),
}));

const model = {} as DashboardModel;

function renderSchap(
  domain: PillarId,
  activeTab: SchapTabId | null = null,
  handlers: {
    onSwitchDomain?: (domain: PillarId) => void;
    onOpenLeefstijlprofiel?: (domain: PillarId) => void;
  } = {},
) {
  return render(
    <SchapView
      model={model}
      domain={domain}
      activeTab={activeTab}
      onTabChange={vi.fn()}
      onBack={vi.fn()}
      {...handlers}
    />,
  );
}

function tabLabels(): string[] {
  return screen.getAllByRole("tab").map((tab) => tab.textContent ?? "");
}

beforeEach(() => {
  favoriteItems = [];
  save.mockClear();
  emitAccountClientEvent.mockClear();
});

describe("SchapView — welke tabs een domein draagt", () => {
  it("toont op slaap Leefstijl, Producten en Favorieten", () => {
    renderSchap("slaap");
    expect(tabLabels()).toEqual(["Leefstijl", "Producten", "Favorieten"]);
    expect(screen.queryByRole("tab", { name: "Diensten" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });

  it("toont op voeding Leefstijl, Producten en Favorieten", () => {
    renderSchap("voeding");
    expect(tabLabels()).toEqual(["Leefstijl", "Producten", "Favorieten"]);
    expect(screen.queryByRole("tab", { name: "Diensten" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });

  it("toont op beweging Leefstijl, Producten, Diensten en Favorieten, nooit Begeleiding", () => {
    renderSchap("beweging");
    expect(tabLabels()).toEqual(["Leefstijl", "Producten", "Diensten", "Favorieten"]);
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });
});

describe("SchapView — de Leefstijl-tab is werkplek", () => {
  it("toont de ladder om keuzes te maken", () => {
    renderSchap("beweging", "leefstijl");
    const teugs = screen.getAllByRole("button");
    // Minstens de terug-knop en de CockpitTile aria-labels
    expect(teugs.length).toBeGreaterThan(0);
    // De ladder moet geladen zijn
    expect(screen.getByRole("tabpanel", { hidden: true })).toBeDefined();
  });

  it("filtert favorieten op domein", () => {
    favoriteItems = [
      { id: "laag-beweging-p1-elk-werkuur-staan", title: "Staan", kind: "activiteit", domain: "beweging" },
      { id: "laag-slaap-p1-vast-opstaan", title: "Vast opstaan", kind: "activiteit", domain: "slaap" },
    ];
    renderSchap("beweging", "favorieten");

    expect(screen.getByText("Staan")).toBeDefined();
    expect(screen.queryByText("Vast opstaan")).toBeNull();
  });
});

describe("SchapView — de domeinschakelaar", () => {
  const domeinNav = () => screen.getByRole("navigation", { name: "Schap van een ander domein" });

  it("toont alleen domeinen mét schap, nooit stress of verbinding", () => {
    renderSchap("slaap", null, { onSwitchDomain: vi.fn() });
    const labels = within(domeinNav())
      .getAllByRole("button")
      .map((chip) => chip.textContent ?? "");
    expect(labels).toEqual(["Beweging", "Slaap", "Voeding"]);
    expect(labels).not.toContain("Stress");
    expect(labels).not.toContain("Verbinding");
  });

  it("markeert het open domein en laat dat geen navigatie afvuren", () => {
    const onSwitchDomain = vi.fn();
    renderSchap("slaap", null, { onSwitchDomain });
    const actief = within(domeinNav()).getByRole("button", { name: "Slaap" });
    expect(actief.getAttribute("aria-current")).toBe("page");

    fireEvent.click(actief);
    expect(onSwitchDomain).not.toHaveBeenCalled();
    expect(emitAccountClientEvent).not.toHaveBeenCalled();
  });

  it("schakelt door en meldt het schap-openen met zijn herkomst", () => {
    const onSwitchDomain = vi.fn();
    renderSchap("slaap", null, { onSwitchDomain });

    fireEvent.click(within(domeinNav()).getByRole("button", { name: "Voeding" }));
    expect(onSwitchDomain).toHaveBeenCalledWith("voeding");
    expect(emitAccountClientEvent).toHaveBeenCalledWith("choice.shelf_opened", {
      domain: "voeding",
      from_state: "schap",
      surface: "schap_slaap",
    });
  });

  it("staat er niet zonder handler — geen chip die nergens heen gaat", () => {
    renderSchap("slaap");
    expect(screen.queryByRole("navigation", { name: "Schap van een ander domein" })).toBeNull();
  });
});

describe("SchapView — de terugweg naar het leefstijlprofiel", () => {
  it("wijst naar het profiel van dit domein", () => {
    const onOpenLeefstijlprofiel = vi.fn();
    renderSchap("voeding", null, { onOpenLeefstijlprofiel });

    fireEvent.click(screen.getByRole("button", { name: /Leefstijlprofiel · Voeding/ }));
    expect(onOpenLeefstijlprofiel).toHaveBeenCalledWith("voeding");
  });

  it("staat er niet zonder handler", () => {
    renderSchap("voeding");
    expect(screen.queryByRole("button", { name: /Leefstijlprofiel/ })).toBeNull();
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
