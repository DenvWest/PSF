import { describe, it, expect } from "vitest";
import { getDeficiencySignals } from "@/lib/intake-engine";

// Neutrale baseline: alle antwoorden midden (3) → geen enkel kruissignaal actief.
// Per test overschrijven we alleen de relevante keys, zodat elke assert één
// signaal isoleert.
function makeAnswers(overrides: Record<string, number> = {}): Record<string, number> {
  return {
    SLP_QUAL: 3,
    SLP_CONS: 3,
    SLP_ONSET: 3,
    SLP_WAKE: 3,
    NRG_PATN: 3,
    NRG_DEP: 3,
    STR_FREQ: 3,
    STR_RCV: 3,
    NUT_O3: 3,
    NUT_PROT: 3,
    MOV_STR: 3,
    MOV_CARD: 3,
    RCV_PHYS: 3,
    ...overrides,
  };
}

describe("K1 — low_recovery_no_load (onderherstel zónder trainingsbelasting)", () => {
  it("triggert bij laag herstel + weinig beweging", () => {
    // recovery_score < 45 (RCV_PHYS+STR_RCV laag) én movementLoad < 2.
    const signals = getDeficiencySignals(
      makeAnswers({ RCV_PHYS: 1, STR_RCV: 1, MOV_STR: 1, MOV_CARD: 1 }),
    );
    expect(signals.low_recovery_no_load).toBe(true);
  });

  it("triggert NIET bij laag herstel mét trainingsbelasting", () => {
    // Zelfde lage herstelscore, maar movementLoad >= 2 → dit is
    // trainingsgedreven onderherstel (recoveryDeficit-terrein), niet K1.
    const signals = getDeficiencySignals(
      makeAnswers({ RCV_PHYS: 1, STR_RCV: 1, MOV_STR: 4, MOV_CARD: 4 }),
    );
    expect(signals.low_recovery_no_load).toBe(false);
  });
});

describe("K2 — sleep_issue_no_stress (inslaapprobleem zónder stressdrijver)", () => {
  // LET OP — omgekeerde schaal. SLP_ONSET laag = slecht inslapen (probleem).
  // STR_FREQ hoog = stress is INFREQUENT (gezond). De regel
  // `sleepOnset <= 2 && stressFrequency >= 3` betekent dus: slaapprobleem
  // terwijl stress beheersbaar is. Draai de STR_FREQ-operator om en je vangt
  // exact de verkeerde groep zonder dat de happy-path het merkt.
  it("triggert bij slecht inslapen + lage stress", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ SLP_ONSET: 1, STR_FREQ: 4 }),
    );
    expect(signals.sleep_issue_no_stress).toBe(true);
  });

  it("triggert NIET bij slecht inslapen mét veel stress", () => {
    // STR_FREQ laag = frequente stress → stressgedreven slaapprobleem,
    // dus K2 hoort uit te staan (geen leefstijl-only inslaaproute opdringen).
    const signals = getDeficiencySignals(
      makeAnswers({ SLP_ONSET: 1, STR_FREQ: 1 }),
    );
    expect(signals.sleep_issue_no_stress).toBe(false);
  });
});

describe("K3 — energy_dip_unexplained (energiedip zónder slaap/voeding-verklaring)", () => {
  it("triggert bij lage energie terwijl slaap én voeding op orde zijn", () => {
    // energy_score < 40, sleep_score >= 50, nutrition_score >= 50.
    const signals = getDeficiencySignals(
      makeAnswers({ NRG_PATN: 1, NRG_DEP: 2 }),
    );
    expect(signals.energy_dip_unexplained).toBe(true);
  });

  it("triggert NIET als slechte slaap de energiedip verklaart", () => {
    // Slaapscore onder 50 → de dip is verklaard, geen K3.
    // SLP_ONSET bewust op 3 gehouden zodat dit K2 niet incidenteel raakt.
    const signals = getDeficiencySignals(
      makeAnswers({
        NRG_PATN: 1,
        NRG_DEP: 2,
        SLP_QUAL: 1,
        SLP_CONS: 1,
        SLP_WAKE: 1,
        SLP_ONSET: 3,
      }),
    );
    expect(signals.energy_dip_unexplained).toBe(false);
  });
});
