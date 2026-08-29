import { describe, expect, it } from "vitest";
import { buildDomainBasis } from "@/lib/reveal-domain-basis";
import type { DeficiencySignals } from "@/lib/intake-engine";

const NO_SIGNALS: DeficiencySignals = {
  omega3_deficiency: false,
  magnesium_signal: false,
  cortisol_risk: false,
  creatine_signal: false,
  melatonine_signal: false,
  protein_gap_signal: false,
  low_recovery_no_load: false,
  sleep_issue_no_stress: false,
  energy_dip_unexplained: false,
};

describe("buildDomainBasis", () => {
  it("citeert een concreet signaal uit de antwoorden als dat er is", () => {
    const basis = buildDomainBasis("voeding", "Voeding", 55, {
      ...NO_SIGNALS,
      omega3_deficiency: true,
    });
    expect(basis.fromAnswer).toBe(true);
    expect(basis.lines).toEqual(["Je eet zelden vette vis"]);
  });

  it("toont maximaal twee signalen, nooit meer", () => {
    const basis = buildDomainBasis("voeding", "Voeding", 55, {
      ...NO_SIGNALS,
      omega3_deficiency: true,
      protein_gap_signal: true,
    });
    expect(basis.lines).toHaveLength(2);
  });

  it("valt terug op de gemeten status zonder signaal, nooit een lege regel", () => {
    const pressure = buildDomainBasis("stress", "Stress", 25, NO_SIGNALS);
    expect(pressure.fromAnswer).toBe(false);
    expect(pressure.lines[0]).toContain("laagst naar voren");

    const strong = buildDomainBasis("voeding", "Voeding", 85, NO_SIGNALS);
    expect(strong.lines[0]).toContain("sterkere domeinen");
  });

  it("koppelt een signaal alleen aan het domein waar het antwoord over gaat", () => {
    // cortisol_risk gaat over stress, niet over beweging — beweging moet op
    // de score terugvallen ook al is cortisol_risk actief.
    const basis = buildDomainBasis("beweging", "Beweging", 50, {
      ...NO_SIGNALS,
      cortisol_risk: true,
    });
    expect(basis.fromAnswer).toBe(false);
  });

  it("gebruikt nooit een signaal-tekst die niet bij dit domein hoort", () => {
    const basis = buildDomainBasis("stress", "Stress", 50, {
      ...NO_SIGNALS,
      omega3_deficiency: true,
    });
    expect(basis.lines.join(" ")).not.toContain("vette vis");
  });
});
