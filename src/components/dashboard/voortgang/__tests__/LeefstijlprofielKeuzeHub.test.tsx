// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LeefstijlprofielKeuzeHub from "@/components/dashboard/voortgang/LeefstijlprofielKeuzeHub";
import type { DashboardData } from "@/types/dashboard";

vi.mock("@/lib/voortgang-favorites-context", () => ({
  useVoortgangFavorites: () => ({
    items: [],
    hydrated: true,
    isSaved: () => false,
    save: vi.fn(),
    remove: vi.fn(),
  }),
}));

function buildData(overrides: Partial<DashboardData>): DashboardData {
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
    remeasure: null,
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
    stressCheckinSnapshot: null,
    domainCheckDaysAgo: {},
    movementPrefs: {},
    supplementVerdicts: [],
    proteinTarget: null,
    ...overrides,
  } as DashboardData;
}

describe("LeefstijlprofielKeuzeHub", () => {
  // Verbinding is uit de interface (zie `zichtbare-domeinen.ts`), dus ook het
  // blok dat uitlegde waarom het geen eigen check had. De score blijft bestaan.
  /**
   * Alleen voeding is nog een eigen domeintegel (`zichtbare-domeinen.ts`).
   *
   * De woorden "slaap" en "beweging" mogen wél blijven staan: ze verschijnen in
   * de uitleg onder de readouts ("Energie volgt uit je slaap, voeding en
   * beweging"). Dat is een verklaring, geen deur — vandaar dat deze test op
   * knoppen kijkt en niet op tekst.
   */
  it("geeft alleen voeding een eigen domeintegel", () => {
    render(
      <LeefstijlprofielKeuzeHub data={buildData({})} onBack={vi.fn()} onOpenDomain={vi.fn()} />,
    );
    const tegels = screen
      .getAllByRole("button")
      .map((knop) => knop.textContent ?? "")
      .filter((tekst) => /Nog niet|Gemeten/.test(tekst));

    expect(tegels).toHaveLength(1);
    expect(tegels[0]).toContain("Voeding");
  });

  it("offers the check as the only action for an unmeasured domain", () => {
    render(
      <LeefstijlprofielKeuzeHub data={buildData({})} onBack={vi.fn()} onOpenDomain={vi.fn()} />,
    );
    expect(screen.getByText(/Nog niet apart gemeten/)).toBeTruthy();
  });

  /**
   * Tot 22 september rendeerde dit het slaap-kengetalblok uit de snapshot.
   * Slaap is nu uit de interface, dus de snapshot mag binnenkomen maar hoort
   * niets meer te tonen — zelfde grens als bij stress hieronder.
   */
  it("toont geen slaap-kengetallen meer, ook niet met een gevulde snapshot", () => {
    render(
      <LeefstijlprofielKeuzeHub
        data={buildData({
          domainCheckDaysAgo: { slaap: 6 },
          sleepCheckinSnapshot: {
            headline: "",
            focusLabel: null,
            focusDimension: null,
            answerLabel: null,
            focusStatement: "",
            implicationLine: "",
            focusLayer: 1,
            layerStates: {} as never,
            kompasStatus: "",
            primaryAction: null,
            delta: null,
            date: "2026-08-17",
            factRows: [
              {
                key: "duur",
                label: "Slaapduur",
                answerLabel: "6 tot 7 uur",
                benchmarkLabel: "Populatierichtlijn: 7+ uur",
                status: "near",
                layer: 1,
                whyLine: "",
              },
              {
                key: "SLP_CONS",
                label: "Regelmaat",
                answerLabel: "Meestal wel, soms niet",
                benchmarkLabel: null,
                status: "near",
                layer: 2,
                whyLine: "",
              },
            ],
          },
        })}
        onBack={vi.fn()}
        onOpenDomain={vi.fn()}
      />,
    );

    expect(screen.queryByText("Slaapduur")).toBeNull();
    expect(screen.queryByText("6 tot 7 uur")).toBeNull();
    expect(screen.queryByText("Gemeten 6 dagen geleden")).toBeNull();
  });

  it("falls back to a plain checked row for a measured domain without its own blok yet", () => {
    render(
      <LeefstijlprofielKeuzeHub
        data={buildData({ domainCheckDaysAgo: { voeding: 0 } })}
        onBack={vi.fn()}
        onOpenDomain={vi.fn()}
      />,
    );
    expect(screen.getByText("Gemeten vandaag")).toBeTruthy();
  });

  it("houdt Voeding klikbaar, ook zonder check", () => {
    const onOpenDomain = vi.fn();
    render(
      <LeefstijlprofielKeuzeHub
        data={buildData({})}
        onBack={vi.fn()}
        onOpenDomain={onOpenDomain}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Voeding\s+Nog niet/ }));
    expect(onOpenDomain).toHaveBeenCalledWith("voeding");
  });

  /**
   * Tot 22 september rendeerde dit de stress-kengetallen uit de T1d-snapshot.
   * Stress is nu uit de interface (`zichtbare-domeinen.ts`), dus de snapshot
   * mag binnenkomen maar hoort niets meer te tonen. Het mechanisme zelf — een
   * snapshot die zijn factRows rendert — blijft gedekt door de beweging-test
   * hieronder.
   */
  it("toont geen stress-kengetallen meer, ook niet met een gevulde snapshot", () => {
    render(
      <LeefstijlprofielKeuzeHub
        data={buildData({
          domainCheckDaysAgo: { stress: 2 },
          stressCheckinSnapshot: {
            date: "2026-09-03",
            headline: "",
            focusLabel: "Overgang",
            answerLabel: null,
            focusStatement: "",
            implicationLine: "",
            focusLayer: 1,
            layerStates: {} as never,
            kompasStatus: "",
            primaryAction: null,
            delta: null,
            factRows: [
              {
                key: "STR_FREQ",
                label: "Spanning",
                answerLabel: "Regelmatig",
                benchmarkLabel: null,
                status: "below",
                layer: 1,
                scoresWeight: true,
                whyLine: "",
              },
            ],
          },
        })}
        onBack={vi.fn()}
        onOpenDomain={vi.fn()}
      />,
    );
    expect(screen.queryByText("Spanning")).toBeNull();
    expect(screen.queryByText("Regelmatig")).toBeNull();
  });

  /** Zelfde grens als bij slaap en stress: beweging is uit de interface. */
  it("toont geen beweging-kengetallen meer, ook niet met een gevulde snapshot", () => {
    render(
      <LeefstijlprofielKeuzeHub
        data={buildData({
          domainCheckDaysAgo: { beweging: 1 },
          movementCheckinSnapshot: {
            date: "2026-09-04",
            factRows: [
              {
                key: "kracht",
                label: "Kracht",
                answerLabel: "1× per week",
                benchmarkLabel: "2× per week",
                status: "below",
                whyLine: "",
              },
            ],
          } as never,
        })}
        onBack={vi.fn()}
        onOpenDomain={vi.fn()}
      />,
    );
    expect(screen.queryByText("Kracht")).toBeNull();
    expect(screen.queryByText("1× per week")).toBeNull();
  });

  it("groups energie and herstel under 'Volgt uit de rest' — alleen voeding is een deur", () => {
    const onOpenDomain = vi.fn();
    render(
      <LeefstijlprofielKeuzeHub data={buildData({})} onBack={vi.fn()} onOpenDomain={onOpenDomain} />,
    );
    expect(screen.getByText("Volgt uit de rest")).toBeTruthy();
    expect(screen.getByText("Energie volgt uit je slaap, voeding en beweging.")).toBeTruthy();
    expect(screen.getByText("Herstel volgt uit je slaap, beweging en stress.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Slaap" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Beweging" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Stress" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Voeding" }));
    expect(onOpenDomain).toHaveBeenCalledWith("voeding");
  });

  it("opent voeding vanaf de kengetaltegel", () => {
    const onOpenDomain = vi.fn();
    render(
      <LeefstijlprofielKeuzeHub
        data={buildData({
          domainCheckDaysAgo: { slaap: 6, voeding: 0 },
          sleepCheckinSnapshot: {
            headline: "",
            focusLabel: null,
            focusDimension: null,
            answerLabel: null,
            focusStatement: "",
            implicationLine: "",
            focusLayer: 1,
            layerStates: {} as never,
            kompasStatus: "",
            primaryAction: null,
            delta: null,
            date: "2026-08-17",
            factRows: [
              {
                key: "duur",
                label: "Slaapduur",
                answerLabel: "6 tot 7 uur",
                benchmarkLabel: null,
                status: "near",
                layer: 1,
                whyLine: "",
              },
            ],
          },
        })}
        onBack={vi.fn()}
        onOpenDomain={onOpenDomain}
      />,
    );
    // De slaap-kengetallen renderen niet meer, dus er valt niets op te klikken
    // dat het verkeerde domein zou openen.
    expect(screen.queryByText("Slaapduur")).toBeNull();
    expect(onOpenDomain).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: /Voeding/ })[0]);
    expect(onOpenDomain).toHaveBeenCalledWith("voeding");
  });
});
