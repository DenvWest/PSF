import { describe, expect, it } from "vitest";
import { buildDagboekWinstRegel, buildDagStatus, buildDoelStand } from "@/lib/kompas-winst-dagboek";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { STANDAARD_NORMEN } from "@/lib/nutrition-normen";

const VANDAAG = "2026-10-08";

function halveDag(date: string, key: string, grams: number): DagboekDag {
  return { date, soort: "doordeweeks", porties: {}, items: [{ moment: "ontbijt", key, grams }] };
}

/** Een volle dag: het product bij het ontbijt, lunch en avondeten zonder magnesium. */
function dag(date: string, key: string, grams: number): DagboekDag {
  return {
    date,
    soort: "doordeweeks",
    porties: {},
    items: [
      { moment: "ontbijt", key, grams },
      { moment: "lunch", key: "pizza", grams: 100 },
      { moment: "avondeten", key: "pizza", grams: 100 },
    ],
  };
}

function datum(i: number): string {
  return `2026-10-0${8 - i}`;
}

function dagen(aantal: number, key: string, grams: number): DagboekDag[] {
  return Array.from({ length: aantal }, (_, i) => dag(datum(i), key, grams));
}

function halveDagen(aantal: number, key: string, grams: number): DagboekDag[] {
  return Array.from({ length: aantal }, (_, i) => halveDag(datum(i), key, grams));
}

describe("buildDagboekWinstRegel", () => {
  it("doet onder de vijf volle dagen geen uitspraak over stoffen", () => {
    const regel = buildDagboekWinstRegel(dagen(4, "havermout", 100), VANDAAG, STANDAARD_NORMEN);
    expect(regel).toMatchObject({ kind: "te_weinig", dagen: 4, gelogd: 4 });
  });

  it("zegt 0 dagen bij een leeg dagboek in plaats van een stof te noemen", () => {
    expect(buildDagboekWinstRegel([], VANDAAG, STANDAARD_NORMEN)).toEqual({
      kind: "te_weinig",
      dagen: 0,
      gelogd: 0,
      maaltijdFeit: null,
      ontbreekt: null,
    });
  });

  it("telt vijf halve dagen niet als vijf dagen: onbekend is geen nul", () => {
    const regel = buildDagboekWinstRegel(halveDagen(5, "havermout", 100), VANDAAG, STANDAARD_NORMEN);
    expect(regel?.kind).toBe("te_weinig");
    if (regel?.kind !== "te_weinig") return;
    expect(regel.dagen).toBe(0);
    expect(regel.gelogd).toBe(5);
    expect(regel.ontbreekt).toBe("lunch");
  });

  it("geeft bij halve dagen een feit over de maaltijd die er wél staat", () => {
    const regel = buildDagboekWinstRegel(halveDagen(4, "havermout", 100), VANDAAG, STANDAARD_NORMEN);
    if (regel?.kind !== "te_weinig") throw new Error("verwacht te_weinig");
    expect(regel.maaltijdFeit).toMatchObject({ moment: "ontbijt", doelWoord: "magnesiumnorm", dagen: 4 });
    expect(regel.maaltijdFeit?.aandeelPct).toBeGreaterThan(0);
  });

  it("geeft geen maaltijdfeit op minder dan drie dagen", () => {
    const regel = buildDagboekWinstRegel(halveDagen(2, "havermout", 100), VANDAAG, STANDAARD_NORMEN);
    if (regel?.kind !== "te_weinig") throw new Error("verwacht te_weinig");
    expect(regel.maaltijdFeit).toBeNull();
  });

  it("telt een bewust overgeslagen maaltijd als gelogd", () => {
    const met = Array.from({ length: 5 }, (_, i) => ({
      ...dag(datum(i), "havermout", 100),
      items: [
        { moment: "ontbijt" as const, key: "havermout", grams: 100 },
        { moment: "lunch" as const, key: "pizza", grams: 100 },
      ],
      overgeslagen: ["avondeten"],
    }));
    expect(buildDagboekWinstRegel(met, VANDAAG, STANDAARD_NORMEN)?.kind).toBe("stoffen");
  });

  it("volgt je eetpatroon: wie alleen ontbijt eet heeft met een ontbijt een volle dag", () => {
    const regel = buildDagboekWinstRegel(halveDagen(5, "havermout", 100), VANDAAG, STANDAARD_NORMEN, {
      gewone: ["ontbijt"],
    });
    expect(regel?.kind).toBe("stoffen");
  });

  it("telt dagen buiten het zevendagenvenster niet mee", () => {
    const oud = dagen(5, "havermout", 100).map((d, i) => ({ ...d, date: `2026-09-0${i + 1}` }));
    expect(buildDagboekWinstRegel(oud, VANDAAG, STANDAARD_NORMEN)).toMatchObject({
      kind: "te_weinig",
      dagen: 0,
      gelogd: 0,
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
    expect(
      buildDoelStand(dagen(3, "havermout", 100), VANDAAG, STANDAARD_NORMEN, { richting: "energie" }),
    ).toMatchObject({ kind: "te_weinig", dagen: 3 });
  });

  it("kiest de stof van je richting en noemt de richting", () => {
    const stand = buildDoelStand(week, VANDAAG, STANDAARD_NORMEN, { richting: "energie" });
    if (stand?.kind !== "stof") throw new Error("verwacht stof");
    expect(stand.nutrient).toBe("magnesium");
    expect(stand.richtingKort).toBe("Vaak moe");
    expect(stand.doelLabel).toMatch(/^je norm \(/);
    expect(stand.voorstel).toMatch(/noten/i);
  });

  it("neemt zonder richting de stof met de meeste ruimte en noemt geen richting", () => {
    const stand = buildDoelStand(week, VANDAAG, STANDAARD_NORMEN);
    if (stand?.kind !== "stof") throw new Error("verwacht stof");
    expect(stand.richtingKort).toBeNull();
    expect(stand.aandeelPct).toBeLessThan(100);
  });

  it("valt bij richting spier zonder eiwitdoel terug op de laagste stof, zonder de richting te beweren", () => {
    const stand = buildDoelStand(week, VANDAAG, STANDAARD_NORMEN, { richting: "spier" });
    if (stand?.kind !== "stof") throw new Error("verwacht stof");
    expect(stand.richtingKort).toBeNull();
    expect(["zinc", "vitamin_d"]).not.toContain(stand.nutrient);
  });

  it("rekent eiwit tegen je eiwitdoel, nooit als 'gehaald'", () => {
    const stand = buildDoelStand(week, VANDAAG, STANDAARD_NORMEN, { richting: "spier", eiwitDoelG: 95 });
    if (stand?.kind !== "stof") throw new Error("verwacht stof");
    expect(stand.nutrient).toBe("protein");
    expect(stand.doelLabel).toContain("eiwitdoel");
    expect(stand.gedekt).toBe(false);
  });
});

describe("buildDagboekWinstRegel — uitsluiten", () => {
  it("noemt de stof niet die de doel-zone al draagt", () => {
    const week = dagen(5, "havermout", 100);
    const zonder = buildDagboekWinstRegel(week, VANDAAG, STANDAARD_NORMEN, { uitsluiten: "magnesium" });
    if (zonder?.kind === "stoffen") {
      expect(zonder.stoffen.map((s) => s.nutrient)).not.toContain("magnesium");
    } else {
      expect(zonder === null || zonder.kind === "op_norm").toBe(true);
    }
  });

  it("zegt niet 'op je norm' als de uitgesloten stof zelf onder de norm zit", () => {
    const week = dagen(5, "havermout", 100);
    const alle = buildDagboekWinstRegel(week, VANDAAG, STANDAARD_NORMEN);
    if (alle?.kind !== "stoffen") throw new Error("verwacht stoffen");
    const regel = buildDagboekWinstRegel(week, VANDAAG, STANDAARD_NORMEN, {
      uitsluiten: alle.stoffen[0].nutrient,
    });
    expect(regel?.kind).not.toBe("op_norm");
  });
});

describe("buildDagStatus", () => {
  it("noemt wat gelogd en wat open is, in vaste volgorde", () => {
    const status = buildDagStatus([halveDag(VANDAAG, "havermout", 60)], VANDAAG);
    expect(status.gelogd).toEqual(["ontbijt"]);
    expect(status.open).toEqual(["lunch", "avondeten"]);
    expect(status.compleet).toBe(false);
  });

  it("is compleet als alle maaltijden erop staan", () => {
    expect(buildDagStatus([dag(VANDAAG, "havermout", 60)], VANDAAG).compleet).toBe(true);
  });

  it("telt een overgeslagen maaltijd als gelogd", () => {
    const status = buildDagStatus(
      [{ ...halveDag(VANDAAG, "havermout", 60), overgeslagen: ["lunch", "avondeten"] }],
      VANDAAG,
    );
    expect(status.compleet).toBe(true);
  });

  it("volgt je eetpatroon", () => {
    expect(buildDagStatus([halveDag(VANDAAG, "havermout", 60)], VANDAAG, ["ontbijt"]).compleet).toBe(true);
  });

  it("zegt dat alles open staat als er vandaag niets is", () => {
    const status = buildDagStatus([], VANDAAG);
    expect(status.gelogd).toEqual([]);
    expect(status.open).toEqual(["ontbijt", "lunch", "avondeten"]);
  });
});
