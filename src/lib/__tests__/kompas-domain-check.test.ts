import { describe, expect, it } from "vitest";
import {
  buildDomainCheckHref,
  buildDomainCheckStates,
  buildRemeasureState,
  DOMAIN_CHECK_INTERVAL_DAYS,
} from "@/lib/kompas-domain-check";

function build(
  timings: Record<string, number> = {},
  priorityId = "slaap",
  remeasureDaysUntil: number | null = 22,
) {
  return buildDomainCheckStates({
    timings,
    priorityId: priorityId as never,
    remeasureDaysUntil,
  });
}

describe("buildDomainCheckStates", () => {
  it("geeft elk rail-domein een status", () => {
    const states = build();
    // Verbinding hoort niet meer in de rail; zie `zichtbare-domeinen.ts`.
    expect([...states.keys()]).toEqual([
      "slaap",
      "beweging",
      "voeding",
      "stress",
    ]);
  });

  it("markeert een nooit gedane check als direct te doen", () => {
    const state = build().get("beweging")!;
    expect(state.status).toBe("never");
    expect(state.actionable).toBe(true);
    expect(state.ctaLabel).toBe("Doe de beweegcheck");
    expect(state.href).toBe("/intake/beweging?from=dashboard&kompas=beweging");
    expect(state.progress).toBe(1);
  });

  it("telt af zolang het interval loopt", () => {
    const state = build({ stress: 5 }).get("stress")!;
    expect(state.status).toBe("counting");
    expect(state.actionable).toBe(false);
    expect(state.daysUntil).toBe(DOMAIN_CHECK_INTERVAL_DAYS - 5);
    expect(state.label).toBe("Nieuwe stresscheck over 9 dagen");
    expect(state.progress).toBeCloseTo(5 / DOMAIN_CHECK_INTERVAL_DAYS);
  });

  it("zegt morgen bij nog één dag", () => {
    const state = build({ voeding: DOMAIN_CHECK_INTERVAL_DAYS - 1 }).get("voeding")!;
    expect(state.label).toBe("Nieuwe voedingscheck morgen");
  });

  it("toont een verse check als net gedaan", () => {
    const state = build({ slaap: 0 }).get("slaap")!;
    expect(state.status).toBe("fresh");
    expect(state.actionable).toBe(false);
    expect(state.label).toBe("Vandaag gemeten · volgende over 14 dagen");
    expect(state.progress).toBe(0);
  });

  it("opent de check weer na het interval", () => {
    const state = build({ slaap: DOMAIN_CHECK_INTERVAL_DAYS + 7 }).get("slaap")!;
    expect(state.status).toBe("due");
    expect(state.actionable).toBe(true);
    expect(state.label).toBe("Laatst gemeten: 21 dagen geleden");
    expect(state.daysUntil).toBe(0);
  });

  /**
   * De hermeting-staat werd hier via verbinding getest: het enige rail-domein
   * zonder eigen check. Verbinding is uit de rail (zie
   * `zichtbare-domeinen.ts`), en de vier die overblijven hebben allemaal een
   * eigen check — de tak is dus niet meer via `buildDomainCheckStates` te
   * bereiken. Hij blijft wél bestaan voor het volgende domein zonder check,
   * dus hij wordt hier rechtstreeks getest in plaats van geschrapt.
   */
  it("laat een domein zonder eigen check meelopen met de hermeting", () => {
    const state = buildRemeasureState("verbinding", 8);
    expect(state.status).toBe("remeasure");
    expect(state.actionable).toBe(false);
    expect(state.href).toBeNull();
    expect(state.label).toBe("Meet mee in je hermeting — over 8 dagen");
    expect(state.progress).toBeCloseTo(22 / 30);
  });

  it("zegt nu als de hermeting verlopen is", () => {
    const state = buildRemeasureState("verbinding", -3);
    expect(state.label).toBe("Meet mee in je hermeting — nu");
    expect(state.daysUntil).toBe(0);
  });

  it("geeft elk rail-domein een eigen check — geen hermeting-staat meer in de rail", () => {
    for (const state of build().values()) {
      expect(state.status).not.toBe("remeasure");
    }
  });

  it("licht het prioriteitsdomein uit als die te doen is", () => {
    const states = build({ slaap: 20, stress: 30 }, "slaap");
    expect(states.get("slaap")!.highlighted).toBe(true);
    expect(states.get("stress")!.highlighted).toBe(false);
  });

  it("licht niets uit als de focuscheck nog aftelt, ook niet bij een groter meetgat elders", () => {
    const states = build({ slaap: 2, stress: 40 }, "slaap");
    expect([...states.values()].some((state) => state.highlighted)).toBe(false);
    expect(states.get("beweging")!.actionable).toBe(true);
    expect(states.get("stress")!.actionable).toBe(true);
  });

  it("licht nooit een ander domein uit dan de focus", () => {
    const states = build(
      { slaap: 2, beweging: 16, voeding: 40, stress: 20 },
      "slaap",
    );
    expect(
      [...states.values()].filter((state) => state.highlighted),
    ).toHaveLength(0);
  });

  it("licht niets uit als alles nog aftelt", () => {
    const states = build(
      { slaap: 1, beweging: 2, voeding: 3, stress: 4 },
      "slaap",
    );
    expect([...states.values()].some((state) => state.highlighted)).toBe(false);
  });
});

describe("buildDomainCheckHref", () => {
  it("bouwt een dashboard-herkomst in de link", () => {
    expect(buildDomainCheckHref("slaap")).toBe(
      "/intake/slaap?from=dashboard&kompas=slaap",
    );
  });
});
