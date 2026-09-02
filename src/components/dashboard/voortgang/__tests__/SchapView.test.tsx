// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import SchapView from "@/components/dashboard/voortgang/SchapView";
import type { DashboardModel, PillarId, SchapTabId } from "@/types/dashboard";

type FakeFavorite = { id: string; title: string; kind: string; domain?: string };

let favoriteItems: FakeFavorite[] = [];
const save = vi.fn();

const updateReminder = vi.fn();

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: favoriteItems,
    hydrated: true,
    isSaved: (id: string) => favoriteItems.some((item) => item.id === id),
    save,
    remove: vi.fn(),
    updateReminder,
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
  updateReminder.mockClear();
  emitAccountClientEvent.mockClear();
});

describe("SchapView — welke tabs een domein draagt", () => {
  it("toont op slaap Leefstijl, Producten en Favorieten", () => {
    renderSchap("slaap");
    expect(tabLabels()).toEqual(["Producten", "Favorieten"]);
    expect(screen.queryByRole("tab", { name: "Diensten" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });

  it("toont op voeding Producten, Voedingslogboek en Favorieten", () => {
    renderSchap("voeding");
    expect(tabLabels()).toEqual(["Producten", "Voedingslogboek", "Favorieten"]);
    expect(screen.queryByRole("tab", { name: "Diensten" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });

  it("toont op beweging Producten, Diensten en Favorieten, nooit Begeleiding", () => {
    renderSchap("beweging");
    expect(tabLabels()).toEqual(["Producten", "Diensten", "Favorieten"]);
    expect(screen.queryByRole("tab", { name: "Begeleiding" })).toBeNull();
  });

  // W4a — het schap draagt aanbod en favorieten, geen leefstijl-werkplek.
  it("draagt op geen enkel domein nog een Leefstijl-tab", () => {
    for (const domain of ["beweging", "slaap", "voeding"] as const) {
      const { unmount } = renderSchap(domain);
      expect(screen.queryByRole("tab", { name: "Leefstijl" })).toBeNull();
      unmount();
    }
  });
});

describe("SchapView — de Favorieten-tab", () => {
  it("filtert favorieten op domein", () => {
    favoriteItems = [
      { id: "laag-beweging-p1-elk-werkuur-staan", title: "Staan", kind: "activiteit", domain: "beweging" },
      { id: "laag-slaap-p1-vast-opstaan", title: "Vast opstaan", kind: "activiteit", domain: "slaap" },
    ];
    renderSchap("beweging", "favorieten");

    expect(screen.getByText("Staan")).toBeDefined();
    expect(screen.queryByText("Vast opstaan")).toBeNull();
  });

  it("toont de tijd/alert-editor alleen bij een ladder-favoriet, niet bij een dienst", () => {
    favoriteItems = [
      { id: "laag-beweging-p1-elk-werkuur-staan", title: "Staan", kind: "activiteit", domain: "beweging" },
      { id: "dienst-personal-trainer-1", title: "Personal trainer intake", kind: "dienst", domain: "beweging" },
    ];
    renderSchap("beweging", "favorieten");

    expect(screen.getAllByRole("button", { name: "Tijdstip" })).toHaveLength(1);
  });
});

describe("SchapView — de domeinschakelaar", () => {
  const domeinNav = () => screen.getByRole("navigation", { name: "Kiezen op een ander domein" });

  it("laat alleen domeinen mét aanbod klikken, in Kompas-volgorde", () => {
    renderSchap("slaap", null, { onSwitchDomain: vi.fn() });
    const labels = within(domeinNav())
      .getAllByRole("button")
      .map((chip) => chip.textContent ?? "");
    expect(labels).toEqual(["Slaap", "Beweging", "Voeding"]);
  });

  // De poort zichtbaar houden: stress en verbinding hébben geen schap, en dat
  // is een oordeel. Ze weglaten zou dat oordeel als een gat laten lezen.
  it("toont stress en verbinding wél, dicht, mét de reden", () => {
    renderSchap("slaap", null, { onSwitchDomain: vi.fn() });
    for (const label of ["Stress", "Verbinding"]) {
      const chip = within(domeinNav()).getByText(label);
      expect(chip.closest("[aria-disabled]")).toBeTruthy();
      expect(chip.closest("[aria-disabled]")?.getAttribute("title")).toContain(
        "Geen aanbod",
      );
    }
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

describe("SchapView — de spiegel leefstijl ↔ aanbod", () => {
  const spiegel = () =>
    screen.getByRole("region", { name: "Wat eerst komt, en wat je kunt kopen" });

  it("staat bóven de tabs, zodat de volgorde vóór het aanbod komt", () => {
    renderSchap("voeding", "producten");

    const blok = spiegel();
    const tablist = screen.getByRole("tablist");
    // Node.compareDocumentPosition: 4 = de tablist volgt op de spiegel.
    expect(blok.compareDocumentPosition(tablist) & 4).toBeTruthy();
  });

  it("blijft staan op elk onderdeel — het is geen tab die je moet aanklikken", () => {
    renderSchap("voeding", "favorieten");
    expect(spiegel()).toBeTruthy();
  });

  it("zet de gratis lagen links en de betaalde laag rechts, met hun nummers", () => {
    renderSchap("voeding", "producten");

    expect(within(spiegel()).getByText("Gratis · laag 1–5")).toBeTruthy();
    expect(within(spiegel()).getByText("Betaald · laag 6 van 6")).toBeTruthy();
    expect(within(spiegel()).getByText("Je eetbasis")).toBeTruthy();
  });

  it("draagt de doorstroom naar de gids, met de terugweg naar het dashboard", () => {
    renderSchap("voeding", "producten");

    const link = within(spiegel())
      .getByText("Open de supplementengids")
      .closest("a");
    expect(link?.getAttribute("href")).toBe("/supplementen?from=voortgang");
  });

  it("staat er niet op een domein zonder ladder", () => {
    renderSchap("energie", "producten");
    expect(
      screen.queryByRole("region", { name: "Wat eerst komt, en wat je kunt kopen" }),
    ).toBeNull();
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
