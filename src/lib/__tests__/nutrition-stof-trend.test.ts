import { describe, expect, it } from "vitest";
import type { DagboekItem } from "@/lib/nutrition-dagboek-items";
import { bronnenUitMeting, meetDag, meetPeriode, perMomentUitMeting, type DagMeting } from "@/lib/nutrition-stof-meting";
import { bouwStofTrend, schaalVoor, type StofTrendInvoer } from "@/lib/nutrition-stof-trend";

const mg = (moment: DagboekItem["moment"], capsules = 1) =>
  ({ moment, bron: "supplement", key: "magnesiumcitraat-capsule", grams: capsules }) as DagboekItem;
const zink = (moment: DagboekItem["moment"]) =>
  ({ moment, bron: "supplement", key: "zinkcitraat-tablet", grams: 1 }) as DagboekItem;

function bron(perDag: Record<string, DagboekItem[]>) {
  return { itemsPerDag: new Map(Object.entries(perDag)), etiketPerDag: {}, nevoProducten: new Map() };
}

describe("meetDag", () => {
  it("telt per maaltijd en noemt een dag pas volledig met ontbijt, lunch én avondeten", () => {
    const halve = meetDag("magnesium", bron({ "2026-10-01": [mg("ontbijt"), zink("lunch")] }), "2026-10-01");
    expect(halve.som).toBe(200);
    expect(halve.volledig).toBe(false);
    expect(halve.momenten.find((m) => m.moment === "lunch")).toMatchObject({ geregistreerd: true, som: 0 });

    const hele = meetDag(
      "magnesium",
      bron({ "2026-10-01": [mg("ontbijt"), zink("lunch"), zink("avondeten")] }),
      "2026-10-01",
    );
    expect(hele.volledig).toBe(true);
  });

  it("laat een supplement van een andere stof buiten de bronnen", () => {
    const meting = meetPeriode("magnesium", bron({ "2026-10-01": [mg("ontbijt"), zink("ontbijt")] }), ["2026-10-01"]);
    expect(bronnenUitMeting(meting, "mg").map((b) => b.naam)).toEqual(["Magnesiumcitraat, capsule"]);
    expect(perMomentUitMeting(meting)[0]).toMatchObject({ moment: "ontbijt", totaal: 200, keer: 1 });
  });
});

function dag(datum: string, ontbijt: number, volledig: boolean): DagMeting {
  const momenten = (["ontbijt", "lunch", "avondeten", "tussendoor"] as const).map((moment) => ({
    moment,
    geregistreerd: moment === "ontbijt" || (volledig && moment !== "tussendoor"),
    som: moment === "ontbijt" ? ontbijt : 0,
    somStreng: moment === "ontbijt" ? ontbijt : 0,
  }));
  return { datum, geregistreerd: true, volledig, som: ontbijt, somStreng: ontbijt, benaderd: false, momenten, bijdragen: [] };
}

const LEGE_DAG: DagMeting = { ...dag("2026-10-03", 0, false), geregistreerd: false, momenten: [] };

function invoer(dagen: DagMeting[], extra: Partial<StofTrendInvoer> = {}): StofTrendInvoer {
  return {
    stof: "magnesium",
    label: "Magnesium",
    unit: "mg",
    soort: "kern",
    norm: 350,
    nietBewijsbaar: null,
    periodetotaal: false,
    dagen,
    ...extra,
  };
}

describe("schaalVoor", () => {
  it("één dag per maaltijd, tot 14 dagen per dag, daarboven per week", () => {
    expect(schaalVoor(1)).toBe("maaltijd");
    expect(schaalVoor(7)).toBe("dag");
    expect(schaalVoor(14)).toBe("dag");
    expect(schaalVoor(30)).toBe("week");
  });
});

describe("bouwStofTrend", () => {
  it("geeft een onvolledige dag onder de norm geen oordeel, en zegt wat er per maaltijd wél te zeggen valt", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 70, false), dag("2026-10-02", 70, false), LEGE_DAG]));
    expect(trend.punten.map((p) => p.staat)).toEqual(["onvolledig", "onvolledig", "leeg"]);
    expect(trend.redenen[0]).toMatch(/Op geen van je 2 gemeten dagen staan ontbijt, lunch én avondeten/);
    expect(trend.redenen[1]).toBe("Per maaltijd gemiddeld: ontbijt 70 mg (20% van de dagnorm), 2×.");
  });

  it("rekent het oordeel over de volledige dagen en telt de onvolledige apart", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 175, true), dag("2026-10-02", 70, false)]));
    expect(trend.punten.map((p) => p.staat)).toEqual(["onder", "onvolledig"]);
    expect(trend.redenen[0]).toBe("Op je 1 volledige dag gemiddeld 175 mg: 50% van de norm (350 mg).");
    expect(trend.redenen[1]).toMatch(/1 dag mist een hoofdmaaltijd/);
  });

  it("een gehaalde dag is gehaald, ook als hij onvolledig is", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 400, false), dag("2026-10-02", 400, true)]));
    expect(trend.punten.map((p) => p.staat)).toEqual(["gehaald", "gehaald"]);
    expect(trend.gehaald).toBe(true);
    expect(trend.redenen).toEqual([]);
    expect(trend.kop).toBe("norm gehaald op 2 van 2 gemeten dagen");
  });

  it("een niet aan te tonen stof krijgt alleen de reden", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 3, true)], { stof: "zinc", nietBewijsbaar: "Bronnen leveren te weinig." }));
    expect(trend.bewijsbaar).toBe(false);
    expect(trend.redenen).toEqual(["Bronnen leveren te weinig."]);
  });

  it("omega-3 telt als periodetotaal, zonder kleur per dag", () => {
    const trend = bouwStofTrend(
      invoer([dag("2026-10-01", 1500, true), dag("2026-10-02", 0, true)], { stof: "omega3", norm: 250, periodetotaal: true }),
    );
    expect(trend.gehaald).toBe(true);
    expect(trend.punten.every((p) => p.staat === "neutraal")).toBe(true);
  });

  it("een gevolgde stof krijgt geen kleur, wel de feiten", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 175, true)], { stof: "calciumMg", soort: "gevolgd" }));
    expect(trend.punten[0]!.staat).toBe("neutraal");
    expect(trend.redenen[0]).toMatch(/50% van de norm/);
  });

  it("toont per maaltijd bij één dag", () => {
    const trend = bouwStofTrend(invoer([dag("2026-10-01", 70, false)]));
    expect(trend.schaal).toBe("maaltijd");
    expect(trend.punten.map((p) => p.waarde)).toEqual([70, null, null, null]);
  });
});
