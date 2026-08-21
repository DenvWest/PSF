// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PrioriteitenLadder from "@/components/dashboard/voortgang/PrioriteitenLadder";

type FakeFavorite = { id: string; title: string; kind: string; domain?: string };

let favoriteItems: FakeFavorite[] = [];
const save = vi.fn();
const remove = vi.fn();

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: favoriteItems,
    hydrated: true,
    isSaved: (id: string) => favoriteItems.some((item) => item.id === id),
    save,
    remove,
  }),
}));

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

beforeEach(() => {
  favoriteItems = [];
  save.mockClear();
  remove.mockClear();
});

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

  it("laat een buitenstaander bepalen welke laag open staat", () => {
    const onOpenLayerChange = vi.fn();
    const { rerender } = render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="beweging"
        surface="test"
        openLayer={2}
        onOpenLayerChange={onOpenLayerChange}
      />,
    );
    expect(screen.getByText("Samenvatting twee.")).toBeTruthy();

    // Gestuurd: de klik meldt zich, maar opent niets uit zichzelf.
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(onOpenLayerChange).toHaveBeenCalledWith(1);
    expect(screen.queryByText("Samenvatting een.")).toBeNull();

    rerender(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="beweging"
        surface="test"
        openLayer={1}
        onOpenLayerChange={onOpenLayerChange}
      />,
    );
    expect(screen.getByText("Samenvatting een.")).toBeTruthy();

    // Nog een klik op dezelfde laag is "dicht", niet opnieuw open.
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(onOpenLayerChange).toHaveBeenLastCalledWith(null);
  });

  it("geeft elke laag een anker-id, zodat de ladder in de kop ernaartoe kan scrollen", () => {
    const { container } = render(
      <PrioriteitenLadder layers={LAYERS} intro="Intro-tekst." domain="beweging" surface="test" />,
    );
    expect(container.querySelector("#ladder-laag-beweging-p1")).toBeTruthy();
    expect(container.querySelector("#ladder-laag-beweging-p2")).toBeTruthy();
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

  it("toont geen actieblok bij een laag zonder acties, wel het lege Mijn keuze", () => {
    const layersLeeg = [
      { id: 1, name: "Meten & timing", summary: "Gereedschap, geen fundament.", actions: [] },
    ];
    render(
      <PrioriteitenLadder layers={layersLeeg} intro="Intro-tekst." domain="voeding" surface="test" />,
    );
    fireEvent.click(screen.getByText("Meten & timing"));
    expect(screen.getByText("Gereedschap, geen fundament.")).toBeTruthy();
    expect(screen.queryByText("Wat je hier kunt doen")).toBeNull();
    expect(screen.getByText("Mijn keuze op deze laag")).toBeTruthy();
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

  it("schrijft een gekozen actie weg met een id dat domein én laag onthoudt", () => {
    render(
      <PrioriteitenLadder layers={LAYERS} intro="Intro-tekst." domain="stress" surface="test" />,
    );
    fireEvent.click(screen.getByText("Tweede prioriteit"));
    fireEvent.click(screen.getAllByRole("button", { name: "Zet bij Mijn keuze" })[0]);

    expect(save).toHaveBeenCalledWith({
      id: "laag-stress-p2-actie-2a",
      title: "Actie 2a",
      kind: "activiteit",
      domain: "stress",
      source: "mijn_keuze",
    });
  });

  it("toont per laag wat je daar koos, en telt het op de dichte rij", () => {
    favoriteItems = [
      { id: "laag-stress-p1-actie-1a", title: "Actie 1a", kind: "activiteit", domain: "stress" },
      { id: "laag-stress-p1-iets-eigens", title: "Iets eigens", kind: "activiteit", domain: "stress" },
      { id: "laag-stress-p2-actie-2a", title: "Actie 2a", kind: "activiteit", domain: "stress" },
    ];
    render(
      <PrioriteitenLadder layers={LAYERS} intro="Intro-tekst." domain="stress" surface="test" />,
    );

    // Dicht: alleen de teller, geen inhoud.
    expect(screen.getByText("2 gekozen")).toBeTruthy();
    expect(screen.getByText("1 gekozen")).toBeTruthy();
    expect(screen.queryByText("Iets eigens")).toBeNull();

    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.getByText("Iets eigens")).toBeTruthy();
    // De keuze van laag 2 blijft achter zijn eigen rij.
    expect(screen.queryByText(/^Actie 2a$/)).toBeNull();
  });

  it("telt keuzes van een ander domein niet mee", () => {
    favoriteItems = [
      { id: "laag-slaap-p1-actie-1a", title: "Actie 1a", kind: "activiteit", domain: "slaap" },
    ];
    render(
      <PrioriteitenLadder layers={LAYERS} intro="Intro-tekst." domain="stress" surface="test" />,
    );
    expect(screen.queryByText(/gekozen$/)).toBeNull();
  });

  it("noemt een laag alleen 'Aanbevolen' als de check hem aanwijst", () => {
    const { rerender } = render(
      <PrioriteitenLadder layers={LAYERS} intro="Intro-tekst." domain="beweging" surface="test" />,
    );
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.getByText("Wat je hier kunt doen")).toBeTruthy();

    rerender(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="beweging"
        surface="test"
        recommendedLayerIds={[1]}
      />,
    );
    expect(screen.getByText("Aanbevolen na je check")).toBeTruthy();
  });

  it("toont de staat per laag zodra de check hem levert, en opent de winst-laag", () => {
    render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="beweging"
        surface="test"
        layerStates={{ 1: "ok", 2: "winst" }}
        stateLabels={{
          winst: "Grootste winst",
          ok: "Op orde",
          watch: "Houd in de gaten",
          wacht: "Nog niet nu",
        }}
        focusLayer={2}
      />,
    );
    expect(screen.getByText("Op orde")).toBeTruthy();
    expect(screen.getByText("Grootste winst")).toBeTruthy();
    // De winst-laag staat meteen open.
    expect(screen.getByText("Samenvatting twee.")).toBeTruthy();
  });

  it("wijst naar Mijn Dag zodra die terugweg bestaat", () => {
    const onGoAgenda = vi.fn();
    render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="stress"
        surface="test"
        onGoAgenda={onGoAgenda}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Open Mijn Dag/ }));
    expect(onGoAgenda).toHaveBeenCalled();
  });
});
