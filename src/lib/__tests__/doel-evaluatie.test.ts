import { describe, expect, it } from "vitest";
import type { DoelEvaluatie } from "@/lib/account-voedingsdoelen";
import { evaluatieDue } from "@/lib/doel-evaluatie";

const NU = new Date("2026-11-20T12:00:00Z");
const geleden = (dagen: number) => new Date(NU.getTime() - dagen * 86_400_000).toISOString();

function evaluatie(overrides: Partial<DoelEvaluatie> = {}): DoelEvaluatie {
  return {
    gekozenOp: geleden(35),
    startstand: { magnesium: { datum: geleden(30).slice(0, 10), aandeelPct: 40, dagen: 5 } },
    bevestigdOp: null,
    ...overrides,
  };
}

describe("evaluatieDue", () => {
  it("is aan de beurt 30 dagen na je keuze, met een startstand van minstens 14 dagen oud", () => {
    expect(evaluatieDue(evaluatie(), "magnesium", NU)).toBe(true);
  });

  it("wacht binnen 30 dagen na je keuze", () => {
    expect(evaluatieDue(evaluatie({ gekozenOp: geleden(20) }), "magnesium", NU)).toBe(false);
  });

  it("wacht zonder keuzedatum: een richting van vóór de migratie krijgt geen verzonnen datum", () => {
    expect(evaluatieDue(evaluatie({ gekozenOp: null }), "magnesium", NU)).toBe(false);
  });

  it("wacht zonder startstand voor deze stof", () => {
    expect(evaluatieDue(evaluatie(), "protein", NU)).toBe(false);
  });

  it("wacht als de startstand nog geen 14 dagen oud is", () => {
    const jong = evaluatie({ startstand: { magnesium: { datum: geleden(5).slice(0, 10), aandeelPct: 40, dagen: 5 } } });
    expect(evaluatieDue(jong, "magnesium", NU)).toBe(false);
  });

  it("start na Houden een nieuwe ronde van 30 dagen", () => {
    expect(evaluatieDue(evaluatie({ bevestigdOp: geleden(10) }), "magnesium", NU)).toBe(false);
    expect(evaluatieDue(evaluatie({ bevestigdOp: geleden(31) }), "magnesium", NU)).toBe(true);
  });
});
