import { describe, expect, it } from "vitest";
import {
  adviceMayOutrankDayStep,
  resolveDayStepState,
  type DayStepFacts,
} from "@/lib/domain-ready-state";

function facts(overrides: Partial<DayStepFacts> = {}): DayStepFacts {
  return {
    plannedActionKey: "mov-wandeling-10min",
    completedActionKeys: [],
    isPriorityDomain: true,
    ...overrides,
  };
}

describe("resolveDayStepState", () => {
  it("noemt een geplande, niet-afgevinkte stap open", () => {
    expect(resolveDayStepState(facts())).toBe("open");
  });

  it("noemt een afgevinkte stap done", () => {
    const state = resolveDayStepState(
      facts({ completedActionKeys: ["mov-wandeling-10min"] }),
    );
    expect(state).toBe("done");
  });

  it("noemt een dag zonder geplande stap een rustdag voor het prioriteitsdomein", () => {
    expect(resolveDayStepState(facts({ plannedActionKey: null }))).toBe("rest_day");
  });

  it("noemt een dag zonder geplande stap buiten het prioriteitsdomein anders", () => {
    const state = resolveDayStepState(
      facts({ plannedActionKey: null, isPriorityDomain: false }),
    );
    expect(state).toBe("other_domain_priority");
  });

  it("telt een afvinking van een andere actie niet als deze stap", () => {
    const state = resolveDayStepState(
      facts({ completedActionKeys: ["slp-avondritme"] }),
    );
    expect(state).toBe("open");
  });
});

describe("adviceMayOutrankDayStep", () => {
  it("houdt de deur dicht zolang er een open stap staat", () => {
    expect(adviceMayOutrankDayStep(facts())).toBe(false);
  });

  it("houdt de deur ook dicht als het domein niet de prioriteit is maar de stap openstaat", () => {
    expect(adviceMayOutrankDayStep(facts({ isPriorityDomain: false }))).toBe(false);
  });

  it("geeft ruimte bij afgevinkt, rustdag en ander prioriteitsdomein", () => {
    expect(
      adviceMayOutrankDayStep(facts({ completedActionKeys: ["mov-wandeling-10min"] })),
    ).toBe(true);
    expect(adviceMayOutrankDayStep(facts({ plannedActionKey: null }))).toBe(true);
    expect(
      adviceMayOutrankDayStep(facts({ plannedActionKey: null, isPriorityDomain: false })),
    ).toBe(true);
  });
});
