import { describe, expect, it } from "vitest";
import {
  resolveDomainLadderReadout,
  resolveLadderLayerReason,
} from "@/lib/domain-ladder-readout";
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

describe("resolveLadderLayerReason — de vanwege, en alleen waar hij bestaat", () => {
  it("draagt op de winst-laag de feitenrij die hem verklaart", () => {
    const readout = resolveDomainLadderReadout("slaap", dataWithSleep());
    const reason = resolveLadderLayerReason(readout, 1);
    expect(reason).toEqual({
      kind: "bewijs",
      label: "Slaapduur",
      answerLabel: "6 uur",
      benchmarkLabel: "Populatierichtlijn: 7+ uur",
      whyLine: "Onder de gangbare ondergrens voor volwassenen.",
    });
  });

  it("kiest binnen een laag de rij die onder de richtlijn zit, niet de eerste", () => {
    const readout = resolveDomainLadderReadout(
      "slaap",
      dataWithSleep({
        focusLayer: 3,
        layerStates: { 1: "ok", 2: "ok", 3: "winst", 4: "wacht", 5: "wacht", 6: "wacht" },
        factRows: [
          {
            key: "morninglight",
            label: "Ochtendlicht",
            answerLabel: "Soms",
            benchmarkLabel: null,
            status: "near",
            layer: 3,
            whyLine: "Licht in het eerste uur zet je klok gelijk.",
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
        ],
      } as never),
    );
    const reason = resolveLadderLayerReason(readout, 3);
    expect(reason?.kind).toBe("bewijs");
    expect(reason).toMatchObject({ label: "Avondafbouw" });
  });

  it("geeft boven de winst-laag de wacht-regel", () => {
    const readout = resolveDomainLadderReadout("slaap", dataWithSleep());
    expect(resolveLadderLayerReason(readout, 6)).toEqual({
      kind: "wacht",
      line: "Eerst gelegenheid, dan een potje.",
    });
  });

  it("claimt niets onder de winst-laag", () => {
    const readout = resolveDomainLadderReadout(
      "slaap",
      dataWithSleep({
        focusLayer: 3,
        layerStates: { 1: "ok", 2: "ok", 3: "winst", 4: "wacht", 5: "wacht", 6: "wacht" },
      } as never),
    );
    expect(resolveLadderLayerReason(readout, 1)).toBeNull();
  });

  it("geeft null als de winst-laag geen bewijsrij heeft — geen verzonnen reden (J3)", () => {
    const readout = resolveDomainLadderReadout(
      "slaap",
      dataWithSleep({ focusLayer: 4 } as never),
    );
    expect(readout?.evidenceByLayer[4]).toBeUndefined();
    expect(resolveLadderLayerReason(readout, 4)).toBeNull();
  });

  it("geeft null zonder readout — voeding en verbinding hebben er geen", () => {
    expect(resolveLadderLayerReason(null, 1)).toBeNull();
  });
});
