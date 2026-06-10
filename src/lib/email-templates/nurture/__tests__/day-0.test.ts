import { describe, it, expect } from "vitest";
import { nurtureDay0Email } from "@/lib/email-templates/nurture/day-0";
import type {
  NurtureEmailData,
  NurtureEmailDispatchContext,
} from "@/lib/email-templates/nurture/types";

const RECOVERY_URL = "https://www.perfectsupplement.nl/api/intake/recover?token=abc123";

const CTX: NurtureEmailDispatchContext = {
  recipientEmail: "test@example.com",
  sessionId: "sess-123",
  recoveryUrl: RECOVERY_URL,
};

function buildData(
  profileLabel: string,
  primaryDomain: string,
  domainScores: Record<string, number>,
): NurtureEmailData {
  return {
    profileLabel,
    primaryDomain,
    domainScores,
    sequenceDay: 0,
    urgencyLevel: "moderate",
    visibleTiers: [1, 2, 3],
    completedPlanPhases: 0,
  };
}

// ── P1: primaire CTA-knop bevat recoveryUrl, NIET /profiel/ ──────────────────

describe("dag-0 primaire CTA-knop", () => {
  it("Stressdrager — CTA bevat recoveryUrl", () => {
    const data = buildData("Stressdrager", "stress", {
      stress_score: 25,
      sleep_score: 50,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain(RECOVERY_URL);
  });

  it("Stressdrager — CTA bevat GEEN /profiel/ als knop-href", () => {
    const data = buildData("Stressdrager", "stress", {
      stress_score: 25,
      sleep_score: 50,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    // CTA-knop mag geen /profiel/ bevatten
    const ctaButtonMatch = html.match(/href="([^"]*)"[^>]*>[^<]*Bekijk je resultaten/);
    if (ctaButtonMatch) {
      expect(ctaButtonMatch[1]).not.toMatch(/\/profiel\//);
    }
    // href naar /profiel/stressdrager mag niet in een knop-element zitten
    expect(html).not.toMatch(/nurtureCtaButton[^>]*\/profiel\//);
  });

  it("Lage Batterij — CTA bevat recoveryUrl", () => {
    const data = buildData("Lage Batterij", "energy", {
      stress_score: 50,
      sleep_score: 50,
      energy_score: 20,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain(RECOVERY_URL);
  });

  it("Onrustige Slaper — CTA bevat recoveryUrl", () => {
    const data = buildData("Onrustige Slaper", "sleep", {
      stress_score: 50,
      sleep_score: 20,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain(RECOVERY_URL);
  });

  it("In Balans — CTA bevat recoveryUrl", () => {
    const data = buildData("In Balans", "sleep", {
      stress_score: 70,
      sleep_score: 68,
      energy_score: 72,
      nutrition_score: 66,
      movement_score: 65,
      recovery_score: 69,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain(RECOVERY_URL);
  });

  it("CTA-knop bevat NIET /intake/resultaten (route bestaat niet)", () => {
    const data = buildData("Stressdrager", "stress", {
      stress_score: 25,
      sleep_score: 50,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).not.toContain("/intake/resultaten");
  });
});

// ── P3+P4: weakspot-blok toont label van PRIMAIRE domein ────────────────────

describe("dag-0 weakspot-blok toont primair domein", () => {
  it("primaryDomain=stress → label 'Stress', ook als energy numeriek lager scoort", () => {
    const data = buildData("Stressdrager", "stress", {
      stress_score: 60,
      sleep_score: 50,
      energy_score: 10, // numeriek laagste, maar niet het primaire domein
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    // Weakspot header bevat "STRESS" (uppercase in HTML)
    expect(html.toUpperCase()).toMatch(/STRESS[^<]*STRESS VRAAGT NU JE AANDACHT/);
    // "Energie" mag niet als weakspot-label voorkomen
    expect(html).not.toMatch(/ENERGIE — ENERGIE STAAT ONDER DRUK/i);
  });

  it("primaryDomain=sleep → label 'Slaap'", () => {
    const data = buildData("Onrustige Slaper", "sleep", {
      stress_score: 50,
      sleep_score: 25,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("Slaap is je duidelijkste signaal");
  });

  it("primaryDomain=energy → label 'Energie'", () => {
    const data = buildData("Lage Batterij", "energy", {
      stress_score: 50,
      sleep_score: 50,
      energy_score: 20,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("Energie staat onder druk");
  });

  it("primaryDomain=nutrition → label 'Voeding'", () => {
    const data = buildData("In Balans", "nutrition", {
      stress_score: 70,
      sleep_score: 70,
      energy_score: 70,
      nutrition_score: 30,
      movement_score: 70,
      recovery_score: 70,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("Voeding is je zwakste pijler");
  });
});

// ── P2: emotionele opening per profiel ──────────────────────────────────────

describe("dag-0 emotionele opening", () => {
  it("Stressdrager — opening benoemt stress als prioriteit", () => {
    const data = buildData("Stressdrager", "stress", {
      stress_score: 25,
      sleep_score: 50,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("stress je prioriteit is");
    expect(html).toContain("dag niet echt stopt als je thuis bent");
  });

  it("Onrustige Slaper — opening benoemt slaap als prioriteit", () => {
    const data = buildData("Onrustige Slaper", "sleep", {
      stress_score: 50,
      sleep_score: 20,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("slaap je prioriteit is");
    expect(html).toContain("wakker wordt en al moe bent");
  });

  it("Lage Batterij — opening benoemt energie als prioriteit", () => {
    const data = buildData("Lage Batterij", "energy", {
      stress_score: 50,
      sleep_score: 50,
      energy_score: 20,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("energie je prioriteit is");
    expect(html).toContain("energie op is lang voordat de dag voorbij is");
  });

  it("opening bevat NIET de oude koude copy over het zenuwstelsel", () => {
    const data = buildData("Stressdrager", "stress", {
      stress_score: 25,
      sleep_score: 50,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    // Oude opening-copy mag er niet meer in zitten
    expect(html).not.toContain("Je zenuwstelsel staat langer aan");
    expect(html).not.toContain("zenuwstelsel staat langer aan");
  });
});

// ── P5: slechts één CTA-knop ──────────────────────────────────────────────

describe("dag-0 één CTA-knop", () => {
  it("Stressdrager — geen tweede knop naar een /profiel/-pagina", () => {
    const data = buildData("Stressdrager", "stress", {
      stress_score: 25,
      sleep_score: 50,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    // Tel het aantal CTA-knop-stijlpatronen (background-color knop)
    const buttonMatches = html.match(/background-color:#2d4a3e[^"]*"[^>]*>[^<]*<\/a>/g);
    expect((buttonMatches ?? []).length).toBeLessThanOrEqual(1);
  });
});
