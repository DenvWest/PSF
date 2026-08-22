// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import KompasKeuzeSectie from "@/components/dashboard/kompas/KompasKeuzeSectie";
import type { PillarId } from "@/types/dashboard";

type FakeFavorite = { id: string; title: string; kind: string; domain?: PillarId };

let favoriteItems: FakeFavorite[] = [];
let hydrated = true;

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: favoriteItems,
    hydrated,
    isSaved: (id: string) => favoriteItems.some((item) => item.id === id),
    save: vi.fn(),
    remove: vi.fn(),
  }),
}));

const trackEvent = vi.fn();
vi.mock("@/lib/ga4", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

function renderSectie(priorityDomain: PillarId = "beweging") {
  const onOpenDomain = vi.fn();
  render(<KompasKeuzeSectie priorityDomain={priorityDomain} onOpenDomain={onOpenDomain} />);
  return { onOpenDomain };
}

beforeEach(() => {
  favoriteItems = [];
  hydrated = true;
  trackEvent.mockClear();
});

describe("KompasKeuzeSectie", () => {
  it("toont niets vóór hydratie, zodat de lege staat niet oplicht", () => {
    hydrated = false;
    favoriteItems = [
      { id: "laag-beweging-p1-wandelen", title: "Elke dag 20 minuten wandelen", kind: "activiteit", domain: "beweging" },
    ];
    const { container } = render(
      <KompasKeuzeSectie priorityDomain="beweging" onOpenDomain={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("toont de gekozen handelingen zelf, gegroepeerd per domein", () => {
    favoriteItems = [
      { id: "laag-beweging-p1-wandelen", title: "Elke dag 20 minuten wandelen", kind: "activiteit", domain: "beweging" },
      { id: "supp-magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    renderSectie();

    expect(screen.getByRole("heading", { name: "Wat je koos" })).toBeTruthy();
    expect(screen.getByText("Elke dag 20 minuten wandelen")).toBeTruthy();
    expect(screen.getByText("Magnesium")).toBeTruthy();
    expect(screen.getByText("Supplement")).toBeTruthy();
    expect(screen.getByText(/2 handelingen, over 2 domeinen/)).toBeTruthy();
  });

  it("zet het prioriteitsdomein als eerste kaart", () => {
    favoriteItems = [
      { id: "supp-magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
      { id: "laag-voeding-p1-eiwit", title: "Eiwit bij elke maaltijd", kind: "activiteit", domain: "voeding" },
    ];
    renderSectie("voeding");

    const kaarten = screen.getAllByRole("link", { name: /Bekijk je keuzes voor/ });
    expect(kaarten[0]?.getAttribute("aria-label")).toBe("Bekijk je keuzes voor Voeding");
  });

  it("geeft de knop een link naar het schap van het prioriteitsdomein", () => {
    favoriteItems = [
      { id: "supp-magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    renderSectie("slaap");

    const knop = screen.getByRole("link", { name: "Bekijk je keuzes op je schap" });
    expect(knop.getAttribute("href")).toBe(
      "/dashboard?tab=voortgang&screen=schap&fav=slaap&schap=favorieten",
    );

    fireEvent.click(knop);
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_kompas_keuzes_click",
      expect.objectContaining({ destination: "schap", element: "knop", count: 1 }),
    );
  });

  it("opent het domeinscherm als het prioriteitsdomein geen schap heeft", () => {
    favoriteItems = [
      { id: "laag-stress-p1-adem", title: "Ademoefening na werk", kind: "activiteit", domain: "stress" },
    ];
    const { onOpenDomain } = renderSectie("stress");

    fireEvent.click(
      screen.getByRole("button", { name: "Bekijk je keuzes in je prioriteitsdomein" }),
    );
    expect(onOpenDomain).toHaveBeenCalledWith("stress");
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_kompas_keuzes_click",
      expect.objectContaining({ destination: "leefstijlprofiel", element: "knop" }),
    );
  });

  it("laat een domeinkaart zonder schap het domeinscherm openen", () => {
    favoriteItems = [
      { id: "laag-stress-p1-adem", title: "Ademoefening na werk", kind: "activiteit", domain: "stress" },
    ];
    const { onOpenDomain } = renderSectie("stress");

    fireEvent.click(screen.getByRole("button", { name: "Bekijk je keuzes voor Stress" }));
    expect(onOpenDomain).toHaveBeenCalledWith("stress");
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_kompas_keuzes_click",
      expect.objectContaining({ domain: "stress", element: "domeinkaart" }),
    );
  });

  it("kort een lange domeinlijst in met een resttelling", () => {
    favoriteItems = [
      ...Array.from({ length: 10 }, (_, index) => ({
        id: `laag-slaap-p1-actie-${index}`,
        title: `Slaapactie ${index}`,
        kind: "activiteit",
        domain: "slaap" as PillarId,
      })),
      { id: "laag-beweging-p1-wandelen", title: "Wandelen", kind: "activiteit", domain: "beweging" },
    ];
    renderSectie("slaap");

    expect(screen.getByText("Slaapactie 0")).toBeTruthy();
    expect(screen.queryByText("Slaapactie 5")).toBeNull();
    expect(screen.getByText("+5 meer op je schap")).toBeTruthy();
  });

  it("laat één domein verder doorlopen, want die kaart is volle breedte", () => {
    favoriteItems = Array.from({ length: 10 }, (_, index) => ({
      id: `laag-slaap-p1-actie-${index}`,
      title: `Slaapactie ${index}`,
      kind: "activiteit",
      domain: "slaap" as PillarId,
    }));
    renderSectie("slaap");

    expect(screen.getByText("Slaapactie 7")).toBeTruthy();
    expect(screen.queryByText("Slaapactie 8")).toBeNull();
    expect(screen.getByText("+2 meer op je schap")).toBeTruthy();
  });

  it("toont een lege staat met knop naar het prioriteitsdomein", () => {
    const { onOpenDomain } = renderSectie("beweging");

    expect(screen.getByText(/Nog niets gekozen/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open je prioriteitsdomein" }));
    expect(onOpenDomain).toHaveBeenCalledWith("beweging");
  });
});
