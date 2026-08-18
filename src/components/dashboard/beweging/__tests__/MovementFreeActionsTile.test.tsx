// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MovementFreeActionsTile from "@/components/dashboard/beweging/MovementFreeActionsTile";

const ACTIONS = [
  "Onderbreek elk werkuur twee minuten — staan is genoeg.",
  "Zet één verplaatsing per dag om naar lopen of fietsen.",
  "Neem één telefoongesprek per dag staand of wandelend.",
];

describe("MovementFreeActionsTile — N4: geen aanbod op een doe-surface", () => {
  it("rendert niets als de prioriteit geen acties heeft (P5, P6)", () => {
    const { container } = render(
      <MovementFreeActionsTile priorityId={5} priorityName="Geavanceerde training" actions={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("toont de drie acties, elk met een 'Zet op Mijn Dag'-knop", () => {
    render(
      <MovementFreeActionsTile priorityId={1} priorityName="Dagelijks bewegen" actions={ACTIONS} />,
    );
    for (const action of ACTIONS) {
      expect(screen.queryByText(action)).not.toBeNull();
    }
    expect(screen.getAllByText("Zet op Mijn Dag")).toHaveLength(3);
  });

  it("wisselt naar 'Staat op Mijn Dag' na een klik, en laat de andere twee onaangeroerd", () => {
    render(
      <MovementFreeActionsTile priorityId={1} priorityName="Dagelijks bewegen" actions={ACTIONS} />,
    );
    const buttons = screen.getAllByRole("button", { name: /Zet op Mijn Dag/ });
    fireEvent.click(buttons[0]);

    expect(screen.queryByText("Staat op Mijn Dag")).not.toBeNull();
    expect(screen.getAllByText("Zet op Mijn Dag")).toHaveLength(2);
  });

  it("noemt geen merk, prijs of oordeel — alleen de check als bron", () => {
    render(
      <MovementFreeActionsTile priorityId={1} priorityName="Dagelijks bewegen" actions={ACTIONS} />,
    );
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/€|Aanrader|Alleen als|Nu niet/);
    expect(screen.queryByText(/Hier verdienen we niets aan/)).not.toBeNull();
  });
});
