import { describe, expect, it } from "vitest";
import { buildDagboekWinstRegel } from "@/lib/kompas-winst-dagboek";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { STANDAARD_NORMEN } from "@/lib/nutrition-normen";

const VANDAAG = "2026-10-08";

function dag(date: string, key: string, grams: number): DagboekDag {
  return { date, soort: "doordeweeks", porties: {}, items: [{ moment: "ontbijt", key, grams }] };
}

function dagen(aantal: number, key: string, grams: number): DagboekDag[] {
  return Array.from({ length: aantal }, (_, i) =>
    dag(`2026-10-0${8 - i}`, key, grams),
  );
}

describe("buildDagboekWinstRegel", () => {
  it("doet onder de vijf dagen geen uitspraak over stoffen", () => {
    const regel = buildDagboekWinstRegel(dagen(4, "havermout", 100), VANDAAG, STANDAARD_NORMEN);
    expect(regel).toEqual({ kind: "te_weinig", dagen: 4 });
  });

  it("zegt 0 dagen bij een leeg dagboek in plaats van een stof te noemen", () => {
    expect(buildDagboekWinstRegel([], VANDAAG, STANDAARD_NORMEN)).toEqual({
      kind: "te_weinig",
      dagen: 0,
    });
  });

  it("telt dagen buiten het zevendagenvenster niet mee", () => {
    const oud = dagen(5, "havermout", 100).map((d, i) => ({ ...d, date: `2026-09-0${i + 1}` }));
    expect(buildDagboekWinstRegel(oud, VANDAAG, STANDAARD_NORMEN)).toEqual({
      kind: "te_weinig",
      dagen: 0,
    });
  });

  it("noemt hoogstens twee stoffen onder de norm, laagste eerst, als ondergrens", () => {
    const regel = buildDagboekWinstRegel(dagen(5, "havermout", 100), VANDAAG, STANDAARD_NORMEN);
    expect(regel?.kind).toBe("stoffen");
    if (regel?.kind !== "stoffen") return;
    expect(regel.dagen).toBe(5);
    expect(regel.stoffen.length).toBeLessThanOrEqual(2);
    const pcts = regel.stoffen.map((s) => s.aandeelPct);
    expect(pcts).toEqual([...pcts].sort((a, b) => a - b));
    expect(regel.stoffen.every((s) => s.aandeelPct < 100 && s.normLabel.length > 0)).toBe(true);
  });

  it("laat stoffen zonder enige bron weg: onbekend is geen nul", () => {
    const regel = buildDagboekWinstRegel(dagen(5, "havermout", 100), VANDAAG, STANDAARD_NORMEN);
    if (regel?.kind !== "stoffen") throw new Error("verwacht stoffen");
    expect(regel.stoffen.some((s) => s.aandeelPct === 0)).toBe(false);
  });

  it("noemt zink en vitamine D nooit: een dagboek kan ze niet aantonen", () => {
    const regel = buildDagboekWinstRegel(dagen(6, "havermout", 100), VANDAAG, STANDAARD_NORMEN);
    if (regel?.kind !== "stoffen") throw new Error("verwacht stoffen");
    expect(regel.stoffen.map((s) => s.nutrient)).not.toContain("zinc");
    expect(regel.stoffen.map((s) => s.nutrient)).not.toContain("vitamin_d");
  });
});
