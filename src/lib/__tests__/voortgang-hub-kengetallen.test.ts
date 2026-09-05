import { describe, expect, it } from "vitest";
import { resolveHubKengetalRows } from "@/lib/voortgang-hub-kengetallen";
import type { DashboardData } from "@/types/dashboard";

function data(overrides: Partial<DashboardData>): DashboardData {
  return {
    empty: false,
    sleepCheckinSnapshot: null,
    movementCheckinSnapshot: null,
    stressCheckinSnapshot: null,
    ...overrides,
  } as DashboardData;
}

describe("resolveHubKengetalRows", () => {
  it("geeft null zonder snapshot of zonder factRows", () => {
    expect(resolveHubKengetalRows("slaap", data({}))).toBeNull();
    expect(resolveHubKengetalRows("stress", data({}))).toBeNull();
    expect(resolveHubKengetalRows("beweging", data({}))).toBeNull();
    expect(resolveHubKengetalRows("voeding", data({}))).toBeNull();
  });

  it("levert max drie rijen voor slaap, stress en beweging", () => {
    const sleep = resolveHubKengetalRows(
      "slaap",
      data({
        sleepCheckinSnapshot: {
          factRows: [
            { label: "A", answerLabel: "1", benchmarkLabel: null },
            { label: "B", answerLabel: "2", benchmarkLabel: null },
            { label: "C", answerLabel: "3", benchmarkLabel: null },
            { label: "D", answerLabel: "4", benchmarkLabel: null },
          ],
        } as never,
      }),
    );
    expect(sleep).toHaveLength(3);

    const stress = resolveHubKengetalRows(
      "stress",
      data({
        stressCheckinSnapshot: {
          factRows: [
            { label: "Spanning", answerLabel: "Regelmatig", benchmarkLabel: null },
            { label: "Herstel", answerLabel: "Stapelt op", benchmarkLabel: null },
          ],
        } as never,
      }),
    );
    expect(stress?.[0]?.label).toBe("Spanning");

    const beweging = resolveHubKengetalRows(
      "beweging",
      data({
        movementCheckinSnapshot: {
          factRows: [{ label: "Kracht", answerLabel: "2×/week", benchmarkLabel: "2×" }],
        } as never,
      }),
    );
    expect(beweging?.[0]?.answerLabel).toBe("2×/week");
  });
});
