import { describe, expect, it } from "vitest";
import { buildNutritionFactRows } from "@/lib/nutrition-ladder";
import {
  bouwStatusFilters,
  bouwStatusRijen,
  filterStatusRijen,
} from "@/lib/nutrition-statustabel";

const report = {
  sliders: {
    vegetables: 2,
    fruit: 2,
    wholegrain: 2,
    meatLegumes: 2,
    dairy: 2,
    nutsSeedsLegumes: 1,
    oilyFish: 0,
    sugaryDrinks: 5,
    ultraProcessed: 1,
  },
  preference: "none" as const,
  allergies: [] as string[],
};

function rijen() {
  return bouwStatusRijen(buildNutritionFactRows(report), report);
}

describe("nutrition-statustabel", () => {
  it("legt voedselgroepen en kwaliteitsvragen op één rijmodel", () => {
    const soorten = new Set(rijen().map((rij) => rij.soort));
    expect(soorten.has("groep")).toBe(true);
    expect(soorten.has("kwaliteit")).toBe(true);
  });

  /**
   * De bronrijen die de oude kwaliteitslaag als tweede sectie toonde
   * (plantbasis, visbron, eiwitbronnen) staan al als voedselgroep in deze
   * tabel. Ze een tweede keer opnemen zou dezelfde meting twee rijen geven —
   * precies de herhaling waar dit overzicht vanaf moest.
   */
  it("neemt alleen laag 2 als kwaliteitsrij op, niet de bronrijen van laag 1", () => {
    const kwaliteit = rijen().filter((rij) => rij.soort === "kwaliteit");
    expect(kwaliteit.map((rij) => rij.id).sort()).toEqual([
      "bewerkingsgraad",
      "minderen",
    ]);
  });

  it("geeft elke rij hoogstens één plek in de tabel", () => {
    const ids = rijen().map((rij) => rij.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("zet ruimte bovenaan", () => {
    const eerste = rijen()[0];
    expect(eerste.status).toBe("below");
  });

  it("erft antwoord, richtlijn en status ongewijzigd van de feitenrij", () => {
    const factRows = buildNutritionFactRows(report);
    const minderen = factRows.find((rij) => rij.key === "minderen");
    const rij = rijen().find((r) => r.id === "minderen");
    expect(rij?.jij).toBe(minderen?.answerLabel);
    expect(rij?.richtlijn).toBe(minderen?.benchmarkLabel);
    expect(rij?.status).toBe(minderen?.status);
  });

  it("laat alleen voedselgroepen uitklappen naar hun bronnen", () => {
    for (const rij of rijen()) {
      expect(rij.categorieId != null).toBe(rij.soort === "groep");
    }
  });

  it("bouwt filters met een telling per aanwezige status", () => {
    const filters = bouwStatusFilters(rijen());
    expect(filters[0].id).toBe("alles");
    expect(filters[0].aantal).toBe(rijen().length);
    // Geen dode knoppen: elke statusknop filtert minstens één rij.
    for (const filter of filters.slice(1)) {
      expect(filter.aantal).toBeGreaterThan(0);
    }
  });

  it("laat de knoppenrij weg als er niets te filteren valt", () => {
    // Eén statusknop naast "Alles" toont dezelfde rijen met een klik ervoor.
    const eenStatus = rijen()
      .filter((rij) => rij.status === "near")
      .slice(0, 2);
    expect(bouwStatusFilters(eenStatus)).toEqual([]);
  });

  it("filtert op status en geeft alles terug bij 'alles'", () => {
    const alle = rijen();
    expect(filterStatusRijen(alle, "alles")).toHaveLength(alle.length);
    const ruimte = filterStatusRijen(alle, "below");
    expect(ruimte.length).toBeGreaterThan(0);
    expect(ruimte.every((rij) => rij.status === "below")).toBe(true);
  });
});
