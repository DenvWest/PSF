import { describe, expect, it } from "vitest";
import { NUTRITION_CORE_SLIDER_IDS, nutritionSliderQuestion } from "@/data/nutrition/lifescore-questions";
import { buildNutritionFactRows, type NutritionFactRowKey } from "@/lib/nutrition-ladder";
import {
  beschikbareGroepen,
  isVoedselgroepId,
  rowKeysVoorGroepen,
  VOEDSELGROEPEN,
} from "@/lib/nutrition-voedselgroepen";

/** Minimale geldige report-vorm; de tests sturen alleen sliders aan. */
function report(sliders: Record<string, number>) {
  return { sliders, preference: "none" as const, allergies: [] as string[] };
}

/** Alle sliders op hun laagste stop — levert de volle set feitenrijen op. */
function alleRijen() {
  const sliders = Object.fromEntries(NUTRITION_CORE_SLIDER_IDS.map((id) => [id, 0]));
  return buildNutritionFactRows(report(sliders));
}

describe("voedselgroep-filters", () => {
  it("verwijst alleen naar bestaande feitenrijen", () => {
    const bestaande = new Set(alleRijen().map((rij) => rij.key));
    for (const groep of VOEDSELGROEPEN) {
      for (const key of groep.rowKeys) {
        expect(bestaande, `${groep.id} verwijst naar onbekende rij ${key}`).toContain(key);
      }
    }
  });

  it("dekt elke feitenrij met minstens één groep", () => {
    // Anders zou een rij onbereikbaar zijn zodra de gebruiker een filter kiest.
    const gedekt = new Set<NutritionFactRowKey>();
    for (const groep of VOEDSELGROEPEN) {
      for (const key of groep.rowKeys) gedekt.add(key);
    }
    for (const rij of alleRijen()) {
      expect(gedekt, `rij ${rij.key} zit in geen enkele groep`).toContain(rij.key);
    }
  });

  it("geeft null bij een lege selectie (= geen filter)", () => {
    expect(rowKeysVoorGroepen([])).toBeNull();
  });

  it("combineert meerdere groepen als unie", () => {
    const keys = rowKeysVoorGroepen(["groente", "granen"]);
    expect(keys).not.toBeNull();
    expect(keys!.has("plantbasis")).toBe(true);
    expect(keys!.has("vezelbasis")).toBe(true);
    expect(keys!.has("visbron")).toBe(false);
  });

  it("laat vlees & vis de visbron-rij zien", () => {
    const keys = rowKeysVoorGroepen(["vlees-vis"]);
    expect(keys!.has("visbron")).toBe(true);
    expect(keys!.has("eiwitbronnen")).toBe(true);
  });

  it("zet suiker en bewerkt samen op één knop", () => {
    const keys = rowKeysVoorGroepen(["suiker"]);
    expect(keys!.has("minderen")).toBe(true);
    expect(keys!.has("bewerkingsgraad")).toBe(true);
  });

  it("toont geen knop voor een groep zonder rijen in deze check", () => {
    // Alleen de volkoren-vraag beantwoord. 'Granen' hoort erbij; 'Groente',
    // 'Fruit' en 'Suiker' niet, want plantbasis/minderen leveren dan geen rij.
    // (Eiwitbronnen komt er wél, met "Geen van deze bronnen" — die rij bouwt
    // de builder bewust ook zonder antwoorden, zie ROW_SPECS.)
    const rijen = buildNutritionFactRows(report({ wholegrain: 1 }));
    const ids = beschikbareGroepen(rijen.map((r) => r.key)).map((g) => g.id);
    expect(ids).toContain("granen");
    expect(ids).not.toContain("groente");
    expect(ids).not.toContain("fruit");
    expect(ids).not.toContain("suiker");
  });

  it("herkent geldige groep-ids", () => {
    expect(isVoedselgroepId("vlees-vis")).toBe(true);
    expect(isVoedselgroepId("bestaat-niet")).toBe(false);
  });
});

describe("bewerkingsgraad-feitenrij", () => {
  it("staat op laag 2 (voedingskwaliteit) met een bron", () => {
    const laatsteIndex = (nutritionSliderQuestion("ultraProcessed")?.stops.length ?? 1) - 1;
    const rijen = buildNutritionFactRows(report({ ultraProcessed: laatsteIndex }));
    const rij = rijen.find((r) => r.key === "bewerkingsgraad");
    expect(rij).toBeDefined();
    expect(rij!.layer).toBe(2);
    expect(rij!.cluster).toBe("C5");
    expect(rij!.benchmarkSource).toBe("Monteiro 2019");
    // Hoogste index op een FREQ_BAD-schaal = vaakst kant-en-klaar = rood.
    expect(rij!.status).toBe("below");
  });

  it("geeft meets bij zelden kant-en-klaar", () => {
    const rijen = buildNutritionFactRows(report({ ultraProcessed: 0 }));
    expect(rijen.find((r) => r.key === "bewerkingsgraad")!.status).toBe("meets");
  });

  it("draagt een voetnoot dat er geen Nederlandse norm is", () => {
    const rijen = buildNutritionFactRows(report({ ultraProcessed: 3 }));
    expect(rijen.find((r) => r.key === "bewerkingsgraad")!.footnote).toMatch(/geen Nederlandse norm/i);
  });
});
