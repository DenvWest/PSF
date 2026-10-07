// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import KeuzeVergelijken from "@/components/dashboard/keuze/KeuzeVergelijken";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";
import type { StoredSupplementVerdict } from "@/types/verdict";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/intake-events-client", () => ({ emitIntakeClientEvent: vi.fn() }));
vi.mock("@/lib/account-events-client", () => ({ emitAccountClientEvent: vi.fn() }));
const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/use-kernstof-normen", () => ({
  useKernstofProfiel: () => ({ geslacht: null, zeventigPlus: false, voedingswijze: null, streefwaarden: {} }),
  useEiwitDoel: () => null,
}));
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
  fetchMock.mockImplementation(async () => new Response(JSON.stringify({ items: [] }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
  favorieten.items = [];
  favorieten.save.mockClear();
});

function status(nutrient: "protein" | "magnesium", label: string): NutrientRouteStatus {
  return {
    nutrient,
    label,
    route: nutrientRoute(nutrient),
    status: "gap",
    answerLabel: "1× per dag",
    carriesVerdict: true,
    sources: [],
    supplementDoorOpen: false,
    doorReasonNl: "",
    comparisonPath: `/beste/${nutrient}`,
  };
}

function reeks(nutrient: "protein" | "magnesium", gedekt: boolean): Vensterreeks {
  const v = (dagen_terug: 1 | 7 | 14 | 30) => ({
    dagen_terug,
    gemiddeld: gedekt ? 400 : 200,
    aandeel: gedekt ? 1.1 : 0.57,
    dagen: 7,
    dagenMetBron: 5,
    gedekt,
  });
  return { nutrient, label: nutrient, unit: "mg", vensters: [v(1), v(7), v(14), v(30)], bewijsbaar: true, richting: "vlak" };
}

const magnesiumOordeel: StoredSupplementVerdict = {
  id: "v1",
  ingredientKey: "magnesium",
  verdict: "kopen",
  reasonKey: "trigger_matched",
  rulesVersion: "test",
  nextReviewAt: null,
  createdAt: "2026-09-05T10:00:00Z",
  supersededAt: null,
  basedOn: {
    scores: {} as never,
    signals: {} as never,
    profileLabel: "Lage Batterij" as never,
    triggeredBy: [{ type: "signal", signal: "magnesium_signal" }],
    nutritionLogCompleted: true,
  },
};

function keuze(magnesiumGedekt = false, verdicts: StoredSupplementVerdict[] = []) {
  return (
    <KeuzeVergelijken
      statuses={[status("magnesium", "Magnesium"), status("protein", "Eiwit")]}
      reeksen={[reeks("magnesium", magnesiumGedekt), reeks("protein", true)]}
      dagen={[]}
      vandaag="2026-10-06"
      surface="test"
      verdicts={verdicts}
    />
  );
}

function renderKeuze(magnesiumGedekt = false, verdicts: StoredSupplementVerdict[] = []) {
  return render(keuze(magnesiumGedekt, verdicts));
}

describe("KeuzeVergelijken", () => {
  it("vat het dagboek samen en zet eten en supplement naast elkaar, zonder slotjes", () => {
    renderKeuze();
    expect(screen.getByText(/1 van 2 meetbare kernstoffen op je norm · magnesium heeft ruimte/)).toBeTruthy();
    const eten = screen.getByRole("region", { name: "Uit je eten" });
    const supplement = screen.getByRole("region", { name: "Uit een supplement" });
    expect(within(supplement).getByText("Per vorm de hoogste PS-Score")).toBeTruthy();
    expect(within(supplement).getByRole("link", { name: /Alle \d+ met PS-Score/ }).getAttribute("href")).toBe(
      "/supplementen?categorie=magnesium&van=keuze&stof=magnesium",
    );
    expect(within(supplement).getByRole("link", { name: /Vergelijk op prijs/ }).getAttribute("href")).toBe(
      "/beste/magnesium?van=keuze&stof=magnesium",
    );
    expect(within(eten).getAllByRole("button", { name: / kiezen$/ }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Eerst je voedingsbasis/)).toBeNull();
  });

  it("allebei = een voedingsmiddel kiezen én een supplement kiezen", async () => {
    const { rerender } = renderKeuze();
    const eten = () => screen.getByRole("region", { name: "Uit je eten" });
    fireEvent.click(within(eten()).getAllByRole("button", { name: / kiezen$/ })[0]);
    await waitFor(() => expect(favorieten.items.map((i) => i.id)).toContain("voeding-route-magnesium-bord"));
    rerender(keuze());
    const supplement = screen.getByRole("region", { name: "Uit een supplement" });
    fireEvent.click(within(supplement).getAllByRole("button", { name: / kiezen$/ })[0]);
    const ids = favorieten.items.map((i) => i.id);
    expect(ids).toContain("voeding-route-magnesium-beide");
    expect(ids.some((id) => id.startsWith("voeding-product-magnesium-"))).toBe(true);
  });

  it("een supplement kiezen zet het in Mijn keuzes, met de productpagina, en opnieuw tikken wist de keuze", () => {
    const naarMijnKeuzes = vi.fn();
    const { rerender } = render(
      <KeuzeVergelijken
        statuses={[status("magnesium", "Magnesium"), status("protein", "Eiwit")]}
        reeksen={[reeks("magnesium", false), reeks("protein", true)]}
        dagen={[]}
        vandaag="2026-10-06"
        surface="test"
        verdicts={[]}
        onNaarMijnKeuzes={naarMijnKeuzes}
      />,
    );
    let supplement = screen.getByRole("region", { name: "Uit een supplement" });
    expect(within(supplement).getByText(/Kies hierboven het supplement/)).toBeTruthy();
    fireEvent.click(within(supplement).getAllByRole("button", { name: / kiezen$/ })[0]);
    const productId = favorieten.items.find((i) => i.id.startsWith("voeding-product-"))!.id;
    const slug = productId.replace("voeding-product-magnesium-", "");
    expect(favorieten.items.map((i) => i.id)).toContain("voeding-route-magnesium-potje");

    rerender(
      <KeuzeVergelijken
        statuses={[status("magnesium", "Magnesium"), status("protein", "Eiwit")]}
        reeksen={[reeks("magnesium", false), reeks("protein", true)]}
        dagen={[]}
        vandaag="2026-10-06"
        surface="test"
        verdicts={[]}
        onNaarMijnKeuzes={naarMijnKeuzes}
      />,
    );
    supplement = screen.getByRole("region", { name: "Uit een supplement" });
    expect(within(supplement).getByText(/staat in Mijn keuzes/)).toBeTruthy();
    expect(within(supplement).getByRole("link", { name: /Naar de productpagina/ }).getAttribute("href")).toBe(
      `/product/${slug}?van=keuze&stof=magnesium`,
    );
    fireEvent.click(within(supplement).getByRole("button", { name: "Naar Mijn keuzes →" }));
    expect(naarMijnKeuzes).toHaveBeenCalled();
    fireEvent.click(within(supplement).getByRole("button", { name: /gekozen, tik om te wissen/ }));
    expect(favorieten.items).toEqual([]);
  });

  it("één knop per voedingsmiddel: kiezen bewaart het in Mijn keuzes en kiest de route eten", async () => {
    renderKeuze();
    const eten = () => screen.getByRole("region", { name: "Uit je eten" });
    expect(within(eten()).getByText(/Eet je vegetarisch of veganistisch\?/)).toBeTruthy();
    expect(within(eten()).queryByRole("button", { name: /in je dagboek zetten/ })).toBeNull();
    fireEvent.click(within(eten()).getAllByRole("button", { name: / kiezen$/ })[0]);
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) => url === "/api/account/dagboek-favorieten" && (init as RequestInit | undefined)?.method === "POST",
        ),
      ).toBe(true),
    );
    expect(favorieten.items.map((i) => i.id)).toContain("voeding-route-magnesium-bord");
  });

  it("het zoekveld in de eetkolom vindt voedingsmiddelen met deze stof", () => {
    renderKeuze();
    const eten = screen.getByRole("region", { name: "Uit je eten" });
    fireEvent.change(within(eten).getByRole("searchbox", { name: /Zoek eten met magnesium/ }), {
      target: { value: "pompoen" },
    });
    expect(within(eten).getByText(/Gevonden · rijkste eerst/)).toBeTruthy();
    expect(within(eten).getAllByText(/Pompoen/).length).toBeGreaterThan(0);
  });

  it("het zoekveld in de supplementkolom zoekt in de producten van deze stof", () => {
    renderKeuze();
    const supplement = screen.getByRole("region", { name: "Uit een supplement" });
    fireEvent.change(within(supplement).getByRole("searchbox", { name: /Zoek een magnesium-supplement/ }), {
      target: { value: "bisglycinaat" },
    });
    expect(within(supplement).getByText(/Viridian/)).toBeTruthy();
  });

  it("houdt de supplementkant rustig en ingeklapt als je eten de norm haalt", () => {
    renderKeuze(true);
    const supplement = screen.getByRole("region", { name: "Uit een supplement" });
    expect(within(supplement).getByText(/Je eten haalt je norm/)).toBeTruthy();
    expect(within(supplement).queryByText("Per vorm de hoogste PS-Score")).toBeNull();
    fireEvent.click(within(supplement).getByRole("button", { name: /Toon de vormen/ }));
    expect(within(supplement).getByText("Per vorm de hoogste PS-Score")).toBeTruthy();
  });

  it("draagt het oordeel uit je check in de stofkaart, met het dagboek als zwaarste stem", () => {
    renderKeuze(false, [magnesiumOordeel]);
    const check = screen.getByRole("region", { name: "Uit je check" });
    expect(within(check).getByText(/Je check zei .aanvullen.\. Je dagboek weegt hier zwaarder/)).toBeTruthy();
    expect(within(check).getByText("Signaal")).toBeTruthy();
    expect(within(check).getByText("EU-claim")).toBeTruthy();
    fireEvent.click(within(check).getByRole("button", { name: /Hoe we hier komen/ }));
    expect(within(check).getByText(/magnesiumsignaal/)).toBeTruthy();
  });

  it("toont per product wat het toevoegt, de bovengrens en de prijs per dag", () => {
    renderKeuze();
    const supplement = screen.getByRole("region", { name: "Uit een supplement" });
    expect(within(supplement).getAllByText(/Samen met je eten minstens/).length).toBeGreaterThan(0);
    expect(within(supplement).getAllByText(/veilige bovengrens van 250 mg per dag uit supplementen/).length).toBeGreaterThan(0);
    expect(within(supplement).getAllByText(/€ \d+,\d{2} per dag/).length).toBeGreaterThan(0);
  });

  it("terug van een productpagina opent dezelfde stof en haalt de parameter uit de URL", async () => {
    window.history.replaceState(null, "", "/dashboard?tab=keuze&stof=protein");
    renderKeuze();
    await waitFor(() => expect(screen.getByRole("button", { name: /Eiwit/, expanded: true })).toBeTruthy());
    expect(window.location.search).toBe("?tab=keuze");
  });

  it("een gebakken ei gekozen bij eiwit blijft bij eiwit staan, ook onder de bron-drempel", () => {
    const { rerender } = renderKeuze();
    fireEvent.click(screen.getByRole("button", { name: /^Eiwit/, expanded: false }));
    const eiwit = () => screen.getAllByRole("region", { name: "Uit je eten" }).at(-1)!;
    fireEvent.change(within(eiwit()).getByRole("searchbox", { name: /Zoek eten met eiwit/ }), { target: { value: "ei gebakken" } });
    fireEvent.click(within(eiwit()).getByRole("button", { name: "Ei, gebakken kiezen" }));
    expect(favorieten.items.map((i) => i.id)).toContain("voeding-eten-protein-ei-gebakken");

    rerender(keuze());
    fireEvent.change(within(eiwit()).getByRole("searchbox", { name: /Zoek eten met eiwit/ }), { target: { value: "" } });
    expect(within(eiwit()).getByText("Jouw keuze")).toBeTruthy();
    expect(within(eiwit()).getByRole("button", { name: /Ei, gebakken: gekozen/ })).toBeTruthy();
  });
});
