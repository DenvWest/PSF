import { describe, expect, it } from "vitest";
import { buildDagboekWinstRegel, buildDoelStand } from "@/lib/kompas-winst-dagboek";
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

describe("buildDoelStand", () => {
  const week = dagen(5, "havermout", 100);

  it("zwijgt onder de vijf dagen: de winstkaart noemt het aantal al", () => {
    expect(buildDoelStand(dagen(3, "havermout", 100), VANDAAG, STANDAARD_NORMEN, "energie", null)).toEqual({
      kind: "te_weinig",
      dagen: 3,
    });
  });

  it("kiest de stof van je richting en noemt de richting", () => {
    const stand = buildDoelStand(week, VANDAAG, STANDAARD_NORMEN, "energie", null);
    if (stand?.kind !== "stof") throw new Error("verwacht stof");
    expect(stand.nutrient).toBe("magnesium");
    expect(stand.richtingKort).toBe("Vaak moe");
    expect(stand.doelLabel).toMatch(/^je norm \(/);
    expect(stand.voorstel).toMatch(/noten/i);
  });

  it("neemt zonder richting de stof met de meeste ruimte en noemt geen richting", () => {
    const stand = buildDoelStand(week, VANDAAG, STANDAARD_NORMEN, null, null);
    if (stand?.kind !== "stof") throw new Error("verwacht stof");
    expect(stand.richtingKort).toBeNull();
    expect(stand.aandeelPct).toBeLessThan(100);
  });

  it("valt bij richting spier zonder eiwitdoel terug op de laagste stof, zonder de richting te beweren", () => {
    const stand = buildDoelStand(week, VANDAAG, STANDAARD_NORMEN, "spier", null);
    if (stand?.kind !== "stof") throw new Error("verwacht stof");
    expect(stand.richtingKort).toBeNull();
    expect(["zinc", "vitamin_d"]).not.toContain(stand.nutrient);
  });

  it("rekent eiwit tegen je eiwitdoel, nooit als 'gehaald'", () => {
    const stand = buildDoelStand(week, VANDAAG, STANDAARD_NORMEN, "spier", 95);
    if (stand?.kind !== "stof") throw new Error("verwacht stof");
    expect(stand.nutrient).toBe("protein");
    expect(stand.doelLabel).toContain("eiwitdoel");
    expect(stand.gedekt).toBe(false);
  });
});
