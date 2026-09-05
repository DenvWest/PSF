import { describe, expect, it } from "vitest";
import {
  bouwDagboekSlots,
  dagGroepenTelling,
  dagSamenvatting,
} from "@/lib/nutrition-dagboek-slots";
import type { DagboekDag } from "@/lib/nutrition-dagboek";

function dag(date: string, porties: DagboekDag["porties"] = {}): DagboekDag {
  const weekdag = new Date(`${date}T12:00:00.000Z`).getUTCDay();
  return {
    date,
    soort: weekdag === 0 || weekdag === 6 ? "weekend" : "doordeweeks",
    porties,
  };
}

describe("nutrition-dagboek-slots", () => {
  it("levert altijd vier plekken, twee per soort", () => {
    const slots = bouwDagboekSlots([]);
    expect(slots).toHaveLength(4);
    expect(slots.filter((slot) => slot.soort === "doordeweeks")).toHaveLength(2);
    expect(slots.filter((slot) => slot.soort === "weekend")).toHaveLength(2);
    expect(slots.every((slot) => slot.dag === null)).toBe(true);
  });

  it("vult een plek met de dag van de juiste soort", () => {
    // 2026-09-02 is een woensdag, 2026-09-05 een zaterdag.
    const slots = bouwDagboekSlots([dag("2026-09-02"), dag("2026-09-05")]);
    const doordeweeks = slots.filter((slot) => slot.soort === "doordeweeks");
    const weekend = slots.filter((slot) => slot.soort === "weekend");
    expect(doordeweeks[0].dag?.date).toBe("2026-09-02");
    expect(doordeweeks[1].dag).toBeNull();
    expect(weekend[0].dag?.date).toBe("2026-09-05");
    expect(weekend[1].dag).toBeNull();
  });

  it("zet binnen een soort de nieuwste dag boven", () => {
    const slots = bouwDagboekSlots([dag("2026-09-01"), dag("2026-09-03")]);
    const doordeweeks = slots.filter((slot) => slot.soort === "doordeweeks");
    expect(doordeweeks[0].dag?.date).toBe("2026-09-03");
    expect(doordeweeks[1].dag?.date).toBe("2026-09-01");
  });

  /**
   * Extra dagen tellen wél mee in de analyse — daar is meer invoer altijd
   * beter — maar de tabel toont de vorm van het dagboek, en die is 2+2.
   */
  it("toont hoogstens twee dagen per soort", () => {
    const slots = bouwDagboekSlots([
      dag("2026-09-01"),
      dag("2026-09-02"),
      dag("2026-09-03"),
    ]);
    expect(slots.filter((slot) => slot.dag != null)).toHaveLength(2);
  });

  it("vat een dag samen met de zwaarste groepen eerst", () => {
    const samenvatting = dagSamenvatting(
      dag("2026-09-02", { groente: 3, fruit: 1, vis: 2 }),
      2,
    );
    expect(samenvatting).toBe("Groente · Vis +1");
  });

  it("noemt een lege dag niet gevuld", () => {
    expect(dagSamenvatting(dag("2026-09-02", {}))).toBe("Niets geregistreerd");
  });

  it("telt alleen groepen met porties", () => {
    expect(dagGroepenTelling(dag("2026-09-02", { groente: 2, fruit: 0 }))).toBe(1);
  });
});
