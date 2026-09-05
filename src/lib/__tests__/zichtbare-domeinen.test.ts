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
import { derivePriority } from "@/lib/dashboard-model";
import { INTERVENTION_DOMAIN_SCORE_KEYS } from "@/lib/intake-engine";
import { resolveVitaliteitFacets } from "@/lib/vitaliteit";
import type { CheckScores, PillarId } from "@/types/dashboard";

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
  it("verbergt verbinding", () => {
    expect(isZichtbaarDomein("verbinding")).toBe(false);
    expect(isZichtbaarDomein("voeding")).toBe(true);
  });

  it("filtert een kale domeinlijst met behoud van volgorde", () => {
    const lijst: PillarId[] = ["slaap", "verbinding", "voeding"];
    expect(zichtbareDomeinen(lijst)).toEqual(["slaap", "voeding"]);
  });

  it("filtert objecten via hun domein", () => {
    const items = [{ d: "voeding" as PillarId }, { d: "verbinding" as PillarId }];
    expect(filterZichtbareDomeinen(items, (item) => item.d)).toEqual([
      { d: "voeding" },
    ]);
  });

  it("houdt verbinding uit de Kompas-rail", () => {
    expect(KOMPAS_RAIL_PILLAR_IDS).not.toContain("verbinding");
    expect(KOMPAS_RAIL_PILLAR_IDS).toContain("voeding");
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

  it("is omkeerbaar via één lijst", () => {
    expect(VERBORGEN_DOMEINEN).toEqual(["verbinding"]);
  });

  it("laat alleen voeding een leefstijlprofiel-scherm openen", () => {
    expect(KLIKBARE_VOORTGANG_DOMEINEN).toEqual(["voeding"]);
    expect(isKlikbaarVoortgangDomein("voeding")).toBe(true);
    expect(isKlikbaarVoortgangDomein("slaap")).toBe(false);
    expect(isKlikbaarVoortgangDomein("stress")).toBe(false);
    expect(isKlikbaarVoortgangDomein("beweging")).toBe(false);
  });
});
