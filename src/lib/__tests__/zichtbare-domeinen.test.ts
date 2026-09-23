import { describe, expect, it } from "vitest";
import {
  filterZichtbareDomeinen,
  isKlikbaarVoortgangDomein,
  isZichtbaarDomein,
  KLIKBARE_VOORTGANG_DOMEINEN,
  VERBORGEN_DOMEINEN,
  zichtbareDomeinen,
} from "@/lib/zichtbare-domeinen";
import { KOMPAS_RAIL_PILLAR_IDS } from "@/lib/context-rail";
import { buildModel, derivePriority } from "@/lib/dashboard-model";
import { INTERVENTION_DOMAIN_SCORE_KEYS } from "@/lib/intake-engine";
import { resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type { CheckScores, PillarId } from "@/types/dashboard";

const LEGE_TREND = {
  slaap: [], energie: [], stress: [], voeding: [],
  beweging: [], herstel: [], verbinding: [],
};

const scores: CheckScores = {
  slaap: 60,
  energie: 60,
  stress: 60,
  voeding: 60,
  beweging: 60,
  herstel: 60,
  // De laagste score: zonder filter zou verbinding je prioriteit worden.
  verbinding: 10,
};

describe("zichtbare-domeinen", () => {
  it("toont alleen voeding", () => {
    for (const verborgen of ["verbinding", "stress", "slaap", "beweging"] as const) {
      expect(isZichtbaarDomein(verborgen)).toBe(false);
    }
    expect(isZichtbaarDomein("voeding")).toBe(true);
  });

  it("filtert een kale domeinlijst met behoud van volgorde", () => {
    const lijst: PillarId[] = ["slaap", "energie", "verbinding", "voeding"];
    // Energie is een readout, geen interventiedomein — die blijft zichtbaar.
    expect(zichtbareDomeinen(lijst)).toEqual(["energie", "voeding"]);
  });

  it("filtert objecten via hun domein", () => {
    const items = [{ d: "voeding" as PillarId }, { d: "verbinding" as PillarId }];
    expect(filterZichtbareDomeinen(items, (item) => item.d)).toEqual([
      { d: "voeding" },
    ]);
  });

  it("houdt de verborgen domeinen uit de Kompas-rail", () => {
    expect(KOMPAS_RAIL_PILLAR_IDS).toEqual(["voeding"]);
  });

  /**
   * Zonder filter zou de laagste score de prioriteit bepalen en het dashboard
   * naar een scherm wijzen dat niet meer bestaat.
   */
  it("wijst nooit verbinding aan als prioriteit, ook niet bij de laagste score", () => {
    const prioriteit = derivePriority(scores);
    expect(prioriteit.map((pillar) => pillar.id)).not.toContain("verbinding");
    expect(prioriteit[0].id).not.toBe("verbinding");
  });

  /**
   * De kern van het besluit: verbergen is een weergavefilter, geen
   * engine-wijziging. Zou connection_score uit vitaliteit vallen, dan kreeg
   * iedereen met een bestaande check een andere score zonder gedragsverandering
   * — en leest dat bij hermeting als vooruitgang die er niet is.
   */
  it("laat de score van een verborgen domein meetellen in vitaliteit", () => {
    expect(INTERVENTION_DOMAIN_SCORE_KEYS).toContain("connection_score");

    const facets = resolveVitaliteitFacets({
      sleep_score: 60,
      energy_score: 60,
      stress_score: 60,
      nutrition_score: 60,
      movement_score: 60,
      recovery_score: 60,
      connection_score: 10,
    });
    expect(facets.map((facet) => facet.key)).toContain("connection");
  });

  /**
   * Het gat dat bij het verbergen van stress aan het licht kwam: een eerder
   * gekozen prioriteit blijft in `account_priority_pref` staan, en die keuze
   * won van de engine. De contextkolom toonde daardoor een stress-ladder in
   * een dashboard waar stress verder nergens meer bestond.
   *
   * De voorkeur blijft bewaard — hij wordt alleen niet gevolgd zolang het
   * domein verborgen is.
   */
  it("volgt een opgeslagen prioriteitskeuze niet als die op een verborgen domein wijst", () => {
    const model = buildModel(
      { scores, vitality: 50, date: "22 sep 2026", trend: LEGE_TREND },
      null,
      [],
      false,
      {},
      null,
      null,
      "stress",
    );

    expect(model.priority.id).not.toBe("stress");
    expect(isZichtbaarDomein(model.priority.id)).toBe(true);
    // Geen "eigen keuze"-label voor een keuze die niet gevolgd wordt.
    expect(model.priorityIsUserChosen).toBe(false);
  });

  it("volgt een opgeslagen keuze wél als het domein zichtbaar is", () => {
    const model = buildModel(
      { scores, vitality: 50, date: "22 sep 2026", trend: LEGE_TREND },
      null,
      [],
      false,
      {},
      null,
      null,
      "voeding",
    );

    expect(model.priority.id).toBe("voeding");
  });

  it("is omkeerbaar via één lijst", () => {
    expect(VERBORGEN_DOMEINEN).toEqual([
      "verbinding",
      "stress",
      "slaap",
      "beweging",
    ]);
  });

  it("laat alleen voeding een leefstijlprofiel-scherm openen", () => {
    expect(KLIKBARE_VOORTGANG_DOMEINEN).toEqual(["voeding"]);
    expect(isKlikbaarVoortgangDomein("voeding")).toBe(true);
    expect(isKlikbaarVoortgangDomein("slaap")).toBe(false);
  });

  /**
   * Stress had de laagste score in deze fixture en zou zonder filter de
   * prioriteit worden — net als verbinding. Beide moeten wegblijven.
   */
  it("wijst nooit stress aan als prioriteit", () => {
    const prioriteit = derivePriority({ ...scores, stress: 5 });
    expect(prioriteit.map((pillar) => pillar.id)).not.toContain("stress");
  });

  it("laat de stress-score meetellen in vitaliteit", () => {
    const facets = resolveVitaliteitFacets({
      sleep_score: 60,
      energy_score: 60,
      stress_score: 10,
      nutrition_score: 60,
      movement_score: 60,
      recovery_score: 60,
      connection_score: 60,
    });
    expect(facets.map((facet) => facet.key)).toContain("stress");
  });
});
