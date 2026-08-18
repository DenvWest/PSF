import { describe, expect, it } from "vitest";
import { buildBewegingHelpBridge } from "@/lib/beweging-help-bridge";
import type { DashboardModel } from "@/types/dashboard";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";

function model(overrides: Partial<DashboardModel> = {}): DashboardModel {
  return {
    activeHabit: null,
    movementPrefs: { startPattern: "kracht", anchor: null },
    ...overrides,
  } as unknown as DashboardModel;
}

function slot(overrides: Partial<WeekDaySlot> = {}): WeekDaySlot {
  return {
    date: "2026-08-06",
    dayLabel: "Do",
    isToday: true,
    dayOffset: 0,
    domain: "beweging",
    stepId: "mov-thuis-basisoefening",
    title: "Eén krachtoefening thuis: kniebuiging, opdrukken of opstaan uit een stoel",
    detail: null,
    ...overrides,
  } as WeekDaySlot;
}

describe("buildBewegingHelpBridge — statusstrip", () => {
  it("staat Check altijd op done — de sheet is alleen bereikbaar via de dagstap-poort", () => {
    const bridge = buildBewegingHelpBridge(model(), slot(), false);
    expect(bridge.points.find((point) => point.id === "check")?.status).toBe("done");
  });

  it("zet Advies op wacht zonder complete voedingslog, op done ermee", () => {
    expect(
      buildBewegingHelpBridge(model(), slot(), false).points.find(
        (point) => point.id === "advies",
      )?.status,
    ).toBe("wacht");
    expect(
      buildBewegingHelpBridge(model(), slot(), true).points.find(
        (point) => point.id === "advies",
      )?.status,
    ).toBe("done");
  });

  it("labelt Favorieten expliciet op now", () => {
    const bridge = buildBewegingHelpBridge(model(), slot(), true);
    expect(bridge.points.find((point) => point.id === "favorieten")?.label).toBe("Favorieten");
    expect(bridge.points.find((point) => point.id === "favorieten")?.status).toBe("now");
    expect(bridge.points.find((point) => point.id === "beste")?.status).toBe("toekomstig");
  });
});

describe("buildBewegingHelpBridge — basis-strip", () => {
  it("leest de stap-titel via resolveActionKey, niet direct slot.title", () => {
    // activeHabit wint van slot.stepId (zelfde precedent als day-model.ts) —
    // dit bewijst dat de brug de override volgt, niet de statische weekpreview.
    const overridden = model({
      activeHabit: { stepId: "mov-trap-of-wandeling" } as never,
    });
    expect(buildBewegingHelpBridge(overridden, slot(), false).stepTitle).toBe(
      "Neem de trap of loop 20 min stevig",
    );
  });

  it("valt terug op null zonder slot", () => {
    expect(buildBewegingHelpBridge(model(), null, false).stepTitle).toBeNull();
  });

  it("leest het programmalabel uit movementPrefs", () => {
    expect(buildBewegingHelpBridge(model(), slot(), false).programLabel).toBe("Kracht");
  });
});
