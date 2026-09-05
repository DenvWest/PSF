// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import DomainKompasScreen from "@/components/dashboard/domain/DomainKompasScreen";
import { DomainLadderFocusProvider } from "@/lib/domain-ladder-focus-context";
import { LadderMomentsProvider } from "@/lib/ladder-moments-context";
import { VoortgangFavoritesProvider } from "@/lib/voortgang-favorites-context";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

function model(): DashboardModel {
  return {
    scores: { slaap: 58, beweging: 71 },
    trend: { slaap: [49, 52, 51, 54, 56, 58], beweging: [64, 66, 68, 69, 70, 71] },
  } as unknown as DashboardModel;
}

const SLEEP_SNAPSHOT = {
  date: "2026-08-18",
  headline: "Je gunt jezelf structureel te weinig tijd in bed.",
  focusLabel: "Slaapduur",
  focusDimension: null,
  answerLabel: "6 uur",
  focusStatement: "",
  implicationLine: "",
  focusLayer: 1,
  layerStates: { 1: "winst", 2: "watch", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
  kompasStatus: "",
  primaryAction: null,
  delta: null,
  factRows: [],
};

function data(overrides: Record<string, unknown> = {}): DashboardData {
  return {
    sleepCheckinSnapshot: SLEEP_SNAPSHOT,
    domainCheckDaysAgo: { slaap: 2 },
    ...overrides,
  } as unknown as DashboardData;
}

function renderScreen(
  domain: PillarId,
  dashboardData?: DashboardData,
  handlers: { onGoVoortgangDomein?: () => void; onGoLogboek?: () => void } = {},
) {
  return render(
    <DomainLadderFocusProvider>
      <LadderMomentsProvider>
        <VoortgangFavoritesProvider>
          <DomainKompasScreen
            domain={domain}
            model={model()}
            data={dashboardData}
            onGoAgenda={() => {}}
            onGoVoortgangDomein={handlers.onGoVoortgangDomein ?? (() => {})}
            onGoLogboek={handlers.onGoLogboek}
          />
        </VoortgangFavoritesProvider>
      </LadderMomentsProvider>
    </DomainLadderFocusProvider>,
  );
}

/**
 * Twee stoffen die aandacht vragen, één die gedekt is — genoeg om beide
 * tellingen van het tweeluik uit elkaar te houden.
 */
function nutritionReadout(overrides: Record<string, unknown> = {}) {
  const route = (nutrient: string, status: string) => ({
    nutrient,
    label: nutrient,
    route: { kind: "direct" },
    status,
    answerLabel: null,
    carriesVerdict: true,
    sources: [],
    supplementDoorOpen: false,
    doorReasonNl: "",
    comparisonPath: "/beste/magnesium",
  });
  return {
    date: "2026-08-30",
    headline: "Je voedingsbasis staat, op je plantaardige kant na.",
    factRows: [],
    focusLayer: 1,
    layerStates: { 1: "winst", 2: "watch", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
    gate: { open: false, reason: "Eerst je voedingsbasis; daarna pas het potje." },
    routes: [
      route("omega3", "gap"),
      route("magnesium", "partial"),
      route("protein", "covered"),
    ],
    ladderReport: { sliders: {}, preference: "none", allergies: [] },
    sufficiency: {
      layerState: "winst",
      contextLine: "82 kg · matige trainingsbelasting",
      trainingLoadLabel: "Matige trainingsbelasting",
      nutrients: [],
      focusNutrients: ["omega3"],
    },
    contribution: [],
    personalization: {
      weightKg: 82,
      trainingLoad: 2,
      proteinTarget: { gramsLow: 90, gramsHigh: 105 },
      ageRange: "45-54",
    },
    ...overrides,
  };
}

beforeEach(() => {
  // `KompasDomainGauge` vraagt naar prefers-reduced-motion; jsdom levert geen
  // matchMedia. Stille stub, want het scherm draait er niet op.
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ items: [], blocks: [] }), { status: 200 })),
  );
});

describe("DomainKompasScreen — slaap draagt hetzelfde scherm als beweging", () => {
  it("draagt de domeinnaam als enige h1, met stand en conclusiezin", () => {
    renderScreen("slaap", data());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Slaap");
    expect(screen.queryByText(/gemeten 2 dagen geleden/)).not.toBeNull();
    expect(
      screen.queryByText("Je gunt jezelf structureel te weinig tijd in bed."),
    ).not.toBeNull();
  });

  it("opent op de winst-laag uit de slaapcheck en toont de staat in tekst", () => {
    renderScreen("slaap", data());
    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    const winst = within(ladder).getByRole("button", { name: /Slaapgelegenheid/ });
    expect(winst.getAttribute("aria-pressed")).toBe("true");
    expect(within(ladder).queryByText("Grootste winst")).not.toBeNull();
  });

  it("laat een andere laag aanklikken en biedt de weg terug naar de winst-laag", () => {
    renderScreen("slaap", data());
    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    // Op de winst-laag zelf staat de knop er niet als knop, maar als merk: je
    // hoeft nergens heen terug.
    expect(screen.queryByText(/Jouw prioriteit — hier zit je winst/)).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Terug naar jouw prioriteit/ })).toBeNull();

    fireEvent.click(within(ladder).getByRole("button", { name: /Slaapomgeving/ }));
    const terug = screen.getByRole("button", { name: /Terug naar jouw prioriteit/ });
    expect(screen.queryByText(/Jouw prioriteit — hier zit je winst/)).toBeNull();

    fireEvent.click(terug);
    expect(screen.queryByRole("button", { name: /Terug naar jouw prioriteit/ })).toBeNull();
    expect(screen.queryByText(/Jouw prioriteit — hier zit je winst/)).not.toBeNull();
  });

  it("koppelt elke gratis optie aan Mijn keuze én aan Mijn Dag", () => {
    renderScreen("slaap", data());
    expect(screen.getAllByRole("button", { name: /Zet bij Mijn keuze/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Zet op Mijn Dag/ }).length).toBeGreaterThan(0);
  });

  it("sluit af zonder slaapbeeld-deur; Mijn Dag blijft", () => {
    renderScreen("slaap", data());
    expect(screen.queryByRole("button", { name: /Open je slaapbeeld/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Mijn Dag › vanavond" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: /beweegbeeld/ })).toBeNull();
  });

  it("zonder slaapcheck: ladder zonder oordeel, en het scherm blijft bruikbaar", () => {
    renderScreen("slaap", data({ sleepCheckinSnapshot: null, domainCheckDaysAgo: {} }));
    expect(screen.queryByText(/nog geen slaapcheck/)).not.toBeNull();
    expect(screen.queryByText(/Van basis naar finetunen/)).not.toBeNull();
    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    expect(within(ladder).queryByText("Grootste winst")).toBeNull();
    expect(
      within(ladder).getByRole("button", { name: /Slaapgelegenheid/ }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("beweging houdt zijn eigen copy op hetzelfde scherm", () => {
    renderScreen("beweging", data({ sleepCheckinSnapshot: null, domainCheckDaysAgo: {} }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Beweging");
    expect(screen.queryByText(/nog geen beweegcheck/)).not.toBeNull();
    expect(screen.queryByRole("button", { name: /Open je beweegbeeld/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Mijn Dag › vandaag" })).not.toBeNull();
  });

  it("voeding heeft nog geen check-uitlezing: ladder zonder oordeel, eigen copy", () => {
    renderScreen("voeding", data({ sleepCheckinSnapshot: null, domainCheckDaysAgo: {} }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Voeding");
    expect(screen.queryByText(/nog geen voedingscheck/)).not.toBeNull();
    expect(screen.queryByText(/Van onder naar boven/)).not.toBeNull();
    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    expect(within(ladder).queryByText("Grootste winst")).toBeNull();
    expect(
      within(ladder).getByRole("button", { name: /Voedingsbasis/ }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.queryByRole("button", { name: /Open je voedingsbeeld/ })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Mijn Dag › vandaag" })).not.toBeNull();
  });
});

describe("DomainKompasScreen — voeding draagt het tweeluik in plaats van het volle logboek", () => {
  const voedingData = () =>
    data({
      sleepCheckinSnapshot: null,
      domainCheckDaysAgo: { voeding: 3 },
      nutritionCheckinReadout: nutritionReadout(),
    });

  it("vervangt het logboek-blok door twee tellingen met elk hun eigen deur", async () => {
    renderScreen("voeding", voedingData());
    // Het volle logboek hoort hier niet meer te staan: geen chiprij, geen
    // uitklapbare stofdossiers.
    expect(screen.queryByRole("navigation", { name: "Kies een stof" })).toBeNull();
    expect(screen.queryByText("Je voedingslogboek")).toBeNull();

    expect(screen.queryByText("Voedingsstatus")).not.toBeNull();
    expect(screen.queryByText("Voedingslogboek")).not.toBeNull();
    // De aandacht-telling komt uit de check en staat er meteen: twee van de
    // drie routes vragen aandacht (gap + partial).
    expect(screen.queryByText("2 van de 3 stoffen vragen aandacht.")).not.toBeNull();

    // De open-telling hangt aan je bewaarde keuzes en verschijnt pas als die
    // binnen zijn — tot dan draagt de kaart zijn neutrale regel in plaats van
    // een getal dat straks omlaag springt.
    expect(screen.queryByText(/stoffen zonder keuze/)).toBeNull();
    expect(
      await screen.findByText("Nog 2 stoffen zonder keuze."),
    ).not.toBeNull();
  });

  it("stuurt de status naar Voortgang en het logboek naar het schap", () => {
    const onGoVoortgangDomein = vi.fn();
    const onGoLogboek = vi.fn();
    renderScreen("voeding", voedingData(), { onGoVoortgangDomein, onGoLogboek });

    fireEvent.click(screen.getByText("Voedingsstatus").closest("button")!);
    expect(onGoVoortgangDomein).toHaveBeenCalledTimes(1);
    expect(onGoLogboek).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Voedingslogboek").closest("button")!);
    expect(onGoLogboek).toHaveBeenCalledTimes(1);
  });

  it("noemt de reden dat de supplement-poort dicht staat, in de woorden van de check", () => {
    renderScreen("voeding", voedingData());
    expect(screen.queryByText("Eerst je voedingsbasis; daarna pas het potje.")).not.toBeNull();
  });

  it("laat de prioriteitsknop meebewegen met de laag die je aanklikt", () => {
    renderScreen("voeding", voedingData());
    expect(screen.queryByText(/Jouw prioriteit — hier zit je winst/)).not.toBeNull();

    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    const anderelaag = within(ladder)
      .getAllByRole("button")
      .find((button) => button.getAttribute("aria-pressed") === "false")!;
    fireEvent.click(anderelaag);
    expect(screen.getByRole("button", { name: /Terug naar jouw prioriteit 1/ })).not.toBeNull();
  });

  it("toont geen tweeluik zonder voedingscheck", () => {
    renderScreen("voeding", data({ sleepCheckinSnapshot: null, domainCheckDaysAgo: {} }));
    expect(screen.queryByText("Voedingsstatus")).toBeNull();
  });
});
