// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DomainAttentionBar from "@/components/dashboard/kompas/DomainAttentionBar";
import { MOVEMENT_LAYER_STATE_LABEL } from "@/lib/movement-ladder";

const LAYERS = [
  { id: 1, name: "Dagelijks bewegen" },
  { id: 2, name: "Kracht + basisconditie" },
  { id: 3, name: "Progressief opbouwen" },
  { id: 4, name: "Specifiek sporten" },
];

describe("DomainAttentionBar", () => {
  it("toont de winst-laag altijd, ook als hij niet het laagste id heeft", () => {
    render(
      <DomainAttentionBar
        layers={LAYERS}
        states={{ 1: "watch", 2: "winst", 3: "wacht", 4: "wacht" }}
        stateLabels={MOVEMENT_LAYER_STATE_LABEL}
      />,
    );
    expect(screen.queryByText("Kracht + basisconditie")).not.toBeNull();
    expect(screen.queryByText("Grootste winst")).not.toBeNull();
  });

  it("toont nooit meer dan drie lagen, ook met zes ingevoerd", () => {
    const six = [1, 2, 3, 4, 5, 6].map((id) => ({ id, name: `Laag ${id}` }));
    render(
      <DomainAttentionBar
        layers={six}
        states={{ 1: "wacht", 2: "wacht", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" }}
        stateLabels={MOVEMENT_LAYER_STATE_LABEL}
      />,
    );
    expect(screen.getAllByText(/^P\d$/)).toHaveLength(3);
  });

  it("sorteert winst > houd in de gaten > op orde > wacht, tiebreak op het laagste id", () => {
    render(
      <DomainAttentionBar
        layers={LAYERS}
        states={{ 1: "wacht", 2: "wacht", 3: "watch", 4: "watch" }}
        stateLabels={MOVEMENT_LAYER_STATE_LABEL}
      />,
    );
    // Twee watch-lagen (3 en 4) staan vóór de twee wacht-lagen; van de twee
    // watch-lagen wint het laagste id (3). De eerste P-tab hoort dus bij P3.
    const tabs = screen.getAllByText(/^P\d$/);
    expect(tabs[0].textContent).toBe("P3");
  });
});
