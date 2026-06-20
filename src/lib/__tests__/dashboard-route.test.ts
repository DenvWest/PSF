import { describe, expect, it } from "vitest";
import {
  DASHBOARD_ROUTE_FAQ,
  DASHBOARD_ROUTE_STEPS,
} from "@/data/dashboard-route";

describe("dashboard-route", () => {
  it("defines exactly 6 route steps in order", () => {
    expect(DASHBOARD_ROUTE_STEPS).toHaveLength(6);
    expect(DASHBOARD_ROUTE_STEPS.map((step) => step.step)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("includes required fields on every step", () => {
    for (const step of DASHBOARD_ROUTE_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
      expect(step.timeLabel.length).toBeGreaterThan(0);
    }
  });

  it("includes 3 FAQ entries", () => {
    expect(DASHBOARD_ROUTE_FAQ).toHaveLength(3);
  });
});
