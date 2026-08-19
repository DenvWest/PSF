/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FavorietenSchapView from "@/components/dashboard/voortgang/FavorietenSchapView";
import type { DashboardData } from "@/types/dashboard";
import type { StoredSupplementVerdict } from "@/types/verdict";

function verdict(ingredientKey: string): StoredSupplementVerdict {
  return {
    id: `id-${ingredientKey}`,
    ingredientKey,
    verdict: "kopen",
    reasonKey: "trigger_matched",
    rulesVersion: "1.6.0",
    nextReviewAt: null,
    createdAt: "2026-08-16T00:00:00.000Z",
    supersededAt: null,
    basedOn: null,
  };
}

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockEmitAccountClientEvent = vi.fn();
vi.mock("@/lib/account-events-client", () => ({
  emitAccountClientEvent: (...args: unknown[]) => mockEmitAccountClientEvent(...args),
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

const noop = () => {};

describe("FavorietenSchapView — vier tabs", () => {
  it("wisselt tussen de vier tabs en schrijft de schap-tab naar de URL", () => {
    favoriteItems = [];
    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab={null}
        hasCheck={false}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["Leefstijl", "Producten", "Diensten", "Begeleiding"]);

    fireEvent.click(tabs[0]);
    expect(mockReplace).toHaveBeenCalledWith(
      "/dashboard?tab=voortgang&screen=favorieten&fav=beweging&schap=leefstijl",
      { scroll: false },
    );
    expect(screen.getByRole("tab", { name: "Leefstijl" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(mockEmitAccountClientEvent).toHaveBeenCalledWith("dashboard.schap_tab_selected", {
      domain: "beweging",
      tab: "leefstijl",
    });

    fireEvent.click(tabs[2]);
    expect(mockReplace).toHaveBeenCalledWith(
      "/dashboard?tab=voortgang&screen=favorieten&fav=beweging&schap=diensten",
      { scroll: false },
    );
    expect(screen.getByRole("tab", { name: "Diensten" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("start op de tab uit de URL wanneer die is meegegeven", () => {
    favoriteItems = [];
    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="diensten"
        hasCheck={false}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );
    expect(screen.getByRole("tab", { name: "Diensten" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
});

describe("FavorietenSchapView — Leefstijl-tab is een spiegel", () => {
  it("toont vijf domeinregels, nul schap-kaarten", () => {
    favoriteItems = [
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
    ];
    const { container } = render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="leefstijl"
        hasCheck={false}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );

    expect(screen.getByText("Beweging")).toBeTruthy();
    expect(screen.getByText("Slaap")).toBeTruthy();
    expect(screen.getByText("Voeding")).toBeTruthy();
    expect(screen.getByText("Stress")).toBeTruthy();
    expect(screen.getByText("Verbinding")).toBeTruthy();
    expect(screen.getByText("1 gekozen")).toBeTruthy();

    const leefstijlSection = container.querySelector('section[aria-label="Leefstijl"]');
    expect(leefstijlSection?.querySelector('[class*="bg-black/20"]')).toBeNull();
  });

  it("navigeert naar het juiste domein op klik", () => {
    favoriteItems = [];
    const onOpen = vi.fn();
    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="leefstijl"
        hasCheck={false}
        onBack={noop}
        onOpenLeefstijlprofiel={onOpen}
      />,
    );
    fireEvent.click(screen.getByText("Slaap"));
    expect(onOpen).toHaveBeenCalledWith("slaap");
  });
});

describe("FavorietenSchapView — Producten-tab", () => {
  it("toont alleen gekozen supplementen van dit domein, geen activiteiten", () => {
    favoriteItems = [
      { id: "creatine", title: "Creatine", kind: "supplement", domain: "beweging" },
      { id: "kracht-thuis", title: "Kracht thuis", kind: "activiteit", domain: "beweging" },
      { id: "magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="producten"
        hasCheck={true}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );
    expect(screen.getByText("Creatine")).toBeTruthy();
    expect(screen.queryByText("Kracht thuis")).toBeNull();
    expect(screen.queryByText("Magnesium")).toBeNull();
  });

  it("toont de twee gratis schap-basiskaarten altijd onder Aanbevolen, ongeacht de voedingscheck", () => {
    favoriteItems = [];
    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="producten"
        hasCheck={true}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );
    expect(screen.getByText("Stevig wandelen, 3× 30 minuten")).toBeTruthy();
    expect(screen.getByText("Elk werkuur twee minuten staan")).toBeTruthy();
  });

  it("toont oordeel + commissie-microcopy per kandidaat-kaart zodra de voedingscheck rond is", () => {
    favoriteItems = [];
    const data = {
      supplementVerdicts: [verdict("creatine")],
      nutritionIntake: { date: "18 aug 2026", items: [{ label: "Test", band: "meets" }] },
    } as unknown as DashboardData;

    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="producten"
        hasCheck={true}
        data={data}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );

    expect(screen.getByText("Creatine")).toBeTruthy();
    expect(
      screen.getByText(
        "We ontvangen commissie als je via ons koopt. Het oordeel is los daarvan opgesteld en verandert niet mee.",
      ),
    ).toBeTruthy();
  });

  it("een aanbeveling wordt nooit stilzwijgend een keuze: een opgeslagen basiskaart blijft in Aanbevolen én staat apart in Mijn keuze", () => {
    favoriteItems = [{ id: "wandelen", title: "Stevig wandelen, 3× 30 minuten", kind: "activiteit", domain: "beweging" }];
    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="producten"
        hasCheck={true}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );

    const titles = screen.getAllByText("Stevig wandelen, 3× 30 minuten");
    expect(titles.length).toBe(2);
    expect(screen.getByText("Staat in Favorieten")).toBeTruthy();
  });
});

describe("FavorietenSchapView — Diensten-tab", () => {
  it("toont vier demo-categorieën onder Aanbevolen, geen specifieke aanbiedernaam of commissie-copy", () => {
    favoriteItems = [];
    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="diensten"
        hasCheck={true}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );

    expect(screen.getByText("PT-intake bij een lokale trainer")).toBeTruthy();
    expect(screen.getByText("Krachtgroep voor 45-plussers")).toBeTruthy();
    expect(screen.getByText("Online begeleiding op afstand")).toBeTruthy();
    expect(screen.getByText("Rustig baantjeszwemmen")).toBeTruthy();

    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/Kracht & Co|De Vliert|Beweegcoach Nederland|Sportiom/);
    expect(text).not.toContain(
      "We ontvangen commissie als je via ons koopt. Het oordeel is los daarvan opgesteld en verandert niet mee.",
    );
  });

  it("toont alleen gekozen diensten van dit domein onder Mijn keuze", () => {
    favoriteItems = [
      { id: "pt-intake", title: "PT-intake bij een lokale trainer", kind: "dienst", domain: "beweging" },
      { id: "creatine", title: "Creatine", kind: "supplement", domain: "beweging" },
    ];
    render(
      <FavorietenSchapView
        domain="beweging"
        activeTab="diensten"
        hasCheck={true}
        onBack={noop}
        onOpenLeefstijlprofiel={noop}
      />,
    );

    expect(screen.getAllByText("PT-intake bij een lokale trainer").length).toBe(2);
    expect(screen.queryByText("Creatine")).toBeNull();
  });
});
