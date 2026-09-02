import { describe, expect, it } from "vitest";
import { buildNutritionTijdlaag } from "@/lib/nutrition-tijdlaag";
import { buildMeetreeks } from "@/lib/voortgang-meetreeks";
import type { DomainMeasurement, DomainMeasurementValue } from "@/types/dashboard";

function value(
  key: string,
  label: string,
  answerLabel: string,
  level: number | null,
): DomainMeasurementValue {
  return {
    key,
    label,
    answerLabel,
    benchmarkLabel: null,
    level,
    levelMax: 3,
    scale: "zelfrapportage",
  };
}

/** `buildMeetreeks` krijgt oudste-eerst binnen en draait de reeks zelf om. */
function moment(
  id: string,
  dateLabel: string,
  values: DomainMeasurementValue[],
): DomainMeasurement {
  return {
    id,
    dateIso: "2026-08-01",
    dateLabel,
    daysAgo: 1,
    score: 60,
    source: "checkin",
    values,
  };
}

describe("buildNutritionTijdlaag", () => {
  it("zegt niets over richting bij één meting", () => {
    const tijdlaag = buildNutritionTijdlaag(
      buildMeetreeks([moment("a", "1 aug 2026", [value("vis", "Visbron", "1× per week", 2)])]),
    );
    expect(tijdlaag.momenten).toBe(1);
    expect(tijdlaag.samenvatting).toBeNull();
  });

  it("leest de richting tussen de twee nieuwste momenten", () => {
    const tijdlaag = buildNutritionTijdlaag(
      buildMeetreeks([
        moment("oud", "1 jul 2026", [value("vis", "Visbron", "Nooit", 0)]),
        moment("nieuw", "1 aug 2026", [value("vis", "Visbron", "1× per week", 2)]),
      ]),
    );
    const vis = tijdlaag.rijen.find((rij) => rij.key === "vis");
    expect(vis?.richting).toBe("vooruit");
    expect(vis?.eerder).toBe("Nooit");
    expect(vis?.nu).toBe("1× per week");
    expect(tijdlaag.laatsteDatum).toBe("1 aug 2026");
    expect(tijdlaag.vorigeDatum).toBe("1 jul 2026");
  });

  it("noemt een rij die de vorige keer niet gemeten werd 'nieuw', geen achteruitgang", () => {
    const tijdlaag = buildNutritionTijdlaag(
      buildMeetreeks([
        moment("oud", "1 jul 2026", []),
        moment("nieuw", "1 aug 2026", [value("vis", "Visbron", "Nooit", 0)]),
      ]),
    );
    expect(tijdlaag.rijen[0].richting).toBe("nieuw");
    expect(tijdlaag.rijen[0].eerder).toBeNull();
  });

  it("telt vooruit en achteruit los in de samenvatting, zonder conclusie", () => {
    const tijdlaag = buildNutritionTijdlaag(
      buildMeetreeks([
        moment("oud", "1 jul 2026", [
          value("vis", "Visbron", "Nooit", 0),
          value("suiker", "Wat je mindert", "1× per week", 2),
        ]),
        moment("nieuw", "1 aug 2026", [
          value("vis", "Visbron", "1× per week", 2),
          value("suiker", "Wat je mindert", "Dagelijks", 0),
        ]),
      ]),
    );
    expect(tijdlaag.samenvatting).toContain("1 vooruit, 1 terug");
    // Nooit een delta of percentage — de stops-schaal draagt dat niet.
    expect(tijdlaag.samenvatting).not.toMatch(/%/);
  });

  it("zegt bij een ongewijzigde reeks dat vasthouden het werk is", () => {
    const tijdlaag = buildNutritionTijdlaag(
      buildMeetreeks([
        moment("oud", "1 jul 2026", [value("vis", "Visbron", "1× per week", 2)]),
        moment("nieuw", "1 aug 2026", [value("vis", "Visbron", "1× per week", 2)]),
      ]),
    );
    expect(tijdlaag.rijen[0].richting).toBe("gelijk");
    expect(tijdlaag.samenvatting).toContain("dezelfde stand");
  });

  it("laat de domeinscore erbuiten — die woont op Voortgang-home", () => {
    const tijdlaag = buildNutritionTijdlaag(
      buildMeetreeks([
        moment("oud", "1 jul 2026", [value("vis", "Visbron", "Nooit", 0)]),
        moment("nieuw", "1 aug 2026", [value("vis", "Visbron", "Nooit", 0)]),
      ]),
    );
    expect(tijdlaag.rijen.map((rij) => rij.key)).toEqual(["vis"]);
  });

  it("valt terug op een lege staat zonder reeks", () => {
    const tijdlaag = buildNutritionTijdlaag(null);
    expect(tijdlaag.momenten).toBe(0);
    expect(tijdlaag.rijen).toHaveLength(0);
    expect(tijdlaag.samenvatting).toBeNull();
  });
});
