// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import KompasKeuzeSectie from "@/components/dashboard/kompas/KompasKeuzeSectie";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import type { AgendaBlockRecord } from "@/types/agenda";
import type { DashboardData, PillarId } from "@/types/dashboard";

type FakeFavorite = { id: string; title: string; kind: string; domain?: PillarId };

let favoriteItems: FakeFavorite[] = [];
let hydrated = true;
let momentBlock: AgendaBlockRecord | null = null;
const momentForMock = vi.fn(() => momentBlock);

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: favoriteItems,
    hydrated,
    isSaved: (id: string) => favoriteItems.some((item) => item.id === id),
    save: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock("@/lib/ladder-moments-context", () => ({
  useLadderMoments: () => ({
    hydrated: true,
    momentFor: momentForMock,
    plan: vi.fn(),
    move: vi.fn(),
    cancel: vi.fn(),
  }),
}));

const trackEvent = vi.fn();
vi.mock("@/lib/ga4", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));
vi.mock("@/lib/clarity", () => ({ clarityTag: vi.fn() }));

const MOVEMENT_LADDER = getLeefstijlLadder("beweging")!;
const WINST_LAYER = MOVEMENT_LADDER.layers.find((row) => row.id === 2)!;

const KRACHT_ROW = {
  key: "kracht",
  label: "Kracht",
  answerLabel: "1× per week",
  benchmarkLabel: "Richtlijn: 2× per week",
  benchmarkSource: "WHO 2020",
  status: "below",
  whyLine: "Richtlijn is 2× per week; jij zit daar nu onder.",
  footnote: null,
};

function movementReadoutData(focus = 2, daysAgo = 2): DashboardData {
  return {
    domainCheckDaysAgo: { beweging: daysAgo },
    movementCheckinSnapshot: {
      date: "2026-08-23",
      headline: "Je kracht is het deel dat nu achterblijft.",
      focusDimension: "kracht",
      focusLabel: "Kracht",
      answerLabel: "1× per week",
      focusStatement: "",
      implicationLine: "",
      ladder: {
        focus,
        states: { 1: "ok", 2: "winst", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
        coverage: { onOrder: 1, measured: 3 },
      },
      factRows: [KRACHT_ROW],
    },
  } as unknown as DashboardData;
}

function renderSectie(
  priorityDomain: PillarId = "beweging",
  data?: DashboardData,
) {
  const onOpenDomain = vi.fn();
  const onOpenAgenda = vi.fn();
  render(
    <KompasKeuzeSectie
      priorityDomain={priorityDomain}
      data={data}
      onOpenDomain={onOpenDomain}
      onOpenAgenda={onOpenAgenda}
    />,
  );
  return { onOpenDomain, onOpenAgenda };
}

beforeEach(() => {
  favoriteItems = [];
  hydrated = true;
  momentBlock = null;
  momentForMock.mockClear();
  trackEvent.mockClear();
});

describe("KompasKeuzeSectie — Mijn keuze (default tab)", () => {
  it("toont niets vóór hydratie, zodat de lege staat niet oplicht", () => {
    hydrated = false;
    favoriteItems = [
      { id: "laag-beweging-p1-wandelen", title: "Elke dag 20 minuten wandelen", kind: "activiteit", domain: "beweging" },
    ];
    const { container } = render(
      <KompasKeuzeSectie priorityDomain="beweging" onOpenDomain={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("toont de gekozen handelingen zelf, gegroepeerd per domein", () => {
    favoriteItems = [
      { id: "laag-beweging-p1-wandelen", title: "Elke dag 20 minuten wandelen", kind: "activiteit", domain: "beweging" },
      { id: "supp-magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    renderSectie();

    expect(screen.getByRole("heading", { name: "Wat je koos" })).toBeTruthy();
    expect(screen.getByText("Elke dag 20 minuten wandelen")).toBeTruthy();
    expect(screen.getByText("Magnesium")).toBeTruthy();
    expect(screen.getByText("Supplement")).toBeTruthy();
    expect(screen.getByText(/2 handelingen, over 2 domeinen/)).toBeTruthy();
  });

  it("zet het prioriteitsdomein als eerste kaart", () => {
    favoriteItems = [
      { id: "supp-magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
      { id: "laag-voeding-p1-eiwit", title: "Eiwit bij elke maaltijd", kind: "activiteit", domain: "voeding" },
    ];
    renderSectie("voeding");

    const headings = screen.getAllByText(/^(Voeding|Slaap)$/);
    expect(headings[0]?.textContent).toBe("Voeding");
  });

  it("een supplement-rij linkt naar het schap van zijn eigen domein", () => {
    favoriteItems = [
      { id: "supp-magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    renderSectie("beweging");

    const rij = screen.getByRole("link", { name: "Bekijk Magnesium op je schap" });
    expect(rij.getAttribute("href")).toBe(
      "/dashboard?tab=voortgang&screen=schap&fav=slaap&schap=favorieten",
    );

    fireEvent.click(rij);
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_kompas_keuzes_click",
      expect.objectContaining({ view: "mijn_keuze", domain: "slaap", destination: "schap", element: "rij" }),
    );
  });

  it("een activiteit zonder moment opent het domeinscherm", () => {
    momentBlock = null;
    favoriteItems = [
      { id: "laag-beweging-p1-wandelen", title: "Elke dag 20 minuten wandelen", kind: "activiteit", domain: "beweging" },
    ];
    const { onOpenDomain, onOpenAgenda } = renderSectie("beweging");

    fireEvent.click(screen.getByRole("button", { name: "Open Elke dag 20 minuten wandelen op je ladder" }));
    expect(onOpenDomain).toHaveBeenCalledWith("beweging");
    expect(onOpenAgenda).not.toHaveBeenCalled();
  });

  it("een activiteit met een gepland moment gaat naar Mijn Dag op die datum", () => {
    momentBlock = {
      id: "block-1",
      date: "2026-08-27",
      categoryId: "beweging",
      title: "Elke dag 20 minuten wandelen",
      startTime: "09:00",
      endTime: "09:30",
      source: "routine",
      status: "open",
      externalProvider: null,
      externalRef: null,
    };
    favoriteItems = [
      { id: "laag-beweging-p1-wandelen", title: "Elke dag 20 minuten wandelen", kind: "activiteit", domain: "beweging" },
    ];
    const { onOpenDomain, onOpenAgenda } = renderSectie("beweging");

    fireEvent.click(screen.getByRole("button", { name: "Bekijk Elke dag 20 minuten wandelen op Mijn Dag" }));
    expect(onOpenAgenda).toHaveBeenCalledWith("2026-08-27");
    expect(onOpenDomain).not.toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_kompas_keuzes_click",
      expect.objectContaining({ destination: "agenda" }),
    );
  });

  it("een dienst op een domein zonder schap opent het domeinscherm", () => {
    favoriteItems = [
      { id: "dienst-coach", title: "Slaapcoach-sessie", kind: "dienst", domain: "stress" },
    ];
    const { onOpenDomain } = renderSectie("stress");

    fireEvent.click(screen.getByRole("button", { name: "Open Slaapcoach-sessie op je ladder" }));
    expect(onOpenDomain).toHaveBeenCalledWith("stress");
  });

  it("kort een lange domeinlijst in met een resttelling", () => {
    favoriteItems = [
      ...Array.from({ length: 10 }, (_, index) => ({
        id: `laag-slaap-p1-actie-${index}`,
        title: `Slaapactie ${index}`,
        kind: "activiteit",
        domain: "slaap" as PillarId,
      })),
      { id: "laag-beweging-p1-wandelen", title: "Wandelen", kind: "activiteit", domain: "beweging" },
    ];
    renderSectie("slaap");

    expect(screen.getByText("Slaapactie 0")).toBeTruthy();
    expect(screen.queryByText("Slaapactie 5")).toBeNull();
    expect(screen.getByText("+5 meer op je schap")).toBeTruthy();
  });

  it("laat één domein verder doorlopen, want die kaart is volle breedte", () => {
    favoriteItems = Array.from({ length: 10 }, (_, index) => ({
      id: `laag-slaap-p1-actie-${index}`,
      title: `Slaapactie ${index}`,
      kind: "activiteit",
      domain: "slaap" as PillarId,
    }));
    renderSectie("slaap");

    expect(screen.getByText("Slaapactie 7")).toBeTruthy();
    expect(screen.queryByText("Slaapactie 8")).toBeNull();
    expect(screen.getByText("+2 meer op je schap")).toBeTruthy();
  });

  it("toont een lege staat met knop naar het prioriteitsdomein", () => {
    const { onOpenDomain } = renderSectie("beweging");

    expect(screen.getByText(/Nog niets gekozen/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open je prioriteitsdomein" }));
    expect(onOpenDomain).toHaveBeenCalledWith("beweging");
  });

  it("geeft de primaire knop een link naar het schap van het prioriteitsdomein", () => {
    favoriteItems = [
      { id: "supp-magnesium", title: "Magnesium", kind: "supplement", domain: "slaap" },
    ];
    renderSectie("slaap");

    const knop = screen.getByRole("link", { name: "Bekijk je keuzes op je schap" });
    expect(knop.getAttribute("href")).toBe(
      "/dashboard?tab=voortgang&screen=schap&fav=slaap&schap=favorieten",
    );
  });
});

describe("KompasKeuzeSectie — toggle en Aanbevolen", () => {
  it("staat standaard op Mijn keuze en wisselt naar Aanbevolen", () => {
    renderSectie("beweging", movementReadoutData(2));

    expect(screen.getByRole("heading", { name: "Wat je koos" })).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(screen.getByRole("heading", { name: "Aanbevolen" })).toBeTruthy();
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_kompas_keuzes_toggle",
      expect.objectContaining({ view: "aanbevolen" }),
    );
  });

  it("toont de winst-laag-actie per domein en opent altijd de ladder", () => {
    const { onOpenDomain } = renderSectie("beweging", movementReadoutData(2));
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(screen.getByText(WINST_LAYER.actions[0])).toBeTruthy();
    expect(screen.getByText(`Laag 2 · ${WINST_LAYER.name}`)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: `Open ${WINST_LAYER.actions[0]} op je ladder` }),
    );
    expect(onOpenDomain).toHaveBeenCalledWith("beweging");
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_kompas_aanbeveling_click",
      expect.objectContaining({ domain: "beweging" }),
    );
  });

  it("geeft ook een domein zonder readout een kaart, op laag 1", () => {
    // Vóór 26 augustus viel het hele blok weg zodra je prioriteitsdomein geen
    // readout had. Voeding heeft die nog steeds niet, maar wel een ladder.
    renderSectie("voeding", movementReadoutData(2));
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    const voedingLaag1 = getLeefstijlLadder("voeding")!.layers.find((row) => row.id === 1)!;
    expect(screen.getByText("Voeding")).toBeTruthy();
    expect(screen.getByText(`Laag 1 · ${voedingLaag1.name}`)).toBeTruthy();
    // Beweging houdt zijn eigen, gemeten laag.
    expect(screen.getByText(WINST_LAYER.actions[0])).toBeTruthy();
  });

  it("zegt er eerlijk bij dat een terugval-laag niet uit een meting komt", () => {
    renderSectie("voeding", undefined);
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(
      screen.getAllByText("Nog niet apart gemeten — dit is de basis van je ladder.").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Uit je voedingscheck/)).toBeNull();
  });

  it("markeert alleen het prioriteitsdomein als focus", () => {
    renderSectie("voeding", undefined);
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(screen.getAllByText("Je focus")).toHaveLength(1);
  });

  it("toont beide markeringen als je focus en de analyse uiteenlopen", () => {
    const onOpenDomain = vi.fn();
    render(
      <KompasKeuzeSectie
        priorityDomain="beweging"
        enginePriorityDomain="stress"
        onOpenDomain={onOpenDomain}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(screen.getAllByText("Advies")).toHaveLength(1);
    expect(screen.getAllByText("Je focus")).toHaveLength(1);
  });

  it("toont één markering als focus en analyse samenvallen", () => {
    const onOpenDomain = vi.fn();
    render(
      <KompasKeuzeSectie
        priorityDomain="beweging"
        enginePriorityDomain="beweging"
        onOpenDomain={onOpenDomain}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(screen.getAllByText("Advies")).toHaveLength(1);
    expect(screen.getAllByText("Je focus")).toHaveLength(1);
    // Beide chips zitten op dezelfde, bovenste kaart.
    expect(screen.getAllByText("Beweging")).toHaveLength(1);
  });

  it("toont de nudge alleen op Aanbevolen als focus en analyse uiteenlopen", () => {
    const onAcceptEngine = vi.fn();
    render(
      <KompasKeuzeSectie
        priorityDomain="beweging"
        enginePriorityDomain="stress"
        showEngineShiftNudge
        onAcceptEngine={onAcceptEngine}
        onOpenDomain={vi.fn()}
      />,
    );

    // Mijn keuze is de landing — daar hoort de nudge niet.
    expect(screen.queryByRole("button", { name: "Volg het nieuwe advies" })).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));
    const knop = screen.getByRole("button", { name: "Volg het nieuwe advies" });
    expect(screen.getByText(/Je meting wijst nu stress aan/)).toBeTruthy();

    fireEvent.click(knop);
    expect(onAcceptEngine).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      "dashboard_kompas_engine_shift_accept",
      expect.objectContaining({ from: "beweging", to: "stress" }),
    );
  });

  it("toont geen nudge als focus en analyse samenvallen", () => {
    render(
      <KompasKeuzeSectie
        priorityDomain="beweging"
        enginePriorityDomain="beweging"
        showEngineShiftNudge={false}
        onAcceptEngine={vi.fn()}
        onOpenDomain={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(screen.queryByRole("button", { name: "Volg het nieuwe advies" })).toBeNull();
  });

  it("blokkeert de nudge-knop terwijl het opslaan loopt", () => {
    render(
      <KompasKeuzeSectie
        priorityDomain="beweging"
        enginePriorityDomain="stress"
        showEngineShiftNudge
        acceptEngineBusy
        onAcceptEngine={vi.fn()}
        onOpenDomain={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(
      screen.getByRole("button", { name: "Volg het nieuwe advies" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("draagt de herkomstregel van een gemeten domein wél", () => {
    renderSectie("beweging", movementReadoutData(2, 3));
    fireEvent.click(screen.getByRole("tab", { name: "Aanbevolen" }));

    expect(screen.getByText("Uit je beweegcheck van 3 dagen geleden.")).toBeTruthy();
  });
});
