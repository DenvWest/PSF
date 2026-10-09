// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MijnKeuzes from "@/components/dashboard/keuze/MijnKeuzes";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({ emitAccountClientEvent: vi.fn() }));
vi.mock("@/lib/use-kernstof-normen", () => ({
  useEiwitDoel: () => null,
  useKernstofProfiel: () => ({ geslacht: null, zeventigPlus: false, voedingswijze: null, streefwaarden: {} }),
}));
const fetchMock = vi.hoisted(() => vi.fn());
const favorieten = vi.hoisted(() => ({
  items: [] as { id: string; title: string; kind: string }[],
  save: vi.fn((item: { id: string; title: string; kind: string }) => {
    favorieten.items = [...favorieten.items.filter((i) => i.id !== item.id), item];
  }),
  remove: vi.fn((id: string) => {
    favorieten.items = favorieten.items.filter((i) => i.id !== id);
  }),
}));
vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({ items: favorieten.items, save: favorieten.save, remove: favorieten.remove }),
}));

beforeEach(() => {
  fetchMock.mockImplementation(
    async () => new Response(JSON.stringify({ items: [{ bron: "voeding", key: "haring" }] }), { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  favorieten.items = [];
});

function status(nutrient: NutrientId, label: string): NutrientRouteStatus {
  return {
    nutrient,
    label,
    route: nutrientRoute(nutrient),
    status: "gap",
    answerLabel: "",
    carriesVerdict: true,
    sources: [],
    supplementDoorOpen: false,
    doorReasonNl: "",
    comparisonPath: `/beste/${nutrient}`,
  };
}

const statuses = [status("omega3", "Omega-3"), status("magnesium", "Magnesium"), status("zinc", "Zink")];

function renderMijn(onNaar = vi.fn()) {
  return { onNaar, ...render(<MijnKeuzes statuses={statuses} reeksen={[]} onNaarVergelijken={onNaar} />) };
}

describe("MijnKeuzes", () => {
  it("zonder keuzes wijst hij naar Vergelijken", async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ items: [] }), { status: 200 }));
    const { onNaar } = renderMijn();
    fireEvent.click(screen.getByRole("button", { name: "Naar Vergelijken →" }));
    expect(onNaar).toHaveBeenCalledWith(null);
  });

  it("toont per stof je gekozen supplement met prijs, je gesterde bron bij de juiste stof en de kosten bovenaan", async () => {
    favorieten.items = [
      { id: "voeding-route-omega3-beide", title: "", kind: "supplement" },
      { id: "voeding-product-omega3-vitals-liquid-epadha", title: "", kind: "supplement" },
    ];
    renderMijn();
    await waitFor(() => expect(screen.getAllByText("Haring").length).toBeGreaterThan(0));
    expect(screen.getByText("1 van 3")).toBeTruthy();
    expect(screen.getByText("Stoffen gekozen")).toBeTruthy();
    expect(screen.getByText("Supplementen").nextElementSibling?.textContent).toBe("1");
    expect(screen.getByText("Per dag").nextElementSibling?.textContent).toMatch(/€ \d+,\d{2}/);
    expect(screen.getByText(/± € \d+,\d{2} per maand/)).toBeTruthy();
    expect(screen.getAllByText(/Vitals Liquid EPA\/DHA/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Naar de productpagina/ }).getAttribute("href")).toBe(
      "/product/vitals-liquid-epadha?van=keuze&stof=omega3&deel=favorieten",
    );
    expect(screen.getByText(/Nog geen keuze: magnesium, zink/)).toBeTruthy();
  });

  it("bewaart één moment per supplement, en opnieuw tikken wist het", () => {
    favorieten.items = [
      { id: "voeding-route-omega3-potje", title: "", kind: "supplement" },
      { id: "voeding-product-omega3-vitals-liquid-epadha", title: "", kind: "supplement" },
    ];
    const { rerender, onNaar } = renderMijn();
    const supplement = () => screen.getByRole("region", { name: "Uit een supplement" });
    fireEvent.click(within(supplement()).getByRole("button", { name: "Ontbijt" }));
    expect(favorieten.items.map((i) => i.id)).toContain("voeding-moment-omega3-ontbijt");

    rerender(<MijnKeuzes statuses={statuses} reeksen={[]} onNaarVergelijken={onNaar} />);
    fireEvent.click(within(supplement()).getByRole("button", { name: "Avondeten" }));
    const momenten = favorieten.items.filter((i) => i.id.startsWith("voeding-moment-")).map((i) => i.id);
    expect(momenten).toEqual(["voeding-moment-omega3-avondeten"]);

    rerender(<MijnKeuzes statuses={statuses} reeksen={[]} onNaarVergelijken={onNaar} />);
    fireEvent.click(within(supplement()).getByRole("button", { name: "Avondeten" }));
    expect(favorieten.items.some((i) => i.id.startsWith("voeding-moment-"))).toBe(false);
  });

  it("Wijzig opent Vergelijken op die stof", () => {
    favorieten.items = [{ id: "voeding-route-magnesium-bord", title: "", kind: "activiteit" }];
    const { onNaar } = renderMijn();
    fireEvent.click(screen.getByRole("button", { name: "Wijzig" }));
    expect(onNaar).toHaveBeenCalledWith("magnesium");
  });

  it("zet eten en supplement naast elkaar, met een eigen moment voor je eten dat de ＋ gebruikt", async () => {
    favorieten.items = [{ id: "voeding-route-omega3-bord", title: "", kind: "activiteit" }];
    const { rerender, onNaar } = renderMijn();
    const eten = () => screen.getByRole("region", { name: "Uit je eten" });
    expect(screen.getByRole("region", { name: "Uit een supplement" })).toBeTruthy();
    expect(screen.getByText("Geen supplement gekozen.")).toBeTruthy();

    await waitFor(() => expect(within(eten()).getByText("Haring")).toBeTruthy());
    fireEvent.click(within(eten()).getByRole("button", { name: "Lunch" }));
    expect(favorieten.items.map((i) => i.id)).toContain("voeding-eetmoment-omega3-lunch");

    rerender(<MijnKeuzes statuses={statuses} reeksen={[]} onNaarVergelijken={onNaar} />);
    await waitFor(() =>
      expect(
        within(screen.getByRole("region", { name: "Lunch" })).getByRole("button", { name: "Haring in je dagboek zetten bij lunch" }),
      ).toBeTruthy(),
    );
  });

  it("zet een gesterd voedingsmiddel één keer neer, bij de stof waar het het meest aan bijdraagt", async () => {
    const metD = [...statuses, status("vitamin_d", "Vitamine D")];
    favorieten.items = [
      { id: "voeding-route-omega3-bord", title: "", kind: "activiteit" },
      { id: "voeding-route-vitamin_d-bord", title: "", kind: "activiteit" },
    ];
    render(<MijnKeuzes statuses={metD} reeksen={[]} onNaarVergelijken={vi.fn()} />);
    await waitFor(() => expect(within(screen.getByRole("region", { name: "Je dag" })).getAllByText("Haring")).toHaveLength(1));
    expect(screen.getByText("Telt ook mee: Haring (bij omega-3)")).toBeTruthy();
    expect(screen.getByText("Kies een bron met ☆:")).toBeTruthy();
  });

  it("toont een bij eiwit gekozen gebakken ei bij eiwit, ook al haalt het de bron-drempel niet", async () => {
    fetchMock.mockImplementation(
      async () => new Response(JSON.stringify({ items: [{ bron: "voeding", key: "ei-gebakken" }] }), { status: 200 }),
    );
    favorieten.items = [{ id: "voeding-eten-protein-ei-gebakken", title: "", kind: "activiteit" }];
    render(<MijnKeuzes statuses={[status("protein", "Eiwit")]} reeksen={[]} onNaarVergelijken={vi.fn()} />);
    expect(screen.getAllByText("Ei, gebakken").length).toBeGreaterThan(0);
    expect(screen.queryByText("Kies een bron met ☆:")).toBeNull();
  });

  it("zet je keuzes over de dag: eten en supplement op hun moment, met één ＋ Dagboek per regel", async () => {
    favorieten.items = [
      { id: "voeding-route-omega3-beide", title: "", kind: "supplement" },
      { id: "voeding-product-omega3-vitals-liquid-epadha", title: "", kind: "supplement" },
      { id: "voeding-moment-omega3-avondeten", title: "", kind: "supplement" },
    ];
    renderMijn();
    const dag = screen.getByRole("region", { name: "Je dag" });
    expect(within(dag).getAllByRole("region").map((r) => r.getAttribute("aria-label"))).toEqual([
      "Ontbijt",
      "Lunch",
      "Avondeten",
      "Tussendoor",
    ]);
    await waitFor(() => expect(within(screen.getByRole("region", { name: "Ontbijt" })).getByText("Haring")).toBeTruthy());
    expect(within(screen.getByRole("region", { name: "Lunch" })).getByText("Nog niets gekozen")).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Avondeten" })).getByText(/Vitals Liquid EPA\/DHA/)).toBeTruthy();
  });

  it("haalt een supplement uit Mijn keuzes: product, moment en supplementroute, en laat eten staan bij allebei", () => {
    favorieten.items = [
      { id: "voeding-route-omega3-beide", title: "", kind: "supplement" },
      { id: "voeding-product-omega3-vitals-liquid-epadha", title: "", kind: "supplement" },
      { id: "voeding-moment-omega3-lunch", title: "", kind: "supplement" },
    ];
    renderMijn();
    fireEvent.click(screen.getByRole("button", { name: "Haal uit Mijn keuzes" }));
    const ids = favorieten.items.map((i) => i.id);
    expect(ids).toEqual(["voeding-route-omega3-bord"]);
  });
});
