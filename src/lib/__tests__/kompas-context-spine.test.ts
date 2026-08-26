import { describe, expect, it } from "vitest";
import {
  buildContextSpine,
  resolveContextSpineDomain,
} from "@/lib/kompas-context-spine";
import { STRESS_LIFESTYLE_FIRST_REASON } from "@/data/domain-product-stance";
import type { DashboardData, DashboardModel } from "@/types/dashboard";

const SNAPSHOT = {
  date: "2026-08-21",
  headline: "Je kracht is het deel dat nu achterblijft.",
  focusDimension: "kracht",
  focusLabel: "Kracht",
  answerLabel: "1× per week",
  focusStatement: "",
  implicationLine: "",
  ladder: {
    focus: 2,
    states: { 1: "ok", 2: "winst", 3: "wacht", 4: "wacht", 5: "wacht", 6: "wacht" },
    coverage: { onOrder: 1, measured: 3 },
  },
  factRows: [
    {
      key: "kracht",
      label: "Kracht",
      answerLabel: "1× per week",
      benchmarkLabel: "Richtlijn: 2× per week",
      benchmarkSource: "WHO 2020",
      status: "below",
      whyLine: "Richtlijn is 2× per week; jij zit daar nu onder.",
      footnote: null,
    },
  ],
};

function data(overrides: Record<string, unknown> = {}): DashboardData {
  return {
    movementCheckinSnapshot: SNAPSHOT,
    cycleEvidence: {
      activeDays: 8,
      cycleDay: 12,
      cycleDayRaw: 12,
      daysUntilRemeasure: 18,
      cycleStartDate: "2026-08-01",
      cycleEndDate: "2026-08-31",
    },
    remeasure: { dueDate: "31 aug 2026", dueDateIso: "2026-08-31", daysUntil: 18 },
    ...overrides,
  } as unknown as DashboardData;
}

function model(habit: { title: string } | null): DashboardModel {
  return { activeHabit: habit } as unknown as DashboardModel;
}

describe("resolveContextSpineDomain", () => {
  it("laat een open ladderlaag winnen van het open domein en de prioriteit", () => {
    expect(
      resolveContextSpineDomain({
        ladderFocusDomain: "slaap",
        viewedDomain: "beweging",
        priorityDomain: "stress",
      }),
    ).toBe("slaap");
  });

  it("valt terug op het open domein en daarna op de prioriteit uit de check", () => {
    expect(
      resolveContextSpineDomain({
        ladderFocusDomain: null,
        viewedDomain: "beweging",
        priorityDomain: "stress",
      }),
    ).toBe("beweging");
    expect(
      resolveContextSpineDomain({
        ladderFocusDomain: null,
        viewedDomain: null,
        priorityDomain: "stress",
      }),
    ).toBe("stress");
  });
});

describe("buildContextSpine — urgentie", () => {
  it("leest zonder open laag de winst-laag uit de check, met de feitzin eronder", () => {
    const spine = buildContextSpine({
      domain: "beweging",
      openLayerId: null,
      data: data(),
      model: model(null),
      todayActionDone: false,
    });
    if (spine.urgency?.kind !== "laag") {
      throw new Error("verwacht een winst-laag");
    }
    expect(spine.urgency.layerId).toBe(2);
    expect(spine.urgency.isFocusLayer).toBe(true);
    expect(spine.urgency.stateLabel).toBe("Grootste winst");
    expect(spine.urgency.reason).toEqual({
      kind: "bewijs",
      label: "Kracht",
      answerLabel: "1× per week",
      benchmarkLabel: "Richtlijn: 2× per week",
      whyLine: "Richtlijn is 2× per week; jij zit daar nu onder.",
    });
  });

  it("volgt de laag die het scherm ernaast open heeft staan", () => {
    const spine = buildContextSpine({
      domain: "beweging",
      openLayerId: 4,
      data: data(),
      model: model(null),
      todayActionDone: false,
    });
    if (spine.urgency?.kind !== "laag") {
      throw new Error("verwacht een winst-laag");
    }
    expect(spine.urgency.layerId).toBe(4);
    expect(spine.urgency.isFocusLayer).toBe(false);
  });

  it("wijst zonder check geen laag aan, maar noemt de check die het oplost", () => {
    const spine = buildContextSpine({
      domain: "beweging",
      openLayerId: null,
      data: data({ movementCheckinSnapshot: null }),
      model: model(null),
      todayActionDone: false,
    });
    if (spine.urgency?.kind !== "geen_winstlaag") {
      throw new Error("verwacht geen_winstlaag");
    }
    // Geen laag 1 als schijnprecisie — wel de weg vooruit.
    expect(spine.urgency.line).toContain("beweegcheck");
    expect(spine.urgency.cta?.href).toBe("/intake/beweging?from=dashboard&kompas=beweging");
  });

  it("draagt geen urgentie voor een domein zonder ladder", () => {
    const spine = buildContextSpine({
      domain: "energie",
      openLayerId: null,
      data: data(),
      model: model(null),
      todayActionDone: false,
    });
    expect(spine.urgency).toBeNull();
  });
});

describe("buildContextSpine — per domein een eigen balk", () => {
  const spineFor = (domain: Parameters<typeof buildContextSpine>[0]["domain"]) =>
    buildContextSpine({
      domain,
      openLayerId: null,
      data: data(),
      model: model(null),
      todayActionDone: false,
    });

  it("geeft slaap, beweging en voeding een eigen schap", () => {
    for (const domain of ["slaap", "beweging", "voeding"] as const) {
      const { schap } = spineFor(domain);
      expect(schap.kind).toBe("open");
      if (schap.kind !== "open") continue;
      expect(schap.href).toContain(`fav=${domain}`);
      expect(schap.href).toContain("schap=producten");
      expect(schap.line.length).toBeGreaterThan(0);
    }
  });

  it("geeft stress geen schap maar wél de reden uit domain-product-stance", () => {
    const { schap } = spineFor("stress");
    expect(schap.kind).toBe("gate");
    if (schap.kind !== "gate") return;
    expect(schap.reason).toBe(STRESS_LIFESTYLE_FIRST_REASON);
  });

  it("geeft verbinding geen schap en geen eigen check", () => {
    const spine = spineFor("verbinding");
    expect(spine.schap.kind).toBe("gate");
    expect(spine.bar.checkCta).toBeNull();
    if (spine.urgency?.kind !== "geen_winstlaag") {
      throw new Error("verwacht geen_winstlaag");
    }
    expect(spine.urgency.cta).toBeNull();
    expect(spine.urgency.line).toContain("hermeting");
  });

  it("noemt bij voeding de ladder zonder oordeel in plaats van een winst-laag", () => {
    const spine = spineFor("voeding");
    if (spine.urgency?.kind !== "geen_winstlaag") {
      throw new Error("verwacht geen_winstlaag");
    }
    expect(spine.urgency.line).toContain("zonder oordeel");
    expect(spine.urgency.cta?.href).toBe("/intake/voeding?from=dashboard&kompas=voeding");
  });

  it("laat elk domein een eigen schap-label dragen", () => {
    const labels = (["slaap", "beweging", "voeding", "stress", "verbinding"] as const).map(
      (domain) => spineFor(domain).schap.label,
    );
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("buildContextSpine — ritme", () => {
  it("meldt de open dagstap zonder oordeel en zonder streak", () => {
    const spine = buildContextSpine({
      domain: "beweging",
      openLayerId: null,
      data: data(),
      model: model({ title: "Tien minuten wandelen" }),
      todayActionDone: false,
    });
    expect(spine.ritme.tone).toBe("neutral");
    expect(spine.ritme.line).toBe("Vandaag staat nog open: tien minuten wandelen.");
    expect(spine.ritme.cycleLine).toBe("Dag 12 van 30 — 8 dagen actief.");
    expect(spine.ritme.domainLine).toBeNull();
    expect(spine.ritmeFirst).toBe(false);
  });

  it("waarschuwt op voeding als de innamelog achterloopt", () => {
    const spine = buildContextSpine({
      domain: "voeding",
      openLayerId: null,
      data: data({ nutritionRelogDue: true, daysSinceNutritionLog: 21 }),
      model: model(null),
      todayActionDone: false,
    });
    expect(spine.ritme.tone).toBe("alert");
    expect(spine.ritme.domainLine).toContain("21 dagen oud");
    // Alleen een klaarstaande hermeting herordent de kolom.
    expect(spine.ritmeFirst).toBe(false);
  });

  it("flitst geen voedings-alert zolang het dashboard nog niet geladen is", () => {
    const spine = buildContextSpine({
      domain: "voeding",
      openLayerId: null,
      data: undefined,
      model: model(null),
      todayActionDone: false,
    });
    expect(spine.ritme.domainLine).toBeNull();
    expect(spine.ritme.tone).toBe("neutral");
  });

  it("meldt op voeding een ontbrekende innamelog zodra het dashboard er is", () => {
    const spine = buildContextSpine({
      domain: "voeding",
      openLayerId: null,
      data: data({ nutritionRelogDue: false, daysSinceNutritionLog: null }),
      model: model(null),
      todayActionDone: false,
    });
    expect(spine.ritme.domainLine).toContain("Nog geen voedingslog");
    expect(spine.ritme.tone).toBe("alert");
  });

  it("zegt op verbinding dat de check in de hermeting meeloopt", () => {
    const spine = buildContextSpine({
      domain: "verbinding",
      openLayerId: null,
      data: data(),
      model: model(null),
      todayActionDone: false,
    });
    expect(spine.ritme.tone).toBe("neutral");
    expect(spine.ritme.domainLine).toContain("meet mee in je hermeting");
  });

  it("meldt een afgevinkte dagstap als stand, niet als compliment", () => {
    const spine = buildContextSpine({
      domain: "beweging",
      openLayerId: null,
      data: data(),
      model: model({ title: "Tien minuten wandelen" }),
      todayActionDone: true,
    });
    expect(spine.ritme.line).toBe("Vandaag staat: tien minuten wandelen.");
  });

  it("zegt het zonder dagstap ook gewoon", () => {
    const spine = buildContextSpine({
      domain: "beweging",
      openLayerId: null,
      data: data(),
      model: model(null),
      todayActionDone: false,
    });
    expect(spine.ritme.line).toBe("Je koos vandaag nog geen stap.");
  });

  it("zet een klaarstaande hermeting bovenaan, vóór de ladder", () => {
    const spine = buildContextSpine({
      domain: "beweging",
      openLayerId: null,
      data: data({
        remeasure: { dueDate: "26 aug 2026", dueDateIso: "2026-08-26", daysUntil: 0 },
        cycleEvidence: {
          activeDays: 16,
          cycleDay: 30,
          cycleDayRaw: 30,
          daysUntilRemeasure: 0,
          cycleStartDate: "2026-07-27",
          cycleEndDate: "2026-08-26",
        },
      }),
      model: model({ title: "Tien minuten wandelen" }),
      todayActionDone: false,
    });
    expect(spine.ritme.tone).toBe("alert");
    expect(spine.ritme.remeasureDue).toBe(true);
    expect(spine.ritmeFirst).toBe(true);
    // Geen dag-teller die tegen de hermeting in praat.
    expect(spine.ritme.cycleLine).toBeNull();
  });
});
