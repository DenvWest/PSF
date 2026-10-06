/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PatroonBronZoek from "@/components/dashboard/patroon/PatroonBronZoek";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({ emitAccountClientEvent: vi.fn() }));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockImplementation(async (_url: string, init?: RequestInit) =>
    init?.method
      ? new Response(JSON.stringify({ ok: true }), { status: 200 })
      : new Response(JSON.stringify({ items: [] }), { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function renderZoek() {
  render(<PatroonBronZoek nutrient="magnesium" label="Magnesium" unit="mg" norm={350} voedingswijze={null} />);
}

describe("PatroonBronZoek", () => {
  it("toont zonder zoekterm de top 5, uit te klappen naar meer", () => {
    renderZoek();
    expect(screen.getByText(/Rijkste voedingsbronnen/)).toBeTruthy();
    const voor = screen.getAllByRole("button", { name: /bewaren in je favorieten/ }).length;
    expect(voor).toBe(5);
    fireEvent.click(screen.getByRole("button", { name: /Toon top/ }));
    expect(screen.getAllByRole("button", { name: /bewaren in je favorieten/ }).length).toBeGreaterThan(5);
  });

  it("vindt een supplement en linkt naar de catalogus met PS-Score van die stof", () => {
    renderZoek();
    fireEvent.change(screen.getByPlaceholderText(/Zoek een product of supplement/), {
      target: { value: "magnesiumcitraat" },
    });
    expect(screen.getByText("Magnesiumcitraat, capsule")).toBeTruthy();
    expect(screen.getByText(/200 mg/)).toBeTruthy();
    const link = screen.getByRole("link", { name: /magnesium-supplementen met PS-Score/ });
    expect(link.getAttribute("href")).toBe("/supplementen?categorie=magnesium");
  });

  it("bewaart met de ster in de dagboek-favorieten", async () => {
    renderZoek();
    fireEvent.change(screen.getByPlaceholderText(/Zoek een product of supplement/), {
      target: { value: "magnesiumcitraat" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Magnesiumcitraat, capsule bewaren/ }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Magnesiumcitraat, capsule uit je favorieten halen/ })).toBeTruthy(),
    );
    const posts = fetchMock.mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === "POST");
    const body = (url: string) =>
      JSON.parse(String((posts.find(([u]) => u === url)?.[1] as RequestInit).body)) as Record<string, string>;
    expect(body("/api/account/dagboek-favorieten")).toEqual({ bron: "supplement", key: "magnesiumcitraat-capsule" });
    expect(body("/api/account/favorites")).toMatchObject({
      item_id: "dagboek-supplement-magnesiumcitraat-capsule",
      kind: "supplement",
      domain: "voeding",
    });
    expect(screen.getByRole("button", { name: /Bewaard bij Mijn supplementen/ })).toBeTruthy();
  });

  it("zet een voedingsproduct niet in Keuze → Favorieten, alleen in het dagboek", async () => {
    renderZoek();
    const ster = screen.getAllByRole("button", { name: /bewaren in je favorieten/ })[0]!;
    fireEvent.click(ster);
    await waitFor(() => expect(screen.getByRole("button", { name: /Bewaard bij Mijn producten/ })).toBeTruthy());
    expect(fetchMock.mock.calls.some(([u]) => String(u).startsWith("/api/account/favorites"))).toBe(false);
  });

  it("＋ opent het dagboek met het product en de maaltijd met de meeste ruimte", () => {
    window.history.replaceState(null, "", "/dashboard?tab=voortgang");
    const popstate = vi.fn();
    window.addEventListener("popstate", popstate);
    render(
      <PatroonBronZoek
        nutrient="magnesium"
        label="Magnesium"
        unit="mg"
        norm={350}
        voedingswijze={null}
        standaardMoment="lunch"
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /in je dagboek zetten/ })[0]!);
    expect(window.location.search).toMatch(/tab=vandaag&voeg=voeding%3A[a-z-]+&moment=lunch/);
    expect(popstate).toHaveBeenCalled();
    window.removeEventListener("popstate", popstate);
  });

  it("begint met de zoekterm uit de URL", () => {
    render(
      <PatroonBronZoek nutrient="magnesium" label="Magnesium" unit="mg" norm={350} voedingswijze={null} startZoek="magnesiumcitraat" />,
    );
    expect(screen.getByText("Magnesiumcitraat, capsule")).toBeTruthy();
  });
});
