// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PrioriteitenLadder from "@/components/dashboard/voortgang/PrioriteitenLadder";

const LAYERS = [
  {
    id: 1,
    name: "Eerste prioriteit",
    subtitle: "Ondertitel een",
    summary: "Samenvatting een.",
    actions: ["Actie 1a", "Actie 1b"],
  },
  {
    id: 2,
    name: "Tweede prioriteit",
    subtitle: "Ondertitel twee",
    summary: "Samenvatting twee.",
    actions: ["Actie 2a"],
  },
];

describe("PrioriteitenLadder", () => {
  it("toont alle lagen dicht, zonder statuslabel — geen afgeleide score", () => {
    render(
      <PrioriteitenLadder layers={LAYERS} intro="Intro-tekst." domain="stress" surface="test" />,
    );
    expect(screen.getByText("Eerste prioriteit")).toBeTruthy();
    expect(screen.getByText("Tweede prioriteit")).toBeTruthy();
    expect(screen.queryByText("Samenvatting een.")).toBeNull();
    // Geen enkele state-badge (winst/ok/watch/wacht) — dit is zelfselectie, geen scoring.
    expect(screen.queryByText(/Grootste winst|Op orde|Houd in de gaten|Nog niet nu/)).toBeNull();
  });

  it("opent en sluit een laag op klik, onafhankelijk van de andere lagen", () => {
    render(
      <PrioriteitenLadder layers={LAYERS} intro="Intro-tekst." domain="stress" surface="test" />,
    );
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.getByText("Samenvatting een.")).toBeTruthy();
    expect(screen.queryByText("Samenvatting twee.")).toBeNull();

    fireEvent.click(screen.getByText("Tweede prioriteit"));
    expect(screen.getByText("Samenvatting twee.")).toBeTruthy();
    expect(screen.queryByText("Samenvatting een.")).toBeNull();
  });

  it("toont de vangnetregel alleen als hij expliciet is meegegeven", () => {
    const { rerender } = render(
      <PrioriteitenLadder layers={LAYERS} intro="Intro-tekst." domain="stress" surface="test" />,
    );
    expect(screen.queryByText(/huisarts/)).toBeNull();

    rerender(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        safetyNetLine="Loopt dit door — dan is je huisarts het juiste startpunt."
        domain="verbinding"
        surface="test"
      />,
    );
    expect(screen.getByText(/huisarts/)).toBeTruthy();
  });

  it("werkt zonder subtitle — voeding heeft er geen", () => {
    const layersZonderSubtitle = [
      { id: 1, name: "Je eetbasis", summary: "Samenvatting.", actions: [] },
    ];
    render(
      <PrioriteitenLadder
        layers={layersZonderSubtitle}
        intro="Intro-tekst."
        domain="voeding"
        surface="test"
      />,
    );
    expect(screen.getByText("Je eetbasis")).toBeTruthy();
  });

  it("toont geen 'Wat je kunt doen' bij een laag zonder acties", () => {
    const layersLeeg = [
      { id: 1, name: "Meten & timing", summary: "Gereedschap, geen fundament.", actions: [] },
    ];
    render(
      <PrioriteitenLadder layers={layersLeeg} intro="Intro-tekst." domain="voeding" surface="test" />,
    );
    fireEvent.click(screen.getByText("Meten & timing"));
    expect(screen.getByText("Gereedschap, geen fundament.")).toBeTruthy();
    expect(screen.queryByText("Wat je kunt doen")).toBeNull();
  });

  it("gebruikt de meegegeven eyebrow in plaats van de standaard", () => {
    render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        eyebrow="Van onder naar boven"
        domain="voeding"
        surface="test"
      />,
    );
    expect(screen.getByText("Van onder naar boven")).toBeTruthy();
    expect(screen.queryByText("Kies wat herkenbaar is")).toBeNull();
  });
});
