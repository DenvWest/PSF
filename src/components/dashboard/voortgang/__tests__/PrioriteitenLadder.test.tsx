// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PrioriteitenLadder from "@/components/dashboard/voortgang/PrioriteitenLadder";
import { buildMeetreeks } from "@/lib/voortgang-meetreeks";

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

    expect(save).toHaveBeenCalledWith(
      {
        id: "laag-stress-p2-actie-2a",
        title: "Actie 2a",
        kind: "activiteit",
        domain: "stress",
        source: "mijn_keuze",
      },
      "test",
    );
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

/**
 * De `explain`-stand is wat Voortgang sinds 23 augustus gebruikt: de ladder
 * verklaart, Kompas kiest. Zonder deze tests kruipt de keuze-affordance er
 * ongemerkt weer in — en dan staat "wat koos ik op deze laag" opnieuw op drie
 * plekken.
 */
describe("PrioriteitenLadder — variant 'explain': verklaren, niet kiezen", () => {
  function renderExplain() {
    return render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="beweging"
        surface="test"
        variant="explain"
        kompasHref="/dashboard?tab=vandaag&kompas=beweging"
      />,
    );
  }

  it("draagt de verklaring van de laag onverkort", () => {
    renderExplain();
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.getByText("Samenvatting een.")).toBeTruthy();
    expect(screen.getByText("Actie 1a")).toBeTruthy();
  });

  it("draagt geen save-knop — kiezen gebeurt op Kompas", () => {
    renderExplain();
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.queryByRole("button", { name: /Zet bij Mijn keuze/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Kies dit op Kompas/ })).toBeTruthy();
  });

  it("draagt geen tweede 'Mijn keuze op deze laag' en geen plan-knop", () => {
    favoriteItems = [
      {
        id: "laag-beweging-p1-actie-1a",
        title: "Actie 1a",
        kind: "activiteit",
        domain: "beweging",
      },
    ];
    renderExplain();
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.queryByText("Mijn keuze op deze laag")).toBeNull();
    expect(screen.queryByRole("button", { name: /Zet op Mijn Dag/ })).toBeNull();
  });

  it("toont de gekozen titel read-only in de open laag", () => {
    favoriteItems = [
      {
        id: "laag-beweging-p1-iets-eigens",
        title: "Iets eigens",
        kind: "activiteit",
        domain: "beweging",
      },
    ];
    renderExplain();
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.getByText("Jij koos")).toBeTruthy();
    expect(screen.getByText("Iets eigens")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Zet bij Mijn keuze/ })).toBeNull();
  });

  it("blijft wél tonen dat je op deze laag iets koos", () => {
    favoriteItems = [
      {
        id: "laag-beweging-p1-actie-1a",
        title: "Actie 1a",
        kind: "activiteit",
        domain: "beweging",
      },
    ];
    renderExplain();
    // De dichte rij houdt zijn teller: feedback zonder tweede archief.
    expect(screen.getByText("1 gekozen")).toBeTruthy();
  });

  it("houdt de keuze-affordance in de standaardstand — verbinding heeft geen Kompas-scherm", () => {
    render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="verbinding"
        surface="test"
      />,
    );
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.getAllByRole("button", { name: /Zet bij Mijn keuze/ }).length).toBeGreaterThan(0);
    expect(screen.getByText("Mijn keuze op deze laag")).toBeTruthy();
  });

  it("zet een meetfeit in de open laag, met de lat ernaast", () => {
    render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="beweging"
        surface="test"
        variant="explain"
        kompasHref="/dashboard?tab=vandaag&kompas=beweging"
        evidenceByLayer={{
          1: [
            {
              key: "kracht",
              label: "Kracht",
              answerLabel: "1× per week",
              benchmarkLabel: "Richtlijn: 2× per week krachttraining",
              benchmarkSource: "WHO 2020",
              whyLine: "Spierbehoud na 40 hangt aan frequentie.",
            },
          ],
        }}
      />,
    );
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.getByText(/Kracht · 1× per week/)).toBeTruthy();
    expect(screen.getByText(/De lat/)).toBeTruthy();
    expect(screen.getByText(/Richtlijn: 2× per week krachttraining/)).toBeTruthy();
    expect(screen.queryByText("Over tijd")).toBeNull();
  });

  it("noemt de lat niet bij zelfrapportage, ook niet als er een label hangt", () => {
    const meetreeks = buildMeetreeks([
      {
        id: "stress-1",
        dateIso: "2026-08-20",
        dateLabel: "20 aug 2026",
        daysAgo: 5,
        score: 49,
        source: "checkin",
        values: [
          {
            key: "STR_FREQ",
            label: "Spanning",
            answerLabel: "Regelmatig",
            benchmarkLabel: null,
            level: 2,
            levelMax: 4,
            scale: "zelfrapportage",
          },
        ],
      },
    ]);

    render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="stress"
        surface="test"
        variant="explain"
        kompasHref="/dashboard?tab=vandaag&kompas=stress"
        meetreeks={meetreeks}
        evidenceByLayer={{
          1: [
            {
              key: "STR_FREQ",
              label: "Spanning",
              answerLabel: "Regelmatig",
              whyLine: "Dit is hoe vaak jij spanning voelt.",
            },
          ],
        }}
      />,
    );
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    expect(screen.getByText(/Spanning · Regelmatig/)).toBeTruthy();
    expect(screen.getByText(/Geen richtlijn — dit is jouw eigen antwoord/)).toBeTruthy();
    expect(screen.queryByText(/De lat/)).toBeNull();
  });

  it("opent de micro-reeks alleen bij een plotbaar feit", () => {
    const meetreeks = buildMeetreeks([
      {
        id: "oud",
        dateIso: "2026-07-01",
        dateLabel: "1 jul 2026",
        daysAgo: 40,
        score: 50,
        source: "checkin",
        values: [
          {
            key: "kracht",
            label: "Kracht",
            answerLabel: "Minder dan 1× per week",
            benchmarkLabel: "Richtlijn: 2× per week krachttraining",
            level: 1,
            levelMax: 3,
            scale: "richtlijn",
          },
        ],
      },
      {
        id: "nieuw",
        dateIso: "2026-08-20",
        dateLabel: "20 aug 2026",
        daysAgo: 5,
        score: 58,
        source: "checkin",
        values: [
          {
            key: "kracht",
            label: "Kracht",
            answerLabel: "1× per week",
            benchmarkLabel: "Richtlijn: 2× per week krachttraining",
            level: 2,
            levelMax: 3,
            scale: "richtlijn",
          },
        ],
      },
    ]);

    render(
      <PrioriteitenLadder
        layers={LAYERS}
        intro="Intro-tekst."
        domain="beweging"
        surface="test"
        variant="explain"
        kompasHref="/dashboard?tab=vandaag&kompas=beweging"
        meetreeks={meetreeks}
        evidenceByLayer={{
          1: [
            {
              key: "kracht",
              label: "Kracht",
              answerLabel: "1× per week",
              benchmarkLabel: "Richtlijn: 2× per week krachttraining",
              benchmarkSource: "WHO 2020",
              whyLine: "Richtlijn is 2× per week.",
            },
          ],
        }}
      />,
    );
    fireEvent.click(screen.getByText("Eerste prioriteit"));
    fireEvent.click(screen.getByRole("button", { name: /Over tijd/ }));
    expect(
      screen.getByRole("img", { name: /Kracht over 2 meetmomenten, links je laatste meting/ }),
    ).toBeTruthy();
  });
});
