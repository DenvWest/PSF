// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import KeuzeVergelijken from "@/components/dashboard/keuze/KeuzeVergelijken";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";
import type { StoredSupplementVerdict } from "@/types/verdict";

vi.mock("@/lib/ga4", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));
vi.mock("@/lib/intake-events-client", () => ({ emitIntakeClientEvent: vi.fn() }));
vi.mock("@/lib/use-kernstof-normen", () => ({
  useKernstofProfiel: () => ({ geslacht: null, zeventigPlus: false, voedingswijze: null, streefwaarden: {} }),
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

afterEach(() => {
  cleanup();
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

function renderKeuze(magnesiumGedekt = false, verdicts: StoredSupplementVerdict[] = []) {
  return render(
    <KeuzeVergelijken
      statuses={[status("magnesium", "Magnesium"), status("protein", "Eiwit")]}
      reeksen={[reeks("magnesium", magnesiumGedekt), reeks("protein", true)]}
      dagen={[]}
      vandaag="2026-10-06"
      surface="test"
      verdicts={verdicts}
    />,
  );
}

describe("KeuzeVergelijken", () => {
  it("vat het dagboek samen en zet eten en supplement naast elkaar, zonder slotjes", () => {
    renderKeuze();
    expect(screen.getByText(/1 van 2 meetbare kernstoffen op je norm · magnesium heeft ruimte/)).toBeTruthy();
    const eten = screen.getByRole("region", { name: "Uit je eten" });
    const supplement = screen.getByRole("region", { name: "Uit een supplement" });
    expect(within(supplement).getByText("Per vorm de hoogste PS-Score")).toBeTruthy();
    expect(within(supplement).getByRole("link", { name: /Alle \d+ met PS-Score/ }).getAttribute("href")).toBe(
      "/supplementen?categorie=magnesium",
    );
    expect(within(eten).getByRole("button", { name: "Kies eten" })).toBeTruthy();
    expect(screen.queryByText(/Eerst je voedingsbasis/)).toBeNull();
  });

  it("allebei = beide kaarten kiezen", () => {
    const { rerender } = renderKeuze();
    fireEvent.click(screen.getByRole("button", { name: "Kies eten" }));
    expect(favorieten.items.map((i) => i.id)).toEqual(["voeding-route-magnesium-bord"]);
    rerender(
      <KeuzeVergelijken
        statuses={[status("magnesium", "Magnesium"), status("protein", "Eiwit")]}
        reeksen={[reeks("magnesium", false), reeks("protein", true)]}
        dagen={[]}
        vandaag="2026-10-06"
        surface="test"
        verdicts={[]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Kies supplement" }));
    expect(favorieten.items.map((i) => i.id)).toEqual(["voeding-route-magnesium-beide"]);
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
});
