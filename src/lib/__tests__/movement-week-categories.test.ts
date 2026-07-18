import { describe, expect, it } from "vitest";
import {
  filterStepsForCategory,
  getCategoryStatus,
  isMovementWeekPhase,
  MOVEMENT_WEEK_PHASE_ID,
} from "@/lib/movement-week-categories";
import type { PlanStep } from "@/types/lifestyle-plan";

const MOCK_STEPS: PlanStep[] = [
  {
    id: "mov-kracht",
    title: "Kracht",
    tags: ["kracht"],
  },
  {
    id: "mov-rust",
    title: "Rust",
    tags: ["herstel"],
  },
  {
    id: "mov-conditie",
    title: "Conditie",
    tags: ["conditie"],
  },
];

describe("movement-week-categories", () => {
  it("detects movement week phase", () => {
    expect(isMovementWeekPhase(MOVEMENT_WEEK_PHASE_ID, "movement")).toBe(true);
    expect(isMovementWeekPhase("mov-phase-week-2-4", "movement")).toBe(false);
    expect(isMovementWeekPhase(MOVEMENT_WEEK_PHASE_ID, "sleep")).toBe(false);
  });

  it("filters kracht including herstel", () => {
    const steps = filterStepsForCategory(MOCK_STEPS, "kracht");
    expect(steps.map((s) => s.id)).toEqual(["mov-kracht", "mov-rust"]);
  });

  it("filters conditie only", () => {
    const steps = filterStepsForCategory(MOCK_STEPS, "conditie");
    expect(steps.map((s) => s.id)).toEqual(["mov-conditie"]);
  });

  it("returns empty for dagelijks ritme", () => {
    expect(filterStepsForCategory(MOCK_STEPS, "dagelijks_ritme")).toEqual([]);
  });

  it("reports category completion status", () => {
    const getState = (id: string) => (id === "mov-kracht" ? "done" : "todo");
    expect(getCategoryStatus(MOCK_STEPS, "kracht", getState)).toBe("partial");
    expect(getCategoryStatus(MOCK_STEPS, "conditie", getState)).toBe("todo");
    expect(getCategoryStatus(MOCK_STEPS, "dagelijks_ritme", getState)).toBe("na");
  });
});
