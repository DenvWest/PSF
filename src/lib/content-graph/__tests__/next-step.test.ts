import { describe, expect, it } from "vitest";
import {
  nextStepForMetadata,
  resolveNextStep,
} from "@/lib/content-graph/next-step";
import { allGraphNodes } from "@/lib/content-graph/node";
import { CONTENT_CHECKS } from "@/data/content-graph/checks";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";

describe("resolveNextStep", () => {
  it("geeft elke knoop in de graaf een primaire stap", () => {
    for (const node of allGraphNodes()) {
      const step = resolveNextStep(node);
      expect(step.primary.href, node.path).toBeTruthy();
      expect(step.primary.label, node.path).toBeTruthy();
      expect(step.primary.reasonNl, node.path).toBeTruthy();
    }
  });

  // De volgorde begrijpen → controleren → verbeteren → aanvullen → vergelijken,
  // als invariant en niet als richtlijn.
  it("biedt nooit een /beste/-pad als primaire vervolgstap", () => {
    const fout = allGraphNodes()
      .filter((node) => resolveNextStep(node).primary.href.startsWith("/beste/"))
      .map((n) => n.path);
    expect(fout).toEqual([]);
  });

  it("wijst elke stap naar een bestaande check-route", () => {
    const geldig = new Set(Object.values(CONTENT_CHECKS).map((c) => c.href));
    for (const node of allGraphNodes()) {
      const step = resolveNextStep(node);
      expect(geldig, node.path).toContain(step.primary.href);
      if (step.secondary) expect(geldig).toContain(step.secondary.href);
    }
  });

  it("geeft primair en secundair nooit hetzelfde doel", () => {
    for (const node of allGraphNodes()) {
      const step = resolveNextStep(node);
      if (step.secondary) {
        expect(step.primary.target, node.path).not.toBe(step.secondary.target);
      }
    }
  });
});

describe("copy volgt thresholdKind", () => {
  // nutrient-routes.ts zet magnesium en zink op `proxy`: de vraag meet de stof
  // niet. Magnesium is het grootste cluster van de site, dus juist daar zou
  // "kijk of je een tekort hebt" een precisie claimen die er niet is.
  it("belooft bij een proxy-stof alleen dat je naar de bronnen kijkt", () => {
    expect(nutrientRoute("magnesium").thresholdKind).toBe("proxy");
    const step = nextStepForMetadata({ theme: "sleep", nutrients: ["magnesium"] });
    expect(step.primary.reasonNl).toContain("bronnen");
    expect(step.primary.reasonNl).not.toContain("hieraan komt");
  });

  it("mag bij een gepubliceerde norm wél zeggen of je eraan komt", () => {
    expect(nutrientRoute("omega3").thresholdKind).toBe("populatierichtlijn");
    const step = nextStepForMetadata({ theme: "nutrition", nutrients: ["omega3"] });
    expect(step.primary.reasonNl).toContain("hieraan komt");
  });

  it("laat één proxy-stof de hele belofte temperen", () => {
    // magnesium (proxy) + eiwit (vuistregel) — de zwakste bepaalt wat we zeggen.
    const step = nextStepForMetadata({ nutrients: ["protein", "magnesium"] });
    expect(step.primary.reasonNl).toContain("bronnen");
  });

  it("noemt geen milligram, geen dagtotaal en geen percentage", () => {
    // Dezelfde harde grens als in nutrient-routes.ts en nutrient-rail.ts.
    for (const node of allGraphNodes()) {
      const step = resolveNextStep(node);
      const tekst = `${step.primary.label} ${step.primary.reasonNl}`;
      expect(tekst, node.path).not.toMatch(/\bmg\b|\bmilligram\b|%/);
    }
  });
});

describe("uitrolstand", () => {
  it("laat de stof-dragende stukken los van de rest schakelen", async () => {
    const { isContentNextStepEnabled } = await import("@/lib/feature-flags");
    // Zonder env-variabele staat alles uit — de bestaande CTA's blijven.
    expect(isContentNextStepEnabled(true)).toBe(false);
    expect(isContentNextStepEnabled(false)).toBe(false);
  });
});
