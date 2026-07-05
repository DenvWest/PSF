import { describe, expect, it } from "vitest";
import { SIGNALS } from "@/data/dashboard";
import { allInsights } from "@/data/insights";
import {
  CATEGORY_TAXONOMY,
  getCategoriesForDomain,
  getDomainTaxonomy,
  type WearableSignalId,
} from "@/data/approach/category-taxonomy";
import {
  isInterventionDomain,
  READOUT_DRIVERS,
  type ReadoutPillarId,
} from "@/lib/domain-role";
import type { PillarId } from "@/types/dashboard";

const SIGNAL_IDS = new Set(SIGNALS.map((signal) => signal.id));
const INTERVENTION_PILLARS: PillarId[] = [
  "slaap",
  "stress",
  "voeding",
  "beweging",
];
const READOUT_PILLARS: ReadoutPillarId[] = ["energie", "herstel"];

describe("category-taxonomy", () => {
  it("alle id-waarden zijn uniek", () => {
    const ids = CATEGORY_TAXONOMY.map((category) => category.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("self_report-categorieën hebben questionId en geen wearableSignalId", () => {
    for (const category of CATEGORY_TAXONOMY.filter(
      (entry) => entry.source === "self_report",
    )) {
      expect(category.questionId).toBeDefined();
      expect("wearableSignalId" in category).toBe(false);
    }
  });

  it("wearable-categorieën hebben wearableSignalId in SIGNALS en geen questionId", () => {
    for (const category of CATEGORY_TAXONOMY.filter(
      (entry) => entry.source === "wearable",
    )) {
      expect(category.wearableSignalId).toBeDefined();
      expect("questionId" in category).toBe(false);
      expect(SIGNAL_IDS.has(category.wearableSignalId)).toBe(true);
    }
  });

  it("none-categorieën hebben geen questionId en geen wearableSignalId", () => {
    for (const category of CATEGORY_TAXONOMY.filter(
      (entry) => entry.source === "none",
    )) {
      expect("questionId" in category).toBe(false);
      expect("wearableSignalId" in category).toBe(false);
    }
  });

  it("elk interventie-domein heeft minstens één categorie", () => {
    for (const pillar of INTERVENTION_PILLARS) {
      expect(getCategoriesForDomain(pillar).length).toBeGreaterThanOrEqual(1);
      expect(isInterventionDomain(pillar)).toBe(true);
    }
  });

  it("readout-domeinen hebben geen categorieën en getDomainTaxonomy geeft role readout", () => {
    for (const pillar of READOUT_PILLARS) {
      expect(getCategoriesForDomain(pillar)).toHaveLength(0);

      const taxonomy = getDomainTaxonomy(pillar);
      expect(taxonomy.role).toBe("readout");
      if (taxonomy.role === "readout") {
        expect(taxonomy.drivers.length).toBeGreaterThanOrEqual(1);
        expect(taxonomy.drivers).toEqual(READOUT_DRIVERS[pillar]);
      }
    }
  });

  it("WearableSignalId-waarden zijn subset van SIGNALS-ids", () => {
    const wearableIds: WearableSignalId[] = CATEGORY_TAXONOMY.flatMap(
      (category) =>
        "wearableSignalId" in category ? [category.wearableSignalId] : [],
    );

    for (const id of wearableIds) {
      expect(SIGNAL_IDS.has(id)).toBe(true);
    }
  });

  it("insightSlugs verwijzen naar bestaande content-slugs", () => {
    const SLUGS = new Set(allInsights.map((i) => i.slug));
    for (const category of CATEGORY_TAXONOMY) {
      for (const slug of category.insightSlugs) {
        expect(SLUGS.has(slug), `${category.id} → ${slug}`).toBe(true);
      }
    }
  });
});
