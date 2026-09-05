// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import LeefstijlprofielDomeinScherm from "@/components/dashboard/voortgang/LeefstijlprofielDomeinScherm";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: [],
    hydrated: true,
    isSaved: () => false,
    save: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock("@/lib/account-events-client", () => ({
  emitAccountClientEvent: vi.fn(),
}));

function buildData(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    empty: false,
    current: null,
    prev: null,
    history: [],
    retest: false,
    nutritionIntake: null,
    nutritionLastLoggedAt: null,
    nutritionRelogDue: false,
    daysSinceNutritionLog: null,
    movementRecoveryTrend: [],
    movementRcvFeel: null,
    movementRcvFeelAt: null,
    remeasure: { dueDate: "12 sep 2026", dueDateIso: "2026-09-12", daysUntil: 18 },
    cycleEvidence: null,
    deltaReport: null,
    profileLabel: null,
    firstName: null,
    answers: null,
    sessionId: null,
    planProgress: null,
    movementPlanProgress: null,
    planDomain: null,
    priorityPref: null,
    sleepCheckinFocus: null,
    sleepCheckinSnapshot: null,
    movementCheckinSnapshot: null,
    hasStressCheckin: false,
    stressCheckinReport: null,
    domainCheckDaysAgo: {},
    domainMeasurements: {},
    movementPrefs: {},
    supplementVerdicts: [],
    proteinTarget: null,
    ...overrides,
  } as DashboardData;
}

const model = {} as DashboardModel;

/**
 * Kies een prioriteit in de keuzekolom.
 *
 * De kolom staat twee keer in de boom — als chiprij op mobiel en als kolom op
 * desktop — omdat de layout bepaalt welke zichtbaar is, niet JavaScript. In
 * jsdom zijn ze allebei aanwezig; klikken op de eerste is genoeg, want beide
 * roepen dezelfde `onKies` aan.
 */
function kiesPrioriteit(naam: RegExp) {
  const knoppen = screen.getAllByRole("button", { name: naam });
  fireEvent.click(knoppen[0]!);
}

describe("LeefstijlprofielDomeinScherm", () => {
  it("draagt geen stand-gauge en geen feiten-dump — de ladder is het scherm", () => {
    render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData({ domainCheckDaysAgo: { beweging: 4 } })}
        domain="beweging"
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /Wat er onder je beweging staat/ })).toBeTruthy();
    expect(screen.getByText(/Zoals je beweegcheck van 4 dagen geleden/)).toBeTruthy();
    expect(screen.queryByText("Je stand")).toBeNull();
    expect(screen.queryByText("Wat jij koos")).toBeNull();
    expect(screen.queryByText("Supplementen en wearables")).toBeNull();
    expect(screen.queryByText("Zelfde blok als op je check-in resultaat")).toBeNull();
    expect(screen.getAllByRole("button", { name: /Dagelijks bewegen/ }).length).toBeGreaterThan(0);
    expect(screen.queryByText("Jouw route")).toBeNull();
  });

  it("toont adviesExtra alleen wanneer die wordt doorgegeven", () => {
    const { rerender } = render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData()}
        domain="voeding"
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );
    expect(screen.queryByText("Wat je binnenkrijgt")).toBeNull();

    rerender(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData()}
        domain="voeding"
        adviesExtra={<p>Wat je binnenkrijgt</p>}
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );
    expect(screen.getByText("Wat je binnenkrijgt")).toBeTruthy();
  });

  it("toont op voeding geen oordeel per laag", () => {
    render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData({ domainCheckDaysAgo: { voeding: 2 } })}
        domain="voeding"
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /Wat er onder je voeding staat/ })).toBeTruthy();
    expect(screen.getByText(/Wat hier staat is je keuze en de datum/)).toBeTruthy();
    expect(screen.queryByText("Grootste winst")).toBeNull();
    kiesPrioriteit(/Voedingsstatus/);
    expect(screen.queryByText("Jij mat")).toBeNull();
  });

  /**
   * De wearable-belofte ("een wearable-reeks komt hier later bij") stond hier
   * tot 3 sep in laag 6. Hij is weg: op de laag waar je kiest tussen eten en
   * aanvullen zei een aankondiging over toekomstige hardware niets over die
   * keuze. Wat blijft is dat laag 6 de supplement-poort draagt en niets
   * daarbuiten.
   */
  it("houdt laag 6 bij de supplement-poort, zonder wearable-belofte", () => {
    render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData()}
        domain="beweging"
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );

    kiesPrioriteit(/Supplementen/);
    expect(screen.queryByText(/wearable-reeks komt hier later bij/)).toBeNull();
    expect(screen.getByRole("link", { name: /Kies dit op Kompas/ })).toBeTruthy();
  });

  it("zet het check-feit in de winst-laag en opent de micro-reeks", () => {
    render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData({
          domainCheckDaysAgo: { beweging: 5 },
          movementCheckinSnapshot: {
            headline: "Je winst zit op kracht.",
            focusDimension: "kracht",
            focusLabel: "Kracht",
            answerLabel: "1× per week",
            focusStatement: "Eén vast moment brengt dit binnen bereik.",
            implicationLine: "",
            delta: null,
            startStatement: null,
            stripVariant: "S1",
            date: "20 aug 2026",
            factRows: [
              {
                key: "kracht",
                label: "Kracht",
                answerLabel: "1× per week",
                benchmarkLabel: "Richtlijn: 2× per week krachttraining",
                benchmarkSource: "WHO 2020",
                status: "below",
                whyLine: "Richtlijn is 2× per week; jij zit daar nu onder.",
                footnote: null,
              },
            ],
            ladder: {
              states: { 1: "ok", 2: "winst", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
              focus: 2,
              coverage: { measured: [1, 2, 3], onOrder: [1], percentage: 33 },
            },
          },
          domainMeasurements: {
            beweging: [
              {
                id: "beweging-oud",
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
                id: "beweging-nieuw",
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
            ],
          },
        })}
        domain="beweging"
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );

    expect(screen.getByText("Je winst zit op kracht.")).toBeTruthy();
    expect(screen.getByText("Grootste winst")).toBeTruthy();
    expect(screen.getByText(/Kracht · 1× per week/)).toBeTruthy();
    expect(screen.getByText(/De lat/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Over tijd/ }));
    expect(
      screen.getByRole("img", { name: /Kracht over 2 meetmomenten, links je laatste meting/ }),
    ).toBeTruthy();
  });

  it("vouwt de kwaliteitsvragen in de statustabel, zonder eigen knop of blok", () => {
    render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData()}
        domain="voeding"
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );

    // Voedingskwaliteit is sinds het drieluik geen eigen knop meer, en sinds
    // de statustabel ook geen eigen blok: zijn rijen delen de kolommen met de
    // voedselgroepen. Een tweede blok zou dezelfde meting twee keer tonen.
    expect(screen.queryByRole("button", { name: /Voedingskwaliteit/ })).toBeNull();
    kiesPrioriteit(/Voedingsstatus/);
    expect(screen.queryByText("Dit komt uit je voedingscheck.")).toBeNull();
    // Zonder check opent de laag op wat er ontbreekt — niet op de ranglijst,
    // die voor iedereen gelijk is en dus geen antwoord op "hoe sta ik ervoor".
    expect(
      screen.getByText(/Doe de voedingscheck om per categorie te zien/),
    ).toBeTruthy();
    expect(screen.queryByText(/Kwaliteit — wat er op je groente en fruit zit/)).toBeNull();
  });

  it("toont op voeding drie knoppen, met de voedingsstatus vooraan", () => {
    render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData({ domainCheckDaysAgo: { voeding: 2 } })}
        domain="voeding"
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );

    const strip = screen.getByRole("group", { name: /Kies een prioriteit/ });
    const namen = within(strip)
      .getAllByRole("button")
      .map((knop) => knop.textContent?.replace(/winst$/, "").trim());
    expect(namen).toEqual([
      "Voedingsstatus",
      "Meten & timing",
      "Aanvullen & vergelijken",
    ]);
  });

  it("laat Verhoudingen als knop verdwijnen", () => {
    render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData({ domainCheckDaysAgo: { voeding: 2 } })}
        domain="voeding"
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /Verhoudingen/ })).toBeNull();
  });

  it("opent Meten & timing via urlLayer zonder voedingscheck", () => {
    render(
      <LeefstijlprofielDomeinScherm
        model={model}
        data={buildData()}
        domain="voeding"
        urlLayer={5}
        onBack={vi.fn()}
        onOpenSchap={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Meten & timing" })).toBeTruthy();
    // De keuzekolom markeert de actieve prioriteit met aria-pressed; de
    // deeplink moet die stand zetten zonder dat er geklikt is.
    const gekozen = screen
      .getAllByRole("button", { name: /Meten & timing/ })
      .filter((knop) => knop.getAttribute("aria-pressed") === "true");
    expect(gekozen.length).toBeGreaterThan(0);
  });
});
