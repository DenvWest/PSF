import { describe, expect, it } from "vitest";
import { buildCheckLens } from "@/lib/check-lens";
import type { DomainScores } from "@/lib/intake-engine";

/** Slaap laag → focus wordt slaap, profiel wordt "Onrustige Slaper". */
const SLEEP_FIRST: DomainScores = {
  sleep_score: 28,
  energy_score: 55,
  stress_score: 62,
  nutrition_score: 74,
  movement_score: 58,
  recovery_score: 61,
  connection_score: 66,
};

const INPUT = { scores: SLEEP_FIRST, answers: {}, ownProfileSlug: "onrustige-slaper" };

describe("buildCheckLens — gezondheidsgids", () => {
  it("herkent de gids van je startpunt als jouw domein", () => {
    const lens = buildCheckLens({ kind: "guide", thema: "slaap" }, INPUT);
    expect(lens.tone).toBe("focus");
    expect(lens.badge).toBe("Past bij jou");
    expect(lens.score).toEqual({ label: "Slaap", value: 28, color: expect.any(String) });
    expect(lens.lines[0]).toContain("startpunt");
  });

  it("noemt een sterk domein onderhoud en wijst terug naar je startpunt", () => {
    const lens = buildCheckLens({ kind: "guide", thema: "voeding" }, INPUT);
    expect(lens.tone).toBe("strength");
    expect(lens.score?.value).toBe(74);
    expect(lens.lines[0]).toContain("onderhoud");
    expect(lens.lines[0]).toContain("slaap");
  });

  it("zegt bij een ongemeten thema eerlijk dat de check dit niet meet", () => {
    const lens = buildCheckLens({ kind: "guide", thema: "testosteron" }, INPUT);
    expect(lens.score).toBeNull();
    expect(lens.lines[0]).toContain("meet dit thema niet apart");
  });

  it("schaalt de toon mee met de score", () => {
    const pressure = buildCheckLens(
      { kind: "guide", thema: "stress" },
      { ...INPUT, scores: { ...SLEEP_FIRST, stress_score: 31 } },
    );
    const watch = buildCheckLens(
      { kind: "guide", thema: "stress" },
      { ...INPUT, scores: { ...SLEEP_FIRST, stress_score: 50 } },
    );
    expect(pressure.tone).toBe("pressure");
    expect(watch.tone).toBe("watch");
  });
});

describe("buildCheckLens — profielpagina", () => {
  it("bevestigt de profielpagina die de check aanwees", () => {
    const lens = buildCheckLens(
      { kind: "profile", slug: "onrustige-slaper", label: "Onrustige Slaper" },
      INPUT,
    );
    expect(lens.tone).toBe("focus");
    expect(lens.badge).toBe("Past bij jou");
    expect(lens.cta).toBeNull();
  });

  it("zegt het eerlijk als de pagina een ander profiel beschrijft, met link naar je eigen", () => {
    const lens = buildCheckLens(
      { kind: "profile", slug: "overtrainer", label: "Overtrainer" },
      INPUT,
    );
    expect(lens.tone).toBe("off");
    expect(lens.badge).toBe("Niet jouw profiel");
    expect(lens.lines[0]).toContain("Onrustige Slaper");
    expect(lens.lines[0]).toContain("Overtrainer");
    expect(lens.cta?.href).toBe("/profiel/onrustige-slaper?from=intake");
  });

  it("laat de CTA weg als het gemeten profiel geen eigen pagina heeft", () => {
    const lens = buildCheckLens(
      { kind: "profile", slug: "overtrainer", label: "Overtrainer" },
      { ...INPUT, ownProfileSlug: null },
    );
    expect(lens.cta).toBeNull();
  });
});
