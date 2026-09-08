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
  handlers: { onGoVoortgangDomein?: () => void } = {},
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
          />
        </VoortgangFavoritesProvider>
      </LadderMomentsProvider>
    </DomainLadderFocusProvider>,
  );
}

/**
 * Twee stoffen die aandacht vragen, één die gedekt is — genoeg om de
 * prioriteitenrij en de aanvullaag uit elkaar te houden.
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

describe("DomainKompasScreen — voeding draagt het dagboek op P1", () => {
  const voedingData = () =>
    data({
      sleepCheckinSnapshot: null,
      domainCheckDaysAgo: { voeding: 3 },
      nutritionCheckinReadout: nutritionReadout(),
    });

  it("opent op het dagboek zelf, met de dagstrip en de vier eetmomenten", () => {
    renderScreen("voeding", voedingData());

    expect(screen.queryByRole("region", { name: "Voedingsdagboek" })).not.toBeNull();
    expect(screen.queryByRole("navigation", { name: "Kies een dag" })).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Ontbijt" })).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Avondeten" })).not.toBeNull();

    // Het tweeluik dat hier stond is weg: het dagboek zelf staat er nu, dus een
    // kaart met een deur ernaartoe is een omweg.
    expect(screen.queryByText("Voedingslogboek")).toBeNull();
  });

  it("noemt geen dagtotaal in milligrammen maar dekking in stoffen", () => {
    renderScreen("voeding", voedingData());
    expect(
      screen.queryByText("Nog niets ingevuld voor deze dag."),
    ).not.toBeNull();
    expect(screen.queryByText(/kcal/)).toBeNull();
  });

  it("zet een product op de dag en toont wat het levert", async () => {
    renderScreen("voeding", voedingData());

    fireEvent.click(screen.getByRole("button", { name: /Wat at je bij avondeten\?/ }));
    fireEvent.click(await screen.findByRole("button", { name: /^Spinazie/ }));

    // De regel staat op de dag, mét de portie erachter.
    expect(
      await screen.findByRole("button", { name: /Eén portie spinazie meer/ }),
    ).not.toBeNull();
    // De chips staan op de regel zelf: dát is waarvoor dit dagboek bestaat.
    expect(screen.getAllByText(/Vitamine K/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/van de 18 stoffen kwamen langs/)).not.toBeNull();
  });

  it("laat P2 dezelfde dag lezen in plaats van een tweede meting", () => {
    renderScreen("voeding", voedingData());

    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    fireEvent.click(within(ladder).getByRole("button", { name: /Voedingskwaliteit/ }));

    expect(screen.queryByRole("region", { name: "Voedingskwaliteit" })).not.toBeNull();
    // Zonder ingevulde dag doet de laag geen uitspraak.
    expect(screen.queryByText(/Zet er eerst iets in/)).not.toBeNull();
    // Het dagboek blijft staan: invullen mag niet achter een andere laag
    // verdwijnen.
    expect(screen.queryByRole("region", { name: "Voedingsdagboek" })).not.toBeNull();
  });

  it("opent P1 ook wanneer de check een andere winst-laag aanwijst", () => {
    renderScreen(
      "voeding",
      data({
        sleepCheckinSnapshot: null,
        domainCheckDaysAgo: { voeding: 3 },
        nutritionCheckinReadout: nutritionReadout({
          focusLayer: 3,
          layerStates: { 1: "ok", 2: "ok", 3: "winst", 4: "wacht", 5: "wacht", 6: "wacht" },
        }),
      }),
    );

    const ladder = screen.getByRole("group", { name: "Je prioriteiten" });
    expect(
      within(ladder).getByRole("button", { name: /Voedingsbasis/ }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.queryByRole("button", { name: /Terug naar jouw prioriteit 3/ }),
    ).not.toBeNull();
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

  it("toont het dagboek ook zonder voedingscheck", () => {
    renderScreen("voeding", data({ sleepCheckinSnapshot: null, domainCheckDaysAgo: {} }));
    expect(screen.queryByRole("region", { name: "Voedingsdagboek" })).not.toBeNull();
  });
});
