// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DomainLifestyleLadder, {
  type LifestyleLayerState,
} from "@/components/dashboard/domain/DomainLifestyleLadder";

const trackEvent = vi.hoisted(() => vi.fn());
vi.mock("@/lib/ga4", () => ({ trackEvent }));

const LAYERS = [
  { id: 1, name: "Dagelijks bewegen", subtitle: "Zitten onderbreken", summary: "", actions: [] },
  { id: 2, name: "Kracht + basisconditie", subtitle: "Spierbehoud", summary: "", actions: [] },
  { id: 3, name: "Progressief opbouwen", subtitle: "Meer per keer", summary: "", actions: [] },
];

const STATES: Record<number, LifestyleLayerState> = { 1: "watch", 2: "winst", 3: "wacht" };
const LABELS: Record<LifestyleLayerState, string> = {
  winst: "Grootste winst",
  ok: "Op orde",
  watch: "Houd in de gaten",
  wacht: "Nog niet nu",
};

function renderLadder(selectedLayer: number | null, onSelectLayer = vi.fn()) {
  render(
    <DomainLifestyleLadder
      layers={LAYERS}
      layerStates={STATES}
      stateLabels={LABELS}
      selectedLayer={selectedLayer}
      onSelectLayer={onSelectLayer}
      whyWait={(id) => (id === 3 ? "Opbouwen begint later." : null)}
      domain="beweging"
      surface="leefstijlprofiel_beweging"
    />,
  );
  return onSelectLayer;
}

describe("DomainLifestyleLadder", () => {
  it("toont alle lagen in vaste volgorde met hun staat in tekst", () => {
    renderLadder(2);
    const namen = screen.getAllByRole("button").map((b) => b.textContent ?? "");
    expect(namen[0]).toContain("Dagelijks bewegen");
    expect(namen[1]).toContain("Kracht + basisconditie");
    expect(namen[2]).toContain("Progressief opbouwen");
    expect(screen.getByText("Grootste winst")).toBeTruthy();
    expect(screen.getByText("Houd in de gaten")).toBeTruthy();
  });

  it("meldt een klik en meet hem, zonder zelf iets te openen", () => {
    const onSelectLayer = renderLadder(2);
    fireEvent.click(screen.getByText("Progressief opbouwen"));
    expect(onSelectLayer).toHaveBeenCalledWith(3);
    expect(trackEvent).toHaveBeenCalledWith("beweging_ladder_layer_open", {
      layer: 3,
      surface: "leefstijlprofiel_beweging",
    });
  });

  it("toont de subregel alleen op de gekozen laag — de rest blijft één regel", () => {
    renderLadder(2);
    expect(screen.getByText("Spierbehoud")).toBeTruthy();
    expect(screen.queryByText("Zitten onderbreken")).toBeNull();
  });

  it("legt bij een wachtende laag uit waarom, zodra je hem kiest", () => {
    renderLadder(3);
    expect(screen.getByText("Opbouwen begint later.")).toBeTruthy();
  });

  it("toont geen enkel staat-woord zonder check — de lagen blijven wel klikbaar", () => {
    const onSelectLayer = vi.fn();
    render(
      <DomainLifestyleLadder
        layers={LAYERS}
        selectedLayer={1}
        onSelectLayer={onSelectLayer}
        domain="beweging"
        surface="kompas_beweging"
      />,
    );
    for (const label of Object.values(LABELS)) {
      expect(screen.queryByText(label)).toBeNull();
    }
    fireEvent.click(screen.getByText("Progressief opbouwen"));
    expect(onSelectLayer).toHaveBeenCalledWith(3);
  });

  it("markeert de gekozen laag voor hulptechniek", () => {
    renderLadder(2);
    const gekozen = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(gekozen).toHaveLength(1);
    expect(gekozen[0].textContent).toContain("Kracht + basisconditie");
  });
});
