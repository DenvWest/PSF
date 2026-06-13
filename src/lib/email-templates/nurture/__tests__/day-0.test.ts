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

// ── P1a: score-patroon-zin ────────────────────────────────────────────────

describe("dag-0 score-patroon-zin", () => {
  it("3 SUMMARY-pijlers < 60, primaryDomain=movement → 'van je vier gebieden vragen nu aandacht' + 'Beweging het meest'", () => {
    const data = buildData("In Balans", "movement", {
      sleep_score: 35,
      stress_score: 45,
      nutrition_score: 38,
      movement_score: 20,
      energy_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("van je vier gebieden vragen nu aandacht");
    expect(html).toContain("Beweging");
    expect(html).toContain("het meest");
  });

  it("slechts 1 SUMMARY-pijler < 60 → 'Eén gebied vraagt nu je aandacht'", () => {
    const data = buildData("Onrustige Slaper", "sleep", {
      sleep_score: 30,
      stress_score: 75,
      nutrition_score: 80,
      movement_score: 70,
      energy_score: 70,
      recovery_score: 70,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("Eén gebied vraagt nu je aandacht");
  });

  it("0 SUMMARY-pijlers < 60 (In Balans) → geen aandacht-zin", () => {
    const data = buildData("In Balans", "sleep", {
      sleep_score: 65,
      stress_score: 70,
      nutrition_score: 72,
      movement_score: 68,
      energy_score: 80,
      recovery_score: 75,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).not.toContain("van je vier gebieden vragen nu aandacht");
    expect(html).not.toContain("Eén gebied vraagt nu je aandacht");
  });
});

// ── P1b: nulpunt-zin ──────────────────────────────────────────────────────

describe("dag-0 nulpunt-zin", () => {
  it("html bevat 'Dit is je startpunt' en 'geen oordeel'", () => {
    const data = buildData("In Balans", "sleep", {
      sleep_score: 40,
      stress_score: 60,
      nutrition_score: 70,
      movement_score: 65,
      energy_score: 70,
      recovery_score: 70,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("Dit is je startpunt");
    expect(html).toContain("geen oordeel");
  });
});

// ── Domein-consistentie: movement en nutrition ────────────────────────────

describe("dag-0 domein-consistentie movement en nutrition", () => {
  it("primaryDomain=movement → opening bevat 'beweging je prioriteit is'", () => {
    const data = buildData("In Balans", "movement", {
      sleep_score: 30,
      stress_score: 50,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 20,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("beweging je prioriteit is");
  });

  it("primaryDomain=movement → weakspot bevat 'Beweging heeft ruimte'", () => {
    const data = buildData("In Balans", "movement", {
      sleep_score: 30,
      stress_score: 50,
      energy_score: 50,
      nutrition_score: 50,
      movement_score: 20,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("Beweging heeft ruimte");
  });

  it("bevat geen PDF-gids-blok", () => {
    const domains = ["sleep", "stress", "energy", "movement", "nutrition", "recovery"];
    for (const domain of domains) {
      const data = buildData("In Balans", domain, {
        sleep_score: 30,
        stress_score: 50,
        energy_score: 50,
        nutrition_score: 50,
        movement_score: 20,
        recovery_score: 50,
      });
      const { html } = nurtureDay0Email(data, CTX);
      expect(html).not.toContain("GRATIS SLAAPGIDS");
      expect(html).not.toContain("GRATIS ENERGIEGIDS");
      expect(html).not.toContain("GRATIS HERSTELGIDS");
      expect(html).not.toContain("Download de Slaapgids");
      expect(html).not.toContain("Stressgids voor mannen");
    }
  });

  it("primaryDomain=movement → bevat NIET 'energie je prioriteit is'", () => {
    const data = buildData("Lage Batterij", "movement", {
      sleep_score: 30,
      stress_score: 50,
      energy_score: 15,
      nutrition_score: 50,
      movement_score: 20,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).not.toContain("energie je prioriteit is");
  });

  it("primaryDomain=nutrition → opening bevat 'voeding je prioriteit is'", () => {
    const data = buildData("In Balans", "nutrition", {
      sleep_score: 70,
      stress_score: 70,
      energy_score: 70,
      nutrition_score: 20,
      movement_score: 70,
      recovery_score: 70,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain("voeding je prioriteit is");
  });

  it("subject is altijd 'Dit valt op in jouw resultaten'", () => {
    const domains = ["sleep", "stress", "energy", "movement", "nutrition", "recovery"];
    for (const domain of domains) {
      const data = buildData("In Balans", domain, {
        sleep_score: 50,
        stress_score: 50,
        energy_score: 50,
        nutrition_score: 50,
        movement_score: 50,
        recovery_score: 50,
      });
      const { subject } = nurtureDay0Email(data, CTX);
      expect(subject).toBe("Dit valt op in jouw resultaten");
    }
  });
});

// ── P1c: 'en verder'-regel bij extra aandachtsdomeinen ───────────────────

describe("dag-0 en-verder-regel", () => {
  it("2+ aandachtsdomeinen → compacte regel over andere domeinen", () => {
    const data = buildData("In Balans", "movement", {
      sleep_score: 35,
      stress_score: 45,
      nutrition_score: 38,
      movement_score: 20,
      energy_score: 50,
      recovery_score: 50,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).toContain(
      "Je slaap en energie vroegen ook aandacht — daar komen we in de volgende mails op terug.",
    );
  });

  it("slechts 1 aandachtsdomein → geen en-verder-regel", () => {
    const data = buildData("Onrustige Slaper", "sleep", {
      sleep_score: 30,
      stress_score: 75,
      nutrition_score: 80,
      movement_score: 70,
      energy_score: 70,
      recovery_score: 70,
    });
    const { html } = nurtureDay0Email(data, CTX);
    expect(html).not.toContain("daar komen we in de volgende mails op terug");
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
