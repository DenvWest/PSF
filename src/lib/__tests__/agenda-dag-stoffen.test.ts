import { describe, expect, it } from "vitest";
import { dagStof } from "@/lib/agenda-dag-stoffen";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { STANDAARD_NORMEN } from "@/lib/nutrition-normen";

const dag = (items: DagboekDag["items"]): DagboekDag => ({
  date: "2026-10-08",
  soort: "doordeweeks",
  porties: {},
  items,
});

describe("dagStof", () => {
  it("is leeg zonder items, nooit 'niet gehaald'", () => {
    expect(dagStof(null, "magnesium", STANDAARD_NORMEN)).toMatchObject({
      stand: "leeg",
      hoeveelheid: null,
      aandeel: null,
    });
  });

  it("geeft open met een aandeel onder de norm en gehaald vanaf 100%", () => {
    const weinig = dagStof(dag([{ moment: "lunch", key: "havermout", grams: 30 }]), "magnesium", STANDAARD_NORMEN);
    expect(weinig.stand).toBe("open");
    expect(weinig.aandeel).not.toBeNull();
    expect(weinig.aandeel as number).toBeLessThan(1);

    const veel = dagStof(
      dag([{ moment: "lunch", key: "havermout", grams: 2000 }]),
      "magnesium",
      STANDAARD_NORMEN,
    );
    expect(veel.aandeel as number).toBeGreaterThanOrEqual(1);
    expect(veel.stand).toBe("gehaald");
  });

  it("geeft eiwit nooit gehaald op dagniveau (geen vaste norm)", () => {
    const eiwit = dagStof(dag([{ moment: "lunch", key: "havermout", grams: 500 }]), "protein", STANDAARD_NORMEN);
    expect(eiwit.aandeel).toBeNull();
    expect(eiwit.stand).toBe("open");
  });
});
