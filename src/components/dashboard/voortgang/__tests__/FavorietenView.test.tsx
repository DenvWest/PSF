// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FavorietenView from "@/components/dashboard/voortgang/FavorietenView";
import { getLeefstijlLadder, ladderActionFavoriteId } from "@/lib/leefstijl-ladder";

type FakeFavorite = { id: string; title: string; kind: string; domain?: string; source?: string };

let favoriteItems: FakeFavorite[] = [];

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: favoriteItems,
    hydrated: true,
    isSaved: (id: string) => favoriteItems.some((item) => item.id === id),
    save: vi.fn(),
    remove: vi.fn(),
  }),
}));

const LADDER = getLeefstijlLadder("beweging")!;
const LAAG2 = LADDER.layers.find((layer) => layer.id === 2)!;

beforeEach(() => {
  favoriteItems = [];
});

describe("FavorietenView — het archief draagt de laag waar een keuze vandaan komt", () => {
  it("toont laagnummer en laagnaam bij een keuze van de ladder", () => {
    favoriteItems = [
      {
        id: ladderActionFavoriteId("beweging", 2, LAAG2.actions[0]),
        title: LAAG2.actions[0],
        kind: "activiteit",
        domain: "beweging",
        source: "aanbevolen",
      },
    ];
    render(<FavorietenView onBack={vi.fn()} />);

    // Eén meta-regel, drie delen: laag komt erbij, vervangt niets. Via
    // textContent i.p.v. getByText, want de delen zijn losse tekstknopen.
    const sectie = screen.getByRole("region", { name: "Favorieten Beweging" });
    expect(sectie.textContent).toContain(`Laag 2 · ${LAAG2.name}`);
    expect(sectie.textContent).toContain("Activiteit");
    expect(sectie.textContent).toContain("Aanbevolen");
  });

  it("laat de laagregel weg bij een keuze die niet van de ladder komt", () => {
    favoriteItems = [
      { id: "magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    render(<FavorietenView onBack={vi.fn()} />);

    expect(screen.queryByText(/Laag \d/)).toBeNull();
    expect(screen.getByText(/Supplement/)).toBeTruthy();
  });

  it("draagt geen laag zonder domein — liever geen herkomst dan een verzonnen herkomst", () => {
    favoriteItems = [{ id: "laag-beweging-p2-losse-rij", title: "Losse rij", kind: "activiteit" }];
    render(<FavorietenView onBack={vi.fn()} />);

    expect(screen.queryByText(/Laag \d/)).toBeNull();
  });
});
