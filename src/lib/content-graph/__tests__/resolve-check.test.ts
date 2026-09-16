import { describe, expect, it } from "vitest";
import {
  resolveCheck,
  resolveCheckEntry,
  resolveSecondaryCheck,
} from "@/lib/content-graph/resolve-check";
import {
  CONTENT_CHECKS,
  CONTENT_CHECK_IDS,
} from "@/data/content-graph/checks";
import { PROBLEMS, PROBLEM_IDS } from "@/data/content-graph/problems";
import { CONTENT_METADATA } from "@/data/insight-metadata";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";
import { getDeficiencySignals } from "@/lib/intake-engine";
import { allInsights } from "@/data/insights";
import { allGraphNodes } from "@/lib/content-graph/node";
import { metadataForNode } from "@/data/content-graph/node-metadata";

describe("CONTENT_CHECKS", () => {
  it("botst niet met de dashboard-CHECKS", async () => {
    // `CheckId`/`CHECKS` in src/data/dashboard zijn check-in-slots. Zouden de
    // twee dezelfde sleutels dragen, dan is een importfout onzichtbaar.
    const dashboard = await import("@/data/dashboard");
    const overlap = CONTENT_CHECK_IDS.filter(
      (id) => id in (dashboard.CHECKS as Record<string, unknown>),
    );
    expect(overlap).toEqual([]);
  });

  it("elke check wijst naar een /intake-route", () => {
    for (const id of CONTENT_CHECK_IDS) {
      expect(CONTENT_CHECKS[id].href).toMatch(/^\/intake/);
    }
  });
});

describe("PROBLEMS", () => {
  it("dekt precies de sleutels van DeficiencySignals — geen tweede vocabulaire", () => {
    const signalKeys = Object.keys(getDeficiencySignals({})).sort();
    expect([...PROBLEM_IDS].sort()).toEqual(signalKeys);
  });

  it("elk probleem verwijst naar een bestaande nutriënt en check", () => {
    for (const id of PROBLEM_IDS) {
      const problem = PROBLEMS[id];
      if (problem.nutrient) {
        expect(NUTRIENT_IDS).toContain(problem.nutrient);
      }
      expect(CONTENT_CHECK_IDS).toContain(problem.check);
    }
  });

  it("geeft geen stof aan een probleem waar niets te suppleren valt", () => {
    // Anders leest de graaf een supplementroute in een stressprobleem.
    expect(PROBLEMS.cortisol_risk.nutrient).toBeNull();
    expect(PROBLEMS.sleep_issue_no_stress.nutrient).toBeNull();
  });
});

describe("nutrients in CONTENT_METADATA", () => {
  it("bevat alleen bestaande NutrientId's", () => {
    for (const [slug, meta] of Object.entries(CONTENT_METADATA)) {
      for (const nutrient of meta.nutrients ?? []) {
        expect(NUTRIENT_IDS, `onbekende stof op ${slug}`).toContain(nutrient);
      }
    }
  });

  it("geeft geen enkel stuk meer dan twee stoffen", () => {
    const teveel = Object.entries(CONTENT_METADATA)
      .filter(([, meta]) => (meta.nutrients?.length ?? 0) > 2)
      .map(([slug]) => slug);
    expect(teveel, "meer dan twee stoffen = geen onderwerp").toEqual([]);
  });

  it("bevat geen dubbele stof binnen één stuk", () => {
    for (const [slug, meta] of Object.entries(CONTENT_METADATA)) {
      const list = meta.nutrients ?? [];
      expect(new Set(list).size, `dubbele stof op ${slug}`).toBe(list.length);
    }
  });

  // Drift-vangrail in de nuttige richting: het veld staat los van de
  // commerciële catalogus, maar een magnesium-vergelijking zonder de stof
  // magnesium is vrijwel zeker een vergeten regel.
  it("een stuk met een nutriëntdragend supplement draagt ook die stof", () => {
    const VERWACHT: Record<string, string> = {
      "omega-3": "omega3",
      "magnesium-glycinaat": "magnesium",
      zink: "zinc",
      "vitamine-d3": "vitamin_d",
      eiwitpoeder: "protein",
    };
    const mist = Object.entries(CONTENT_METADATA)
      .filter(([, meta]) => {
        const verwacht = meta.relatedSupplementId
          ? VERWACHT[meta.relatedSupplementId]
          : undefined;
        if (!verwacht) return false;
        return !(meta.nutrients ?? []).includes(
          verwacht as (typeof NUTRIENT_IDS)[number],
        );
      })
      .map(([slug]) => slug);
    expect(mist).toEqual([]);
  });

  it("dekt een substantieel deel van de content", () => {
    const met = Object.values(CONTENT_METADATA).filter(
      (m) => (m.nutrients?.length ?? 0) > 0,
    ).length;
    // Nulmeting 16 sep 2026: 61 van 117. Mag groeien, niet krimpen.
    expect(met).toBeGreaterThanOrEqual(61);
  });
});

describe("resolveCheck", () => {
  it("laat de stof winnen van het thema", () => {
    expect(resolveCheck({ theme: "sleep", nutrients: ["magnesium"] })).toBe(
      "voeding",
    );
  });

  it("valt zonder stof terug op het gemeten domein", () => {
    expect(resolveCheck({ theme: "sleep" })).toBe("slaap");
    expect(resolveCheck({ theme: "stress" })).toBe("stress");
    expect(resolveCheck({ theme: "movement" })).toBe("beweging");
    expect(resolveCheck({ theme: "nutrition" })).toBe("voeding");
  });

  it("stuurt verbinding en onbekend naar de brede leefstijlcheck", () => {
    expect(resolveCheck({ theme: "connection" })).toBe("leefstijl");
    expect(resolveCheck({})).toBe("leefstijl");
  });

  it("respecteert checkOverride boven alles", () => {
    expect(
      resolveCheck({ theme: "nutrition", nutrients: ["protein"], checkOverride: "slaap" }),
    ).toBe("slaap");
  });

  it("geeft voor elk contentitem een bestaande check", () => {
    for (const item of allInsights) {
      const meta = CONTENT_METADATA[item.slug] ?? {};
      const check = resolveCheckEntry(meta);
      expect(CONTENT_CHECK_IDS, `geen check voor ${item.slug}`).toContain(check.id);
    }
  });

  it("biedt elke check minstens één keer aan vanuit content", () => {
    // Een check die nergens vanuit content bereikbaar is, bestaat niet voor
    // een bezoeker die via Google binnenkomt.
    const aangeboden = new Set(
      allInsights.map((item) => resolveCheck(CONTENT_METADATA[item.slug] ?? {})),
    );
    const onbereikbaar = CONTENT_CHECK_IDS.filter((id) => !aangeboden.has(id));
    expect(
      onbereikbaar,
      `checks die geen enkel contentitem aanbiedt: ${onbereikbaar.join(", ")}`,
    ).toEqual([]);
  });
});

describe("resolveSecondaryCheck", () => {
  it("geeft altijd de brede leefstijlcheck onder een micro-check", () => {
    expect(resolveSecondaryCheck({ theme: "sleep", nutrients: ["magnesium"] })).toBe(
      "leefstijl",
    );
    expect(resolveSecondaryCheck({ theme: "nutrition", nutrients: ["protein"] })).toBe(
      "leefstijl",
    );
    expect(resolveSecondaryCheck({ theme: "sleep" })).toBe("leefstijl");
  });

  it("biedt de domeincheck niet als tweede stap aan", () => {
    // De leefstijlcheck meet slaap al; ze naast elkaar zetten is dezelfde
    // vraag twee keer stellen. Een domeincheck is óf primair, óf niet in beeld.
    expect(resolveSecondaryCheck({ theme: "stress", nutrients: ["magnesium"] })).not.toBe(
      "stress",
    );
  });

  it("valt niet terug op zichzelf", () => {
    expect(resolveSecondaryCheck({ theme: "connection" })).toBeNull();
    expect(resolveSecondaryCheck({ checkOverride: "leefstijl" })).toBeNull();
  });

  // De reden dat deze functie bestaat: de brede check levert domain_scores,
  // profile_label, urgency_level en de e-mailopt-in. Verdwijnt hij uit de
  // content, dan droogt de personalisatie- en nurture-instroom op.
  it("houdt de leefstijlcheck op élke contentpagina bereikbaar", () => {
    const zonder = allGraphNodes().filter((node) => {
      const meta = metadataForNode(node);
      return (
        resolveCheck(meta) !== "leefstijl" &&
        resolveSecondaryCheck(meta) !== "leefstijl"
      );
    });
    expect(
      zonder.map((n) => n.path),
      "pagina's die de leefstijlcheck nergens aanbieden",
    ).toEqual([]);
  });
});

describe("metadataForNode", () => {
  it("geeft elke knoop in de graaf metadata, niet alleen blog en kennisbank", () => {
    for (const node of allGraphNodes()) {
      expect(metadataForNode(node), `geen metadata voor ${node.path}`).toBeDefined();
    }
  });

  it("stuurt pillars en profielpagina's naar de brede leefstijlcheck", () => {
    // Een pillar zegt zelf dat een klacht meerdere oorzaken heeft, en een
    // profielpagina ís de uitkomst van de brede check. Een micro-check van één
    // minuut zou hun eigen boodschap tegenspreken.
    const breed = allGraphNodes().filter(
      (n) => n.type === "pillar" || n.type === "profiel",
    );
    expect(breed.length).toBeGreaterThan(10);
    for (const node of breed) {
      expect(resolveCheck(metadataForNode(node)), node.path).toBe("leefstijl");
    }
  });

  it("geeft supplementgidsen en vergelijkingen hun stof", () => {
    const magnesiumGids = allGraphNodes().find(
      (n) => n.path === "/supplementen/magnesium",
    );
    expect(metadataForNode(magnesiumGids!).nutrients).toEqual(["magnesium"]);

    const omegaVergelijking = allGraphNodes().find(
      (n) => n.path === "/beste/omega-3-supplement",
    );
    expect(metadataForNode(omegaVergelijking!).nutrients).toEqual(["omega3"]);
  });

  it("geeft geen stof aan een supplement dat de voedingscheck niet meet", () => {
    // Creatine, melatonine en ashwagandha staan niet in NutrientId.
    for (const slug of ["creatine", "melatonine", "ashwagandha"]) {
      const node = allGraphNodes().find((n) => n.path === `/supplementen/${slug}`);
      expect(metadataForNode(node!).nutrients, slug).toBeUndefined();
    }
  });
});
