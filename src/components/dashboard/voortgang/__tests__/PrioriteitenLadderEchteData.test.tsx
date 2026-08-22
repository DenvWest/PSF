// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PrioriteitenLadder from "@/components/dashboard/voortgang/PrioriteitenLadder";
import { getLeefstijlLadder, ladderActionFavoriteId } from "@/lib/leefstijl-ladder";
import { MOVEMENT_LAYER_STATE_LABEL } from "@/lib/movement-ladder";

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

beforeEach(() => {
  favoriteItems = [];
  save.mockClear();
});

/**
 * De ladder tegen de échte domeindata, niet tegen een verzonnen laagje: elke
 * laagnaam en elke actie hier komt woordelijk uit `src/data/`, dus als een
 * domein zijn copy verandert valt dat hier om — niet pas op het scherm.
 */
describe("PrioriteitenLadder op echte domeindata", () => {
  it("zet de zes slaaplagen neer en toont de acties van de laag die je opent", () => {
    const ladder = getLeefstijlLadder("slaap")!;
    render(
      <PrioriteitenLadder
        layers={ladder.layers}
        intro={ladder.intro}
        eyebrow={ladder.eyebrow}
        domain="slaap"
        surface={ladder.surface}
      />,
    );

    for (const layer of ladder.layers) {
      expect(screen.getByText(layer.name), layer.name).toBeTruthy();
    }

    const tweede = ladder.layers[1];
    expect(screen.queryByText(tweede.actions[0])).toBeNull();
    fireEvent.click(screen.getByText(tweede.name));
    expect(screen.getByText(tweede.actions[0])).toBeTruthy();
    expect(screen.getByText("Mijn keuze op deze laag")).toBeTruthy();
  });

  it("bewaart een echte slaapactie onder de laag waar hij staat", () => {
    const ladder = getLeefstijlLadder("slaap")!;
    const eerste = ladder.layers[0];
    render(
      <PrioriteitenLadder
        layers={ladder.layers}
        intro={ladder.intro}
        domain="slaap"
        surface={ladder.surface}
      />,
    );
    fireEvent.click(screen.getByText(eerste.name));
    fireEvent.click(screen.getAllByRole("button", { name: "Zet bij Mijn keuze" })[0]);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: ladderActionFavoriteId("slaap", eerste.id, eerste.actions[0]),
        title: eerste.actions[0],
        kind: "activiteit",
        domain: "slaap",
      }),
      "leefstijlprofiel_slaap",
    );
  });

  it("draagt op beweging de staat per laag én markeert alleen de aangewezen laag als aanbevolen", () => {
    const ladder = getLeefstijlLadder("beweging")!;
    render(
      <PrioriteitenLadder
        layers={ladder.layers}
        intro={ladder.intro}
        eyebrow={ladder.eyebrow}
        domain="beweging"
        surface={ladder.surface}
        layerStates={{ 1: "ok", 2: "winst", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" }}
        stateLabels={MOVEMENT_LAYER_STATE_LABEL}
        focusLayer={2}
        recommendedLayerIds={[2]}
      />,
    );

    expect(screen.getByText("Grootste winst")).toBeTruthy();
    // De winst-laag staat meteen open en heet daar Aanbevolen.
    expect(screen.getByText("Aanbevolen na je check")).toBeTruthy();

    // Een laag die de check niet aanwijst claimt geen aanbeveling.
    fireEvent.click(screen.getByText(ladder.layers[0].name));
    expect(screen.getByText("Wat je hier kunt doen")).toBeTruthy();
    expect(screen.queryByText("Aanbevolen na je check")).toBeNull();
  });

  it("houdt de vangnetregel van verbinding op verbinding", () => {
    const ladder = getLeefstijlLadder("verbinding")!;
    render(
      <PrioriteitenLadder
        layers={ladder.layers}
        intro={ladder.intro}
        eyebrow={ladder.eyebrow}
        safetyNetLine={ladder.safetyNetLine}
        domain="verbinding"
        surface={ladder.surface}
      />,
    );
    expect(screen.getByText(/huisarts het juiste startpunt/)).toBeTruthy();
  });
});
