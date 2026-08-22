import { describe, expect, it } from "vitest";
import { resolveDomainLadderReadout } from "@/lib/domain-ladder-readout";
import type { DashboardData } from "@/types/dashboard";

function dataWithSleep(
  overrides: Partial<NonNullable<DashboardData["sleepCheckinSnapshot"]>> = {},
): DashboardData {
  return {
    sleepCheckinSnapshot: {
      date: "2026-08-18",
      headline: "Je slaapduur is je knelpunt.",
      focusLabel: "Slaapduur",
      focusDimension: null,
      answerLabel: "6 uur",
      focusStatement: "Je gunt jezelf structureel te weinig tijd in bed.",
      implicationLine: "",
      focusLayer: 1,
      layerStates: { 1: "winst", 2: "watch", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
      kompasStatus: "",
      primaryAction: null,
      delta: null,
      factRows: [
        {
          key: "duur",
          label: "Slaapduur",
          answerLabel: "6 uur",
          benchmarkLabel: "Populatierichtlijn: 7+ uur",
          status: "below",
          layer: 1,
          whyLine: "Onder de gangbare ondergrens voor volwassenen.",
        },
        {
          key: "SLP_CONS",
          label: "Regelmaat",
          answerLabel: "Wisselend",
          benchmarkLabel: null,
          status: "na",
          layer: 2,
          whyLine: "Een vaste opsta-tijd is een sterker anker dan een vaste bedtijd.",
        },
        {
          key: "winddown",
          label: "Avondafbouw",
          answerLabel: "Zelden",
          benchmarkLabel: null,
          status: "below",
          layer: 3,
          whyLine: "Zonder afbouwtijd loopt de dag door tot in je bed.",
        },
        {
          key: "morninglight",
          label: "Ochtendlicht",
          answerLabel: "Soms",
          benchmarkLabel: null,
          status: "near",
          layer: 3,
          whyLine: "Licht in het eerste uur zet je klok gelijk.",
        },
      ],
      ...overrides,
    },
  } as unknown as DashboardData;
}

describe("resolveDomainLadderReadout — slaap leest zijn eigen check", () => {
  it("levert staten, winst-laag en conclusiezin af", () => {
    const readout = resolveDomainLadderReadout("slaap", dataWithSleep());
    expect(readout).not.toBeNull();
    expect(readout?.focusLayer).toBe(1);
    expect(readout?.headline).toBe("Je slaapduur is je knelpunt.");
    expect(readout?.layerStates[1]).toBe("winst");
    expect(readout?.stateLabels.winst).toBe("Grootste winst");
  });

  it("groepeert de feitenrijen onder de laag die ze onderbouwen", () => {
    const readout = resolveDomainLadderReadout("slaap", dataWithSleep());
    expect(readout?.evidenceByLayer[1]?.map((row) => row.key)).toEqual(["duur"]);
    expect(readout?.evidenceByLayer[3]?.map((row) => row.key)).toEqual([
      "winddown",
      "morninglight",
    ]);
    // Laag 4 heeft geen check-veld — dan ook geen bewijs.
    expect(readout?.evidenceByLayer[4]).toBeUndefined();
  });

  it("laat een rij zonder richtlijn ('na') zonder status-badge", () => {
    const readout = resolveDomainLadderReadout("slaap", dataWithSleep());
    expect(readout?.evidenceByLayer[1]?.[0]?.status).toBe("below");
    expect(readout?.evidenceByLayer[2]?.[0]?.status).toBeUndefined();
  });

  it("beveelt één laag aan — niet de laag erna, die zegt zelf te wachten", () => {
    const readout = resolveDomainLadderReadout("slaap", dataWithSleep());
    expect(readout?.recommendedLayerIds).toEqual([1]);
  });

  it("geeft de wacht-regel per laag door", () => {
    const readout = resolveDomainLadderReadout("slaap", dataWithSleep());
    expect(readout?.whyWait(1)).toBeNull();
    expect(readout?.whyWait(6)).toBe("Eerst gelegenheid, dan een potje.");
  });
});

describe("resolveDomainLadderReadout — zonder check, en zonder ladder-domein", () => {
  it("geeft null als er geen slaapcheck is", () => {
    expect(resolveDomainLadderReadout("slaap", {} as DashboardData)).toBeNull();
  });

  it("geeft null voor domeinen zonder staten per laag", () => {
    expect(resolveDomainLadderReadout("stress", dataWithSleep())).toBeNull();
    expect(resolveDomainLadderReadout("voeding", dataWithSleep())).toBeNull();
    expect(resolveDomainLadderReadout("verbinding", dataWithSleep())).toBeNull();
  });
});

function dataWithMovement(): DashboardData {
  return {
    movementCheckinSnapshot: {
      headline: "Op basis van jouw antwoorden ligt jouw grootste beweegwinst bij zitten.",
      focusLabel: "Zitten",
      focusDimension: "zitten",
      ladder: {
        focus: 1,
        states: { 1: "winst", 2: "ok", 3: "watch", 4: "wacht", 5: "wacht", 6: "wacht" },
        coverage: { measured: [1, 2, 3], onOrder: [2], percentage: 33 },
      },
      factRows: [
        {
          key: "zitten",
          label: "Zitten",
          answerLabel: "8-10 uur per dag",
          benchmarkLabel: null,
          benchmarkSource: null,
          status: "own",
          whyLine: "Lang zitten weegt mee los van wat je verder traint.",
          footnote: null,
        },
        {
          key: "mobiliteit",
          label: "Mobiliteit",
          answerLabel: "Redelijk soepel",
          benchmarkLabel: null,
          benchmarkSource: null,
          status: "own",
          whyLine: "Soepel blijven woont op prioriteit 1.",
          footnote: null,
        },
        {
          key: "kracht",
          label: "Kracht",
          answerLabel: "2x per week",
          benchmarkLabel: "WHO 2020: 2× per week spierversterkend",
          benchmarkSource: "WHO 2020",
          status: "meets",
          whyLine: "De richtlijn is gehaald.",
          footnote: null,
        },
        {
          key: "aeroob",
          label: "Conditie",
          answerLabel: "150-299 minuten matig",
          benchmarkLabel: "150 minuten matig per week",
          benchmarkSource: "WHO 2020",
          status: "meets",
          whyLine: "De aerobe norm is gehaald.",
          footnote: null,
        },
        {
          key: "consistentie",
          label: "Consistentie",
          answerLabel: "3 van de 4 weken",
          benchmarkLabel: null,
          benchmarkSource: null,
          status: "own",
          whyLine: "Herhaling voorspelt resultaat.",
          footnote: null,
        },
      ],
    },
  } as unknown as DashboardData;
}

describe("resolveDomainLadderReadout — beweging groepeert feiten per laag", () => {
  it("legt zitten en mobiliteit onder prioriteit 1", () => {
    const readout = resolveDomainLadderReadout("beweging", dataWithMovement());
    expect(readout?.focusLayer).toBe(1);
    expect(readout?.evidenceByLayer[1]?.map((row) => row.key)).toEqual(["zitten", "mobiliteit"]);
    expect(readout?.evidenceByLayer[1]?.[0]?.answerLabel).toBe("8-10 uur per dag");
    expect(readout?.evidenceByLayer[2]?.map((row) => row.key)).toEqual(["kracht", "aeroob"]);
    expect(readout?.evidenceByLayer[3]?.map((row) => row.key)).toEqual(["consistentie"]);
    expect(readout?.evidenceByLayer[6]).toBeUndefined();
  });
});
