import { describe, expect, it } from "vitest";
import { buildDomeinPaneel, buildMesoZone, macroBronregel } from "@/lib/domein-paneel";
import type { Meetreeks } from "@/lib/voortgang-meetreeks";
import type { DomainMeasurement } from "@/types/dashboard";

function moment(id: string, dateLabel: string, score: number): DomainMeasurement {
  return {
    id,
    dateIso: "2026-08-12",
    dateLabel,
    daysAgo: 3,
    score,
    source: "intake",
    values: [],
  };
}

function reeks(moments: DomainMeasurement[]): Meetreeks {
  return {
    moments,
    scoreRow: {
      key: "__score__",
      label: "Score",
      cells: [],
      levelMax: 100,
      scale: "score",
      plottable: moments.length > 1,
    },
    valueRows: [],
  };
}

describe("buildMesoZone", () => {
  it("noemt één meting een nulpunt, geen reeks", () => {
    const zone = buildMesoZone(reeks([moment("a", "12 aug 2026", 60)]));
    expect(zone.staat).toBe("nulpunt");
    if (zone.staat === "nulpunt") {
      expect(zone.datumLabel).toBe("12 aug 2026");
    }
  });

  it("geeft vanaf twee metingen een reeks", () => {
    const zone = buildMesoZone(
      reeks([moment("a", "12 aug 2026", 60), moment("b", "1 aug 2026", 55)]),
    );
    expect(zone.staat).toBe("reeks");
    if (zone.staat === "reeks") {
      expect(zone.momenten).toBe(2);
    }
  });

  it("is leeg zonder meetreeks", () => {
    expect(buildMesoZone(null).staat).toBe("leeg");
  });
});

describe("macroBronregel", () => {
  it("verwijst naar de check en de hermeting, zonder oordeel", () => {
    const regel = macroBronregel({
      score: 62,
      daysAgo: 12,
      hermetingLabel: "24 sep",
    });
    expect(regel).toBe(
      "Dit cijfer komt uit je check van 12 dagen geleden. Bijgewerkt bij je hermeting op 24 sep.",
    );
    // Geen waardeoordeel over de score zelf.
    expect(regel).not.toMatch(/goed|slecht|laag|hoog/);
  });

  it("zegt het eerlijk als er nog niet gemeten is", () => {
    expect(macroBronregel({ score: null, daysAgo: null, hermetingLabel: null })).toBe(
      "Je hebt dit domein nog niet gemeten.",
    );
  });

  it("gebruikt gisteren en vandaag als woorden", () => {
    expect(macroBronregel({ score: 60, daysAgo: 0, hermetingLabel: null })).toContain(
      "van vandaag",
    );
    expect(macroBronregel({ score: 60, daysAgo: 1, hermetingLabel: null })).toContain(
      "van gisteren",
    );
  });
});

describe("buildDomeinPaneel", () => {
  it("zet de twee zones onafhankelijk van elkaar", () => {
    const paneel = buildDomeinPaneel({
      meetreeks: reeks([moment("a", "12 aug 2026", 60), moment("b", "1 aug 2026", 55)]),
      score: 60,
      daysAgo: 3,
      hermetingLabel: "24 sep",
    });
    expect(paneel.meso.staat).toBe("reeks");
    expect(paneel.macro.score).toBe(60);
  });

  it("houdt de macro-score los van de meso-reeks", () => {
    // De score is de check; de reeks is de historie. Een leeg meso-vak mag de
    // macro-verwijzing niet wegnemen.
    const paneel = buildDomeinPaneel({
      meetreeks: null,
      score: 71,
      daysAgo: 5,
      hermetingLabel: null,
    });
    expect(paneel.meso.staat).toBe("leeg");
    expect(paneel.macro.score).toBe(71);
  });
});

